from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.session import get_async_db
from db.user.models import User
from pydantic import BaseModel, EmailStr
from utils.security import hash_password
import uuid

router = APIRouter()


class UserCreate(BaseModel):
    email: EmailStr
    password: str


@router.post("/users", status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_async_db)):
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == user.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    # Hash the password before storing
    hashed_password = hash_password(user.password)

    new_user = User(
        id=str(uuid.uuid4()), email=user.email, hashed_password=hashed_password
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return {"id": new_user.id, "email": new_user.email}
