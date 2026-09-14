"""
Database configuration and models for VPS Reseller Store
Using PostgreSQL with SQLAlchemy and asyncpg
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, Numeric, func
from sqlalchemy.orm import relationship
import enum
import os

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/vpsstore")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()


class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"


class OrderStatus(str, enum.Enum):
    pending_payment = "pending_payment"
    active = "active"
    suspended = "suspended"
    expired = "expired"
    cancelled = "cancelled"


class TransactionType(str, enum.Enum):
    topup = "topup"
    payment = "payment"
    referral_bonus = "referral_bonus"
    refund = "refund"


class TransactionStatus(str, enum.Enum):
    pending = "pending"
    success = "success"
    failed = "failed"


class ReferralStatus(str, enum.Enum):
    pending = "pending"
    credited = "credited"

class ServerType(str, enum.Enum):
    vps = "vps"
    dedicated = "dedicated"

class OsType(str, enum.Enum):
    linux = "linux"
    windows = "windows"

class NotificationType(str, enum.Enum):
    payment_reminder = "payment_reminder"
    suspension_warning = "suspension_warning"
    topup_success = "topup_success"
    order_created = "order_created"
    welcome = "welcome"
    referral_bonus = "referral_bonus"

class TopupRequestStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    whatsapp = Column(String(50), nullable=True)
    balance = Column(Numeric(15, 2), default=0)
    referral_code = Column(String(20), unique=True, nullable=False, index=True)
    referred_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.user)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    referrer = relationship("User", remote_side=[id], backref="referrals")
    orders = relationship("VPSOrder", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")


class VPSPackage(Base):
    __tablename__ = "vps_packages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    cpu = Column(String(50), nullable=False)
    ram = Column(String(50), nullable=False)
    storage = Column(String(50), nullable=False)
    bandwidth = Column(String(50), nullable=False)
    server_type = Column(String, default="vps")  # vps | dedicated
    os_type = Column(String, default="linux")    # linux | windows
    ip_type = Column(String, default="shared")   # shared | dedicated
    os_options = Column(Text, nullable=True)     # daftar OS didukung, dipisah koma
    price_monthly = Column(Numeric(15, 2), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    orders = relationship("VPSOrder", back_populates="package")


class VPSOrder(Base):
    __tablename__ = "vps_orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    package_id = Column(Integer, ForeignKey("vps_packages.id"), nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.active)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    expired_at = Column(DateTime(timezone=True), nullable=False)
    price_paid = Column(Numeric(15, 2), nullable=False)
    notes = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    vps_details = Column(Text, nullable=True)  # JSON string: remote access, ports, credentials
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="orders")
    package = relationship("VPSPackage", back_populates="orders")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    description = Column(Text, nullable=True)
    reference_id = Column(String(255), nullable=True, index=True)
    status = Column(Enum(TransactionStatus), default=TransactionStatus.pending)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="transactions")


class ReferralLog(Base):
    __tablename__ = "referral_logs"

    id = Column(Integer, primary_key=True, index=True)
    referrer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    referred_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    bonus_amount = Column(Numeric(15, 2), nullable=False)
    status = Column(Enum(ReferralStatus), default=ReferralStatus.pending)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    referrer = relationship("User", foreign_keys=[referrer_id])
    referred = relationship("User", foreign_keys=[referred_id])


class NotificationLog(Base):
    __tablename__ = "notifications_log"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(NotificationType), nullable=False)
    channel = Column(String(50), default="email")
    message = Column(Text, nullable=False)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(50), default="sent")

    user = relationship("User")


class SiteSettings(Base):
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class PaymentMethod(Base):
    __tablename__ = "payment_methods"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)        # BCA, BRI, DANA, dll
    type = Column(String(50), nullable=False)          # bank | ewallet
    account_number = Column(String(100), nullable=False)  # nomor rekening/akun
    account_name = Column(String(255), nullable=False)    # nama pemilik
    logo = Column(String(50), nullable=True)           # bca, bri, dana, dll (untuk ikon)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TopupRequest(Base):
    __tablename__ = "topup_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    payment_method_id = Column(Integer, ForeignKey("payment_methods.id"), nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    unique_code = Column(Integer, nullable=False)      # kode unik 3 digit
    total_transfer = Column(Numeric(15, 2), nullable=False)  # amount + unique_code
    status = Column(Enum(TopupRequestStatus), default=TopupRequestStatus.pending)
    transfer_proof = Column(Text, nullable=True)       # catatan/bukti dari user
    admin_notes = Column(Text, nullable=True)
    proof_image = Column(String(500), nullable=True)  # path file gambar bukti transfer
    order_id = Column(Integer, ForeignKey("vps_orders.id"), nullable=True)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", foreign_keys=[user_id])
    payment_method = relationship("PaymentMethod")
    approver = relationship("User", foreign_keys=[approved_by])
    order = relationship("VPSOrder", foreign_keys=[order_id])

class TicketStatus(str, enum.Enum):
    open = "open"
    waiting_admin = "waiting_admin"
    waiting_user = "waiting_user"
    closed = "closed"

class TicketPriority(str, enum.Enum):
    low = "low"
    normal = "normal"
    high = "high"

class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topup_request_id = Column(Integer, ForeignKey("topup_requests.id"), nullable=True)
    order_id = Column(Integer, ForeignKey("vps_orders.id"), nullable=True)
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(Enum(TicketStatus), default=TicketStatus.open)
    priority = Column(Enum(TicketPriority), default=TicketPriority.normal)
    admin_reply = Column(Text, nullable=True)
    replied_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    replied_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", foreign_keys=[user_id])
    replier = relationship("User", foreign_keys=[replied_by])

class TicketReplyRole(str, enum.Enum):
    user = "user"
    admin = "admin"

class TicketReply(Base):
    __tablename__ = "ticket_replies"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("support_tickets.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sender_role = Column(Enum(TicketReplyRole), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    ticket = relationship("SupportTicket", foreign_keys=[ticket_id])
    sender = relationship("User", foreign_keys=[sender_id])

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)