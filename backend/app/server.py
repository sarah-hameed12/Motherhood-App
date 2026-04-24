from fastapi import FastAPI, Depends, HTTPException, APIRouter
import os
import subprocess
from pathlib import Path
import shutil
from app.database.postgres import SessionLocal, engine
from sqlalchemy import text, MetaData
from app.router.auth_routes import auth_router
from app.middleware.protect_endpoints import verify_authentication
from fastapi.middleware.cors import CORSMiddleware
from app.router.child_routes import child_router
from app.router.profile_routes import profile_router
from app.router.admin_routes import admin_router
from app.router.child_growth_routes import child_growth_router
from app.router.vaccination_reminder_routes import vaccination_reminder_router
from app.router.community_routes import community_router
from app.router.vaccination_routes import vaccine_router
from app.router.mood_routes import router as mood_router  
from app.router.tutorial_routes import video_tutorial_router


# from app.llm_core.utils.vector_store import create_motherhood_collection
from app.router.llm_routes import llm_router
from app.router.socket_routes import router as socket_router

app = FastAPI()


# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["https://frontendsproj-production.up.railway.app"],  
#     allow_credentials=True,
#     allow_methods=["POST", "GET", "DELETE", "PUT", "PATCH", "OPTIONS"],
#     allow_headers=["*"],
# )


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["POST", "GET", "DELETE", "PUT", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    try:
        async with SessionLocal() as session:
            await session.execute(text("SELECT 1"))

        print("Databases connected successfully.")

    except Exception as e:
        print(f"Database connection failed: {e}")
        
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(child_router)
app.include_router(mood_router)  
app.include_router(vaccination_reminder_router)
app.include_router(community_router)
app.include_router(vaccine_router)
app.include_router(child_growth_router)
app.include_router(video_tutorial_router)
app.include_router(admin_router)
app.include_router(llm_router)
app.include_router(socket_router)



async def reset_database_and_migrations():
    """Delete all tables/data and migrations - USE WITH CAUTION!"""
    try:
        print("🚨 Starting complete reset of database and migrations...")
        
        # Step 1: Drop all tables from PostgreSQL
        async with engine.begin() as conn:
            # Get metadata and drop all tables
            meta = MetaData()
            await conn.run_sync(meta.reflect)
            
            if meta.tables:
                print(f"🗑️  Dropping {len(meta.tables)} tables...")
                await conn.run_sync(meta.drop_all)
                print("✅ All tables dropped!")
            else:
                print("ℹ️  No tables to drop.")
            
            # Drop alembic_version table if exists
            await conn.execute(text("DROP TABLE IF EXISTS alembic_version;"))
        
        # Step 2: Delete all migration files
        migrations_dir = Path("migrations/versions")
        if migrations_dir.exists():
            # Delete all .py files in versions directory
            for file in migrations_dir.glob("*.py"):
                file.unlink()
                print(f"🗑️  Deleted migration: {file.name}")
            
            # Check if we should delete the entire versions directory
            if len(list(migrations_dir.glob("*"))) == 0:
                print("📁 Migration versions directory is now empty")
        
        print("✅ Database and migrations reset complete!")
        
        return {
            "status": "success",
            "message": "Database tables and migrations deleted successfully",
            "next_steps": [
                "Run: alembic revision --autogenerate -m 'initial'",
                "Run: alembic upgrade head"
            ]
        }
        
    except Exception as e:
        error_msg = f"❌ Error during reset: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)


@app.get("/health")
async def health(reset: bool = False):
    """Health check endpoint with optional database reset"""
    if reset:
        # This is dangerous - you might want to add authentication/authorization
        return await reset_database_and_migrations()
    
    # Normal health check
    try:
        # Check PostgreSQL
        async with SessionLocal() as session:
            await session.execute(text("SELECT 1"))
        
        # Check MongoDB
        
        return {
            "status": "healthy",
            "postgres": "connected",
            "mongodb": "connected",
            "reset_available": True,
            "reset_endpoint": "/health?reset=true"
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "reset_available": True
        }


@app.post("/reset-all")
async def reset_all_tables():
    """Alternative endpoint to reset everything (requires auth if needed)"""
    # Uncomment if you want to add authentication
    # await verify_authentication(request)
    return await reset_database_and_migrations()



# from app.llm_core.utils.embeddings_service import create_embedding


# @app.post("/test")
# async def reset_all_tables():
#     text = "Child has completed vaccination schedule."
#     vector = create_embedding(text)

#     return {
#         "text": text,
#         "vector_size": len(vector)
#     }


@app.post("/recreate-migrations")
async def recreate_migrations():
    """After reset, recreate migrations"""
    try:
        # Run alembic commands
        result1 = subprocess.run(
            ["alembic", "revision", "--autogenerate", "-m", "initial"],
            capture_output=True,
            text=True
        )
        
        result2 = subprocess.run(
            ["alembic", "upgrade", "head"],
            capture_output=True,
            text=True
        )
        
        return {
            "status": "success",
            "revision_output": result1.stdout,
            "upgrade_output": result2.stdout,
            "errors": result1.stderr or result2.stderr or "None"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Optional: Add a protected reset endpoint (safer)
@app.post("/admin/reset-database")
async def admin_reset_database(auth: dict = Depends(verify_authentication)):
    """Protected endpoint to reset database (requires authentication)"""
    # Check if user is admin (add your own logic)
    # if not auth.get("is_admin"):
    #     raise HTTPException(status_code=403, detail="Admin access required")
    
    return await reset_database_and_migrations()
