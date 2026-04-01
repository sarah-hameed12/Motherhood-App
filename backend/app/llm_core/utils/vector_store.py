# from qdrant_client.http.models import Distance, VectorParams
# from app.llm_core.utils.qdrant_service import qdrant_client


# def create_motherhood_collection():

#     collections = qdrant_client.get_collections().collections
#     collection_names = [c.name for c in collections]

#     if "motherhood_knowledge" not in collection_names:
#         qdrant_client.create_collection(
#             collection_name="motherhood_knowledge",
#             vectors_config=VectorParams(
#                 size=384,
#                 distance=Distance.COSINE
#             )
#         )