from fastapi import APIRouter, Query
from database import get_supabase
from typing import Optional

router = APIRouter(tags=["Sales"])


@router.get("/rm-list")
def get_rm_list():
    sb = get_supabase()
    res = sb.table("relationship_managers").select(
        "id, name, city, date_of_joining, salary, sip_target_monthly, "
        "active_ap_till_date, grade, nism_status, is_active"
    ).eq("is_active", True).order("name").execute()
    return res.data


@router.get("/sip-records")
def get_sip_records(
    rm_id: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
):
    sb = get_supabase()
    q = sb.table("sip_records").select("*").limit(limit).offset(offset)
    if rm_id:
        q = q.eq("rm_id", rm_id)
    return q.execute().data


@router.get("/sip-bounce")
def get_sip_bounce(
    month:   Optional[str] = None,
    rm_name: Optional[str] = None,
    limit: int = 200,
):
    sb = get_supabase()
    q = sb.table("sip_bounce").select("*").order("bounce_date", desc=True).limit(limit)
    if month:
        q = q.eq("month", month)
    if rm_name:
        q = q.ilike("rm_name", f"%{rm_name}%")
    return q.execute().data


@router.get("/rm-targets/{rm_id}")
def get_rm_targets(rm_id: str, month: Optional[str] = None):
    sb = get_supabase()
    q = sb.table("rm_monthly_targets").select("*").eq("rm_id", rm_id)
    if month:
        q = q.eq("month", month)
    return q.execute().data


@router.get("/client-onboarding")
def get_client_onboarding(limit: int = 200):
    sb = get_supabase()
    return (
        sb.table("client_onboarding")
        .select("*")
        .order("create_date", desc=True)
        .limit(limit)
        .execute()
        .data
    )


@router.get("/sip-stops")
def get_sip_stops(limit: int = 200):
    sb = get_supabase()
    return (
        sb.table("sip_stops")
        .select("*")
        .order("stop_date", desc=True)
        .limit(limit)
        .execute()
        .data
    )


@router.get("/incentives")
def get_incentives(rm_id: Optional[str] = None, month: Optional[str] = None):
    sb = get_supabase()
    q = sb.table("rm_incentives").select("*")
    if rm_id:
        q = q.eq("rm_id", rm_id)
    if month:
        q = q.eq("month", month)
    return q.execute().data


@router.get("/authorized-partners")
def get_authorized_partners(rm_id: Optional[str] = None):
    sb = get_supabase()
    q = sb.table("authorized_partners").select("*")
    if rm_id:
        q = q.eq("rm_id", rm_id)
    return q.execute().data
