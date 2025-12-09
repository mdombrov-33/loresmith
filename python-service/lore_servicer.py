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
        """Generate characters with streaming progress updates."""
        try:
            # Yield: Starting generation
            yield lore_pb2.CharactersStreamResponse(
                progress=lore_pb2.GenerationProgress(
                    progress=20,
                    message="Generating characters..."
                )
            )

            # Create queue for progress updates
            progress_queue = asyncio.Queue()
            generation_complete = asyncio.Event()

            # Create callback to send progress updates to queue
            async def progress_callback(progress, message):
                await progress_queue.put((progress, message))

            # Start generation in background task
            async def generate():
                try:
                    result = await generate_multiple_characters(
                        request.count,
                        request.theme,
                        progress_callback=progress_callback
                    )
                    return result
                finally:
                    generation_complete.set()

            generation_task = asyncio.create_task(generate())

            # Consume progress updates from queue and yield them
            while not generation_complete.is_set() or not progress_queue.empty():
                try:
                    progress, message = await asyncio.wait_for(progress_queue.get(), timeout=0.1)
                    yield lore_pb2.CharactersStreamResponse(
                        progress=lore_pb2.GenerationProgress(
                            progress=progress,
                            message=message
                        )
                    )
                except asyncio.TimeoutError:
                    continue

            # Wait for generation to complete and get result
            characters = await generation_task

            # Yield: Generation complete
            yield lore_pb2.CharactersStreamResponse(
                progress=lore_pb2.GenerationProgress(
                    progress=90,
                    message="Finalizing characters..."
                )
            )

            # Convert to gRPC and send final result
            grpc_pieces = [convert_to_grpc_lore_piece(piece) for piece in characters]
            yield lore_pb2.CharactersStreamResponse(
                final=lore_pb2.CharactersResponse(characters=grpc_pieces)
            )

        except Exception as e:
            logger.error(f"Character generation failed: {str(e)}", exc_info=True)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Character generation failed: {str(e)}")

    async def GenerateFactions(self, request, context):
        """Generate factions with streaming progress updates."""
        try:
            # Yield: Starting generation
            yield lore_pb2.FactionsStreamResponse(
                progress=lore_pb2.GenerationProgress(
                    progress=20,
                    message="Generating factions..."
                )
            )

            # Create queue for progress updates
            progress_queue = asyncio.Queue()
            generation_complete = asyncio.Event()

            # Create callback to send progress updates to queue
            async def progress_callback(progress, message):
                await progress_queue.put((progress, message))

            # Start generation in background task
            async def generate():
                try:
                    result = await generate_multiple_factions(
                        request.count,
                        request.theme,
                        progress_callback=progress_callback
                    )
                    return result
                finally:
                    generation_complete.set()

            generation_task = asyncio.create_task(generate())

            # Consume progress updates from queue and yield them
            while not generation_complete.is_set() or not progress_queue.empty():
                try:
                    progress, message = await asyncio.wait_for(progress_queue.get(), timeout=0.1)
                    yield lore_pb2.FactionsStreamResponse(
                        progress=lore_pb2.GenerationProgress(
                            progress=progress,
                            message=message
                        )
                    )
                except asyncio.TimeoutError:
                    continue

            # Wait for generation to complete and get result
            factions = await generation_task

            # Yield: Generation complete
            yield lore_pb2.FactionsStreamResponse(
                progress=lore_pb2.GenerationProgress(
                    progress=90,
                    message="Finalizing factions..."
                )
            )

            grpc_pieces = [convert_to_grpc_lore_piece(piece) for piece in factions]
            yield lore_pb2.FactionsStreamResponse(
                final=lore_pb2.FactionsResponse(factions=grpc_pieces)
            )

        except Exception as e:
            logger.error(f"Faction generation failed: {str(e)}", exc_info=True)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Faction generation failed: {str(e)}")

    async def GenerateSettings(self, request, context):
        """Generate settings with streaming progress updates."""
        try:
            # Yield: Starting generation
            yield lore_pb2.SettingsStreamResponse(
                progress=lore_pb2.GenerationProgress(
                    progress=20,
                    message="Generating settings..."
                )
            )

            # Create queue for progress updates
            progress_queue = asyncio.Queue()
            generation_complete = asyncio.Event()

            # Create callback to send progress updates to queue
            async def progress_callback(progress, message):
                await progress_queue.put((progress, message))

            # Start generation in background task
            async def generate():
                try:
                    result = await generate_multiple_settings(
                        request.count,
                        request.theme,
                        progress_callback=progress_callback
                    )
                    return result
                finally:
                    generation_complete.set()

            generation_task = asyncio.create_task(generate())

            # Consume progress updates from queue and yield them
            while not generation_complete.is_set() or not progress_queue.empty():
                try:
                    progress, message = await asyncio.wait_for(progress_queue.get(), timeout=0.1)
                    yield lore_pb2.SettingsStreamResponse(
                        progress=lore_pb2.GenerationProgress(
                            progress=progress,
                            message=message
                        )
                    )
                except asyncio.TimeoutError:
                    continue

            # Wait for generation to complete and get result
            settings = await generation_task

            # Yield: Generation complete
            yield lore_pb2.SettingsStreamResponse(
                progress=lore_pb2.GenerationProgress(
                    progress=90,
                    message="Finalizing settings..."
                )
            )

            grpc_pieces = [convert_to_grpc_lore_piece(piece) for piece in settings]
            yield lore_pb2.SettingsStreamResponse(
                final=lore_pb2.SettingsResponse(settings=grpc_pieces)
            )

        except Exception as e:
            logger.error(f"Setting generation failed: {str(e)}", exc_info=True)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Setting generation failed: {str(e)}")

    async def GenerateEvents(self, request, context):
        """Generate events with streaming progress updates."""
        try:
            setting = convert_lore_piece(request.selected_setting) if request.HasField("selected_setting") else None
            if not setting:
                context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
                context.set_details("selected_setting is required for event generation")
                return

            # Yield: Starting generation
            yield lore_pb2.EventsStreamResponse(
                progress=lore_pb2.GenerationProgress(
                    progress=20,
                    message="Generating events..."
                )
            )

            # Create queue for progress updates
            progress_queue = asyncio.Queue()
            generation_complete = asyncio.Event()

            # Create callback to send progress updates to queue
            async def progress_callback(progress, message):
                await progress_queue.put((progress, message))

            # Start generation in background task
            async def generate():
                try:
                    result = await generate_multiple_events(
                        request.count,
                        request.theme,
                        setting,
                        progress_callback=progress_callback
                    )
                    return result
                finally:
                    generation_complete.set()

            generation_task = asyncio.create_task(generate())

            # Consume progress updates from queue and yield them
            while not generation_complete.is_set() or not progress_queue.empty():
                try:
                    progress, message = await asyncio.wait_for(progress_queue.get(), timeout=0.1)
                    yield lore_pb2.EventsStreamResponse(
                        progress=lore_pb2.GenerationProgress(
                            progress=progress,
                            message=message
                        )
                    )
                except asyncio.TimeoutError:
                    continue

            # Wait for generation to complete and get result
            events = await generation_task

            # Yield: Generation complete
            yield lore_pb2.EventsStreamResponse(
                progress=lore_pb2.GenerationProgress(
                    progress=90,
                    message="Finalizing events..."
                )
            )

            # Yield: Final result
            grpc_events = [convert_to_grpc_lore_piece(event) for event in events]
            yield lore_pb2.EventsStreamResponse(
                final=lore_pb2.EventsResponse(events=grpc_events)
            )
        except Exception as e:
            logger.error(f"Event generation failed: {str(e)}", exc_info=True)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Event generation failed: {str(e)}")

    async def GenerateRelics(self, request, context):
        """Generate relics with streaming progress updates."""
        try:
            setting = convert_lore_piece(request.selected_setting) if request.HasField("selected_setting") else None
            event = convert_lore_piece(request.selected_event) if request.HasField("selected_event") else None

            if not setting or not event:
                context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
                context.set_details("selected_setting and selected_event are required for relic generation")
                return

            # Yield: Starting generation
            yield lore_pb2.RelicsStreamResponse(
                progress=lore_pb2.GenerationProgress(
                    progress=20,
                    message="Generating relics..."
                )
            )

            # Create queue for progress updates
            progress_queue = asyncio.Queue()
            generation_complete = asyncio.Event()

            # Create callback to send progress updates to queue
            async def progress_callback(progress, message):
                await progress_queue.put((progress, message))

            # Start generation in background task
            async def generate():
                try:
                    result = await generate_multiple_relics(
                        request.count,
                        request.theme,
                        setting,
                        event,
                        progress_callback=progress_callback
                    )
                    return result
                finally:
                    generation_complete.set()

            generation_task = asyncio.create_task(generate())

            # Consume progress updates from queue and yield them
            while not generation_complete.is_set() or not progress_queue.empty():
                try:
                    progress, message = await asyncio.wait_for(progress_queue.get(), timeout=0.1)
                    yield lore_pb2.RelicsStreamResponse(
                        progress=lore_pb2.GenerationProgress(
                            progress=progress,
                            message=message
                        )
                    )
                except asyncio.TimeoutError:
                    continue

            # Wait for generation to complete and get result
            relics = await generation_task

            # Yield: Generation complete
            yield lore_pb2.RelicsStreamResponse(
                progress=lore_pb2.GenerationProgress(
                    progress=90,
                    message="Finalizing relics..."
                )
            )

            # Yield: Final result
            grpc_relics = [convert_to_grpc_lore_piece(relic) for relic in relics]
            yield lore_pb2.RelicsStreamResponse(
                final=lore_pb2.RelicsResponse(relics=grpc_relics)
            )
        except Exception as e:
            logger.error(f"Relic generation failed: {str(e)}", exc_info=True)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Relic generation failed: {str(e)}")

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
