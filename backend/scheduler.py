"""
APScheduler Jobs for VPS Store
- Payment reminders (H-7, H-3, H-1)
- Auto suspend expired VPS
- Auto cancel warning for suspended VPS
"""
import logging
from datetime import datetime, timedelta, timezone
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from database import AsyncSessionLocal, VPSOrder, User, NotificationLog, OrderStatus, NotificationType
from email_service import (
    send_payment_reminder_email,
    send_suspension_notice_email,
    send_final_warning_email
)

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


async def log_notification(
    db: AsyncSession,
    user_id: int,
    notif_type: NotificationType,
    message: str,
    status: str = "sent"
):
    """Log notification to database"""
    notif = NotificationLog(
        user_id=user_id,
        type=notif_type,
        channel="email",
        message=message,
        status=status
    )
    db.add(notif)
    await db.commit()


async def job_payment_reminder():
    """
    Job 1 - Payment Reminder
    Runs daily to send reminders for VPS expiring in 7, 3, or 1 days
    """
    logger.info("Running payment reminder job...")
    
    async with AsyncSessionLocal() as db:
        try:
            now = datetime.now(timezone.utc)
            
            # Check for H-7, H-3, H-1
            reminder_days = [7, 3, 1]
            
            for days in reminder_days:
                target_date = now + timedelta(days=days)
                start_of_day = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
                end_of_day = target_date.replace(hour=23, minute=59, second=59, microsecond=999999)
                
                # Query active orders expiring on target date
                result = await db.execute(
                    select(VPSOrder, User)
                    .join(User, VPSOrder.user_id == User.id)
                    .where(
                        and_(
                            VPSOrder.status == OrderStatus.active,
                            VPSOrder.expired_at >= start_of_day,
                            VPSOrder.expired_at <= end_of_day
                        )
                    )
                )
                
                orders = result.all()
                
                for order, user in orders:
                    # Get package info
                    from database import VPSPackage
                    pkg_result = await db.execute(
                        select(VPSPackage).where(VPSPackage.id == order.package_id)
                    )
                    package = pkg_result.scalar_one_or_none()
                    
                    if package and user:
                        success = await send_payment_reminder_email(
                            to_email=user.email,
                            name=user.name,
                            package_name=package.name,
                            expired_at=order.expired_at,
                            days_remaining=days,
                            current_balance=float(user.balance),
                            renewal_price=float(package.price_monthly)
                        )
                        
                        await log_notification(
                            db, user.id,
                            NotificationType.payment_reminder,
                            f"Payment reminder H-{days} for {package.name}",
                            "sent" if success else "failed"
                        )
                        
                        logger.info(f"Sent H-{days} reminder to {user.email} for order {order.id}")
            
            logger.info("Payment reminder job completed")
            
        except Exception as e:
            logger.error(f"Payment reminder job failed: {str(e)}")


async def job_auto_suspend():
    """
    Job 2 - Auto Suspend
    Suspend VPS orders that have expired
    """
    logger.info("Running auto suspend job...")
    
    async with AsyncSessionLocal() as db:
        try:
            now = datetime.now(timezone.utc)
            
            # Query active orders that have expired
            result = await db.execute(
                select(VPSOrder, User)
                .join(User, VPSOrder.user_id == User.id)
                .where(
                    and_(
                        VPSOrder.status == OrderStatus.active,
                        VPSOrder.expired_at < now
                    )
                )
            )
            
            orders = result.all()
            
            for order, user in orders:
                # Update status to suspended
                order.status = OrderStatus.suspended
                
                # Get package info
                from database import VPSPackage
                pkg_result = await db.execute(
                    select(VPSPackage).where(VPSPackage.id == order.package_id)
                )
                package = pkg_result.scalar_one_or_none()
                
                if package and user:
                    success = await send_suspension_notice_email(
                        to_email=user.email,
                        name=user.name,
                        package_name=package.name
                    )
                    
                    await log_notification(
                        db, user.id,
                        NotificationType.suspension_warning,
                        f"VPS {package.name} suspended",
                        "sent" if success else "failed"
                    )
                    
                    logger.info(f"Suspended order {order.id} for user {user.email}")
            
            await db.commit()
            logger.info("Auto suspend job completed")
            
        except Exception as e:
            logger.error(f"Auto suspend job failed: {str(e)}")
            await db.rollback()


async def job_auto_cancel_warning():
    """
    Job 3 - Auto Cancel Warning
    Send final warning for suspended VPS and expire after 7 days
    """
    logger.info("Running auto cancel warning job...")
    
    async with AsyncSessionLocal() as db:
        try:
            now = datetime.now(timezone.utc)
            
            # Query suspended orders
            result = await db.execute(
                select(VPSOrder, User)
                .join(User, VPSOrder.user_id == User.id)
                .where(VPSOrder.status == OrderStatus.suspended)
            )
            
            orders = result.all()
            
            for order, user in orders:
                # Calculate days suspended
                days_suspended = (now - order.expired_at).days
                
                # Get package info
                from database import VPSPackage
                pkg_result = await db.execute(
                    select(VPSPackage).where(VPSPackage.id == order.package_id)
                )
                package = pkg_result.scalar_one_or_none()
                
                if not package or not user:
                    continue
                
                if days_suspended >= 7:
                    # Set status to expired (deleted)
                    order.status = OrderStatus.expired
                    logger.info(f"Order {order.id} set to expired after 7+ days suspension")
                    
                elif days_suspended >= 3:
                    # Send final warning
                    days_until_deletion = 7 - days_suspended
                    
                    success = await send_final_warning_email(
                        to_email=user.email,
                        name=user.name,
                        package_name=package.name,
                        days_until_deletion=days_until_deletion
                    )
                    
                    await log_notification(
                        db, user.id,
                        NotificationType.suspension_warning,
                        f"Final warning: {package.name} will be deleted in {days_until_deletion} days",
                        "sent" if success else "failed"
                    )
                    
                    logger.info(f"Sent final warning to {user.email} for order {order.id}")
            
            await db.commit()
            logger.info("Auto cancel warning job completed")
            
        except Exception as e:
            logger.error(f"Auto cancel warning job failed: {str(e)}")
            await db.rollback()


def start_scheduler():
    """Initialize and start the scheduler"""
    # Run all jobs daily at 8 AM
    scheduler.add_job(
        job_payment_reminder,
        CronTrigger(hour=8, minute=0),
        id="payment_reminder",
        replace_existing=True
    )
    
    scheduler.add_job(
        job_auto_suspend,
        CronTrigger(hour=8, minute=15),
        id="auto_suspend",
        replace_existing=True
    )
    
    scheduler.add_job(
        job_auto_cancel_warning,
        CronTrigger(hour=8, minute=30),
        id="auto_cancel_warning",
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("Scheduler started with 3 daily jobs")


def stop_scheduler():
    """Stop the scheduler"""
    scheduler.shutdown()
    logger.info("Scheduler stopped")
