from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
import schemas
from auth import get_current_active_user

router = APIRouter(prefix="/api/stores", tags=["stores"])


@router.post("", response_model=schemas.Store, status_code=status.HTTP_201_CREATED)
def create_store(
    store_data: schemas.StoreCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Create store
    db_store = models.Store(
        owner_id=current_user.id,
        **store_data.model_dump()
    )
    db.add(db_store)
    db.commit()
    db.refresh(db_store)
    return db_store


@router.get("", response_model=List[schemas.Store])
def get_stores(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Store).filter(models.Store.is_active == True)

    if category:
        query = query.filter(models.Store.category == category)

    if search:
        query = query.filter(models.Store.name.ilike(f"%{search}%"))

    stores = query.offset(skip).limit(limit).all()
    return stores


@router.get("/{store_id}", response_model=schemas.Store)
def get_store(store_id: int, db: Session = Depends(get_db)):
    store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    return store


@router.put("/{store_id}", response_model=schemas.Store)
def update_store(
    store_id: int,
    store_data: schemas.StoreUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )

    # Check if user is the owner or admin
    if store.owner_id != current_user.id and current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this store"
        )

    # Update store
    for field, value in store_data.model_dump(exclude_unset=True).items():
        setattr(store, field, value)

    db.commit()
    db.refresh(store)
    return store


@router.delete("/{store_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_store(
    store_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )

    # Check if user is the owner or admin
    if store.owner_id != current_user.id and current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this store"
        )

    db.delete(store)
    db.commit()
    return None


@router.get("/my/stores", response_model=List[schemas.Store])
def get_my_stores(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    stores = db.query(models.Store).filter(models.Store.owner_id == current_user.id).all()
    return stores
