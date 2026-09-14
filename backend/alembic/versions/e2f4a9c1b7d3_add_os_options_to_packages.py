"""add os_options to packages

Revision ID: e2f4a9c1b7d3
Revises: 478730ff1e0b
Create Date: 2026-09-15 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e2f4a9c1b7d3'
down_revision: Union[str, Sequence[str], None] = '478730ff1e0b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('vps_packages', sa.Column('os_options', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('vps_packages', 'os_options')
