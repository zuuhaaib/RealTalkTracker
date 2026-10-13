def get_awards(statistics, behavior):
    participants = statistics.get("participants", {})

    if not participants:
        return {}

    names = list(participants.keys())

    awards = {}

    # Biggest yapper = most total messages
    awards["biggestYapper"] = max(
        names,
        key=lambda name: participants[name]["messages"]
    )

    # Most words overall
    awards["mostWords"] = max(
        names,
        key=lambda name: participants[name]["words"]
    )

    # Longest average messages
    awards["longestMessages"] = max(
        names,
        key=lambda name: participants[name]["averageWordsPerMessage"]
    )

    # Most conversation starts
    awards["conversationStarter"] = max(
        names,
        key=lambda name: behavior.get(name, {}).get("conversationStarts", 0)
    )

    # Most double texts
    awards["doubleTexter"] = max(
        names,
        key=lambda name: behavior.get(name, {}).get("doubleTexts", 0)
    )

    # Fastest median response time
    valid_response_times = [
        name
        for name in names
        if behavior.get(name, {}).get("medianResponseTimeSeconds") is not None
    ]

    if valid_response_times:
        awards["fastestResponder"] = min(
            valid_response_times,
            key=lambda name: behavior[name]["medianResponseTimeSeconds"]
        )
    else:
        awards["fastestResponder"] = None

    return awards