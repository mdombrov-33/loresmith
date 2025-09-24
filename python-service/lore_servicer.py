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
                    description=char.description,
                    details=char.details,
                    type=char.type,
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
                    description=faction.description,
                    details=faction.details,
                    type=faction.type,
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
                    description=setting.description,
                    details=setting.details,
                    type=setting.type,
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
                    description=event.description,
                    details=event.details,
                    type=event.type,
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
                    description=relic.description,
                    details=relic.details,
                    type=relic.type,
                )
                grpc_relics.append(grpc_relic)
            return lore_pb2.RelicsResponse(relics=grpc_relics)  # type: ignore
        except Exception as e:
            logger.error(f"Relics generation failed: {str(e)}", exc_info=True)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Relics generation failed: {str(e)}")
            return lore_pb2.RelicsResponse()  # type: ignore


async def serve():
    server = grpc.aio.server()
    lore_pb2_grpc.add_LoreServiceServicer_to_server(LoreServicer(), server)
    server.add_insecure_port("0.0.0.0:50051")
    logger.info("gRPC server running on port 50051")
    await server.start()
    await server.wait_for_termination()


if __name__ == "__main__":
    asyncio.run(serve())
