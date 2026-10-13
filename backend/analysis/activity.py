from collections import Counter
from datetime import datetime


def get_activity_statistics(messages):
    if not messages:
        return {}

    hour_counts = Counter()
    weekday_counts = Counter()
    month_counts = Counter()

    for msg in messages:
        timestamp = datetime.fromisoformat(msg["timestamp"])

        hour_counts[timestamp.hour] += 1
        weekday_counts[timestamp.strftime("%A")] += 1
        month_counts[timestamp.strftime("%Y-%m")] += 1

    messages_by_hour = [
        {
            "hour": hour,
            "messages": hour_counts.get(hour, 0)
        }
        for hour in range(24)
    ]

    weekday_order = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ]

    messages_by_weekday = [
        {
            "day": day,
            "messages": weekday_counts.get(day, 0)
        }
        for day in weekday_order
    ]

    messages_by_month = [
        {
            "month": month,
            "messages": count
        }
        for month, count in sorted(month_counts.items())
    ]

    busiest_hour = max(
        hour_counts,
        key=hour_counts.get
    ) if hour_counts else None

    busiest_day = max(
        weekday_counts,
        key=weekday_counts.get
    ) if weekday_counts else None

    busiest_month = max(
        month_counts,
        key=month_counts.get
    ) if month_counts else None

    return {
        "messagesByHour": messages_by_hour,
        "messagesByWeekday": messages_by_weekday,
        "messagesByMonth": messages_by_month,
        "busiestHour": busiest_hour,
        "busiestDay": busiest_day,
        "busiestMonth": busiest_month
    }