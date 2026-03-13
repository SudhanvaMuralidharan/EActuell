from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Plot
from ..schemas import PlotCreate, Plot
from typing import List

router = APIRouter()

@router.post("/plots", response_model=Plot)
def create_plot(plot: PlotCreate, db: Session = Depends(get_db)):
    db_plot = Plot(**plot.dict())
    db.add(db_plot)
    db.commit()
    db.refresh(db_plot)
    return db_plot

@router.get("/plots", response_model=List[Plot])
def get_plots(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    plots = db.query(Plot).offset(skip).limit(limit).all()
    return plots