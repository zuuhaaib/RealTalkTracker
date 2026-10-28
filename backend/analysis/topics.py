"""
Experimental and currently unused.

main.py passes empty sentiment/topic placeholders instead of calling
this module. Its dependencies (transformers, sentence-transformers,
scikit-learn) are intentionally not in requirements.txt, so importing
it in the deployed backend will fail. Kept for possible future work;
see README "experimental modules".
"""

from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans
from collections import Counter
import re

from analysis.message_content import split_message_content


_topic_model = None


def get_topic_model():
    global _topic_model

    if _topic_model is None:
        _topic_model = SentenceTransformer(
            "all-MiniLM-L6-v2"
        )

    return _topic_model


STOP_WORDS = {
    "the", "a", "an", "and", "or", "but", "to", "of", "in",
    "on", "for", "at", "with", "is", "it", "this", "that",
    "i", "you", "me", "my", "your", "we", "our", "he", "she",
    "they", "them", "be", "am", "are", "was", "were", "do",
    "does", "did", "have", "has", "had", "can", "could", "would",
    "should", "will", "just"
}


def get_keywords(messages, count=5):
    words = []

    for message in messages:
        found = re.findall(
            r"\b[\w']+\b",
            message.lower()
        )

        for word in found:
            if (
                len(word) > 2
                and word not in STOP_WORDS
                and not word.isdigit()
            ):
                words.append(word)

    return [
        word
        for word, _ in Counter(words).most_common(count)
    ]


def analyze_topics(messages, number_of_topics=6):
    usable_messages = []

    for msg in messages:
        # Captions remain usable text even when media is present.
        text, _ = split_message_content(msg["message"])

        if not text:
            continue

        if len(text.split()) < 3:
            continue

        usable_messages.append({
            "sender": msg["sender"],
            "message": text
        })

    if len(usable_messages) < number_of_topics:
        return []

    texts = [
        msg["message"]
        for msg in usable_messages
    ]

    # Load SentenceTransformer only when topic analysis is needed
    model = get_topic_model()

    embeddings = model.encode(
        texts,
        show_progress_bar=False
    )

    clustering = KMeans(
        n_clusters=number_of_topics,
        random_state=42,
        n_init=10
    )

    labels = clustering.fit_predict(embeddings)

    clusters = {}

    for message, label in zip(
        usable_messages,
        labels
    ):
        label = int(label)

        if label not in clusters:
            clusters[label] = []

        clusters[label].append(message)

    results = []

    for cluster_id, cluster_messages in clusters.items():
        texts_in_cluster = [
            msg["message"]
            for msg in cluster_messages
        ]

        sender_counts = Counter(
            msg["sender"]
            for msg in cluster_messages
        )

        keywords = get_keywords(
            texts_in_cluster
        )

        results.append({
            "cluster": cluster_id,
            "messageCount": len(cluster_messages),
            "keywords": keywords,
            "participants": dict(sender_counts),
            "examples": texts_in_cluster[:3]
        })

    results.sort(
        key=lambda x: x["messageCount"],
        reverse=True
    )

    return results