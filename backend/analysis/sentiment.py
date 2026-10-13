from transformers import pipeline


_sentiment_pipeline = None


def get_sentiment_pipeline():
    global _sentiment_pipeline

    if _sentiment_pipeline is None:
        _sentiment_pipeline = pipeline(
            "sentiment-analysis",
            model="distilbert-base-uncased-finetuned-sst-2-english"
        )

    return _sentiment_pipeline


def analyze_sentiment(messages):
    results = {}

    # Don't load the model unless there are actually messages to analyze
    if not messages:
        return results

    sentiment_pipeline = get_sentiment_pipeline()

    for msg in messages:
        sender = msg["sender"]
        text = msg["message"].strip()

        if not text:
            continue

        if sender not in results:
            results[sender] = {
                "positive": 0,
                "negative": 0,
                "totalAnalyzed": 0,
            }

        # Skip extremely long messages for now
        text = text[:500]

        try:
            result = sentiment_pipeline(text)[0]

            label = result["label"]

            if label == "POSITIVE":
                results[sender]["positive"] += 1

            elif label == "NEGATIVE":
                results[sender]["negative"] += 1

            results[sender]["totalAnalyzed"] += 1

        except Exception:
            continue

    for sender, stats in results.items():
        total = stats["totalAnalyzed"]

        if total > 0:
            stats["positivePercentage"] = round(
                stats["positive"] / total * 100,
                2
            )

            stats["negativePercentage"] = round(
                stats["negative"] / total * 100,
                2
            )
        else:
            stats["positivePercentage"] = 0
            stats["negativePercentage"] = 0

    return results