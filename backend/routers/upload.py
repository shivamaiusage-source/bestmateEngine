from fastapi import APIRouter, UploadFile, File, HTTPException
from database import get_supabase
import pandas as pd
import io

router = APIRouter(tags=["Upload"])

CHUNK = 500


def safe_date(val):
    if pd.isna(val):
        return None
    try:
        return str(pd.to_datetime(val))[:10]
    except Exception:
        return None


def safe_float(val):
    if pd.isna(val):
        return 0.0
    try:
        return float(str(val).replace(",", ""))
    except Exception:
        return 0.0


def chunk_insert(sb, table: str, records: list[dict]):
    for i in range(0, len(records), CHUNK):
        sb.table(table).insert(records[i : i + CHUNK]).execute()
    return len(records)


@router.post("/excel")
async def upload_excel(
    file:       UploadFile = File(...),
    sheet_type: str = "sip_records",
):
    """
    Upload Excel file to seed / append data in Supabase.

    sheet_type options:
      sip_records | client_tasks | sip_bounce | rm_monthly_targets
    """
    sb = get_supabase()
    contents = await file.read()

    try:
        df = pd.read_excel(io.BytesIO(contents))
    except Exception as exc:
        raise HTTPException(400, f"Could not parse Excel file: {exc}")

    # ── sip_records ────────────────────────────────────────────
    if sheet_type == "sip_records":
        col_map = {
            "SCHEME NAME": "scheme_name",
            "CATEGORY": "category",
            "FOLIO": "folio",
            " FOLIO": "folio",
            "CLIENT": "client_name",
            " CLIENT": "client_name",
            "CLIENT PAN": "client_pan",
            " DEBIT  AMOUNT": "debit_amount",
            "DEBIT AMOUNT": "debit_amount",
            "FREQUENCY": "frequency",
            " RELATIONSHIP  MANAGER": "rm_name",
            "RELATIONSHIP MANAGER": "rm_name",
            " SUB  BROKER": "sub_broker",
            "SUB BROKER": "sub_broker",
            " SERVICE  AGENT": "service_agent",
            "SERVICE AGENT": "service_agent",
            "MONTHLY_EQUIV": "monthly_equiv",
        }
        df = df.rename(columns={k: v for k, v in col_map.items() if k in df.columns})
        df.columns = [c.strip() for c in df.columns]

        records = (
            df.dropna(subset=["client_name"])
            .apply(
                lambda r: {
                    "scheme_name":    str(r.get("scheme_name",    ""))[:500],
                    "category":       str(r["category"])  if pd.notna(r.get("category"))  else None,
                    "folio":          str(r["folio"])      if pd.notna(r.get("folio"))      else None,
                    "client_name":    str(r["client_name"]).strip(),
                    "client_pan":     str(r["client_pan"]) if pd.notna(r.get("client_pan")) else None,
                    "debit_amount":   safe_float(r.get("debit_amount")),
                    "frequency":      str(r.get("frequency", "monthly")).lower(),
                    "rm_name":        str(r["rm_name"]).strip()      if pd.notna(r.get("rm_name"))      else None,
                    "sub_broker":     str(r["sub_broker"]).strip()   if pd.notna(r.get("sub_broker"))   else None,
                    "service_agent":  str(r["service_agent"]).strip() if pd.notna(r.get("service_agent")) else None,
                    "monthly_equiv":  safe_float(r.get("monthly_equiv")),
                },
                axis=1,
            )
            .tolist()
        )
        n = chunk_insert(sb, "sip_records", records)
        return {"inserted": n, "sheet_type": sheet_type}

    # ── client_tasks ───────────────────────────────────────────
    elif sheet_type == "client_tasks":
        col_map = {
            "Start Date":        "start_date",
            "End Date ":         "end_date",
            "End Date":          "end_date",
            "Employee Name":     "ops_member_name",
            "Client Name":       "client_name",
            "RM Name":           "rm_name",
            "SUB-BROKER":        "sub_broker",
            "Task Name":         "task_name",
            "Task Status":       "task_status",
            "Document Status":   "document_status",
            "Remarks":           "remarks",
            "Final  Status":     "final_status",
            "Final Status":      "final_status",
            "Rejected Reason":   "rejected_reason",
        }
        df = df.rename(columns={k: v for k, v in col_map.items() if k in df.columns})

        records = []
        for _, r in df.dropna(subset=["client_name", "ops_member_name"]).iterrows():
            rec = {
                "ops_member_name":  str(r["ops_member_name"]).strip(),
                "rm_name":          str(r["rm_name"]).strip()      if pd.notna(r.get("rm_name"))      else None,
                "sub_broker":       str(r["sub_broker"])            if pd.notna(r.get("sub_broker"))   else None,
                "client_name":      str(r["client_name"]).strip(),
                "start_date":       safe_date(r.get("start_date")),
                "end_date":         safe_date(r.get("end_date")),
                "task_name":        str(r["task_name"]).strip()     if pd.notna(r.get("task_name"))    else None,
                "task_status":      str(r["task_status"]).strip()   if pd.notna(r.get("task_status"))  else None,
                "document_status":  str(r["document_status"])       if pd.notna(r.get("document_status")) else None,
                "remarks":          str(r["remarks"])               if pd.notna(r.get("remarks"))      else None,
                "final_status":     str(r["final_status"])          if pd.notna(r.get("final_status")) else None,
                "rejected_reason":  str(r["rejected_reason"])       if pd.notna(r.get("rejected_reason")) else None,
            }
            records.append(rec)

        n = chunk_insert(sb, "client_tasks", records)
        return {"inserted": n, "sheet_type": sheet_type}

    # ── sip_bounce ─────────────────────────────────────────────
    elif sheet_type == "sip_bounce":
        records = []
        for _, r in df.dropna(subset=["Client Name"]).iterrows():
            records.append({
                "ucc":               str(r["UCC"])               if pd.notna(r.get("UCC"))               else None,
                "bounce_date":       safe_date(r.get("Date")),
                "client_name":       str(r["Client Name"]).strip(),
                "scheme_name":       str(r["Scheme Name"])       if pd.notna(r.get("Scheme Name"))       else None,
                "installment_amt":   safe_float(r.get("Installment Amt")),
                "current_service_rm":str(r["Current Service RM "]).strip() if pd.notna(r.get("Current Service RM ")) else None,
                "rm_name":           str(r["RM NAME"]).strip()   if pd.notna(r.get("RM NAME"))           else None,
                "sub_broker":        str(r["SUB-BROKER"])        if pd.notna(r.get("SUB-BROKER"))        else None,
                "frequency_type":    str(r["Frequency Type"])    if pd.notna(r.get("Frequency Type"))    else None,
                "order_remark":      str(r["Order Remark"])      if pd.notna(r.get("Order Remark"))      else None,
                "order_status":      str(r["Order Status"])      if pd.notna(r.get("Order Status"))      else None,
                "fund_status":       str(r["Fund Status"])       if pd.notna(r.get("Fund Status"))       else None,
                "month":             str(r["Month"])             if pd.notna(r.get("Month"))             else None,
                "final_remarks":     str(r["Final Remarks"])     if pd.notna(r.get("Final Remarks"))     else None,
                "rm_remarks":        str(r["RM Remarks"])        if pd.notna(r.get("RM Remarks"))        else None,
                "detailed_remarks":  str(r["Detailed Remarks"])  if pd.notna(r.get("Detailed Remarks"))  else None,
            })
        n = chunk_insert(sb, "sip_bounce", records)
        return {"inserted": n, "sheet_type": sheet_type}

    raise HTTPException(400, f"Unknown sheet_type: {sheet_type}. Valid: sip_records, client_tasks, sip_bounce")
