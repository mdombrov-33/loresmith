import grpc  # type: ignore
import asyncio
import lore_pb2  # type: ignore
import lore_pb2_grpc  # type: ignore
from chains.multi_variant import generate_multiple_characters


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
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Generation failed: {str(e)}")
            return lore_pb2.CharactersResponse()  # type: ignore


async def serve():
    server = grpc.aio.server()
    lore_pb2_grpc.add_LoreServiceServicer_to_server(LoreServicer(), server)
    server.add_insecure_port("[::]:50051")
    await server.start()
    print("gRPC server running on port 50051")
    await server.wait_for_termination()


if __name__ == "__main__":
    asyncio.run(serve())
