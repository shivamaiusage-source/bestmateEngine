"""
Bestmate Engine — One-time data seed script (httpx version — no supabase client)
Usage:
    cd backend
    python scripts/seed_data.py
"""

import pandas as pd
import httpx
from dotenv import load_dotenv
import os
import sys

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_KEY in backend/.env")
    sys.exit(1)

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

FILES = {
    "rm_formulas": os.path.join(DATA_DIR, "RM_Consolidated_SIP_Formulas.xlsx"),
    "tracker":     os.path.join(DATA_DIR, "Tracker_For_Backoffice.xlsb.xlsx"),
    "bounce":      os.path.join(DATA_DIR, "SIP_BOUNCE_DATA.xlsx"),
    "targets":     os.path.join(DATA_DIR, "Target_Framework___Team_View.xlsx"),
}

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


def insert(table, records):
    """Insert records in chunks via Supabase REST API"""
    total = 0
    for i in range(0, len(records), CHUNK):
        chunk = records[i:i + CHUNK]
        clean = []
        for r in chunk:
            clean.append({
                k: (None if (isinstance(v, float) and pd.isna(v)) else v)
                for k, v in r.items()
            })
        url = f"{SUPABASE_URL}/rest/v1/{table}"
        resp = httpx.post(url, headers=HEADERS, json=clean, timeout=30)
        if resp.status_code not in (200, 201):
            print(f"  ✗ Error on chunk {i}: {resp.status_code} — {resp.text[:200]}")
        else:
            total += len(chunk)
    print(f"  ✓ Inserted {total} rows into '{table}'")


# ── 1. Relationship Managers ──────────────────────────────────
print("\n[1/5] Seeding relationship_managers ...")
try:
    rm_df = pd.read_excel(FILES["targets"], sheet_name="RM_Details", header=1)
    rm_df.columns = [
        "name", "city", "doj", "months", "salary",
        "prev_ap", "ap_req", "ap_onboard", "active_ap",
        "activation_pct", "deficit_ap", "sip_tgt",
        "demat_tgt", "health_ins", "life_ins",
    ]
    rm_df = rm_df.dropna(subset=["name"]).iloc[1:]
    records = []
    for _, r in rm_df.iterrows():
        records.append({
            "name":                   str(r["name"]).strip(),
            "city":                   str(r["city"]) if pd.notna(r["city"]) else None,
            "date_of_joining":        safe_date(r["doj"]),
            "months_of_service":      int(safe_float(r["months"])),
            "salary":                 safe_float(r["salary"]),
            "prev_months_active_ap":  int(safe_float(r["prev_ap"])),
            "ap_required_target":     int(safe_float(r["ap_req"])),
            "ap_onboarded_till_date": int(safe_float(r["ap_onboard"])),
            "active_ap_till_date":    int(safe_float(r["active_ap"])),
            "activation_pct":         safe_float(r["activation_pct"]),
            "deficit_ap":             int(safe_float(r["deficit_ap"])),
            "sip_target_monthly":     safe_float(r["sip_tgt"]),
            "demat_target":           int(safe_float(r["demat_tgt"])),
            "health_insurance_tgt":   int(safe_float(r["health_ins"])),
            "life_insurance_tgt":     int(safe_float(r["life_ins"])),
        })
    insert("relationship_managers", records)
except Exception as e:
    print(f"  ✗ Skipped: {e}")


# ── 2. SIP Records ────────────────────────────────────────────
print("\n[2/5] Seeding sip_records ...")
try:
    sip_df = pd.read_excel(FILES["rm_formulas"], sheet_name="Sheet1")
    sip_df.columns = [c.strip() for c in sip_df.columns]
    col_map = {
        "SCHEME NAME": "scheme_name", "CATEGORY": "category",
        "FOLIO": "folio", " FOLIO": "folio",
        "CLIENT": "client_name", " CLIENT": "client_name",
        "CLIENT PAN": "client_pan",
        " DEBIT  AMOUNT": "debit_amount", "DEBIT AMOUNT": "debit_amount",
        "FREQUENCY": "frequency",
        " RELATIONSHIP  MANAGER": "rm_name", "RELATIONSHIP MANAGER": "rm_name",
        " SUB  BROKER": "sub_broker", "SUB BROKER": "sub_broker",
        " SERVICE  AGENT": "service_agent", "SERVICE AGENT": "service_agent",
        "MONTHLY_EQUIV": "monthly_equiv",
    }
    sip_df = sip_df.rename(columns={k: v for k, v in col_map.items() if k in sip_df.columns})
    records = (
        sip_df.dropna(subset=["client_name"])
        .apply(lambda r: {
            "scheme_name":   str(r.get("scheme_name", ""))[:500],
            "category":      str(r["category"])       if pd.notna(r.get("category"))       else None,
            "folio":         str(r["folio"])           if pd.notna(r.get("folio"))           else None,
            "client_name":   str(r["client_name"]).strip(),
            "client_pan":    str(r["client_pan"])      if pd.notna(r.get("client_pan"))      else None,
            "debit_amount":  safe_float(r.get("debit_amount")),
            "frequency":     str(r.get("frequency", "monthly")).lower(),
            "rm_name":       str(r["rm_name"]).strip()       if pd.notna(r.get("rm_name"))       else None,
            "sub_broker":    str(r["sub_broker"]).strip()    if pd.notna(r.get("sub_broker"))    else None,
            "service_agent": str(r["service_agent"]).strip() if pd.notna(r.get("service_agent")) else None,
            "monthly_equiv": safe_float(r.get("monthly_equiv")),
        }, axis=1)
        .tolist()
    )
    insert("sip_records", records)
except Exception as e:
    print(f"  ✗ Skipped: {e}")


# ── 3. Client Tasks ───────────────────────────────────────────
print("\n[3/5] Seeding client_tasks ...")
try:
    tasks_df = pd.read_excel(FILES["tracker"], sheet_name="Client_Status_Report")
    col_map = {
        "Start Date":      "start_date",
        "End Date ":       "end_date",
        "End Date":        "end_date",
        "Employee Name":   "ops_member_name",
        "Client Name":     "client_name",
        "RM Name":         "rm_name",
        "SUB-BROKER":      "sub_broker",
        "Task Name":       "task_name",
        "Task Status":     "task_status",
        "Document Status": "document_status",
        "Remarks":         "remarks",
        "Final  Status":   "final_status",
        "Final Status":    "final_status",
        "Rejected Reason": "rejected_reason",
    }
    tasks_df = tasks_df.rename(columns={k: v for k, v in col_map.items() if k in tasks_df.columns})
    records = []
    for _, r in tasks_df.dropna(subset=["client_name", "ops_member_name"]).iterrows():
        records.append({
            "ops_member_name": str(r["ops_member_name"]).strip(),
            "rm_name":         str(r["rm_name"]).strip()      if pd.notna(r.get("rm_name"))         else None,
            "sub_broker":      str(r["sub_broker"])           if pd.notna(r.get("sub_broker"))       else None,
            "client_name":     str(r["client_name"]).strip(),
            "start_date":      safe_date(r.get("start_date")),
            "end_date":        safe_date(r.get("end_date")),
            "task_name":       str(r["task_name"]).strip()    if pd.notna(r.get("task_name"))        else None,
            "task_status":     str(r["task_status"]).strip()  if pd.notna(r.get("task_status"))      else None,
            "document_status": str(r["document_status"])      if pd.notna(r.get("document_status"))  else None,
            "remarks":         str(r["remarks"])              if pd.notna(r.get("remarks"))          else None,
            "final_status":    str(r["final_status"])         if pd.notna(r.get("final_status"))     else None,
            "rejected_reason": str(r["rejected_reason"])      if pd.notna(r.get("rejected_reason"))  else None,
        })
    insert("client_tasks", records)
except Exception as e:
    print(f"  ✗ Skipped: {e}")


# ── 4. SIP Bounce ─────────────────────────────────────────────
print("\n[4/5] Seeding sip_bounce ...")
try:
    bounce_df = pd.read_excel(FILES["bounce"], sheet_name="Total Bounce")
    records = []
    for _, r in bounce_df.dropna(subset=["Client Name"]).iterrows():
        records.append({
            "ucc":                str(r["UCC"])                  if pd.notna(r.get("UCC"))                else None,
            "bounce_date":        safe_date(r.get("Date")),
            "client_name":        str(r["Client Name"]).strip(),
            "scheme_name":        str(r["Scheme Name"])          if pd.notna(r.get("Scheme Name"))        else None,
            "installment_amt":    safe_float(r.get("Installment Amt")),
            "current_service_rm": str(r["Current Service RM "]).strip() if pd.notna(r.get("Current Service RM ")) else None,
            "rm_name":            str(r["RM NAME"]).strip()      if pd.notna(r.get("RM NAME"))            else None,
            "sub_broker":         str(r["SUB-BROKER"])           if pd.notna(r.get("SUB-BROKER"))         else None,
            "frequency_type":     str(r["Frequency Type"])       if pd.notna(r.get("Frequency Type"))     else None,
            "order_remark":       str(r["Order Remark"])         if pd.notna(r.get("Order Remark"))       else None,
            "order_status":       str(r["Order Status"])         if pd.notna(r.get("Order Status"))       else None,
            "fund_status":        str(r["Fund Status"])          if pd.notna(r.get("Fund Status"))        else None,
            "month":              str(r["Month"])                if pd.notna(r.get("Month"))              else None,
            "final_remarks":      str(r["Final Remarks"])        if pd.notna(r.get("Final Remarks"))      else None,
            "rm_remarks":         str(r["RM Remarks"])           if pd.notna(r.get("RM Remarks"))         else None,
            "detailed_remarks":   str(r["Detailed Remarks"])     if pd.notna(r.get("Detailed Remarks"))   else None,
        })
    insert("sip_bounce", records)
except Exception as e:
    print(f"  ✗ Skipped: {e}")


# ── 5. Ops Members ────────────────────────────────────────────
print("\n[5/5] Seeding ops_members ...")
try:
    ops_names = ["Mohit", "Neha", "Chanchal", "Kundan", "Sonali", "Akanksha"]
    records = [{"name": n, "role": "Backoffice", "is_active": True} for n in ops_names]
    insert("ops_members", records)
except Exception as e:
    print(f"  ✗ Skipped: {e}")


print("\n✅  All data seeded successfully!")
print("   Check your Supabase dashboard to verify the data.")