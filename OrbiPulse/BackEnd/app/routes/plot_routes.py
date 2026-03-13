from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.plot_service import PlotService
from ..schemas import PlotCreate, Plot
from typing import List

router = APIRouter(prefix="/plots", tags=["Plots"])

@router.post("", response_model=Plot)
def create_plot(plot: PlotCreate, db: Session = Depends(get_db)):
    """Create new plot"""
    service = PlotService(db)
    # TODO: Get farmer_id from authenticated user
    return service.create_plot(plot, farmer_id=plot.farmer_id)

@router.get("", response_model=List[Plot])
def get_plots(farmer_id: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all plots for farmer"""
    service = PlotService(db)
    return service.get_plots(farmer_id=farmer_id, skip=skip, limit=limit)

@router.get("/{plot_id}", response_model=Plot)
def get_plot(plot_id: int, farmer_id: str, db: Session = Depends(get_db)):
    """Get single plot"""
    service = PlotService(db)
    plot = service.get_plot(plot_id, farmer_id)
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found")
    return plot

@router.delete("/{plot_id}")
def delete_plot(plot_id: int, farmer_id: str, db: Session = Depends(get_db)):
    """Delete plot"""
    service = PlotService(db)
    if not service.delete_plot(plot_id, farmer_id):
        raise HTTPException(status_code=404, detail="Plot not found")
    return {"message": "Plot deleted successfully"}
