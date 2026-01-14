from typing import List
from .engineer import ServiceEngineer
from .maintenance import MaintenanceOrder


INDUSTRIAL_BUFFER_MINUTES = 20


def engineer_is_qualified(
    engineer: ServiceEngineer,
    order: MaintenanceOrder
) -> bool:
    return order.required_certifications.issubset(engineer.certifications)


def calculate_actual_duration(
    engineer: ServiceEngineer,
    order: MaintenanceOrder
) -> int:
    skill = engineer.skill_matrix.get(order.task_type, 0.5)
    adjusted = order.base_time_minutes * (order.task_difficulty / skill)
    return int(adjusted + INDUSTRIAL_BUFFER_MINUTES)


def select_best_engineer(
    engineers: List[ServiceEngineer],
    order: MaintenanceOrder
) -> ServiceEngineer | None:

    qualified = [
        e for e in engineers
        if engineer_is_qualified(e, order)
    ]

    if not qualified:
        return None

    return min(
        qualified,
        key=lambda e: e.available_from
    )

from domain.compliance import legally_available


def select_best_engineer(engineers, order, task_start_minute):

    eligible = [
        e for e in engineers
        if engineer_is_qualified(e, order)
        and legally_available(e, task_start_minute)
    ]

    if not eligible:
        return None

    return min(eligible, key=lambda e: e.available_from)