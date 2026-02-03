from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import UserRole, OrderStatus


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    phone: Optional[str] = None
    full_name: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: User


# Store Schemas
class StoreBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    opening_hours: Optional[str] = None
    delivery_fee: float = 0.0
    min_order_amount: float = 0.0


class StoreCreate(StoreBase):
    pass


class StoreUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    opening_hours: Optional[str] = None
    delivery_fee: Optional[float] = None
    min_order_amount: Optional[float] = None
    is_active: Optional[bool] = None


class Store(StoreBase):
    id: int
    owner_id: int
    rating: float
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Product Schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    category: Optional[str] = None
    is_available: bool = True


class ProductCreate(ProductBase):
    store_id: int


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    is_available: Optional[bool] = None


class Product(ProductBase):
    id: int
    store_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Order Item Schemas
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int


class OrderItemCreate(OrderItemBase):
    pass


class OrderItem(OrderItemBase):
    id: int
    order_id: int
    price: float
    subtotal: float
    product: Optional[Product] = None

    class Config:
        from_attributes = True


# Order Schemas
class OrderBase(BaseModel):
    delivery_address: str
    delivery_phone: str
    special_requests: Optional[str] = None


class OrderCreate(OrderBase):
    store_id: int
    items: List[OrderItemCreate]


class OrderUpdate(BaseModel):
    status: OrderStatus


class Order(OrderBase):
    id: int
    customer_id: int
    store_id: int
    status: OrderStatus
    subtotal: float
    delivery_fee: float
    total_amount: float
    created_at: datetime
    order_items: List[OrderItem] = []
    store: Optional[Store] = None

    class Config:
        from_attributes = True
