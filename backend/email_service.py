"""
Email Service - Mock SMTP implementation with all templates
Ready to be used with real SMTP credentials
"""
import os
import logging
from typing import Optional
from datetime import datetime

logger = logging.getLogger(__name__)

# SMTP Configuration — nilai awal dari .env, bisa ditimpa dari SiteSettings
# (admin panel) lewat load_smtp_settings_from_db() saat startup & saat disimpan.
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
SMTP_FROM_NAME = os.environ.get("SMTP_FROM_NAME", "Host ID Murah")
SMTP_FROM_EMAIL = os.environ.get("SMTP_FROM_EMAIL", "noreply@hostidmurah.web.id")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://localhost:3000")

SMTP_SETTING_KEYS = {
    "smtp_host": "SMTP_HOST",
    "smtp_port": "SMTP_PORT",
    "smtp_user": "SMTP_USER",
    "smtp_password": "SMTP_PASSWORD",
    "smtp_from_name": "SMTP_FROM_NAME",
    "smtp_from_email": "SMTP_FROM_EMAIL",
}


async def load_smtp_settings_from_db(db) -> None:
    """Timpa konfigurasi SMTP module-level dari SiteSettings (admin panel),
    kalau nilainya diisi. Dipanggil saat startup dan tiap admin simpan setting SMTP."""
    global SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_NAME, SMTP_FROM_EMAIL
    from sqlalchemy import select
    from database import SiteSettings

    result = await db.execute(
        select(SiteSettings).where(SiteSettings.key.in_(SMTP_SETTING_KEYS.keys()))
    )
    rows = {row.key: row.value for row in result.scalars().all() if row.value}

    if "smtp_host" in rows:
        SMTP_HOST = rows["smtp_host"]
    if "smtp_port" in rows:
        try:
            SMTP_PORT = int(rows["smtp_port"])
        except ValueError:
            pass
    if "smtp_user" in rows:
        SMTP_USER = rows["smtp_user"]
    if "smtp_password" in rows:
        SMTP_PASSWORD = rows["smtp_password"]
    if "smtp_from_name" in rows:
        SMTP_FROM_NAME = rows["smtp_from_name"]
    if "smtp_from_email" in rows:
        SMTP_FROM_EMAIL = rows["smtp_from_email"]


def format_currency(amount) -> str:
    """Format amount as Indonesian Rupiah"""
    return f"Rp {int(amount):,}".replace(",", ".")


async def send_email(to_email: str, subject: str, html_content: str, plain_text: str = "") -> bool:
    """
    Send email via SMTP
    Returns True if successful, False otherwise
    In mock mode, just logs the email
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.info(f"[MOCK EMAIL] To: {to_email}")
        logger.info(f"[MOCK EMAIL] Subject: {subject}")
        logger.info(f"[MOCK EMAIL] Content preview: {html_content[:200]}...")
        return True
    
    try:
        import aiosmtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        
        message = MIMEMultipart("alternative")
        message["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
        message["To"] = to_email
        message["Subject"] = subject
        
        if plain_text:
            message.attach(MIMEText(plain_text, "plain"))
        message.attach(MIMEText(html_content, "html"))
        
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            start_tls=True
        )
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


def get_email_header() -> str:
    """Common email header"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #020617; color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .header h1 { color: #3b82f6; margin: 0; font-size: 28px; }
            .content { background-color: #0f172a; padding: 30px; border: 1px solid #1e293b; }
            .footer { background-color: #020617; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-radius: 0 0 12px 12px; border: 1px solid #1e293b; border-top: 0; }
            .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 15px 0; }
            .button:hover { background-color: #2563eb; }
            .highlight { color: #3b82f6; font-weight: bold; }
            .warning { color: #f59e0b; }
            .danger { color: #ef4444; }
            .success { color: #10b981; }
            .info-box { background-color: #1e293b; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .price-row { display: flex; align-items: center; gap: 10px; margin: 4px 0; }
            .price-original { color: #64748b; text-decoration: line-through; font-size: 13px; }
            .price-actual { color: #10b981; font-weight: bold; }
            .badge-discount { background-color: #064e3b; color: #34d399; font-size: 11px; padding: 2px 8px; border-radius: 99px; border: 1px solid #065f46; }
            h2 { color: #f8fafc; }
            p { line-height: 1.6; color: #cbd5e1; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Host ID Murah</h1>
            </div>
            <div class="content">
    """


def get_email_footer() -> str:
    """Common email footer"""
    return f"""
            </div>
            <div class="footer">
                <p>Email ini dikirim secara otomatis oleh sistem Host ID Murah.</p>
                <p>Jika ada pertanyaan, hubungi kami via WhatsApp 0852 1234 8518.</p>
                <p>&copy; {datetime.now().year} Host ID Murah. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """


def build_price_html(price: float, original_price: Optional[float] = None) -> str:
    """
    Build price display HTML.
    If original_price is provided and different from price, show strikethrough + discount badge.
    """
    if original_price is not None and int(original_price) != int(price):
        return f"""
            <span class="price-original">{format_currency(original_price)}</span>
            <span class="price-actual">{format_currency(price)}</span>
            <span class="badge-discount">Harga Khusus</span>
        """
    return f'<span class="price-actual">{format_currency(price)}</span>'


# ==================== Email Templates ====================

async def send_welcome_email(to_email: str, name: str, referral_code: str) -> bool:
    """Template 1: Welcome email after registration"""
    subject = "Selamat Datang di Host ID Murah!"
    
    html = get_email_header() + f"""
        <h2>Halo {name}! 👋</h2>
        <p>Selamat datang di Host ID Murah! Akun Anda telah berhasil dibuat.</p>
        
        <div class="info-box">
            <p><strong>Kode Referral Anda:</strong></p>
            <p style="font-size: 24px; color: #3b82f6; letter-spacing: 3px;">{referral_code}</p>
            <p><strong>Link Referral Anda:</strong></p>
            <p style="background-color: #0f172a; padding: 10px; border-radius: 6px; border: 1px solid #334155; word-break: break-all;">
                <a href="{FRONTEND_URL}/register?ref={referral_code}" style="color: #60a5fa; text-decoration: none;">
                    {FRONTEND_URL}/register?ref={referral_code}
                </a>
            </p>
            <p>Bagikan link ini ke teman Anda dan dapatkan bonus <strong>Rp 10.000</strong> setiap mereka melakukan top up pertama!</p>
        </div>
        
        <p>Langkah selanjutnya:</p>
        <ol style="color: #cbd5e1;">
            <li>Top up saldo untuk memulai</li>
            <li>Pilih paket VPS yang sesuai kebutuhan</li>
            <li>Nikmati layanan VPS berkualitas tinggi!</li>
        </ol>
        
        <center>
            <a href="{FRONTEND_URL}/dashboard" class="button">Masuk ke Dashboard</a>
        </center>
    """ + get_email_footer()
    
    return await send_email(to_email, subject, html)


async def send_topup_success_email(to_email: str, name: str, amount: float, new_balance: float) -> bool:
    """Template 2: Top up success notification"""
    subject = "Top Up Berhasil - Host ID Murah"
    
    html = get_email_header() + f"""
        <h2>Top Up Berhasil! ✅</h2>
        <p>Halo {name},</p>
        <p>Pembayaran top up Anda telah berhasil diproses.</p>
        
        <div class="info-box">
            <p><strong>Detail Transaksi:</strong></p>
            <p>Jumlah Top Up: <span class="success">{format_currency(amount)}</span></p>
            <p>Saldo Terbaru: <span class="highlight">{format_currency(new_balance)}</span></p>
        </div>
        
        <p>Saldo Anda siap digunakan untuk membeli paket VPS!</p>
        
        <center>
            <a href="{FRONTEND_URL}/dashboard" class="button">Lihat Paket VPS</a>
        </center>
    """ + get_email_footer()
    
    return await send_email(to_email, subject, html)


async def send_order_created_email(
    to_email: str,
    name: str,
    package_name: str,
    price: float,
    expired_at: datetime,
    original_price: Optional[float] = None,
    is_renewal: bool = False
) -> bool:
    """
    Template 3: Order created / renewal confirmation.
    - original_price: harga normal paket (jika berbeda dengan price, tampil dicoret)
    - is_renewal: True jika ini email perpanjangan, False jika order baru
    """
    action_label = "Perpanjangan VPS Berhasil! 🔄" if is_renewal else "Pesanan VPS Berhasil! 🎉"
    subject = f"{'Perpanjangan' if is_renewal else 'Pesanan'} VPS Berhasil - {package_name}"
    action_desc = "diperpanjang" if is_renewal else "dibuat dan langsung aktif"
    button_label = "Lihat VPS Saya"

    price_html = build_price_html(price, original_price)

    html = get_email_header() + f"""
        <h2>{action_label}</h2>
        <p>Halo {name},</p>
        <p>{'Perpanjangan' if is_renewal else 'Pesanan'} VPS Anda telah berhasil {action_desc}.</p>
        
        <div class="info-box">
            <p><strong>Detail {'Perpanjangan' if is_renewal else 'Pesanan'}:</strong></p>
            <p>Paket: <span class="highlight">{package_name}</span></p>
            <p style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                Harga{'&nbsp;Perpanjangan' if is_renewal else ''}: {price_html}
            </p>
            <p>Berlaku Hingga: <span class="highlight">{expired_at.strftime('%d %B %Y')}</span></p>
        </div>
        
        {'<p>Tim kami akan segera memproses dan mengirimkan detail akses VPS Anda.</p>' if not is_renewal else '<p>Layanan VPS Anda telah berhasil diperpanjang dan siap digunakan.</p>'}
        
        <center>
            <a href="{FRONTEND_URL}/dashboard/vps" class="button">{button_label}</a>
        </center>
    """ + get_email_footer()
    
    return await send_email(to_email, subject, html)


async def send_payment_reminder_email(
    to_email: str,
    name: str,
    package_name: str,
    expired_at: datetime,
    days_remaining: int,
    current_balance: float,
    renewal_price: float
) -> bool:
    """Template 4, 5, 6: Payment reminder H-7, H-3, H-1"""
    urgency = "warning" if days_remaining > 1 else "danger"
    urgency_text = "⚠️" if days_remaining > 1 else "🚨"
    
    subject = f"{urgency_text} Pengingat: VPS {package_name} akan berakhir dalam {days_remaining} hari"
    
    html = get_email_header() + f"""
        <h2 class="{urgency}">Pengingat Pembayaran {urgency_text}</h2>
        <p>Halo {name},</p>
        <p>VPS Anda akan berakhir dalam <strong class="{urgency}">{days_remaining} hari</strong>.</p>
        
        <div class="info-box">
            <p><strong>Detail VPS:</strong></p>
            <p>Paket: <span class="highlight">{package_name}</span></p>
            <p>Berakhir: <span class="{urgency}">{expired_at.strftime('%d %B %Y')}</span></p>
            <p>Harga Perpanjangan: <span class="price-actual">{format_currency(renewal_price)}</span></p>
        </div>
        
        <div class="info-box">
            <p><strong>Saldo Anda:</strong> <span class="{'success' if current_balance >= renewal_price else 'danger'}">{format_currency(current_balance)}</span></p>
            {'<p class="success">✅ Saldo cukup untuk perpanjangan</p>' if current_balance >= renewal_price else '<p class="danger">❌ Saldo tidak cukup, silakan top up segera</p>'}
        </div>
        
        <p>Perpanjang sekarang untuk menghindari suspensi layanan.</p>
        
        <center>
            <a href="{FRONTEND_URL}/dashboard/topup" class="button">Top Up Sekarang</a>
        </center>
    """ + get_email_footer()
    
    return await send_email(to_email, subject, html)


async def send_suspension_notice_email(to_email: str, name: str, package_name: str) -> bool:
    """Template 7: Suspension notice"""
    subject = f"🔴 VPS {package_name} Telah Disuspend"
    
    html = get_email_header() + f"""
        <h2 class="danger">VPS Disuspend 🔴</h2>
        <p>Halo {name},</p>
        <p>VPS <strong>{package_name}</strong> Anda telah <span class="danger">disuspend</span> karena masa berlaku telah habis.</p>
        
        <div class="info-box">
            <p><strong>Apa yang terjadi?</strong></p>
            <ul style="color: #cbd5e1;">
                <li>VPS Anda tidak dapat diakses sementara</li>
                <li>Data Anda masih tersimpan dengan aman</li>
                <li>Anda memiliki 7 hari untuk memperpanjang</li>
            </ul>
        </div>
        
        <p class="danger"><strong>Peringatan:</strong> Jika tidak diperpanjang dalam 7 hari, VPS akan dihapus permanen.</p>
        
        <center>
            <a href="{FRONTEND_URL}/dashboard/topup" class="button">Perpanjang Sekarang</a>
        </center>
    """ + get_email_footer()
    
    return await send_email(to_email, subject, html)


async def send_final_warning_email(to_email: str, name: str, package_name: str, days_until_deletion: int) -> bool:
    """Template 8: Final warning before deletion"""
    subject = f"🚨 PERINGATAN TERAKHIR: VPS {package_name} akan dihapus"
    
    html = get_email_header() + f"""
        <h2 class="danger">⚠️ PERINGATAN TERAKHIR /h2>
        <p>Halo {name},</p>
        <p>VPS <strong>{package_name}</strong> Anda akan <span class="danger">DIHAPUS PERMANEN</span> dalam <strong class="danger">{days_until_deletion} hari</strong>.</p>
        
        <div class="info-box" style="border: 2px solid #ef4444;">
            <p class="danger"><strong>⚠️ Setelah dihapus:</strong></p>
            <ul style="color: #ef4444;">
                <li>Semua data akan hilang</li>
                <li>Tidak dapat dikembalikan</li>
                <li>IP address akan dirilis</li>
            </ul>
        </div>
        
        <p>Segera perpanjang untuk menyelamatkan VPS dan data Anda!</p>
        
        <center>
            <a href="{FRONTEND_URL}/dashboard/topup" class="button" style="background-color: #ef4444;">PERPANJANG SEKARANG</a>
        </center>
    """ + get_email_footer()
    
    return await send_email(to_email, subject, html)


async def send_password_reset_email(to_email: str, name: str, reset_token: str) -> bool:
    """Template: Password reset request"""
    reset_url = f"{FRONTEND_URL}/reset-password?token={reset_token}"
    subject = "Reset Password Akun Host ID Murah"

    html = get_email_header() + f"""
        <h2>Reset Password 🔐</h2>
        <p>Halo {name},</p>
        <p>Kami menerima permintaan untuk mengatur ulang password akun Anda.</p>

        <div class="info-box">
            <p>Klik tombol di bawah untuk membuat password baru:</p>
            <center>
                <a href="{reset_url}" class="button">Reset Password Sekarang</a>
            </center>
        </div>

        <p class="warning">⚠️ Link ini hanya berlaku selama <strong>1 jam</strong> dan hanya bisa digunakan sekali.</p>
        <p>Jika Anda tidak meminta reset password, abaikan email ini. Akun Anda tetap aman.</p>

        <p style="font-size: 12px; color: #64748b; word-break: break-all;">
            Atau salin link berikut ke browser:<br/>
            <a href="{reset_url}" style="color: #60a5fa;">{reset_url}</a>
        </p>
    """ + get_email_footer()

    return await send_email(to_email, subject, html)


async def send_referral_bonus_email(to_email: str, name: str, referred_name: str, bonus_amount: float, new_balance: float) -> bool:
    """Template 9: Referral bonus credited"""
    subject = f"🎁 Bonus Referral Diterima - {format_currency(bonus_amount)}"
    
    html = get_email_header() + f"""
        <h2 class="success">Bonus Referral Diterima! 🎁</h2>
        <p>Halo {name},</p>
        <p>Selamat! Anda menerima bonus referral karena <strong>{referred_name}</strong> telah melakukan top up pertama.</p>
        
        <div class="info-box">
            <p><strong>Detail Bonus:</strong></p>
            <p>Bonus Referral: <span class="success">{format_currency(bonus_amount)}</span></p>
            <p>Saldo Terbaru: <span class="highlight">{format_currency(new_balance)}</span></p>
        </div>
        
        <p>Terus bagikan kode referral Anda untuk mendapatkan lebih banyak bonus!</p>
        
        <center>
            <a href="{FRONTEND_URL}/dashboard/referral" class="button">Lihat Statistik Referral</a>
        </center>
    """ + get_email_footer()
    
    return await send_email(to_email, subject, html)