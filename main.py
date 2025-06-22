import asyncio
from chains.orchestrator import generate_all_variants


if __name__ == "__main__":
    variants = asyncio.run(generate_all_variants())
    from pprint import pprint

    pprint(variants)
