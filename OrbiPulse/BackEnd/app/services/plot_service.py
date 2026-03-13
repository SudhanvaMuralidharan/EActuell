from sqlalchemy.orm import Session
from ..models.plot_model import Plot
from ..schemas import PlotCreate
from typing import List

class PlotService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_plot(self, plot: PlotCreate, farmer_id: str) -> Plot:
        """Create new plot"""
        db_plot = Plot(**plot.dict(), farmer_id=farmer_id)
        self.db.add(db_plot)
        self.db.commit()
        self.db.refresh(db_plot)
        return db_plot
    
    def get_plots(self, farmer_id: str, skip: int = 0, limit: int = 100) -> List[Plot]:
        """Get all plots for a farmer"""
        return self.db.query(Plot).filter(Plot.farmer_id == farmer_id).offset(skip).limit(limit).all()
    
    def get_plot(self, plot_id: int, farmer_id: str) -> Plot:
        """Get single plot"""
        return self.db.query(Plot).filter(Plot.id == plot_id, Plot.farmer_id == farmer_id).first()
    
    def delete_plot(self, plot_id: int, farmer_id: str) -> bool:
        """Delete plot"""
        plot = self.db.query(Plot).filter(Plot.id == plot_id, Plot.farmer_id == farmer_id).first()
        if plot:
            self.db.delete(plot)
            self.db.commit()
            return True
        return False
