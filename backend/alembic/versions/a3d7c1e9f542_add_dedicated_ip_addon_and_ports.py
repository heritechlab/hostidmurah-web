"""add dedicated ip addon fields and vps_ports table

Revision ID: a3d7c1e9f542
Revises: f8b3c6e9a2d1
Create Date: 2026-09-15 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a3d7c1e9f542'
down_revision: Union[str, Sequence[str], None] = 'f8b3c6e9a2d1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('vps_orders', sa.Column('dedicated_ip_status', sa.String(length=20), nullable=True, server_default='none'))
    op.add_column('vps_orders', sa.Column('dedicated_ip_price', sa.Numeric(15, 2), nullable=True))

    op.create_table(
        'vps_ports',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('order_id', sa.Integer(), sa.ForeignKey('vps_orders.id'), nullable=False),
        sa.Column('port_number', sa.Integer(), nullable=False),
        sa.Column('protocol', sa.String(length=10), nullable=True, server_default='tcp'),
        sa.Column('label', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=True, server_default='requested'),
        sa.Column('admin_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index(op.f('ix_vps_ports_id'), 'vps_ports', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_vps_ports_id'), table_name='vps_ports')
    op.drop_table('vps_ports')
    op.drop_column('vps_orders', 'dedicated_ip_price')
    op.drop_column('vps_orders', 'dedicated_ip_status')
