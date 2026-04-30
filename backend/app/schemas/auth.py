#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
认证相关的数据模型
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    """用户注册请求模型"""
    email: EmailStr
    password: str = Field(..., min_length=8, description="密码长度至少8位")
    nickname: str = Field(..., max_length=50, description="昵称最大长度50")


class UserLogin(BaseModel):
    """用户登录请求模型"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """令牌响应模型"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """令牌数据模型"""
    user_id: Optional[int] = None


class RefreshTokenRequest(BaseModel):
    """刷新令牌请求模型"""
    refresh_token: str


class SendCodeRequest(BaseModel):
    """发送验证码请求模型"""
    email: EmailStr


class UserResponse(BaseModel):
    """用户信息响应模型"""
    id: str
    email: str
    nickname: str
    avatar: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """认证响应模型"""
    access_token: str
    refresh_token: str
    user: UserResponse


class AdminLogin(BaseModel):
    """管理员登录请求模型"""
    username: str
    password: str


class AdminResponse(BaseModel):
    """管理员信息响应模型"""
    id: str
    email: str
    nickname: str
    is_admin: int

    class Config:
        from_attributes = True


class AdminAuthResponse(BaseModel):
    """管理员认证响应模型"""
    access_token: str
    admin: AdminResponse