#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
认证模块路由
"""
from datetime import date
import random
import string
import uuid

import redis
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.redis import get_redis
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.models import UsageQuota, User
from app.schemas.auth import (
    AdminAuthResponse,
    AdminLogin,
    AdminResponse,
    AuthResponse,
    RefreshTokenRequest,
    SendCodeRequest,
    Token,
    UserLogin,
    UserRegister,
    UserResponse,
)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """获取当前用户"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="用户已被禁用")
    return user


def generate_verification_code() -> str:
    """生成6位数字验证码"""
    return "".join(random.choices(string.digits, k=6))


def send_verification_email(email: str, code: str) -> bool:
    """发送验证码邮件（本地开发阶段模拟）"""
    print(f"向 {email} 发送验证码: {code}")
    return True


def ensure_usage_quota(db: Session, user_id: str, daily_quota: int = 100) -> UsageQuota:
    """确保用户存在额度记录"""
    usage_quota = db.query(UsageQuota).filter(UsageQuota.user_id == user_id).first()
    if usage_quota:
        return usage_quota

    usage_quota = UsageQuota(
        user_id=user_id,
        daily_quota=daily_quota,
        used_today=0,
        last_reset=date.today(),
    )
    db.add(usage_quota)
    return usage_quota


def is_password_valid(plain_password: str, password_hash: str) -> bool:
    """安全校验密码，非法哈希返回False而不是500"""
    try:
        return verify_password(plain_password, password_hash)
    except Exception:
        return False


@router.post("/register", response_model=AuthResponse)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """用户注册"""
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="该邮箱已注册")

    new_user = User(
        id=str(uuid.uuid4()),
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        nickname=user_data.nickname,
    )
    db.add(new_user)
    db.flush()
    ensure_usage_quota(db, new_user.id)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": str(new_user.id)})
    refresh_token = create_refresh_token(data={"sub": str(new_user.id)})

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(new_user),
    )


@router.post("/login", response_model=AuthResponse)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """用户登录"""
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not is_password_valid(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="邮箱或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="用户已被禁用")

    ensure_usage_quota(db, user.id)
    db.commit()

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """刷新令牌"""
    payload = decode_token(request.refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="无效的刷新令牌")

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="无效的刷新令牌")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="用户不存在或已禁用")

    access_token = create_access_token(data={"sub": user_id})
    refresh_token_value = create_refresh_token(data={"sub": user_id})
    return Token(access_token=access_token, refresh_token=refresh_token_value)


@router.post("/send-code")
async def send_code(
    request: SendCodeRequest,
    redis_client: redis.Redis = Depends(get_redis),
):
    """发送验证码"""
    code = generate_verification_code()
    redis_key = f"verification_code:{request.email}"

    try:
        redis_client.setex(redis_key, settings.VERIFICATION_CODE_EXPIRE_MINUTES * 60, code)
    except Exception:
        # Redis不是本地开发必需依赖，降级为仅打印验证码
        pass

    send_verification_email(request.email, code)
    return {"message": "验证码已发送"}


@router.post("/admin/login", response_model=AdminAuthResponse)
async def admin_login(admin_data: AdminLogin, db: Session = Depends(get_db)):
    """管理员登录"""
    user = db.query(User).filter(User.email == admin_data.username).first()
    if not user or not is_password_valid(admin_data.password, user.password_hash) or user.is_admin != 1:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误，或无管理员权限",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="管理员账号已禁用")

    access_token = create_access_token(data={"sub": str(user.id), "is_admin": True})
    return AdminAuthResponse(
        access_token=access_token,
        admin=AdminResponse.model_validate(user),
    )
