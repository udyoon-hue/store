from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
import schemas
from auth import get_current_active_user

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=schemas.Order, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: schemas.OrderCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Check if store exists
    store = db.query(models.Store).filter(models.Store.id == order_data.store_id).first()
    if not store or not store.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found or inactive"
        )

    # Calculate totals
    subtotal = 0.0
    order_items_data = []

    for item in order_data.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {item.product_id} not found"
            )
        if not product.is_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {product.name} is not available"
            )
        if product.store_id != order_data.store_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {product.name} does not belong to this store"
            )

        item_subtotal = product.price * item.quantity
        subtotal += item_subtotal

        order_items_data.append({
            "product_id": product.id,
            "quantity": item.quantity,
            "price": product.price,
            "subtotal": item_subtotal
        })

    total_amount = subtotal + store.delivery_fee

    # Check minimum order amount
    if subtotal < store.min_order_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Order total must be at least {store.min_order_amount}"
        )

    # Create order
    db_order = models.Order(
        customer_id=current_user.id,
        store_id=order_data.store_id,
        delivery_address=order_data.delivery_address,
        delivery_phone=order_data.delivery_phone,
        special_requests=order_data.special_requests,
        subtotal=subtotal,
        delivery_fee=store.delivery_fee,
        total_amount=total_amount,
        status=models.OrderStatus.PENDING
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # Create order items
    for item_data in order_items_data:
        db_item = models.OrderItem(
            order_id=db_order.id,
            **item_data
        )
        db.add(db_item)

    db.commit()
    db.refresh(db_order)

    return db_order


@router.get("", response_model=List[schemas.Order])
def get_orders(
    status: Optional[models.OrderStatus] = None,
    store_id: Optional[int] = None,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Customers can only see their own orders
    # Store owners can see orders for their stores
    # Admins can see all orders

    if current_user.role == models.UserRole.CUSTOMER:
        query = db.query(models.Order).filter(models.Order.customer_id == current_user.id)
    elif current_user.role == models.UserRole.STORE_OWNER:
        if store_id:
            # Check if user owns this store
            store = db.query(models.Store).filter(
                models.Store.id == store_id,
                models.Store.owner_id == current_user.id
            ).first()
            if not store:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to view orders for this store"
                )
            query = db.query(models.Order).filter(models.Order.store_id == store_id)
        else:
            # Get all orders for user's stores
            user_store_ids = [s.id for s in current_user.stores]
            query = db.query(models.Order).filter(models.Order.store_id.in_(user_store_ids))
    else:  # Admin
        query = db.query(models.Order)
        if store_id:
            query = query.filter(models.Order.store_id == store_id)

    if status:
        query = query.filter(models.Order.status == status)

    orders = query.order_by(models.Order.created_at.desc()).all()
    return orders


@router.get("/{order_id}", response_model=schemas.Order)
def get_order(
    order_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    # Check authorization
    if current_user.role == models.UserRole.CUSTOMER:
        if order.customer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this order"
            )
    elif current_user.role == models.UserRole.STORE_OWNER:
        store = db.query(models.Store).filter(
            models.Store.id == order.store_id,
            models.Store.owner_id == current_user.id
        ).first()
        if not store:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this order"
            )

    return order


@router.patch("/{order_id}/status", response_model=schemas.Order)
def update_order_status(
    order_id: int,
    status_update: schemas.OrderUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    # Only store owners and admins can update order status
    if current_user.role == models.UserRole.CUSTOMER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Customers cannot update order status"
        )

    if current_user.role == models.UserRole.STORE_OWNER:
        store = db.query(models.Store).filter(
            models.Store.id == order.store_id,
            models.Store.owner_id == current_user.id
        ).first()
        if not store:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this order"
            )

    order.status = status_update.status
    db.commit()
    db.refresh(order)

    return order
