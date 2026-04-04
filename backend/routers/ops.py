from fastapi import APIRouter
from database import get_supabase
from typing import Optional

router = APIRouter(tags=["Operations"])


@router.get("/members")
def get_ops_members():
    sb = get_supabase()
    return sb.table("ops_members").select("*").eq("is_active", True).order("name").execute().data


@router.get("/client-tasks")
def get_client_tasks(
    ops_member: Optional[str] = None,
    rm_name:    Optional[str] = None,
    task_name:  Optional[str] = None,
    status:     Optional[str] = None,
    start_from: Optional[str] = None,
    start_to:   Optional[str] = None,
    limit:  int = 200,
    offset: int = 0,
):
    sb = get_supabase()
    q = sb.table("client_tasks").select("*").limit(limit).offset(offset)

    if ops_member: q = q.ilike("ops_member_name", f"%{ops_member}%")
    if rm_name:    q = q.ilike("rm_name",          f"%{rm_name}%")
    if task_name:  q = q.eq("task_name",            task_name)
    if status:     q = q.eq("task_status",          status)
    if start_from: q = q.gte("start_date",          start_from)
    if start_to:   q = q.lte("start_date",          start_to)

    return q.order("start_date", desc=True).execute().data


@router.get("/rm-ops-assignments")
def get_rm_ops_assignments(
    rm_name: Optional[str] = None,
    status:  Optional[str] = None,
):
    """Key endpoint: tasks an RM has assigned to the Ops team."""
    sb = get_supabase()
    q = sb.table("rm_ops_assignments").select("*")
    if rm_name: q = q.ilike("rm_name", f"%{rm_name}%")
    if status:  q = q.eq("status", status)
    return q.order("assigned_date", desc=True).execute().data


@router.get("/dashboard-summary")
def get_ops_dashboard_summary():
    """Summary stat cards for the ops dashboard header."""
    sb = get_supabase()
    tasks = sb.table("client_tasks").select("task_status").execute().data
    total     = len(tasks)
    complete  = sum(1 for t in tasks if t["task_status"] == "Complete")
    pending   = sum(1 for t in tasks if t["task_status"] == "Pending")
    rejected  = sum(1 for t in tasks if t["task_status"] == "Rejected")
    inprocess = sum(1 for t in tasks if t["task_status"] == "Inprocess")
    return {
        "total":           total,
        "complete":        complete,
        "pending":         pending,
        "rejected":        rejected,
        "inprocess":       inprocess,
        "completion_rate": round(complete / total * 100, 1) if total else 0,
    }


@router.get("/performance-daily")
def get_performance_daily(
    ops_member: Optional[str] = None,
    task_date:  Optional[str] = None,
    limit: int = 200,
):
    sb = get_supabase()
    q = sb.table("ops_performance_daily").select("*").limit(limit)
    if ops_member: q = q.ilike("ops_member_name", f"%{ops_member}%")
    if task_date:  q = q.eq("task_date", task_date)
    return q.order("task_date", desc=True).execute().data
