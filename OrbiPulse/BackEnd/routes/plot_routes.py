from typing import List

from fastapi import APIRouter, Depends

from models.plot_model import Plot, PlotCreate, PlotUpdate, PlotWithValves
from models.user_model import UserPublic
from services import plot_service
from services.auth_service import get_current_user, oauth2_scheme

router = APIRouter(prefix="/plots", tags=["Plot Management"])


def _current_user(token: str = Depends(oauth2_scheme)) -> UserPublic:
    return get_current_user(token)


@router.get(
    "",
    response_model=List[Plot],
    summary="List all plots owned by the authenticated user",
)
def list_plots(user: UserPublic = Depends(_current_user)):
    return plot_service.list_plots(owner_id=user.id)


@router.post(
    "",
    response_model=Plot,
    status_code=201,
    summary="Create a new agricultural plot",
)
def create_plot(data: PlotCreate, user: UserPublic = Depends(_current_user)):
    return plot_service.create_plot(data, owner_id=user.id)


@router.get(
    "/{plot_id}",
    response_model=Plot,
    summary="Get a single plot by ID",
)
def get_plot(plot_id: str, user: UserPublic = Depends(_current_user)):
    return plot_service.get_plot(plot_id, owner_id=user.id)


@router.get(
    "/{plot_id}/valves",
    response_model=PlotWithValves,
    summary="Get a plot along with its associated valve IDs",
)
def get_plot_with_valves(plot_id: str, user: UserPublic = Depends(_current_user)):
    return plot_service.get_plot_with_valves(plot_id, owner_id=user.id)


@router.patch(
    "/{plot_id}",
    response_model=Plot,
    summary="Update plot details",
)
def update_plot(plot_id: str, data: PlotUpdate, user: UserPublic = Depends(_current_user)):
    return plot_service.update_plot(plot_id, data, owner_id=user.id)


@router.delete(
    "/{plot_id}",
    summary="Delete a plot",
)
def delete_plot(plot_id: str, user: UserPublic = Depends(_current_user)):
    return plot_service.delete_plot(plot_id, owner_id=user.id)
