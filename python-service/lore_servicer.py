import grpc  # type: ignore
import asyncio
import base64
import json
import lore_pb2  # type: ignore
import lore_pb2_grpc  # type: ignore
from generate.chains.multi_variant import (
    generate_multiple_characters,
    generate_multiple_factions,
    generate_multiple_settings,
    generate_multiple_events,
    generate_multiple_relics,
)
from generate.orchestrators.orchestrator_lore_variants import generate_lore_variants
from generate.orchestrators.orchestrator_full_story import (
    generate_full_story_orchestrator,
)
from generate.models.selected_lore_pieces import SelectedLorePieces
from generate.models.lore_piece import LorePiece
from constants.themes import Theme
from utils.logger import logger
from search.reranker import rerank_with_fusion_dartboard
from search.query_preprocessor import preprocess_search_query
from services.embedding_client import (
    generate_search_embedding,
    generate_content_embedding,
)
from services.image_gen.portraits.processor import upload_image_to_r2


class LoreServicer(lore_pb2_grpc.LoreServiceServicer):
    # * Generation Methods
    async def _handle_lore_generation(
        self,
        generate_func,
        response_class,
        response_field_name,
        error_msg,
        request,
        context,
    ):
        """Generic handler for lore piece generation (characters, factions, etc.)."""
        try:
            pieces = await generate_func(request.count, request.theme)
            grpc_pieces = [convert_to_grpc_lore_piece(piece) for piece in pieces]
            return response_class(**{response_field_name: grpc_pieces})
        except Exception as e:
            logger.error(f"{error_msg}: {str(e)}", exc_info=True)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"{error_msg}: {str(e)}")
            return response_class()

    async def GenerateCharacters(self, request, context):
        return await self._handle_lore_generation(
            generate_multiple_characters,
            lore_pb2.CharactersResponse,
            "characters",
            "Character generation failed",
            request,
            context,
        )

    async def GenerateFactions(self, request, context):
        return await self._handle_lore_generation(
            generate_multiple_factions,
            lore_pb2.FactionsResponse,
            "factions",
            "Faction generation failed",
            request,
            context,
        )

    async def GenerateSettings(self, request, context):
        return await self._handle_lore_generation(
            generate_multiple_settings,
            lore_pb2.SettingsResponse,
            "settings",
            "Setting generation failed",
            request,
            context,
        )

    async def GenerateEvents(self, request, context):
        return await self._handle_lore_generation(
            generate_multiple_events,
            lore_pb2.EventsResponse,
            "events",
            "Event generation failed",
            request,
            context,
        )

    async def GenerateRelics(self, request, context):
        return await self._handle_lore_generation(
            generate_multiple_relics,
            lore_pb2.RelicsResponse,
            "relics",
            "Relic generation failed",
            request,
            context,
        )

    async def GenerateAll(self, request, context):
        """Generate all lore types in parallel."""
        try:
            bundle = await generate_lore_variants(request.count, request.theme)
            return lore_pb2.AllResponse(  # type: ignore
                characters=[
                    convert_to_grpc_lore_piece(char) for char in bundle.characters
                ],
                factions=[
                    convert_to_grpc_lore_piece(faction) for faction in bundle.factions
                ],
                settings=[
                    convert_to_grpc_lore_piece(setting) for setting in bundle.settings
                ],
                events=[convert_to_grpc_lore_piece(event) for event in bundle.events],
                relics=[convert_to_grpc_lore_piece(relic) for relic in bundle.relics],
            )
        except Exception as e:
            logger.error(f"Full lore generation failed: {str(e)}", exc_info=True)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Full lore generation failed: {str(e)}")
            return lore_pb2.AllResponse()  # type: ignore

    async def GenerateFullStory(self, request, context):
        """Generate complete story from selected lore pieces."""
        try:
            selected_pieces = SelectedLorePieces(
                character=convert_lore_piece(request.pieces.character)
                if request.pieces.HasField("character")
                else None,
                faction=convert_lore_piece(request.pieces.faction)
                if request.pieces.HasField("faction")
                else None,
                setting=convert_lore_piece(request.pieces.setting)
                if request.pieces.HasField("setting")
                else None,
                event=convert_lore_piece(request.pieces.event)
                if request.pieces.HasField("event")
                else None,
                relic=convert_lore_piece(request.pieces.relic)
                if request.pieces.HasField("relic")
                else None,
            )
            theme = Theme(request.theme)

            full_story = await generate_full_story_orchestrator(selected_pieces, theme)

            grpc_story = lore_pb2.FullStory(  # type: ignore
                content=full_story.content,
                theme=full_story.theme.value,
                pieces=convert_selected_lore_pieces_to_grpc(full_story.pieces),
                quest=full_story.quest,
            )
            return lore_pb2.FullStoryResponse(story=grpc_story)  # type: ignore
        except Exception as e:
            logger.error(f"Full story generation failed: {str(e)}", exc_info=True)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Full story generation failed: {str(e)}")
            return lore_pb2.FullStoryResponse()  # type: ignore

    # * Search & Embedding Methods
    async def GenerateEmbedding(self, request, context):
        """Generate embedding for search queries or content indexing."""
        try:
            if not request.text:
                context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
                context.set_details("Text cannot be empty")
                return lore_pb2.EmbeddingResponse()

            # Auto-detect: short text (<50 words) = search query (preprocess)
            # long text (>=50 words) = content to index (no preprocess)
            word_count = len(request.text.split())
            if word_count < 50:
                logger.info(
                    f"Generating search embedding for query ({word_count} words)"
                )
                embedding = await generate_search_embedding(request.text)
            else:
                logger.info(
                    f"Generating content embedding for indexing ({word_count} words)"
                )
                embedding = await generate_content_embedding(request.text)

            return lore_pb2.EmbeddingResponse(embedding=embedding)
        except Exception as e:
            logger.error(f"Embedding generation failed: {str(e)}", exc_info=True)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Embedding generation failed: {str(e)}")
            return lore_pb2.EmbeddingResponse()

    async def RerankResults(self, request, context):
        """Rerank search results using fusion dartboard algorithm."""
        try:
            if not request.query:
                context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
                context.set_details("Query cannot be empty")
                return lore_pb2.RerankSearchResponse()

            if not request.worlds:
                context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
                context.set_details("Worlds list cannot be empty")
                return lore_pb2.RerankSearchResponse()

            # Convert gRPC worlds to dict format for reranker
            worlds = []
            for grpc_world in request.worlds:
                world = {
                    "title": grpc_world.title,
                    "theme": grpc_world.theme,
                    "full_story": grpc_world.full_story,
                    "relevance": grpc_world.relevance,
                    "embedding": list(grpc_world.embedding)
                    if grpc_world.embedding
                    else [],
                }
                worlds.append(world)

            logger.info(
                f"Reranking {len(worlds)} worlds, query_embedding length: {len(request.query_embedding) if request.query_embedding else 0}"
            )
            logger.info(
                f"Worlds with embeddings: {sum(1 for w in worlds if w['embedding'])}/{len(worlds)}"
            )

            reranked_worlds = rerank_with_fusion_dartboard(
                request.query, worlds, query_embedding=list(request.query_embedding)
            )

            # Convert back to gRPC format
            grpc_reranked_worlds = []
            for world in reranked_worlds:
                grpc_world = lore_pb2.WorldResult(  # type: ignore
                    title=world["title"],
                    theme=world["theme"],
                    full_story=world["full_story"],
                    relevance=world["relevance"],
                )
                grpc_reranked_worlds.append(grpc_world)

            return lore_pb2.RerankSearchResponse(reranked_worlds=grpc_reranked_worlds)  # type: ignore

        except Exception as e:
            logger.error(f"Reranking failed: {str(e)}", exc_info=True)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Reranking failed: {str(e)}")
            return lore_pb2.RerankSearchResponse()

    # * Image Upload Methods
    async def UploadImageToR2(self, request, context):
        """Upload base64 image to R2 with real world_id after world creation."""
        try:
            if not request.image_base64:
                context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
                context.set_details("image_base64 cannot be empty")
                return lore_pb2.UploadImageResponse()

            if not request.world_id:
                context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
                context.set_details("world_id cannot be empty")
                return lore_pb2.UploadImageResponse()

            if not request.character_id:
                context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
                context.set_details("character_id cannot be empty")
                return lore_pb2.UploadImageResponse()

            # Decode base64 to bytes
            try:
                image_data = base64.b64decode(request.image_base64)
            except Exception as e:
                logger.error(f"Failed to decode base64: {e}")
                context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
                context.set_details(f"Invalid base64 data: {e}")
                return lore_pb2.UploadImageResponse()

            # Upload to R2
            image_url = await upload_image_to_r2(
                image_data=image_data,
                world_id=request.world_id,
                character_id=request.character_id,
                image_type=request.image_type or "portrait",
            )

            logger.info(f"Successfully uploaded image to R2: {image_url}")
            return lore_pb2.UploadImageResponse(image_url=image_url)

        except Exception as e:
            logger.error(f"Image upload to R2 failed: {str(e)}", exc_info=True)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Image upload failed: {str(e)}")
            return lore_pb2.UploadImageResponse()

    # * Adventure Methods
    # TODO: Add adventure session management methods


# * Helper Functions
def convert_lore_piece(grpc_piece):
    """Convert gRPC LorePiece to Python model."""
    # Deserialize JSON strings back to their original types (arrays, objects)
    details_deserialized = {}
    for key, value in dict(grpc_piece.details).items():
        try:
            # Try to parse as JSON (for arrays/objects like skills)
            details_deserialized[key] = json.loads(value)
        except (json.JSONDecodeError, ValueError):
            # If not JSON, keep as string
            details_deserialized[key] = value

    return LorePiece(
        name=grpc_piece.name,
        description=grpc_piece.description,
        details=details_deserialized,
        type=grpc_piece.type,
    )


def convert_to_grpc_lore_piece(piece):
    """Convert Python LorePiece to gRPC message."""
    # Convert details to dict[str, str] by serializing non-string values to JSON
    details_serialized = {}
    for key, value in piece.details.items():
        if isinstance(value, (list, dict)):
            # Serialize complex types (like skills array) to JSON string
            details_serialized[key] = json.dumps(value)
        else:
            # Keep strings as-is
            details_serialized[key] = str(value)

    return lore_pb2.LorePiece(  # type: ignore
        name=piece.name,
        description=piece.description,
        details=details_serialized,
        type=piece.type,
    )


def convert_selected_lore_pieces_to_grpc(selected_pieces):
    """Convert SelectedLorePieces to gRPC message."""
    return lore_pb2.SelectedLorePieces(
        character=convert_to_grpc_lore_piece(selected_pieces.character)
        if selected_pieces.character
        else None,
        faction=convert_to_grpc_lore_piece(selected_pieces.faction)
        if selected_pieces.faction
        else None,
        setting=convert_to_grpc_lore_piece(selected_pieces.setting)
        if selected_pieces.setting
        else None,
        event=convert_to_grpc_lore_piece(selected_pieces.event)
        if selected_pieces.event
        else None,
        relic=convert_to_grpc_lore_piece(selected_pieces.relic)
        if selected_pieces.relic
        else None,
    )


# * Server Startup
async def serve():
    # Increase max message size to 20MB to handle base64-encoded images
    max_msg_size = 20 * 1024 * 1024  # 20MB
    server = grpc.aio.server(
        options=[
            ("grpc.max_send_message_length", max_msg_size),
            ("grpc.max_receive_message_length", max_msg_size),
        ]
    )
    lore_pb2_grpc.add_LoreServiceServicer_to_server(LoreServicer(), server)
    server.add_insecure_port("0.0.0.0:50051")
    logger.info("gRPC server running on port 50051 (max message size: 20MB)")

    # * Preload Ollama models to avoid cold start delays
    try:
        logger.info("Preloading embedding model...")
        await generate_search_embedding("warmup")
        logger.info("Embedding model preloaded successfully")
    except Exception as e:
        logger.warning(f"Failed to preload embedding model: {e}")

    try:
        logger.info("Preloading LLM model for query preprocessing...")
        await preprocess_search_query("test query warmup")
        logger.info("LLM model preloaded successfully")
    except Exception as e:
        logger.warning(f"Failed to preload LLM model: {e}")

    await server.start()
    await server.wait_for_termination()


if __name__ == "__main__":
    asyncio.run(serve())
