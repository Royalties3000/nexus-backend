MAX_SHIFT_HOURS = 8
MANDATORY_REST_HOURS = 11
FATIGUE_LIMIT_HOURS = 7


def within_shift_window(engineer, task_start_minute) -> bool:
    return engineer.shift_start <= task_start_minute < engineer.shift_end


def exceeds_max_shift(engineer) -> bool:
    return engineer.hours_worked_today >= MAX_SHIFT_HOURS


def has_mandatory_rest(engineer) -> bool:
    if engineer.last_shift_end is None:
        return True

    rest_minutes = engineer.shift_start - engineer.last_shift_end
    return rest_minutes >= MANDATORY_REST_HOURS * 60


def fatigue_compliant(engineer) -> bool:
    return engineer.hours_worked_today < FATIGUE_LIMIT_HOURS


def legally_available(engineer, task_start_minute) -> bool:
    return all([
        within_shift_window(engineer, task_start_minute),
        has_mandatory_rest(engineer),
        not exceeds_max_shift(engineer),
        fatigue_compliant(engineer),
    ])


from datetime import datetime


def legally_available(
    engineer,
    task_start_minute,
    active_overrides: list,
    now: datetime
) -> bool:

    for override in active_overrides:
        if (
            override.constraint == "FATIGUE_LIMIT"
            and override.target_id == engineer.engineer_id
            and override.is_active(now)
        ):
            return True  # explicitly allowed

    # Normal legality checks
    return all([
        within_shift_window(engineer, task_start_minute),
        has_mandatory_rest(engineer),
        not exceeds_max_shift(engineer),
        fatigue_compliant(engineer),
    ])
