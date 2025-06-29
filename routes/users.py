from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import get_async_db
from db.user.models import User 
from pydantic import BaseModel

router = APIRouter()

class UserCreate(BaseModel):
    id: str
    username: str
    email: str

@router.post("/users", status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_async_db)):
    new_user = User(id=user.id, username=user.username, email=user.email)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user