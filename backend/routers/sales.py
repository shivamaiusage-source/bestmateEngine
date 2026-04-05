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


@router.get("/mtd-months")
def get_mtd_months():
    """Return all distinct months available in rm_monthly_targets, sorted newest first."""
    sb = get_supabase()
    res = (
        sb.table("rm_monthly_targets")
        .select("month, year, month_num")
        .order("year", desc=True)
        .order("month_num", desc=True)
        .execute()
        .data
    )
    seen = set()
    months = []
    for r in res:
        key = r["month"]
        if key not in seen:
            seen.add(key)
            months.append({"month": r["month"], "year": r["year"], "month_num": r["month_num"]})
    return months


@router.get("/mtd-view")
def get_mtd_view(month: Optional[str] = None):
    """
    MTD (Month-To-Date) view — mirrors the Excel MTD sheet.
    Returns per-RM target vs achievement for the given month,
    plus a Bestmate totals row.
    """
    sb = get_supabase()

    # Auto-detect latest month if not supplied
    if not month:
        latest = (
            sb.table("rm_monthly_targets")
            .select("month, year, month_num")
            .order("year", desc=True)
            .order("month_num", desc=True)
            .limit(1)
            .execute()
            .data
        )
        month = latest[0]["month"] if latest else None

    # Fetch only active RMs (both id and name) to filter out inactive/removed RMs
    active_rms = (
        sb.table("relationship_managers")
        .select("id, name")
        .eq("is_active", True)
        .execute()
        .data
    )
    active_rm_ids   = {r["id"]   for r in active_rms}
    active_rm_names = {r["name"].strip().lower() for r in active_rms}

    # Fetch targets for the month
    q = sb.table("rm_monthly_targets").select("*")
    if month:
        q = q.eq("month", month)
    all_rows = q.order("rm_name").execute().data

    # Keep only rows whose rm_id OR rm_name matches an active RM
    def _is_active_rm(row):
        if row.get("rm_id") and row["rm_id"] in active_rm_ids:
            return True
        name = (row.get("rm_name") or "").strip().lower()
        return name in active_rm_names

    rows = [r for r in all_rows if _is_active_rm(r)]

    # If no monthly targets exist yet, fall back to RM master + zeros
    if not rows:
        rms = (
            sb.table("relationship_managers")
            .select("id, name, sip_target_monthly, demat_target")
            .eq("is_active", True)
            .order("name")
            .execute()
            .data
        )
        rows = [
            {
                "rm_name":              r["name"],
                "rm_id":                r["id"],
                "sip_target":           r.get("sip_target_monthly") or 0,
                "sip_achieved":         0,
                "sip_bounce_amt":       0,
                "lumpsum_fresh_target": 0,
                "lumpsum_fresh_done":   0,
                "final_achievement_pct":0,
                "demat_ac_target":      r.get("demat_target") or 0,
                "demat_ac_done":        0,
                "demat_amount_target":  0,
                "demat_amount_done":    0,
                "mfd_target":           0,
                "mfd_done":             0,
                "nism_target":          0,
                "nism_done":            0,
                "mfd_activation_target":0,
                "mfd_activation_done":  0,
                "ulip_target":          0,
                "ulip_done":            0,
                "term_plan_target":     0,
                "term_plan_done":       0,
                "traditional_plan_target": 0,
                "traditional_plan_done":   0,
            }
            for r in rms
        ]

    def _sum(field):
        return sum((r.get(field) or 0) for r in rows)

    sip_t  = _sum("sip_target")
    sip_a  = _sum("sip_achieved")
    totals = {
        "rm_name":                  "Bestmate (Total)",
        "is_total":                 True,
        "sip_target":               sip_t,
        "sip_achieved":             sip_a,
        "sip_bounce_amt":           _sum("sip_bounce_amt"),
        "lumpsum_fresh_target":     _sum("lumpsum_fresh_target"),
        "lumpsum_fresh_done":       _sum("lumpsum_fresh_done"),
        "final_achievement_pct":    round(sip_a / sip_t * 100, 2) if sip_t else 0,
        "demat_ac_target":          _sum("demat_ac_target"),
        "demat_ac_done":            _sum("demat_ac_done"),
        "demat_amount_target":      _sum("demat_amount_target"),
        "demat_amount_done":        _sum("demat_amount_done"),
        "mfd_target":               _sum("mfd_target"),
        "mfd_done":                 _sum("mfd_done"),
        "nism_target":              _sum("nism_target"),
        "nism_done":                _sum("nism_done"),
        "mfd_activation_target":    _sum("mfd_activation_target"),
        "mfd_activation_done":      _sum("mfd_activation_done"),
        "ulip_target":              _sum("ulip_target"),
        "ulip_done":                _sum("ulip_done"),
        "term_plan_target":         _sum("term_plan_target"),
        "term_plan_done":           _sum("term_plan_done"),
        "traditional_plan_target":  _sum("traditional_plan_target"),
        "traditional_plan_done":    _sum("traditional_plan_done"),
    }

    return {"month": month, "data": rows, "totals": totals}


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
