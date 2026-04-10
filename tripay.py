"""
Mock Tripay Payment Gateway Integration
Full flow implementation with mock responses
"""
import os
import hmac
import hashlib
import time
import uuid
from typing import Optional
from decimal import Decimal

TRIPAY_API_KEY = os.environ.get("TRIPAY_API_KEY", "DEV-XXXXX")
TRIPAY_PRIVATE_KEY = os.environ.get("TRIPAY_PRIVATE_KEY", "XXXXX-XXXXX-XXXXX")
TRIPAY_MERCHANT_CODE = os.environ.get("TRIPAY_MERCHANT_CODE", "T12345")
TRIPAY_MODE = os.environ.get("TRIPAY_MODE", "sandbox")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://localhost:3000")

# Mock payment methods available in Tripay
PAYMENT_METHODS = [
    {"code": "QRIS", "name": "QRIS (Semua Aplikasi)", "group": "E-Wallet", "fee_flat": 0, "fee_percent": 0.7},
    {"code": "QRISC", "name": "QRIS (Customizable)", "group": "E-Wallet", "fee_flat": 0, "fee_percent": 0.7},
    {"code": "BRIVA", "name": "BRI Virtual Account", "group": "Virtual Account", "fee_flat": 3000, "fee_percent": 0},
    {"code": "BCAVA", "name": "BCA Virtual Account", "group": "Virtual Account", "fee_flat": 5500, "fee_percent": 0},
    {"code": "MANDIRIVA", "name": "Mandiri Virtual Account", "group": "Virtual Account", "fee_flat": 3000, "fee_percent": 0},
    {"code": "BNIVA", "name": "BNI Virtual Account", "group": "Virtual Account", "fee_flat": 3000, "fee_percent": 0},
    {"code": "OVO", "name": "OVO", "group": "E-Wallet", "fee_flat": 0, "fee_percent": 2},
    {"code": "DANA", "name": "DANA", "group": "E-Wallet", "fee_flat": 0, "fee_percent": 1.5},
    {"code": "SHOPEEPAY", "name": "ShopeePay", "group": "E-Wallet", "fee_flat": 0, "fee_percent": 1.5},
]


def get_payment_methods():
    """Return available payment methods"""
    return PAYMENT_METHODS


def calculate_fee(amount: int, payment_code: str) -> dict:
    """Calculate fee for a payment method"""
    method = next((m for m in PAYMENT_METHODS if m["code"] == payment_code), None)
    if not method:
        return {"fee": 0, "total": amount}
    
    fee_flat = method["fee_flat"]
    fee_percent = int(amount * method["fee_percent"] / 100)
    total_fee = fee_flat + fee_percent
    
    return {
        "fee": total_fee,
        "total": amount + total_fee
    }


def generate_signature(merchant_ref: str, amount: int) -> str:
    """Generate Tripay signature for request"""
    signature_string = f"{TRIPAY_MERCHANT_CODE}{merchant_ref}{amount}"
    signature = hmac.new(
        TRIPAY_PRIVATE_KEY.encode(),
        signature_string.encode(),
        hashlib.sha256
    ).hexdigest()
    return signature


def verify_callback_signature(data: dict) -> bool:
    """Verify Tripay callback signature"""
    # In production, verify the signature from Tripay
    # For mock, we'll accept all callbacks
    return True


def create_invoice(
    amount: int,
    payment_method: str,
    user_id: int,
    user_name: str,
    user_email: str,
    user_phone: str = ""
) -> dict:
    """
    Create a mock payment invoice
    In production, this would call Tripay API
    """
    merchant_ref = f"INV-{int(time.time())}-{user_id}"
    
    fee_info = calculate_fee(amount, payment_method)
    total = fee_info["total"]
    fee = fee_info["fee"]
    
    # Generate mock response
    reference = f"T{uuid.uuid4().hex[:12].upper()}"
    expired_time = int(time.time()) + (24 * 60 * 60)  # 24 hours from now
    
    # Mock checkout URL - in production this would be the real Tripay URL
    base_url = "https://tripay.co.id" if TRIPAY_MODE == "production" else "https://tripay.co.id/checkout"
    checkout_url = f"{base_url}/{reference}"
    
    # Generate QR code URL for QRIS
    qr_url = None
    if payment_method.startswith("QRIS"):
        qr_url = f"https://tripay.co.id/qr/{reference}"
    
    return {
        "success": True,
        "message": "Invoice berhasil dibuat",
        "data": {
            "reference": reference,
            "merchant_ref": merchant_ref,
            "payment_selection_type": "static",
            "payment_method": payment_method,
            "payment_name": next((m["name"] for m in PAYMENT_METHODS if m["code"] == payment_method), payment_method),
            "customer_name": user_name,
            "customer_email": user_email,
            "customer_phone": user_phone,
            "callback_url": f"{FRONTEND_URL}/api/payment/webhook",
            "return_url": f"{FRONTEND_URL}/dashboard/topup?status=success",
            "amount": amount,
            "fee_merchant": 0,
            "fee_customer": fee,
            "total_fee": fee,
            "amount_received": amount,
            "pay_code": "8277089012345678" if "VA" in payment_method else None,
            "pay_url": checkout_url,
            "checkout_url": checkout_url,
            "qr_string": f"00020101021226610014ID.CO.QRIS{reference}" if qr_url else None,
            "qr_url": qr_url,
            "expired_time": expired_time,
            "status": "UNPAID",
            "instructions": get_payment_instructions(payment_method)
        }
    }


def get_payment_instructions(payment_method: str) -> list:
    """Get payment instructions for a method"""
    if "VA" in payment_method:
        return [
            {"title": "ATM", "steps": ["Masukkan kartu ATM", "Pilih menu Transfer", "Pilih Virtual Account", "Masukkan nomor VA", "Konfirmasi pembayaran"]},
            {"title": "Mobile Banking", "steps": ["Login aplikasi mobile banking", "Pilih menu Transfer", "Pilih Transfer ke Virtual Account", "Masukkan nomor VA", "Konfirmasi pembayaran"]},
            {"title": "Internet Banking", "steps": ["Login internet banking", "Pilih menu Transfer", "Pilih Transfer ke Virtual Account", "Masukkan nomor VA", "Konfirmasi pembayaran"]}
        ]
    elif payment_method == "QRIS" or payment_method == "QRISC":
        return [
            {"title": "QRIS", "steps": ["Buka aplikasi e-wallet atau mobile banking", "Scan QR Code", "Periksa detail pembayaran", "Konfirmasi pembayaran"]}
        ]
    else:
        return [
            {"title": "E-Wallet", "steps": ["Buka aplikasi e-wallet", "Anda akan diarahkan ke halaman pembayaran", "Konfirmasi pembayaran"]}
        ]


def simulate_payment_callback(reference: str, merchant_ref: str, amount: int, status: str = "PAID") -> dict:
    """
    Simulate a payment callback from Tripay
    This is for testing purposes
    """
    return {
        "reference": reference,
        "merchant_ref": merchant_ref,
        "payment_method": "QRIS",
        "payment_method_code": "QRIS",
        "total_amount": amount,
        "fee_merchant": 0,
        "fee_customer": int(amount * 0.007),
        "total_fee": int(amount * 0.007),
        "amount_received": amount,
        "is_closed_payment": 1,
        "status": status,
        "paid_at": str(int(time.time())),
        "note": ""
    }
