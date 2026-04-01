from motor.motor_asyncio import AsyncIOMotorClient # type: ignore
from dotenv import load_dotenv # type: ignore
import os


load_dotenv()


MONGO_URL = os.getenv("MONGO_DATABASE_URL")
client = AsyncIOMotorClient(MONGO_URL)


mongo_db = client["new_test"]  