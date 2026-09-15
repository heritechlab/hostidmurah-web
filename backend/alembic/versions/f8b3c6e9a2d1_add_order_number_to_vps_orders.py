"""add order_number to vps_orders

Revision ID: f8b3c6e9a2d1
Revises: e2f4a9c1b7d3
Create Date: 2026-09-15 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f8b3c6e9a2d1'
down_revision: Union[str, Sequence[str], None] = 'e2f4a9c1b7d3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('vps_orders', sa.Column('order_number', sa.String(length=30), nullable=True))
    op.create_index(op.f('ix_vps_orders_order_number'), 'vps_orders', ['order_number'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_vps_orders_order_number'), table_name='vps_orders')
    op.drop_column('vps_orders', 'order_number')
