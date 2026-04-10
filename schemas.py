"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from enum import Enum


class UserRole(str, Enum):
    user = "user"
    admin = "admin"


class OrderStatus(str, Enum):
    pending_payment = "pending_payment"
    active = "active"
    suspended = "suspended"
    expired = "expired"
    cancelled = "cancelled"


class TransactionType(str, Enum):
    topup = "topup"
    payment = "payment"
    referral_bonus = "referral_bonus"
    refund = "refund"


class TransactionStatus(str, Enum):
    pending = "pending"
    success = "success"
    failed = "failed"


# Auth Schemas
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    referral_code: Optional[str] = None
    turnstile_token: str  # Cloudflare Turnstile


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    turnstile_token: str  # Cloudflare Turnstile


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    balance: Decimal
    referral_code: str
    role: str
    is_active: bool
    created_at: datetime


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)


# VPS Package Schemas
class VPSPackageCreate(BaseModel):
    name: str
    description: Optional[str] = None
    cpu: str
    ram: str
    storage: str
    bandwidth: str
    price_monthly: Decimal
    server_type: str = "vps"
    os_type: str = "linux"
    ip_type: str = "shared"


class VPSPackageUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cpu: Optional[str] = None
    ram: Optional[str] = None
    storage: Optional[str] = None
    bandwidth: Optional[str] = None
    price_monthly: Optional[Decimal] = None
    is_active: Optional[bool] = None
    server_type: str = "vps"
    os_type: str = "linux"
    ip_type: Optional[str] = "shared"


class VPSPackageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    description: Optional[str] = None
    cpu: str
    ram: str
    storage: str
    bandwidth: str
    price_monthly: Decimal
    is_active: bool
    created_at: datetime
    server_type: Optional[str] = "vps"
    os_type: Optional[str] = "linux"
    ip_type: Optional[str] = "shared"


# VPS Order Schemas
class VPSOrderCreate(BaseModel):
    package_id: int
    billing_cycle: Optional[int] = 1
    hostname: Optional[str] = None
    notes: Optional[str] = None
    total_price: Optional[int] = None
    payment_mode: Optional[str] = "balance"       # 'balance' | 'transfer'
    use_balance: Optional[bool] = False
    payment_method_id: Optional[int] = None


class VPSOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    package_id: int
    status: str
    started_at: datetime
    expired_at: datetime
    price_paid: Decimal
    notes: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime
    package: Optional[VPSPackageResponse] = None
    vps_details: Optional[str] = None  # JSON string
    payment_info: Optional[Dict[str, Any]] = None

class VPSOrderRenewRequest(BaseModel):
    payment_mode: Optional[str] = "balance"   # 'balance' | 'transfer'
    use_balance: Optional[bool] = False
    payment_method_id: Optional[int] = None
    billing_cycle: Optional[int] = 1          # berapa bulan perpanjang

class VPSOrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    notes: Optional[str] = None
    ip_address: Optional[str] = None
    vps_details: Optional[str] = None

# Transaction Schemas
class TopUpCreate(BaseModel):
    amount: Decimal = Field(..., gt=0)
    payment_method: str


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    type: str
    amount: Decimal
    description: Optional[str] = None
    reference_id: Optional[str] = None
    status: str
    created_at: datetime


class TransactionFilter(BaseModel):
    type: Optional[TransactionType] = None
    status: Optional[TransactionStatus] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


# Referral Schemas
class ReferralStats(BaseModel):
    total_referred: int
    total_earned: Decimal
    referral_code: str
    share_link: str


class ReferralLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    referrer_id: int
    referred_id: int
    bonus_amount: Decimal
    status: str
    created_at: datetime
    referred_user_name: Optional[str] = None


# Tripay Webhook
class TripayCallback(BaseModel):
    reference: str
    merchant_ref: str
    payment_method: str
    payment_method_code: str
    total_amount: int
    fee_merchant: int
    fee_customer: int
    total_fee: int
    amount_received: int
    is_closed_payment: int
    status: str
    paid_at: Optional[str] = None
    note: Optional[str] = None


# Admin Schemas
class AdminUserUpdate(BaseModel):
    is_active: Optional[bool] = None
    balance_adjustment: Optional[Decimal] = None
    balance_reason: Optional[str] = None


class AdminDashboardStats(BaseModel):
    total_users: int
    total_revenue: Decimal
    active_orders: int
    pending_payments: int


class SettingUpdate(BaseModel):
    key: str
    value: str


class SettingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    key: str
    value: Optional[str] = None


# Notification Schema
class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    type: str
    channel: str
    message: str
    sent_at: datetime
    status: str


# Payment Response
class PaymentInvoice(BaseModel):
    reference: str
    merchant_ref: str
    payment_url: str
    payment_method: str
    amount: int
    fee: int
    total: int
    expired_time: int
    qr_url: Optional[str] = None
    checkout_url: str

# Payment Method Schemas
class PaymentMethodCreate(BaseModel):
    name: str
    type: str  # bank | ewallet
    account_number: str
    account_name: str
    logo: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0

class PaymentMethodUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    account_number: Optional[str] = None
    account_name: Optional[str] = None
    logo: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None

class PaymentMethodResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    type: str
    account_number: str
    account_name: str
    logo: Optional[str] = None
    is_active: bool
    sort_order: int
    created_at: datetime

# Topup Request Schemas
class TopupRequestCreate(BaseModel):
    payment_method_id: int
    amount: Decimal = Field(..., gt=0)
    transfer_proof: Optional[str] = None
    order_id: Optional[int] = None

class TopupRequestUpdate(BaseModel):
    status: Optional[str] = None
    admin_notes: Optional[str] = None
    transfer_proof: Optional[str] = None
    proof_image: Optional[str] = None

class TopupRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    payment_method_id: int
    amount: Decimal
    unique_code: int
    total_transfer: Decimal
    status: str
    transfer_proof: Optional[str] = None
    admin_notes: Optional[str] = None
    proof_image: Optional[str] = None
    approved_by: Optional[int] = None
    order_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    payment_method: Optional[PaymentMethodResponse] = None

class BalanceResponse(BaseModel):
    balance: Decimal

# Support Ticket Schemas
class TicketCreate(BaseModel):
    subject: str = Field(..., min_length=5, max_length=255)
    message: str = Field(..., min_length=10)
    topup_request_id: Optional[int] = None
    order_id: Optional[int] = None
    priority: str = "normal"

class TicketReplyCreate(BaseModel):
    message: str = Field(..., min_length=1)

class TicketReplyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    ticket_id: int
    sender_id: int
    sender_role: str
    message: str
    created_at: datetime
    sender_name: Optional[str] = None

class TicketAdminAction(BaseModel):
    status: Optional[str] = None

class TicketResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    topup_request_id: Optional[int] = None
    order_id: Optional[int] = None
    subject: str
    message: str
    status: str
    priority: str
    admin_reply: Optional[str] = None
    replied_by: Optional[int] = None
    replied_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    user_name: Optional[str] = None
    replies: Optional[List[TicketReplyResponse]] = []

class TicketReply(BaseModel):
    admin_reply: str = Field(..., min_length=1)
    status: Optional[str] = None