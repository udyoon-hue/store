from sqlalchemy import Boolean, Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    STORE_OWNER = "store_owner"
    ADMIN = "admin"


class OrderStatus(str, enum.Enum):
    PENDING = "pending"  # 주문 접수
    CONFIRMED = "confirmed"  # 상점 확인
    PREPARING = "preparing"  # 조리중
    READY = "ready"  # 준비 완료
    DELIVERING = "delivering"  # 배달중
    COMPLETED = "completed"  # 완료
    CANCELLED = "cancelled"  # 취소


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(SQLEnum(UserRole), default=UserRole.CUSTOMER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    stores = relationship("Store", back_populates="owner")
    orders = relationship("Order", back_populates="customer")


class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    category = Column(String)  # 편의점, 과일, 정육 등
    address = Column(String, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    phone = Column(String)
    opening_hours = Column(String)  # JSON 형태로 저장 예정
    delivery_fee = Column(Float, default=0.0)
    min_order_amount = Column(Float, default=0.0)
    rating = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="stores")
    products = relationship("Product", back_populates="store")
    orders = relationship("Order", back_populates="store")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    price = Column(Float, nullable=False)
    image_url = Column(String)
    category = Column(String)
    is_available = Column(Boolean, default=True)  # 품절 여부
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    store = relationship("Store", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING)
    delivery_address = Column(String, nullable=False)
    delivery_phone = Column(String, nullable=False)
    special_requests = Column(Text)
    subtotal = Column(Float, nullable=False)  # 상품 합계
    delivery_fee = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)  # 총 금액
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    customer = relationship("User", back_populates="orders")
    store = relationship("Store", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)  # 주문 당시 가격
    subtotal = Column(Float, nullable=False)  # quantity * price

    # Relationships
    order = relationship("Order", back_populates="order_items")
    product = relationship("Product", back_populates="order_items")
