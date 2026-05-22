from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from pathlib import Path
import aiofiles
import os

from db.database import get_db, IFCModel
from ifc.parser import parse_ifc_summary

router = APIRouter()

MODELS_DIR = Path(os.getenv("MODELS_DIR", "./models"))


@router.post("/upload")
async def upload_ifc(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload an IFC model file and extract metadata."""
    if not file.filename.endswith(".ifc"):
        raise HTTPException(status_code=400, detail="Only .ifc files are accepted")

    dest = MODELS_DIR / file.filename
    async with aiofiles.open(dest, "wb") as f:
        content = await file.read()
        await f.write(content)

    # Parse IFC metadata
    try:
        summary = parse_ifc_summary(str(dest))
    except Exception as e:
        summary = {"element_count": 0, "schema": "unknown", "error": str(e)}

    record = IFCModel(
        filename=file.filename,
        file_path=str(dest),
        element_count=summary.get("element_count", 0),
        schema_version=summary.get("schema", "unknown"),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "id": record.id,
        "filename": record.filename,
        "element_count": record.element_count,
        "schema_version": record.schema_version,
        "summary": summary,
    }


@router.get("/")
def list_models(db: Session = Depends(get_db)):
    return db.query(IFCModel).order_by(IFCModel.uploaded_at.desc()).all()
