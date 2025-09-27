import grpc  # type: ignore
import asyncio
import lore_pb2  # type: ignore
import lore_pb2_grpc  # type: ignore
from chains.multi_variant import (
    generate_multiple_characters,
    generate_multiple_factions,
    generate_multiple_settings,
    generate_multiple_events,
    generate_multiple_relics,
)
from orchestrators.orchestrator_lore_variants import generate_lore_variants
from orchestrators.orchestrator_full_story import generate_full_story_orchestrator
from models.selected_lore_pieces import SelectedLorePieces
from models.lore_piece import LorePiece
from constants.themes import Theme
from utils.logger import logger


class LoreServicer(lore_pb2_grpc.LoreServiceServicer):
    async def GenerateCharacters(self, request, context):
        try:
            characters = await generate_multiple_characters(
                request.count, request.theme, request.regenerate
            )
            grpc_characters = []
            for char in characters:
                grpc_char = lore_pb2.LorePiece(  # type: ignore
                    name=char.name,
                    type=char.type,
                    description=char.description,
                    details=char.details,
                )
                grpc_characters.append(grpc_char)
            return lore_pb2.CharactersResponse(characters=grpc_characters)  # type: ignore
        except Exception as e:
            logger.error(f"Generation failed: {str(e)}", exc_info=True)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Generation failed: {str(e)}")
            return lore_pb2.CharactersResponse()  # type: ignore

    async def GenerateFactions(self, request, context):
        try:
            factions = await generate_multiple_factions(
                request.count, request.theme, request.regenerate
            )
            grpc_factions = []
            for faction in factions:
                grpc_faction = lore_pb2.LorePiece(  # type: ignore
                    name=faction.name,
                    type=faction.type,
                    description=faction.description,
                    details=faction.details,
                )
                grpc_factions.append(grpc_faction)
            return lore_pb2.FactionsResponse(factions=grpc_factions)  # type: ignore
        except Exception as e:
            logger.error(f"Factions generation failed: {str(e)}", exc_info=True)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Factions generation failed: {str(e)}")
            return lore_pb2.FactionsResponse()  # type: ignore

    async def GenerateSettings(self, request, context):
        try:
            settings = await generate_multiple_settings(
                request.count, request.theme, request.regenerate
            )
            grpc_settings = []
            for setting in settings:
                grpc_setting = lore_pb2.LorePiece(  # type: ignore
                    name=setting.name,
                    type=setting.type,
                    description=setting.description,
                    details=setting.details,
                )
                grpc_settings.append(grpc_setting)
            return lore_pb2.SettingsResponse(settings=grpc_settings)  # type: ignore
        except Exception as e:
            logger.error(f"Settings generation failed: {str(e)}", exc_info=True)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Settings generation failed: {str(e)}")
            return lore_pb2.SettingsResponse()  # type: ignore

    async def GenerateEvents(self, request, context):
        try:
            events = await generate_multiple_events(
                request.count, request.theme, request.regenerate
            )
            grpc_events = []
            for event in events:
                grpc_event = lore_pb2.LorePiece(  # type: ignore
                    name=event.name,
                    type=event.type,
                    description=event.description,
                    details=event.details,
                )
                grpc_events.append(grpc_event)
            return lore_pb2.EventsResponse(events=grpc_events)  # type: ignore
        except Exception as e:
            logger.error(f"Events generation failed: {str(e)}", exc_info=True)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Events generation failed: {str(e)}")
            return lore_pb2.EventsResponse()  # type: ignore

    async def GenerateRelics(self, request, context):
        try:
            relics = await generate_multiple_relics(
                request.count, request.theme, request.regenerate
            )
            grpc_relics = []
            for relic in relics:
                grpc_relic = lore_pb2.LorePiece(  # type: ignore
                    name=relic.name,
                    type=relic.type,
                    description=relic.description,
                    details=relic.details,
                )
                grpc_relics.append(grpc_relic)
            return lore_pb2.RelicsResponse(relics=grpc_relics)  # type: ignore
        except Exception as e:
            logger.error(f"Relics generation failed: {str(e)}", exc_info=True)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Relics generation failed: {str(e)}")
            return lore_pb2.RelicsResponse()  # type: ignore

    async def GenerateAll(self, request, context):
        try:
            bundle = await generate_lore_variants(
                request.count, request.theme, request.regenerate
            )
            return lore_pb2.AllResponse(  # type: ignore
                characters=[
                    lore_pb2.LorePiece(  # type: ignore
                        name=char.name,
                        type=char.type,
                        description=char.description,
                        details=char.details,
                    )
                    for char in bundle.characters
                ],
                factions=[
                    lore_pb2.LorePiece(  # type: ignore
                        name=faction.name,
                        type=faction.type,
                        description=faction.description,
                        details=faction.details,
                    )
                    for faction in bundle.factions
                ],
                settings=[
                    lore_pb2.LorePiece(  # type: ignore
                        name=setting.name,
                        type=setting.type,
                        description=setting.description,
                        details=setting.details,
                    )
                    for setting in bundle.settings
                ],
                events=[
                    lore_pb2.LorePiece(  # type: ignore
                        name=event.name,
                        type=event.type,
                        description=event.description,
                        details=event.details,
                    )
                    for event in bundle.events
                ],
                relics=[
                    lore_pb2.LorePiece(  # type: ignore
                        name=relic.name,
                        type=relic.type,
                        description=relic.description,
                        details=relic.details,
                    )
                    for relic in bundle.relics
                ],
            )
        except Exception as e:
            logger.error(f"Full lore generation failed: {str(e)}", exc_info=True)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Full lore generation failed: {str(e)}")
            return lore_pb2.AllResponse()  # type: ignore

    async def GenerateFullStory(self, request, context):
        try:
            # Convert gRPC SelectedLorePieces to Python model
            def get_lore_piece(piece_map, piece_type):
                if piece_map:
                    name, desc = next(iter(piece_map.items()))
                    return LorePiece(
                        name=name, description=desc, type=piece_type, details={}
                    )
                return None

            selected_pieces = SelectedLorePieces(
                character=get_lore_piece(request.pieces.characters, "character"),
                faction=get_lore_piece(request.pieces.factions, "faction"),
                setting=get_lore_piece(request.pieces.settings, "setting"),
                event=get_lore_piece(request.pieces.events, "event"),
                relic=get_lore_piece(request.pieces.relics, "relic"),
            )
            theme = Theme(request.theme)

            full_story = await generate_full_story_orchestrator(selected_pieces, theme)

            # Convert back to gRPC maps
            grpc_pieces = lore_pb2.SelectedLorePieces(  # type: ignore
                characters=(
                    {
                        full_story.pieces.character.name: full_story.pieces.character.description
                    }
                    if full_story.pieces.character
                    else {}
                ),
                factions=(
                    {
                        full_story.pieces.faction.name: full_story.pieces.faction.description
                    }
                    if full_story.pieces.faction
                    else {}
                ),
                settings=(
                    {
                        full_story.pieces.setting.name: full_story.pieces.setting.description
                    }
                    if full_story.pieces.setting
                    else {}
                ),
                events=(
                    {full_story.pieces.event.name: full_story.pieces.event.description}
                    if full_story.pieces.event
                    else {}
                ),
                relics=(
                    {full_story.pieces.relic.name: full_story.pieces.relic.description}
                    if full_story.pieces.relic
                    else {}
                ),
            )
            grpc_story = lore_pb2.FullStory(  # type: ignore
                title=full_story.title,
                content=full_story.content,
                theme=full_story.theme.value,
                pieces=grpc_pieces,
            )
            return lore_pb2.FullStoryResponse(story=grpc_story)  # type: ignore
        except Exception as e:
            logger.error(f"Full story generation failed: {str(e)}", exc_info=True)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Full story generation failed: {str(e)}")
            return lore_pb2.FullStoryResponse()  # type: ignore


def convert_lore_piece(grpc_piece):
    return LorePiece(
        name=grpc_piece.name,
        description=grpc_piece.description,
        details=dict(grpc_piece.details),
        type=grpc_piece.type,
    )


def convert_to_grpc_lore_piece(piece):
    return lore_pb2.LorePiece(  # type: ignore
        name=piece.name,
        description=piece.description,
        details=piece.details,
        type=piece.type,
    )


async def serve():
    server = grpc.aio.server()
    lore_pb2_grpc.add_LoreServiceServicer_to_server(LoreServicer(), server)
    server.add_insecure_port("0.0.0.0:50051")
    logger.info("gRPC server running on port 50051")
    await server.start()
    await server.wait_for_termination()


if __name__ == "__main__":
    asyncio.run(serve())
