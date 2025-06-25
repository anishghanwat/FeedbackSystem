from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import schemas
from database import get_db
from services import get_notifications_for_user, mark_notification_as_read, mark_all_notifications_as_read
from .auth import get_current_active_user

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[schemas.Notification])
def read_notifications(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Retrieve all notifications for the current user.
    """
    return get_notifications_for_user(db=db, user_id=current_user.id)

@router.post("/{notification_id}/read", response_model=schemas.Notification)
def read_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Mark a specific notification as read.
    """
    notification = mark_notification_as_read(db=db, notification_id=notification_id, user_id=current_user.id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@router.post("/read-all", status_code=204)
def read_all_notifications(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Mark all of a user's notifications as read.
    """
    mark_all_notifications_as_read(db=db, user_id=current_user.id)
    return 