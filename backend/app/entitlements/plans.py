"""Plan -> limits/features mapping. Single place to tune what each plan gets.

These values are the server-side contract. The frontend may *display* them
but must never be trusted to enforce them.
"""

from __future__ import annotations

from dataclasses import dataclass

from app.db.models import Plan


@dataclass(frozen=True)
class PlanLimits:
    max_messages_per_day: int
    max_documents: int
    priority: bool


PLAN_LIMITS: dict[Plan, PlanLimits] = {
    Plan.free: PlanLimits(max_messages_per_day=20, max_documents=25, priority=False),
    Plan.pro: PlanLimits(max_messages_per_day=1000, max_documents=1000, priority=True),
}


def limits_for(plan: Plan) -> PlanLimits:
    return PLAN_LIMITS[plan]
