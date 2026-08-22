"""Plan -> limits mapping: Pro must actually deliver more than Free."""

from __future__ import annotations

from app.db.models import Plan
from app.entitlements.plans import limits_for


def test_pro_beats_free() -> None:
    free = limits_for(Plan.free)
    pro = limits_for(Plan.pro)
    assert pro.max_messages_per_day > free.max_messages_per_day
    assert pro.max_documents > free.max_documents
    assert pro.priority and not free.priority
