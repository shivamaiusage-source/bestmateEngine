from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from routers import sales, ops, upload
from auth import verify_token
import os

app = FastAPI(
    title="Bestmate Engine API",
    description="Internal analytics API for Bestmate Investment Services",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://bestmateengine.vercel.app",
        "https://bestmate-engine.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sales.router,  prefix="/api/sales",  dependencies=[Depends(verify_token)])
app.include_router(ops.router,    prefix="/api/ops",    dependencies=[Depends(verify_token)])
app.include_router(upload.router, prefix="/api/upload", dependencies=[Depends(verify_token)])


@app.get("/health")
def health():
    return {"status": "ok", "service": "bestmate-engine"}
