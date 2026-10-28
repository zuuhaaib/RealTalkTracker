def get_awards(statistics, behavior):
    participants = statistics.get("participants", {})
    names = list(participants)

    awards = {
        "biggestYapper": None,
        "mostWords": None,
        "longestMessages": None,
        "conversationStarter": None,
        "doubleTexter": None,
        "fastestResponder": None,
    }

    if not names:
        return awards

    def format_winners(winners):
        if len(winners) == 1:
            return winners[0]

        return f"{' & '.join(sorted(winners))} (tie)"

    def highest_positive_award(get_value):
        values = {
            name: get_value(name)
            for name in names
        }

        best_value = max(values.values())

        # Don't award something that nobody did.
        if best_value <= 0:
            return None

        winners = [
            name
            for name, value in values.items()
            if value == best_value
        ]

        return format_winners(winners)

    awards["biggestYapper"] = highest_positive_award(
        lambda name: participants[name]["messages"]
    )

    awards["mostWords"] = highest_positive_award(
        lambda name: participants[name]["words"]
    )

    awards["longestMessages"] = highest_positive_award(
        lambda name: participants[name]["averageWordsPerMessage"]
    )

    awards["conversationStarter"] = highest_positive_award(
        lambda name: behavior.get(name, {}).get(
            "conversationStarts", 0
        )
    )

    awards["doubleTexter"] = highest_positive_award(
        lambda name: behavior.get(name, {}).get(
            "doubleTexts", 0
        )
    )

    response_times = {
        name: behavior.get(name, {}).get(
            "medianResponseTimeSeconds"
        )
        for name in names
    }

    valid_response_times = {
        name: seconds
        for name, seconds in response_times.items()
        if seconds is not None and seconds >= 0
    }

    if valid_response_times:
        fastest_time = min(valid_response_times.values())

        winners = [
            name
            for name, seconds in valid_response_times.items()
            if seconds == fastest_time
        ]

        awards["fastestResponder"] = format_winners(winners)

    return awards