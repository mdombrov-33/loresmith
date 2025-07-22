import logging
import sys

FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

logging.basicConfig(
    level=logging.INFO,
    format=FORMAT,
    handlers=[
        logging.StreamHandler(sys.stdout),
    ],
)

logger = logging.getLogger("loresmith")
