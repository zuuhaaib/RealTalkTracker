from datetime import datetime
from statistics import median


CONVERSATION_GAP_HOURS = 6


def get_behavior_statistics(messages):
    if not messages:
        return {}

    stats = {}

    for msg in messages:
        sender = msg["sender"]

        if sender not in stats:
            stats[sender] = {
                "doubleTexts": 0,
                "conversationStarts": 0,
                "responseTimes": []
            }

    previous_sender = None
    previous_time = None

    for msg in messages:
        sender = msg["sender"]
        # Parse each timestamp once and carry it to the next message.
        current_time = datetime.fromisoformat(msg["timestamp"])

        if previous_time is None:
            stats[sender]["conversationStarts"] += 1
            previous_sender = sender
            previous_time = current_time
            continue

        gap_seconds = (current_time - previous_time).total_seconds()
        gap_hours = gap_seconds / 3600

        # New conversation after a long period of inactivity
        if gap_hours >= CONVERSATION_GAP_HOURS:
            stats[sender]["conversationStarts"] += 1

        # Same person sends multiple messages in a row
        elif sender == previous_sender:
            stats[sender]["doubleTexts"] += 1

        # Different person responds
        else:
            stats[sender]["responseTimes"].append(gap_seconds)

        previous_sender = sender
        previous_time = current_time

    for sender, sender_stats in stats.items():
        response_times = sender_stats["responseTimes"]

        sender_stats["medianResponseTimeSeconds"] = (
            round(median(response_times), 2) if response_times else None
        )

        del sender_stats["responseTimes"]

    return stats