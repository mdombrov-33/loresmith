from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import get_async_db
from db.user import crud
from utils.security import hash_password, verify_password
from utils.jwt import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, verify_jwt_token
from models.users import UserCreate, UserLogin

router = APIRouter()


@router.post("/users", status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_async_db)):
    existing_user = await crud.get_user_by_email(db, user.email)
    if existing_user:
        raise HTTPException(
            status_code=400, detail="User with this email already exists"
        )

    hashed_password = hash_password(user.password)
    new_user = await crud.create_user(db, user.email, hashed_password)

    return {"id": new_user.id, "email": new_user.email}


@router.post("/users/login")
async def login_user(
    user: UserLogin, response: Response, db: AsyncSession = Depends(get_async_db)
):
    db_user = await crud.get_user_by_email(db, user.email)
    if not db_user or not verify_password(user.password, str(db_user.hashed_password)):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token({"sub": db_user.id})
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=True,
        samesite="lax",
        path="/",
    )
    return {"message": "Login successful", "user_id": db_user.id}


@router.get("/me")
async def get_current_user(request: Request, db: AsyncSession = Depends(get_async_db)):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    payload = verify_jwt_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("sub")
    if not isinstance(user_id, str):
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"id": str(user.id), "email": user.email}


@router.post("/users/logout")
def logout_user(response: Response):
    response.delete_cookie(
        key="access_token",
        path="/",
        samesite="lax",
        httponly=True,
        secure=True,
    )
    return {"message": "Logout successful"}
