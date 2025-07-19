from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from db.user.models import User
from typing import Optional
import uuid


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()


async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
    return await db.get(User, user_id)


async def create_user(db: AsyncSession, email: str, hashed_password: str) -> User:
    new_user = User(id=str(uuid.uuid4()), email=email, hashed_password=hashed_password)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user
