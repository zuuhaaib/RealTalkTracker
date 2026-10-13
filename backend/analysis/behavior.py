from datetime import datetime


CONVERSATION_GAP_HOURS = 6


def parse_time(timestamp):
    return datetime.fromisoformat(timestamp)


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

    previous_message = None

    for msg in messages:
        sender = msg["sender"]
        current_time = parse_time(msg["timestamp"])

        if previous_message is None:
            stats[sender]["conversationStarts"] += 1
            previous_message = msg
            continue

        previous_sender = previous_message["sender"]
        previous_time = parse_time(previous_message["timestamp"])

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

        previous_message = msg

    for sender, sender_stats in stats.items():
        response_times = sender_stats["responseTimes"]

        if response_times:
            sorted_times = sorted(response_times)
            middle = len(sorted_times) // 2

            if len(sorted_times) % 2 == 0:
                median = (
                    sorted_times[middle - 1]
                    + sorted_times[middle]
                ) / 2
            else:
                median = sorted_times[middle]

            sender_stats["medianResponseTimeSeconds"] = round(median, 2)
        else:
            sender_stats["medianResponseTimeSeconds"] = None

        del sender_stats["responseTimes"]

    return stats