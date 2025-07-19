from fastapi import APIRouter, HTTPException, status, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.session import get_async_db
from db.user.models import User
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from utils.security import hash_password, verify_password
from utils.jwt import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
import uuid


router = APIRouter()


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
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


@router.post("/users/login")
async def login_user(
    user: UserLogin, response: Response, db: AsyncSession = Depends(get_async_db)
):
    # Find user by email
    result = await db.execute(select(User).where(User.email == user.email))
    db_user = result.scalars().first()

    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Verify the password
    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Create JWT
    access_token = create_access_token({"sub": db_user.id})

    # Set JWT as HTTP only cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # seconds
        secure=True,  # Set to True if using HTTPS
        samesite="lax",
        path="/",
    )

    return {"message": "Login successful", "user_id": db_user.id}
