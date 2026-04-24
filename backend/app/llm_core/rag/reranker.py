# from sentence_transformers import CrossEncoder

# reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")


def rerank(query, results):
    # pairs = [(query, r["content"]) for r in results]
    # scores = reranker.predict(pairs)

    # for i in range(len(results)):
    #     results[i]["rerank_score"] = float(scores[i])

    # results = sorted(results, key=lambda x: x["rerank_score"], reverse=True)
    # return results

    pass