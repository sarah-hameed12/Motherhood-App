from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context # type: ignore

from app.database.postgres import Base
from app.models.user import User, UserArchivePost
from app.models.child import Child, SleepSchedule, MedicalCondition, Allergy
from app.models.vaccination import VaccinationRecord, VaccinationOption, VaccinationSchedule
from app.models.ai import AiConversation, ChatbotMessage
from app.models.community import Post, PostLike, PostComplain
from app.models.child_growth import ChildGrowthRecord
from app.models.notifications import Notification
from app.models.tutorial import VideoTutorial

import os
from dotenv import load_dotenv

load_dotenv()

print("ALEMBIC DATABASE_URL =", os.getenv("POSTGRES_DATABASE_URL"))

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Set the database URL from environment variable
database_url = os.getenv("DATABASE_URL")
if database_url:
    config.set_main_option("sqlalchemy.url", database_url)

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    # Use the URL from config (which we set from environment variable)
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()