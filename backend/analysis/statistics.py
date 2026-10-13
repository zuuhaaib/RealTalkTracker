def get_basic_statistics(messages):
    if not messages:
        return {}

    participant_stats = {}

    for msg in messages:
        sender = msg["sender"]
        text = msg["message"]

        if sender not in participant_stats:
            participant_stats[sender] = {
                "messages": 0,
                "words": 0,
                "characters": 0
            }

        words = text.split()

        participant_stats[sender]["messages"] += 1
        participant_stats[sender]["words"] += len(words)
        participant_stats[sender]["characters"] += len(text)

    total_messages = len(messages)

    for sender, stats in participant_stats.items():
        stats["messagePercentage"] = round(
            (stats["messages"] / total_messages) * 100,
            2
        )

        stats["averageWordsPerMessage"] = round(
            stats["words"] / stats["messages"],
            2
        )

    return {
        "totalMessages": total_messages,
        "participants": participant_stats
    }