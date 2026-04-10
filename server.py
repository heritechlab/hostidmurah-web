"""
VPS Reseller Store - Main FastAPI Application
"""
from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Query, Request, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc
from contextlib import asynccontextmanager
import os
import logging
import httpx
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from decimal import Decimal

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import local modules
from database import (
    get_db, init_db, User, VPSPackage, VPSOrder, Transaction, 
    ReferralLog, NotificationLog, SiteSettings,
    PaymentMethod, TopupRequest, TopupRequestStatus,
    SupportTicket, TicketStatus, TicketPriority, TicketReply as TicketReplyModel, TicketReplyRole,
    UserRole, OrderStatus, TransactionType, TransactionStatus, ReferralStatus, NotificationType
)
from schemas import (
    UserRegister, UserLogin, TokenResponse, RefreshTokenRequest, UserResponse, UserUpdate, PasswordChange,
    VPSPackageCreate, VPSPackageUpdate, VPSPackageResponse,
    VPSOrderCreate, VPSOrderResponse, VPSOrderUpdate, VPSOrderRenewRequest,
    TopUpCreate, TransactionResponse, TransactionFilter,
    ReferralStats, ReferralLogResponse,
    TripayCallback, PaymentInvoice,
    AdminUserUpdate, AdminDashboardStats, SettingUpdate, SettingResponse,
    NotificationResponse, BalanceResponse,
    PaymentMethodCreate, PaymentMethodUpdate, PaymentMethodResponse,
    TopupRequestCreate, TopupRequestUpdate, TopupRequestResponse,
    TicketCreate, TicketReplyCreate, TicketAdminAction, TicketReplyResponse, TicketResponse,
)
from auth import (
    get_password_hash, verify_password, create_access_token, create_refresh_token,
    decode_refresh_token, get_current_user, get_current_admin, generate_referral_code,
    create_password_reset_token, decode_password_reset_token
)
from tripay import get_payment_methods, create_invoice, verify_callback_signature
from email_service import (
    send_welcome_email, send_topup_success_email, send_order_created_email,
    send_referral_bonus_email, send_password_reset_email
)
from scheduler import start_scheduler, stop_scheduler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Referral bonus amount (configurable)
REFERRAL_BONUS_AMOUNT = int(os.environ.get("REFERRAL_BONUS_AMOUNT", "10000"))
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://localhost:3000")
TURNSTILE_SECRET = os.environ.get("TURNSTILE_SECRET_KEY", "")

async def verify_turnstile(token: str) -> bool:
    """Verify Cloudflare Turnstile token"""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={"secret": TURNSTILE_SECRET, "response": token}
        )
        result = resp.json()
        logger.info(f"Turnstile verify: {result.get('success')}")
        return result.get("success", False)
UPLOAD_DIR = "/www/wwwroot/host-id-murah-uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown"""
    # Startup
    logger.info("Starting up VPS Store API...")
    await init_db()
    await seed_initial_data()
    start_scheduler()
    yield
    # Shutdown
    stop_scheduler()
    logger.info("Shutting down VPS Store API...")


app = FastAPI(
    title="VPS Reseller Store API",
    description="API for VPS Reseller Store with e-wallet and referral system",
    version="1.0.0",
    lifespan=lifespan
)

# Create API router with /api prefix
api_router = APIRouter(prefix="/api")


async def seed_initial_data():
    """Seed initial admin user and settings"""
    from database import AsyncSessionLocal
    
    async with AsyncSessionLocal() as db:
        # Check if admin exists
        result = await db.execute(select(User).where(User.email == "admin@vpsstore.com"))
        admin = result.scalar_one_or_none()
        
        if not admin:
            admin = User(
                name="Administrator",
                email="admin@vpsstore.com",
                password_hash=get_password_hash("Admin123!"),
                referral_code=generate_referral_code(),
                role=UserRole.admin,
                is_active=True
            )
            db.add(admin)
            logger.info("Created initial admin user: admin@vpsstore.com")
        
        # Seed default settings
        default_settings = [
            ("referral_bonus_amount", "10000"),
            ("site_name", "VPS Store"),
            ("contact_whatsapp", "6281234567890"),
            ("smtp_host", "smtp.gmail.com"),
            ("smtp_port", "587"),
        ]
        
        for key, value in default_settings:
            result = await db.execute(select(SiteSettings).where(SiteSettings.key == key))
            setting = result.scalar_one_or_none()
            if not setting:
                setting = SiteSettings(key=key, value=value)
                db.add(setting)
        
        # Seed sample VPS packages
        result = await db.execute(select(func.count(VPSPackage.id)))
        count = result.scalar()
        
        if count == 0:
            packages = [
                VPSPackage(
                    name="Starter VPS",
                    description="Cocok untuk website personal dan blog",
                    cpu="1 vCPU",
                    ram="1 GB",
                    storage="20 GB SSD",
                    bandwidth="1 TB",
                    price_monthly=Decimal("50000"),
                    is_active=True
                ),
                VPSPackage(
                    name="Basic VPS",
                    description="Ideal untuk website bisnis kecil",
                    cpu="2 vCPU",
                    ram="2 GB",
                    storage="40 GB SSD",
                    bandwidth="2 TB",
                    price_monthly=Decimal("100000"),
                    is_active=True
                ),
                VPSPackage(
                    name="Standard VPS",
                    description="Performa optimal untuk aplikasi medium",
                    cpu="4 vCPU",
                    ram="4 GB",
                    storage="80 GB SSD",
                    bandwidth="4 TB",
                    price_monthly=Decimal("200000"),
                    is_active=True
                ),
                VPSPackage(
                    name="Professional VPS",
                    description="Untuk aplikasi dengan traffic tinggi",
                    cpu="6 vCPU",
                    ram="8 GB",
                    storage="160 GB SSD",
                    bandwidth="8 TB",
                    price_monthly=Decimal("400000"),
                    is_active=True
                ),
                VPSPackage(
                    name="Enterprise VPS",
                    description="Solusi enterprise untuk bisnis besar",
                    cpu="8 vCPU",
                    ram="16 GB",
                    storage="320 GB SSD",
                    bandwidth="Unlimited",
                    price_monthly=Decimal("800000"),
                    is_active=True
                ),
            ]
            for pkg in packages:
                db.add(pkg)
            logger.info("Created sample VPS packages")
        
        await db.commit()

# Billing cycle discount map
BILLING_DISCOUNTS = {1: 0, 3: 5, 6: 10, 12: 15}

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register new user"""
    # Verify Turnstile
    if not await verify_turnstile(data.turnstile_token):
        raise HTTPException(status_code=400, detail="Verifikasi keamanan gagal. Coba lagi.")
        
    # Check if email exists
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    
    # Check referral code if provided
    referred_by = None
    if data.referral_code:
        result = await db.execute(select(User).where(User.referral_code == data.referral_code))
        referrer = result.scalar_one_or_none()
        if referrer:
            referred_by = referrer.id
        else:
            raise HTTPException(status_code=400, detail="Kode referral tidak valid")
    
    # Create user
    user = User(
        name=data.name,
        email=data.email,
        password_hash=get_password_hash(data.password),
        phone=data.phone,
        whatsapp=data.whatsapp,
        referral_code=generate_referral_code(),
        referred_by=referred_by,
        role=UserRole.user,
        is_active=True
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Create referral log if referred
    if referred_by:
        referral_log = ReferralLog(
            referrer_id=referred_by,
            referred_id=user.id,
            bonus_amount=Decimal(REFERRAL_BONUS_AMOUNT),
            status=ReferralStatus.pending
        )
        db.add(referral_log)
        await db.commit()
    
    # Send welcome email
    await send_welcome_email(user.email, user.name, user.referral_code)
    
    # Generate tokens
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@api_router.post("/auth/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login user"""
    # Verify Turnstile
    if not await verify_turnstile(data.turnstile_token):
        raise HTTPException(status_code=400, detail="Verifikasi keamanan gagal. Coba lagi.")
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email atau password salah")
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Akun Anda telah dinonaktifkan")
    
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@api_router.post("/auth/refresh", response_model=TokenResponse)
async def refresh_token(data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Refresh access token"""
    payload = decode_refresh_token(data.refresh_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    
    access_token = create_access_token({"sub": str(user.id)})
    new_refresh_token = create_refresh_token({"sub": str(user.id)})
    
    return TokenResponse(access_token=access_token, refresh_token=new_refresh_token)


@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    """Get current user info"""
    return user


@api_router.put("/auth/profile", response_model=UserResponse)
async def update_profile(
    data: UserUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user profile"""
    if data.name:
        user.name = data.name
    if data.phone is not None:
        user.phone = data.phone
    if data.whatsapp is not None:
        user.whatsapp = data.whatsapp
    
    await db.commit()
    await db.refresh(user)
    return user


@api_router.post("/auth/change-password")
async def change_password(
    data: PasswordChange,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Change user password"""
    if not verify_password(data.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Password saat ini salah")
    
    user.password_hash = get_password_hash(data.new_password)
    await db.commit()
    
    return {"message": "Password berhasil diubah"}


@api_router.post("/auth/forgot-password")
async def forgot_password(
    data: dict,
    db: AsyncSession = Depends(get_db)
):
    """
    Request reset link. Always returns 200 to prevent email enumeration.
    Validates Turnstile token if TURNSTILE_SECRET is set.
    """
    email = data.get("email", "").strip().lower()
    cf_token = data.get("cf_token", "")

    if not email:
        raise HTTPException(status_code=400, detail="Email wajib diisi")

    # Verify Turnstile
    if TURNSTILE_SECRET and cf_token:
        if not await verify_turnstile(cf_token):
            raise HTTPException(status_code=400, detail="Verifikasi gagal, coba lagi")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user and user.is_active:
        reset_token = create_password_reset_token(user.email)
        await send_password_reset_email(user.email, user.name, reset_token)
        logger.info(f"Password reset requested for: {email}")

    # Always return success to prevent email enumeration
    return {"message": "Jika email terdaftar, link reset telah dikirim"}


@api_router.post("/auth/reset-password")
async def reset_password(
    data: dict,
    db: AsyncSession = Depends(get_db)
):
    """Reset password using token from email."""
    token = data.get("token", "")
    new_password = data.get("new_password", "")

    if not token:
        raise HTTPException(status_code=400, detail="Token tidak valid")
    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="Password minimal 8 karakter")

    email = decode_password_reset_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Link reset tidak valid atau sudah kedaluwarsa")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(status_code=400, detail="Akun tidak ditemukan atau tidak aktif")

    user.password_hash = get_password_hash(new_password)
    await db.commit()
    logger.info(f"Password reset successful for: {email}")

    return {"message": "Password berhasil direset. Silakan masuk dengan password baru."}


# ==================== SALDO / BALANCE ROUTES ====================

@api_router.get("/saldo/balance", response_model=BalanceResponse)
async def get_balance(user: User = Depends(get_current_user)):
    """Get user balance"""
    return BalanceResponse(balance=user.balance)


@api_router.get("/saldo/history", response_model=List[TransactionResponse])
async def get_transaction_history(
    type: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user transaction history"""
    query = select(Transaction).where(Transaction.user_id == user.id)
    
    if type:
        query = query.where(Transaction.type == type)
    if status:
        query = query.where(Transaction.status == status)
    if start_date:
        query = query.where(Transaction.created_at >= start_date)
    if end_date:
        query = query.where(Transaction.created_at <= end_date)
    
    query = query.order_by(desc(Transaction.created_at)).limit(limit).offset(offset)
    
    result = await db.execute(query)
    transactions = result.scalars().all()
    
    return transactions


@api_router.post("/saldo/topup", response_model=PaymentInvoice)
async def create_topup(
    data: TopUpCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create top up invoice via Tripay"""
    amount = int(data.amount)
    
    if amount < 10000:
        raise HTTPException(status_code=400, detail="Minimum top up Rp 10.000")
    
    # Create Tripay invoice
    invoice_data = create_invoice(
        amount=amount,
        payment_method=data.payment_method,
        user_id=user.id,
        user_name=user.name,
        user_email=user.email,
        user_phone=user.whatsapp or user.phone or ""
    )
    
    if not invoice_data.get("success"):
        raise HTTPException(status_code=500, detail="Gagal membuat invoice pembayaran")
    
    invoice = invoice_data["data"]
    
    # Create pending transaction
    transaction = Transaction(
        user_id=user.id,
        type=TransactionType.topup,
        amount=Decimal(amount),
        description=f"Top up via {invoice['payment_name']}",
        reference_id=invoice["reference"],
        status=TransactionStatus.pending
    )
    db.add(transaction)
    await db.commit()
    
    return PaymentInvoice(
        reference=invoice["reference"],
        merchant_ref=invoice["merchant_ref"],
        payment_url=invoice["pay_url"],
        payment_method=invoice["payment_method"],
        amount=amount,
        fee=invoice["total_fee"],
        total=amount + invoice["total_fee"],
        expired_time=invoice["expired_time"],
        qr_url=invoice.get("qr_url"),
        checkout_url=invoice["checkout_url"]
    )


@api_router.get("/saldo/payment-methods")
async def get_available_payment_methods():
    """Get available payment methods from Tripay"""
    return get_payment_methods()


# ==================== VPS PACKAGES ROUTES ====================

@api_router.get("/packages", response_model=List[VPSPackageResponse])
async def list_packages(
    active_only: bool = True,
    db: AsyncSession = Depends(get_db)
):
    """List all VPS packages (public)"""
    query = select(VPSPackage)
    if active_only:
        query = query.where(VPSPackage.is_active == True)
    query = query.order_by(VPSorder.price_paid)
    
    result = await db.execute(query)
    packages = result.scalars().all()
    
    return packages


@api_router.get("/packages/{package_id}", response_model=VPSPackageResponse)
async def get_package(package_id: int, db: AsyncSession = Depends(get_db)):
    """Get package details (public)"""
    result = await db.execute(select(VPSPackage).where(VPSPackage.id == package_id))
    package = result.scalar_one_or_none()
    
    if not package:
        raise HTTPException(status_code=404, detail="Paket tidak ditemukan")
    
    return package


# ==================== VPS ORDERS ROUTES ====================

#--- NEW Order GANTI DENGAN INI ---
 
@api_router.post("/orders", response_model=VPSOrderResponse)
async def create_order(
    data: VPSOrderCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create new VPS order with billing cycle and payment mode support"""
    import random
 
    # Get package
    result = await db.execute(select(VPSPackage).where(VPSPackage.id == data.package_id))
    package = result.scalar_one_or_none()
 
    if not package or not package.is_active:
        raise HTTPException(status_code=404, detail="Paket tidak tersedia")
 
    # Calculate pricing with billing cycle
    billing_cycle = data.billing_cycle or 1
    if billing_cycle not in BILLING_DISCOUNTS:
        billing_cycle = 1
 
    discount_pct = BILLING_DISCOUNTS[billing_cycle]
    monthly_price = order.price_paid
    discounted_monthly = int(monthly_price * (1 - Decimal(discount_pct) / 100))
    total_price = Decimal(discounted_monthly) * billing_cycle
    duration_days = billing_cycle * 30
 
    payment_mode = data.payment_mode or "balance"
    use_balance = data.use_balance or False
 
    # ===== MODE 1: Pay entirely with balance =====
    if payment_mode == "balance":
        if user.balance < total_price:
            raise HTTPException(
                status_code=400,
                detail=f"Saldo tidak cukup. Dibutuhkan {int(total_price):,}. Saldo Anda Rp {int(user.balance):,}"
            )
 
        user.balance -= total_price
 
        order = VPSOrder(
            user_id=user.id,
            package_id=package.id,
            status=OrderStatus.active,
            expired_at=datetime.now(timezone.utc) + timedelta(days=duration_days),
            price_paid=total_price,
            notes=data.notes or None
        )
        db.add(order)
 
        desc_text = f"Pembelian {package.name} ({billing_cycle} bulan)"
        if discount_pct > 0:
            desc_text += f" - diskon {discount_pct}%"
 
        transaction = Transaction(
            user_id=user.id,
            type=TransactionType.payment,
            amount=-total_price,
            description=desc_text,
            status=TransactionStatus.success
        )
        db.add(transaction)
 
        await db.commit()
        await db.refresh(order)
 
        await send_order_created_email(
            user.email, user.name, package.name, float(total_price), order.expired_at, is_renewal=False
        )
 
        notif = NotificationLog(
            user_id=user.id,
            type=NotificationType.order_created,
            message=f"Order {package.name} ({billing_cycle} bulan) - dibayar saldo",
            status="sent"
        )
        db.add(notif)
        await db.commit()
 
        order.package = package
        return order
 
    # ===== MODE 2: Transfer manual =====
    balance_used = Decimal(0)
    if use_balance and user.balance > 0:
        balance_used = min(user.balance, total_price)
        user.balance -= balance_used
 
    remaining_amount = total_price - balance_used
 
    # Create order as pending_payment (if there's remaining to pay)
    order_status = OrderStatus.active if remaining_amount <= 0 else OrderStatus.pending_payment
 
    order = VPSOrder(
        user_id=user.id,
        package_id=package.id,
        status=order_status,
        expired_at=datetime.now(timezone.utc) + timedelta(days=duration_days),
        price_paid=total_price,
        notes=data.notes or None
    )
    db.add(order)
 
    # Log balance deduction if any
    if balance_used > 0:
        balance_tx = Transaction(
            user_id=user.id,
            type=TransactionType.payment,
            amount=-balance_used,
            description=f"Pembayaran sebagian {package.name} (dari saldo)",
            status=TransactionStatus.success
        )
        db.add(balance_tx)
 
    await db.commit()
    await db.refresh(order)
 
    # Create topup request for remaining amount
    if remaining_amount > 0:
        if not data.payment_method_id:
            raise HTTPException(
              status_code=400,
              detail="Pilih metode pembayaran untuk menyelesaikan pembayaran"
           )
        unique_code = random.randint(1, 999)
        total_transfer = remaining_amount + Decimal(unique_code)
 
        topup_request = TopupRequest(
            user_id=user.id,
            payment_method_id=data.payment_method_id,
            amount=remaining_amount,
            unique_code=unique_code,
            total_transfer=total_transfer,
            status=TopupRequestStatus.pending,
            order_id=order.id,
        )
        db.add(topup_request)
        await db.commit()
    
        # BONUS
        order.payment_info = {
            "amount": float(remaining_amount),
            "unique_code": unique_code,
            "total_transfer": float(total_transfer),
            "payment_method_id": data.payment_method_id,
        }
    
    # Notification
    notif = NotificationLog(
        user_id=user.id,
        type=NotificationType.order_created,
        message=f"Order {package.name} ({billing_cycle} bulan) - {'menunggu pembayaran' if order_status == OrderStatus.pending_payment else 'aktif'}",
        status="sent"
    )
    db.add(notif)
    await db.commit()
 
    order.package = package
    return order
 
#--- End New Order ---


@api_router.get("/orders", response_model=List[VPSOrderResponse])
async def list_user_orders(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all orders for current user"""
    result = await db.execute(
        select(VPSOrder).where(VPSOrder.user_id == user.id).order_by(VPSOrder.created_at.desc())
    )
    orders = result.scalars().all()

    # Load packages for each order
    for order in orders:
        pkg_result = await db.execute(select(VPSPackage).where(VPSPackage.id == order.package_id))
        order.package = pkg_result.scalar_one_or_none()

    return orders


@api_router.get("/orders/{order_id}", response_model=VPSOrderResponse)
async def get_order(
    order_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get order details"""
    result = await db.execute(
        select(VPSOrder).where(
            and_(VPSOrder.id == order_id, VPSOrder.user_id == user.id)
        )
    )
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Pesanan tidak ditemukan")

    # Load package
    pkg_result = await db.execute(select(VPSPackage).where(VPSPackage.id == order.package_id))
    order.package = pkg_result.scalar_one_or_none()

    return order


# ==================== REFERRAL ROUTES ====================

@api_router.get("/referral/stats", response_model=ReferralStats)
async def get_referral_stats(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's referral statistics"""
    # Count total referred
    result = await db.execute(
        select(func.count(ReferralLog.id)).where(ReferralLog.referrer_id == user.id)
    )
    total_referred = result.scalar() or 0
    
    # Sum total earned
    result = await db.execute(
        select(func.sum(ReferralLog.bonus_amount)).where(
            and_(
                ReferralLog.referrer_id == user.id,
                ReferralLog.status == ReferralStatus.credited
            )
        )
    )
    total_earned = result.scalar() or Decimal(0)
    
    share_link = f"{FRONTEND_URL}/register?ref={user.referral_code}"
    
    return ReferralStats(
        total_referred=total_referred,
        total_earned=total_earned,
        referral_code=user.referral_code,
        share_link=share_link
    )


@api_router.get("/referral/list", response_model=List[ReferralLogResponse])
async def get_referral_list(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get list of referred users"""
    result = await db.execute(
        select(ReferralLog, User)
        .join(User, ReferralLog.referred_id == User.id)
        .where(ReferralLog.referrer_id == user.id)
        .order_by(desc(ReferralLog.created_at))
    )
    
    referrals = []
    for log, referred_user in result.all():
        referrals.append(ReferralLogResponse(
            id=log.id,
            referrer_id=log.referrer_id,
            referred_id=log.referred_id,
            bonus_amount=log.bonus_amount,
            status=log.status.value,
            created_at=log.created_at,
            referred_user_name=referred_user.name
        ))
    
    return referrals


# ==================== PAYMENT WEBHOOK ====================

@api_router.post("/payment/webhook")
async def tripay_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Handle Tripay payment webhook callback"""
    try:
        data = await request.json()
        logger.info(f"Received webhook: {data}")
        
        # Verify signature (in mock mode, always passes)
        if not verify_callback_signature(data):
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        reference = data.get("reference")
        status = data.get("status")
        
        if not reference or not status:
            raise HTTPException(status_code=400, detail="Missing required fields")
        
        # Find transaction
        result = await db.execute(
            select(Transaction).where(Transaction.reference_id == reference)
        )
        transaction = result.scalar_one_or_none()
        
        if not transaction:
            logger.warning(f"Transaction not found for reference: {reference}")
            return {"success": True}  # Return success to prevent retry
        
        if status == "PAID":
            if transaction.status == TransactionStatus.pending:
                # Update transaction status
                transaction.status = TransactionStatus.success
                
                # Get user and credit balance
                result = await db.execute(select(User).where(User.id == transaction.user_id))
                user = result.scalar_one_or_none()
                
                if user:
                    user.balance += transaction.amount
                    
                    # Send success email
                    await send_topup_success_email(
                        user.email, user.name, float(transaction.amount), float(user.balance)
                    )
                    
                    # Log notification
                    notif = NotificationLog(
                        user_id=user.id,
                        type=NotificationType.topup_success,
                        message=f"Top up Rp {int(transaction.amount):,} berhasil",
                        status="sent"
                    )
                    db.add(notif)
                    
                    # Check and process referral bonus for first time top up
                    await process_referral_bonus(user, db)
                
                await db.commit()
                logger.info(f"Payment successful for reference: {reference}")
        
        elif status == "FAILED" or status == "EXPIRED":
            transaction.status = TransactionStatus.failed
            await db.commit()
            logger.info(f"Payment failed/expired for reference: {reference}")
        
        return {"success": True}
        
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def process_referral_bonus(user: User, db: AsyncSession):
    """Process referral bonus if this is user's first successful top up"""
    if not user.referred_by:
        return
    
    # Check if this is first top up
    result = await db.execute(
        select(func.count(Transaction.id)).where(
            and_(
                Transaction.user_id == user.id,
                Transaction.type == TransactionType.topup,
                Transaction.status == TransactionStatus.success
            )
        )
    )
    topup_count = result.scalar()
    
    if topup_count != 1:  # Not first top up
        return
    
    # Find pending referral log
    result = await db.execute(
        select(ReferralLog).where(
            and_(
                ReferralLog.referred_id == user.id,
                ReferralLog.status == ReferralStatus.pending
            )
        )
    )
    referral_log = result.scalar_one_or_none()
    
    if not referral_log:
        return
    
    # Get referrer
    result = await db.execute(select(User).where(User.id == user.referred_by))
    referrer = result.scalar_one_or_none()
    
    if not referrer:
        return
    
    # Credit bonus to referrer
    bonus_amount = referral_log.bonus_amount
    referrer.balance += bonus_amount
    referral_log.status = ReferralStatus.credited
    
    # Create bonus transaction
    bonus_transaction = Transaction(
        user_id=referrer.id,
        type=TransactionType.referral_bonus,
        amount=bonus_amount,
        description=f"Bonus referral dari {user.name}",
        status=TransactionStatus.success
    )
    db.add(bonus_transaction)
    
    # Send email to referrer
    await send_referral_bonus_email(
        referrer.email, referrer.name, user.name, float(bonus_amount), float(referrer.balance)
    )
    
    # Log notification
    notif = NotificationLog(
        user_id=referrer.id,
        type=NotificationType.referral_bonus,
        message=f"Referral bonus Rp {int(bonus_amount):,} credited",
        status="sent"
    )
    db.add(notif)
    
    logger.info(f"Referral bonus {bonus_amount} credited to user {referrer.id}")


# ==================== MOCK PAYMENT SIMULATION ====================

@api_router.post("/payment/simulate")
async def simulate_payment(
    reference: str,
    db: AsyncSession = Depends(get_db)
):
    """
    [DEV ONLY] Simulate payment success for testing
    This endpoint should be disabled in production
    """
    result = await db.execute(
        select(Transaction).where(Transaction.reference_id == reference)
    )
    transaction = result.scalar_one_or_none()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction.status != TransactionStatus.pending:
        raise HTTPException(status_code=400, detail="Transaction already processed")
    
    # Simulate webhook data
    webhook_data = {
        "reference": reference,
        "status": "PAID",
        "merchant_ref": f"INV-{transaction.id}",
        "total_amount": int(transaction.amount),
        "paid_at": str(int(datetime.now(timezone.utc).timestamp()))
    }
    
    # Process as if it was a real webhook
    transaction.status = TransactionStatus.success
    
    result = await db.execute(select(User).where(User.id == transaction.user_id))
    user = result.scalar_one_or_none()
    
    if user:
        user.balance += transaction.amount
        
        await send_topup_success_email(
            user.email, user.name, float(transaction.amount), float(user.balance)
        )
        
        notif = NotificationLog(
            user_id=user.id,
            type=NotificationType.topup_success,
            message=f"Top up Rp {int(transaction.amount):,} berhasil (simulated)",
            status="sent"
        )
        db.add(notif)
        
        await process_referral_bonus(user, db)
    
    await db.commit()
    
    return {"success": True, "message": "Payment simulated successfully", "new_balance": float(user.balance) if user else 0}


# ==================== NOTIFICATIONS ROUTES ====================

@api_router.get("/notifications", response_model=List[NotificationResponse])
async def get_my_notifications(
    limit: int = Query(20, le=50),
    offset: int = 0,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's notifications"""
    result = await db.execute(
        select(NotificationLog)
        .where(NotificationLog.user_id == user.id)
        .order_by(desc(NotificationLog.sent_at))
        .limit(limit)
        .offset(offset)
    )
    notifications = result.scalars().all()
    return notifications


# ==================== ADMIN ROUTES ====================

@api_router.get("/admin/dashboard", response_model=AdminDashboardStats)
async def admin_dashboard(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get admin dashboard statistics"""
    # Total users
    result = await db.execute(select(func.count(User.id)).where(User.role == UserRole.user))
    total_users = result.scalar() or 0
    
    # Total revenue (successful payments)
    result = await db.execute(
        select(func.sum(Transaction.amount)).where(
            and_(
                Transaction.type == TransactionType.topup,
                Transaction.status == TransactionStatus.success
            )
        )
    )
    total_revenue = result.scalar() or Decimal(0)
    
    # Active orders
    result = await db.execute(
        select(func.count(VPSOrder.id)).where(VPSOrder.status == OrderStatus.active)
    )
    active_orders = result.scalar() or 0
    
    # Pending payments
    result = await db.execute(
        select(func.count(Transaction.id)).where(
            and_(
                Transaction.type == TransactionType.topup,
                Transaction.status == TransactionStatus.pending
            )
        )
    )
    pending_payments = result.scalar() or 0
    
    return AdminDashboardStats(
        total_users=total_users,
        total_revenue=total_revenue,
        active_orders=active_orders,
        pending_payments=pending_payments
    )


@api_router.get("/admin/users", response_model=List[UserResponse])
async def admin_list_users(
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """List all users (admin)"""
    query = select(User).where(User.role == UserRole.user)
    
    if search:
        query = query.where(
            or_(
                User.name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%")
            )
        )
    
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    
    query = query.order_by(desc(User.created_at)).limit(limit).offset(offset)
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    return users


@api_router.get("/admin/users/all")
async def admin_list_all_users(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """List ALL users including admin (for name mapping)"""
    result = await db.execute(select(User).order_by(User.id))
    users = result.scalars().all()
    return [{"id": u.id, "name": u.name, "email": u.email, "whatsapp": u.whatsapp, "phone": u.phone} for u in users]

@api_router.get("/admin/users/{user_id}", response_model=UserResponse)
async def admin_get_user(
    user_id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get user details (admin)"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    
    return user

@api_router.put("/admin/users/{user_id}")
async def admin_update_user(
    user_id: int,
    data: AdminUserUpdate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Update user (admin) - toggle active, adjust balance"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    
    if data.is_active is not None:
        user.is_active = data.is_active
    
    if data.balance_adjustment is not None:
        user.balance += data.balance_adjustment
        
        # Log the adjustment
        transaction = Transaction(
            user_id=user.id,
            type=TransactionType.refund if data.balance_adjustment > 0 else TransactionType.payment,
            amount=data.balance_adjustment,
            description=data.balance_reason or f"Admin adjustment by {admin.email}",
            status=TransactionStatus.success
        )
        db.add(transaction)
    
    await db.commit()
    await db.refresh(user)
    
    return {"message": "User berhasil diupdate", "user": UserResponse.model_validate(user)}

# start ENDPOINT edit user
@api_router.put("/admin/users/{user_id}/profile")
async def admin_edit_user_profile(
    user_id: int,
    data: dict,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Admin edit profil user (nama, whatsapp, phone)"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    if data.get("name"):
        user.name = data["name"]
    if data.get("whatsapp") is not None:
        user.whatsapp = data["whatsapp"]
    if data.get("phone") is not None:
        user.phone = data["phone"]
    await db.commit()
    await db.refresh(user)
    return {"message": "Profil user berhasil diupdate"}


@api_router.post("/admin/users/{user_id}/reset-password")
async def admin_reset_user_password(
    user_id: int,
    data: dict,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Admin reset password user"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    new_password = data.get("new_password", "")
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password minimal 6 karakter")
    user.password_hash = get_password_hash(new_password)
    await db.commit()
    logger.info(f"Admin {admin.email} reset password for user {user.email}")
    return {"message": "Password berhasil direset"}
# end ENDPOINT edit user

# ======== ENDPOINT STAR ============
@api_router.post("/admin/users")
async def admin_create_user(
    data: dict,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Create user manually (admin)"""
    # Check email exists
    result = await db.execute(select(User).where(User.email == data["email"]))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    
    user = User(
        name=data["name"],
        email=data["email"],
        password_hash=get_password_hash(data["password"]),
        whatsapp=data.get("whatsapp", ""),
        referral_code=generate_referral_code(),
        role=UserRole.user,
        is_active=True,
        balance=Decimal(str(data.get("balance", 0)))
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {"message": "User berhasil dibuat", "user_id": str(user.id)}


@api_router.post("/admin/orders/assign")
async def admin_assign_vps(
    data: dict,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Assign VPS package to user manually (admin)"""
    from datetime import datetime, timezone
    
    # Validate user
    result = await db.execute(select(User).where(User.id == data["user_id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    
    # Validate package
    result = await db.execute(select(VPSPackage).where(VPSPackage.id == data["package_id"]))
    package = result.scalar_one_or_none()
    if not package:
        raise HTTPException(status_code=404, detail="Paket tidak ditemukan")
    
    # Set dates
    started_at = datetime.fromisoformat(data["started_at"]) if data.get("started_at") else datetime.now(timezone.utc)
    expired_at = started_at + timedelta(days=30)
    if data.get("expired_at"):
        expired_at = datetime.fromisoformat(data["expired_at"])
    
    # Custom price or package price
    price = Decimal(str(data.get("custom_price", order.price_paid)))
    
    order = VPSOrder(
        user_id=user.id,
        package_id=package.id,
        status=OrderStatus.active,
        started_at=started_at,
        expired_at=expired_at,
        price_paid=price,
        notes=data.get("notes", f"Assigned manually by admin {admin.email}")
    )
    db.add(order)
    
    # Log transaction
    transaction = Transaction(
        user_id=user.id,
        type=TransactionType.payment,
        amount=price,
        description=f"VPS {package.name} - assigned by admin (mulai: {started_at.strftime('%d/%m/%Y')}, expired: {expired_at.strftime('%d/%m/%Y')})",
        status=TransactionStatus.success
    )
    db.add(transaction)
    await db.commit()
    await db.refresh(order)
    
    # Kirim email konfirmasi pesanan baru ke user
    await send_order_created_email(
        user.email,
        user.name,
        package.name,
        float(price),
        expired_at,
        original_price=float(order.price_paid) if int(order.price_paid) != int(price) else None,
        is_renewal=False
    )
    
    return {
        "message": "VPS berhasil diassign ke user",
        "order_id": str(order.id),
        "user": user.name,
        "package": package.name,
        "started_at": started_at.isoformat(),
        "expired_at": expired_at.isoformat(),
        "price": str(price)
    }

# Admin VPS Packages CRUD
@api_router.post("/admin/packages", response_model=VPSPackageResponse)
async def admin_create_package(
    data: VPSPackageCreate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Create VPS package (admin)"""
    package = VPSPackage(**data.model_dump())
    db.add(package)
    await db.commit()
    await db.refresh(package)
    return package


@api_router.put("/admin/packages/{package_id}", response_model=VPSPackageResponse)
async def admin_update_package(
    package_id: int,
    data: VPSPackageUpdate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Update VPS package (admin)"""
    result = await db.execute(select(VPSPackage).where(VPSPackage.id == package_id))
    package = result.scalar_one_or_none()
    
    if not package:
        raise HTTPException(status_code=404, detail="Paket tidak ditemukan")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(package, key, value)
    
    await db.commit()
    await db.refresh(package)
    return package


@api_router.delete("/admin/packages/{package_id}")
async def admin_delete_package(
    package_id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Delete VPS package (admin)"""
    result = await db.execute(select(VPSPackage).where(VPSPackage.id == package_id))
    package = result.scalar_one_or_none()
    
    if not package:
        raise HTTPException(status_code=404, detail="Paket tidak ditemukan")
    
    await db.delete(package)
    await db.commit()
    
    return {"message": "Paket berhasil dihapus"}


# Admin Orders
@api_router.get("/admin/orders", response_model=List[VPSOrderResponse])
async def admin_list_orders(
    status: Optional[str] = None,
    user_id: Optional[int] = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """List all orders (admin)"""
    query = select(VPSOrder)
    
    if status:
        query = query.where(VPSOrder.status == status)
    if user_id:
        query = query.where(VPSOrder.user_id == user_id)
    
    query = query.order_by(desc(VPSOrder.created_at)).limit(limit).offset(offset)
    
    result = await db.execute(query)
    orders = result.scalars().all()
    
    # Load package info
    for order in orders:
        pkg_result = await db.execute(select(VPSPackage).where(VPSPackage.id == order.package_id))
        order.package = pkg_result.scalar_one_or_none()
    
    return orders


@api_router.put("/admin/orders/{order_id}", response_model=VPSOrderResponse)
async def admin_update_order(
    order_id: int,
    data: VPSOrderUpdate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Update order status (admin)"""
    result = await db.execute(select(VPSOrder).where(VPSOrder.id == order_id))
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan")
    
    if data.status:
        order.status = data.status
    if data.notes is not None:
        order.notes = data.notes
    if data.ip_address is not None:
        order.ip_address = data.ip_address
    if data.vps_details is not None:
        order.vps_details = data.vps_details
    
    await db.commit()
    await db.refresh(order)
    
    # Load package
    pkg_result = await db.execute(select(VPSPackage).where(VPSPackage.id == order.package_id))
    order.package = pkg_result.scalar_one_or_none()
    
    return order


# Admin Transactions
@api_router.get("/admin/transactions", response_model=List[TransactionResponse])
async def admin_list_transactions(
    type: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[int] = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """List all transactions (admin)"""
    query = select(Transaction)
    
    if type:
        query = query.where(Transaction.type == type)
    if status:
        query = query.where(Transaction.status == status)
    if user_id:
        query = query.where(Transaction.user_id == user_id)
    
    query = query.order_by(desc(Transaction.created_at)).limit(limit).offset(offset)
    
    result = await db.execute(query)
    transactions = result.scalars().all()
    
    return transactions


# Admin Notifications
@api_router.get("/admin/notifications", response_model=List[NotificationResponse])
async def admin_list_notifications(
    user_id: Optional[int] = None,
    type: Optional[str] = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """List all notifications (admin)"""
    query = select(NotificationLog)
    
    if user_id:
        query = query.where(NotificationLog.user_id == user_id)
    if type:
        query = query.where(NotificationLog.type == type)
    
    query = query.order_by(desc(NotificationLog.sent_at)).limit(limit).offset(offset)
    
    result = await db.execute(query)
    notifications = result.scalars().all()
    
    return notifications


# Admin Settings
@api_router.get("/admin/settings", response_model=List[SettingResponse])
async def admin_get_settings(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get all settings (admin)"""
    result = await db.execute(select(SiteSettings))
    settings = result.scalars().all()
    return [SettingResponse(key=s.key, value=s.value) for s in settings]


@api_router.put("/admin/settings")
async def admin_update_setting(
    data: SettingUpdate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Update setting (admin)"""
    result = await db.execute(select(SiteSettings).where(SiteSettings.key == data.key))
    setting = result.scalar_one_or_none()
    
    if setting:
        setting.value = data.value
    else:
        setting = SiteSettings(key=data.key, value=data.value)
        db.add(setting)
    
    await db.commit()
    
    return {"message": "Setting berhasil diupdate"}

# ==================== PAYMENT METHODS (PUBLIC) ====================

@api_router.get("/payment-methods", response_model=List[PaymentMethodResponse])
async def get_payment_methods_public(db: AsyncSession = Depends(get_db)):
    """Get active payment methods (public)"""
    result = await db.execute(
        select(PaymentMethod)
        .where(PaymentMethod.is_active == True)
        .order_by(PaymentMethod.sort_order, PaymentMethod.name)
    )
    return result.scalars().all()


# ==================== TOPUP REQUEST (USER) ====================

@api_router.post("/topup-request", response_model=TopupRequestResponse)
async def create_topup_request(
    data: TopupRequestCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create manual topup request"""
    import random
    result = await db.execute(
        select(PaymentMethod).where(
            and_(PaymentMethod.id == data.payment_method_id, PaymentMethod.is_active == True)
        )
    )
    payment_method = result.scalar_one_or_none()
    if not payment_method:
        raise HTTPException(status_code=404, detail="Metode pembayaran tidak tersedia")
    if data.amount < 10000:
        raise HTTPException(status_code=400, detail="Minimum top up Rp 10.000")

    unique_code = random.randint(1, 999)
    total_transfer = Decimal(str(data.amount)) + Decimal(str(unique_code))

    topup_request = TopupRequest(
        user_id=user.id,
        payment_method_id=data.payment_method_id,
        amount=Decimal(str(data.amount)),
        unique_code=unique_code,
        total_transfer=total_transfer,
        status=TopupRequestStatus.pending,
        transfer_proof=data.transfer_proof,
    )
    db.add(topup_request)
    await db.commit()
    await db.refresh(topup_request)

    result = await db.execute(select(PaymentMethod).where(PaymentMethod.id == topup_request.payment_method_id))
    topup_request.payment_method = result.scalar_one_or_none()
    return topup_request


@api_router.get("/topup-request", response_model=List[TopupRequestResponse])
async def get_my_topup_requests(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's topup requests"""
    result = await db.execute(
        select(TopupRequest)
        .where(TopupRequest.user_id == user.id)
        .order_by(desc(TopupRequest.created_at))
    )
    requests = result.scalars().all()
    for req in requests:
        pm_result = await db.execute(select(PaymentMethod).where(PaymentMethod.id == req.payment_method_id))
        req.payment_method = pm_result.scalar_one_or_none()
    return requests


@api_router.put("/topup-request/{request_id}", response_model=TopupRequestResponse)
async def update_topup_proof(
    request_id: int,
    data: TopupRequestUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """User update transfer proof"""
    result = await db.execute(
        select(TopupRequest).where(
            and_(TopupRequest.id == request_id, TopupRequest.user_id == user.id)
        )
    )
    topup_req = result.scalar_one_or_none()
    if not topup_req:
        raise HTTPException(status_code=404, detail="Request tidak ditemukan")
    if topup_req.status != TopupRequestStatus.pending:
        raise HTTPException(status_code=400, detail="Request sudah diproses")
    if data.transfer_proof is not None:
        topup_req.transfer_proof = data.transfer_proof
    if data.proof_image is not None:
        topup_req.proof_image = data.proof_image
    await db.commit()
    await db.refresh(topup_req)
    pm_result = await db.execute(select(PaymentMethod).where(PaymentMethod.id == topup_req.payment_method_id))
    topup_req.payment_method = pm_result.scalar_one_or_none()
    return topup_req


# ==================== ADMIN PAYMENT METHODS ====================

@api_router.post("/admin/payment-methods", response_model=PaymentMethodResponse)
async def admin_create_payment_method(
    data: PaymentMethodCreate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    pm = PaymentMethod(**data.model_dump())
    db.add(pm)
    await db.commit()
    await db.refresh(pm)
    return pm


@api_router.get("/admin/payment-methods", response_model=List[PaymentMethodResponse])
async def admin_list_payment_methods(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(PaymentMethod).order_by(PaymentMethod.sort_order, PaymentMethod.name)
    )
    return result.scalars().all()


@api_router.put("/admin/payment-methods/{pm_id}", response_model=PaymentMethodResponse)
async def admin_update_payment_method(
    pm_id: int,
    data: PaymentMethodUpdate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(PaymentMethod).where(PaymentMethod.id == pm_id))
    pm = result.scalar_one_or_none()
    if not pm:
        raise HTTPException(status_code=404, detail="Metode pembayaran tidak ditemukan")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(pm, key, value)
    await db.commit()
    await db.refresh(pm)
    return pm


@api_router.delete("/admin/payment-methods/{pm_id}")
async def admin_delete_payment_method(
    pm_id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(PaymentMethod).where(PaymentMethod.id == pm_id))
    pm = result.scalar_one_or_none()
    if not pm:
        raise HTTPException(status_code=404, detail="Metode pembayaran tidak ditemukan")
    await db.delete(pm)
    await db.commit()
    return {"message": "Metode pembayaran berhasil dihapus"}


# ==================== ADMIN TOPUP REQUESTS ====================

@api_router.get("/admin/topup-requests", response_model=List[TopupRequestResponse])
async def admin_list_topup_requests(
    status: Optional[str] = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    query = select(TopupRequest)
    if status:
        query = query.where(TopupRequest.status == status)
    query = query.order_by(desc(TopupRequest.created_at)).limit(limit).offset(offset)
    result = await db.execute(query)
    requests = result.scalars().all()
    for req in requests:
        pm_result = await db.execute(select(PaymentMethod).where(PaymentMethod.id == req.payment_method_id))
        req.payment_method = pm_result.scalar_one_or_none()
    return requests


@api_router.put("/admin/topup-requests/{request_id}")
async def admin_process_topup_request(
    request_id: int,
    data: TopupRequestUpdate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Approve or reject topup request (admin)"""
    result = await db.execute(select(TopupRequest).where(TopupRequest.id == request_id))
    topup_req = result.scalar_one_or_none()
    if not topup_req:
        raise HTTPException(status_code=404, detail="Request tidak ditemukan")
    if topup_req.status != TopupRequestStatus.pending:
        raise HTTPException(status_code=400, detail="Request sudah diproses sebelumnya")

    if data.status:
        topup_req.status = data.status
    if data.admin_notes is not None:
        topup_req.admin_notes = data.admin_notes
    topup_req.approved_by = admin.id

    if data.status == "approved":
        result = await db.execute(select(User).where(User.id == topup_req.user_id))
        user = result.scalar_one_or_none()
        if user:
            user.balance += topup_req.amount
            transaction = Transaction(
                user_id=user.id,
                type=TransactionType.topup,
                amount=topup_req.amount,
                description=f"Top up manual disetujui admin",
                reference_id=f"MANUAL-{topup_req.id}",
                status=TransactionStatus.success
            )
            db.add(transaction)
            await send_topup_success_email(
                user.email, user.name,
                float(topup_req.amount), float(user.balance)
            )
            await process_referral_bonus(user, db)

            # Jika request ini terkait order VPS, perpanjang otomatis
            if topup_req.order_id:
                order_result = await db.execute(
                    select(VPSOrder).where(VPSOrder.id == topup_req.order_id)
                )
                order = order_result.scalar_one_or_none()
                if order:
                    pkg_result = await db.execute(
                        select(VPSPackage).where(VPSPackage.id == order.package_id)
                    )
                    package = pkg_result.scalar_one_or_none()
                    if package and user.balance >= order.price_paid:
                        user.balance -= order.price_paid
                        now = datetime.now(timezone.utc)
                        base_date = order.expired_at if order.expired_at > now else now
                        order.expired_at = base_date + timedelta(days=30)
                        order.status = OrderStatus.active
                        pay_transaction = Transaction(
                            user_id=user.id,
                            type=TransactionType.payment,
                            amount=-order.price_paid,
                            description=f"Perpanjangan {package.name} (via pembayaran tagihan)",
                            status=TransactionStatus.success
                        )
                        db.add(pay_transaction)
                        await send_order_created_email(
                            user.email, user.name, package.name,
                            float(order.price_paid), order.expired_at,
                            original_price=float(order.price_paid) if int(order.price_paid) != int(order.price_paid) else None,
                            is_renewal=True
                        )

    await db.commit()
    return {"message": f"Request berhasil {data.status}", "request_id": request_id}

# ==================== END ADMIN TOPUP REQUESTS ====================

# ==================== VPS RENEWAL ====================

@api_router.post("/orders/{order_id}/renew", response_model=VPSOrderResponse)
async def renew_order(
    order_id: int,
    data: VPSOrderRenewRequest = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Renew VPS order — supports balance, transfer manual, or hybrid (sebagian saldo + transfer)"""
    import random

    if data is None:
        data = VPSOrderRenewRequest()

    result = await db.execute(
        select(VPSOrder).where(
            and_(VPSOrder.id == order_id, VPSOrder.user_id == user.id)
        )
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan")

    pkg_result = await db.execute(select(VPSPackage).where(VPSPackage.id == order.package_id))
    package = pkg_result.scalar_one_or_none()
    if not package:
        raise HTTPException(status_code=404, detail="Paket tidak ditemukan")

    billing_cycle = data.billing_cycle or 1
    if billing_cycle not in [1, 3, 6, 12]:
        billing_cycle = 1

    # Hitung harga berdasarkan billing cycle
    discount_map = {1: 0, 3: 5, 6: 10, 12: 15}
    discount_pct = discount_map[billing_cycle]
    monthly_price = package.price_monthly
    discounted_monthly = int(monthly_price * (1 - Decimal(discount_pct) / 100))
    renew_price = Decimal(discounted_monthly) * billing_cycle
    duration_days = billing_cycle * 30

    payment_mode = data.payment_mode or "balance"

    # ===== MODE 1: Bayar penuh dengan saldo =====
    if payment_mode == "balance":
        if user.balance < renew_price:
            raise HTTPException(
                status_code=400,
                detail=f"Saldo tidak cukup. Dibutuhkan Rp {int(renew_price):,}. Saldo Anda Rp {int(user.balance):,}"
            )

        user.balance -= renew_price
        now = datetime.now(timezone.utc)
        base_date = order.expired_at if order.expired_at > now else now
        order.expired_at = base_date + timedelta(days=duration_days)
        order.status = OrderStatus.active

        transaction = Transaction(
            user_id=user.id,
            type=TransactionType.payment,
            amount=-renew_price,
            description=f"Perpanjangan {package.name} ({billing_cycle} bulan)",
            status=TransactionStatus.success
        )
        db.add(transaction)
        await db.commit()
        await db.refresh(order)

        await send_order_created_email(
            user.email, user.name, package.name,
            float(renew_price), order.expired_at, is_renewal=True
        )

        order.package = package
        return order

    # ===== MODE 2: Transfer manual (dengan opsional sebagian saldo) =====
    balance_used = Decimal(0)
    if data.use_balance and user.balance > 0:
        balance_used = min(user.balance, renew_price)
        user.balance -= balance_used

    remaining_amount = renew_price - balance_used

    if remaining_amount <= 0:
        # Saldo cukup setelah kombinasi — langsung aktifkan
        now = datetime.now(timezone.utc)
        base_date = order.expired_at if order.expired_at > now else now
        order.expired_at = base_date + timedelta(days=duration_days)
        order.status = OrderStatus.active
        if balance_used > 0:
            db.add(Transaction(
                user_id=user.id,
                type=TransactionType.payment,
                amount=-balance_used,
                description=f"Perpanjangan {package.name} (dari saldo)",
                status=TransactionStatus.success
            ))
        await db.commit()
        await db.refresh(order)
        order.package = package
        return order

    # Ada sisa yang harus dibayar via transfer
    if not data.payment_method_id:
        raise HTTPException(
            status_code=400,
            detail="Pilih metode pembayaran untuk menyelesaikan pembayaran"
        )

    if balance_used > 0:
        db.add(Transaction(
            user_id=user.id,
            type=TransactionType.payment,
            amount=-balance_used,
            description=f"Pembayaran sebagian perpanjangan {package.name} (dari saldo)",
            status=TransactionStatus.success
        ))

    # Tandai order sebagai pending renewal
    order.status = OrderStatus.pending_payment

    unique_code = random.randint(1, 999)
    total_transfer = remaining_amount + Decimal(unique_code)

    topup_request = TopupRequest(
        user_id=user.id,
        payment_method_id=data.payment_method_id,
        amount=remaining_amount,
        unique_code=unique_code,
        total_transfer=total_transfer,
        status=TopupRequestStatus.pending,
        order_id=order.id,
        transfer_proof=f"[Perpanjangan] {package.name} ({billing_cycle} bulan)"
    )
    db.add(topup_request)
    await db.commit()
    await db.refresh(order)

    # Fetch payment method for response
    pm_result = await db.execute(
        select(PaymentMethod).where(PaymentMethod.id == data.payment_method_id)
    )
    pm = pm_result.scalar_one_or_none()

    order.payment_info = {
        "amount": float(remaining_amount),
        "balance_used": float(balance_used),
        "unique_code": unique_code,
        "total_transfer": float(total_transfer),
        "payment_method_id": data.payment_method_id,
        "payment_method": {
            "id": pm.id if pm else None,
            "name": pm.name if pm else None,
            "account_number": pm.account_number if pm else None,
            "account_name": pm.account_name if pm else None,
        } if pm else None,
        "topup_request_id": topup_request.id,
    }

    order.package = package
    return order
# ==================== END VPS RENEWAL ====================

# ==================== FILE UPLOAD ====================

@api_router.post("/upload/proof")
async def upload_proof_image(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user)
):
    """Upload bukti transfer gambar"""
    import uuid
    import shutil

    # Validasi tipe file
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="File harus berupa gambar (JPG, PNG, WebP)")

    # Validasi ukuran (max 5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Ukuran file maksimal 5MB")

    # Generate nama unik
    ext = file.filename.split(".")[-1]
    filename = f"proof_{user.id}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    # Simpan file
    with open(filepath, "wb") as f:
        f.write(contents)

    return {"filename": filename, "url": f"/uploads/{filename}"}


@api_router.get("/topup-request/{request_id}", response_model=TopupRequestResponse)
async def get_topup_request_detail(
    request_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get detail topup request by id"""
    result = await db.execute(
        select(TopupRequest).where(
            and_(TopupRequest.id == request_id, TopupRequest.user_id == user.id)
        )
    )
    topup_req = result.scalar_one_or_none()
    if not topup_req:
        raise HTTPException(status_code=404, detail="Request tidak ditemukan")

    pm_result = await db.execute(select(PaymentMethod).where(PaymentMethod.id == topup_req.payment_method_id))
    topup_req.payment_method = pm_result.scalar_one_or_none()
    return topup_req

# ==================== SUPPORT TICKETS ====================

async def _load_ticket_replies(ticket, db):
    """Load replies for a ticket"""
    result = await db.execute(
        select(TicketReplyModel)
        .where(TicketReplyModel.ticket_id == ticket.id)
        .order_by(TicketReplyModel.created_at)
    )
    replies = result.scalars().all()
    for reply in replies:
        user_result = await db.execute(select(User).where(User.id == reply.sender_id))
        u = user_result.scalar_one_or_none()
        reply.sender_name = u.name if u else None
    ticket.replies = replies
    return ticket


@api_router.post("/tickets", response_model=TicketResponse)
async def create_ticket(
    data: TicketCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """User buat ticket support"""
    ticket = SupportTicket(
        user_id=user.id,
        topup_request_id=data.topup_request_id,
        order_id=data.order_id,
        subject=data.subject,
        message=data.message,
        priority=data.priority,
        status=TicketStatus.waiting_admin,
    )
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)

    # Tambah pesan pertama sebagai reply
    first_reply = TicketReplyModel(
        ticket_id=ticket.id,
        sender_id=user.id,
        sender_role=TicketReplyRole.user,
        message=data.message,
    )
    db.add(first_reply)
    await db.commit()

    ticket.user_name = user.name
    ticket.replies = [first_reply]
    first_reply.sender_name = user.name
    return ticket


@api_router.get("/tickets", response_model=List[TicketResponse])
async def get_my_tickets(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's tickets"""
    result = await db.execute(
        select(SupportTicket)
        .where(SupportTicket.user_id == user.id)
        .order_by(desc(SupportTicket.created_at))
    )
    tickets = result.scalars().all()
    for t in tickets:
        t.user_name = user.name
        await _load_ticket_replies(t, db)
    return tickets


@api_router.get("/tickets/{ticket_id}", response_model=TicketResponse)
async def get_ticket_detail(
    ticket_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get ticket detail"""
    result = await db.execute(
        select(SupportTicket).where(
            and_(SupportTicket.id == ticket_id, SupportTicket.user_id == user.id)
        )
    )
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket tidak ditemukan")
    ticket.user_name = user.name
    await _load_ticket_replies(ticket, db)
    return ticket


@api_router.post("/tickets/{ticket_id}/reply", response_model=TicketReplyResponse)
async def user_reply_ticket(
    ticket_id: int,
    data: TicketReplyCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """User balas ticket"""
    result = await db.execute(
        select(SupportTicket).where(
            and_(SupportTicket.id == ticket_id, SupportTicket.user_id == user.id)
        )
    )
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket tidak ditemukan")
    if ticket.status == TicketStatus.closed:
        raise HTTPException(status_code=400, detail="Ticket sudah ditutup")
    if ticket.status == TicketStatus.waiting_admin:
        raise HTTPException(status_code=400, detail="Menunggu balasan admin terlebih dahulu")

    reply = TicketReplyModel(
        ticket_id=ticket_id,
        sender_id=user.id,
        sender_role=TicketReplyRole.user,
        message=data.message,
    )
    db.add(reply)
    ticket.status = TicketStatus.waiting_admin
    ticket.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(reply)
    reply.sender_name = user.name
    return reply


# ==================== ADMIN TICKETS ====================

@api_router.get("/admin/tickets", response_model=List[TicketResponse])
async def admin_list_tickets(
    status: Optional[str] = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """List all tickets (admin)"""
    query = select(SupportTicket)
    if status:
        query = query.where(SupportTicket.status == status)
    query = query.order_by(desc(SupportTicket.updated_at)).limit(limit).offset(offset)
    result = await db.execute(query)
    tickets = result.scalars().all()
    for t in tickets:
        user_result = await db.execute(select(User).where(User.id == t.user_id))
        u = user_result.scalar_one_or_none()
        t.user_name = u.name if u else None
        await _load_ticket_replies(t, db)
    return tickets


@api_router.get("/admin/tickets/{ticket_id}", response_model=TicketResponse)
async def admin_get_ticket(
    ticket_id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get ticket detail (admin)"""
    result = await db.execute(select(SupportTicket).where(SupportTicket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket tidak ditemukan")
    user_result = await db.execute(select(User).where(User.id == ticket.user_id))
    u = user_result.scalar_one_or_none()
    ticket.user_name = u.name if u else None
    await _load_ticket_replies(ticket, db)
    return ticket


@api_router.post("/admin/tickets/{ticket_id}/reply", response_model=TicketReplyResponse)
async def admin_reply_ticket(
    ticket_id: int,
    data: TicketReplyCreate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Admin balas ticket"""
    result = await db.execute(select(SupportTicket).where(SupportTicket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket tidak ditemukan")
    if ticket.status == TicketStatus.closed:
        raise HTTPException(status_code=400, detail="Ticket sudah ditutup")

    reply = TicketReplyModel(
        ticket_id=ticket_id,
        sender_id=admin.id,
        sender_role=TicketReplyRole.admin,
        message=data.message,
    )
    db.add(reply)
    ticket.status = TicketStatus.waiting_user
    ticket.admin_reply = data.message
    ticket.replied_by = admin.id
    ticket.replied_at = datetime.now(timezone.utc)
    ticket.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(reply)
    reply.sender_name = admin.name
    return reply

@api_router.put("/admin/tickets/{ticket_id}/status")
async def admin_update_ticket_status(
    ticket_id: int,
    data: TicketAdminAction,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Admin update status ticket (close dll)"""
    result = await db.execute(select(SupportTicket).where(SupportTicket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket tidak ditemukan")
    if data.status:
        ticket.status = data.status
    await db.commit()
    return {"message": "Status ticket berhasil diupdate"}

# ==================== END ADMIN TICKETS ====================

# ==================== start notify-email ====================

@api_router.post("/admin/orders/{order_id}/notify-email")
async def admin_notify_order_email(
    order_id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Kirim email notifikasi expire ke user (admin)"""
    # Get order
    result = await db.execute(select(VPSOrder).where(VPSOrder.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan")

    # Get user
    result = await db.execute(select(User).where(User.id == order.user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    # Get package
    result = await db.execute(select(VPSPackage).where(VPSPackage.id == order.package_id))
    package = result.scalar_one_or_none()

    # Hitung sisa hari
    now = datetime.now(timezone.utc)
    expired_at = order.expired_at
    if expired_at.tzinfo is None:
        expired_at = expired_at.replace(tzinfo=timezone.utc)
    days_left = (expired_at - now).days

    package_name = package.name if package else "VPS"

    # Kirim email notifikasi expire
    await send_order_created_email(
         user.email, user.name, package_name,
         float(order.price_paid), order.expired_at,
         original_price=float(order.price_paid) if package and int(order.price_paid) != int(order.price_paid) else None,
         is_renewal=True
    )

    # Log notifikasi
    notif = NotificationLog(
        user_id=user.id,
        type=NotificationType.order_created,
        message=f"Notifikasi expire dikirim admin: {package_name} (sisa {days_left} hari)",
        status="sent"
    )
    db.add(notif)
    await db.commit()

    logger.info(f"Admin {admin.email} sent expire notification to {user.email} for order #{order_id}")

    return {
        "success": True,
        "message": f"Email notifikasi berhasil dikirim ke {user.email}",
        "days_left": days_left
    }
# ==================== end notify-email ====================

# ==================== START GOOGLE OAUTH ====================


GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.environ.get("GOOGLE_REDIRECT_URI", "")

@api_router.get("/auth/google/login")
async def google_login():
    """Redirect ke Google OAuth"""
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
    }
    from urllib.parse import urlencode
    google_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=google_url)


@api_router.get("/auth/google/callback")
async def google_callback(code: str, db: AsyncSession = Depends(get_db)):
    """Handle Google OAuth callback"""
    from fastapi.responses import RedirectResponse

    # Exchange code for token
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            }
        )
        token_data = token_resp.json()
        logger.info(f"Google token response: {token_data}")

    if "error" in token_data:
        logger.error(f"Google OAuth error: {token_data}")
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=google_failed")

    # Get user info
    async with httpx.AsyncClient() as client:
        user_info_resp = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {token_data['access_token']}"}
        )
        user_info = user_info_resp.json()

    email = user_info.get("email")
    name = user_info.get("name", email)

    if not email:
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=no_email")

    # Cek user sudah ada atau buat baru
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            name=name,
            email=email,
            password_hash=get_password_hash(os.urandom(32).hex()),
            referral_code=generate_referral_code(),
            role=UserRole.user,
            is_active=True
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        await send_welcome_email(user.email, user.name, user.referral_code)

    # Generate tokens
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    # Redirect ke frontend dengan token
    redirect_url = f"{FRONTEND_URL}/auth/callback?access_token={access_token}&refresh_token={refresh_token}"
    return RedirectResponse(url=redirect_url)
# ==================== END GOOGLE OAUTH ====================

# Include router
# Mount static files untuk uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "vps-reseller-api"}
