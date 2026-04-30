#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
个人中心模块路由
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import User, Badge, UserBadge, UsageQuota
from app.schemas.profile import ProfileUpdate, BadgeResponse
from app.schemas.auth import UserResponse
from app.api.auth.router import get_current_user

# 创建路由器
router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取当前用户信息"""
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新当前用户信息"""
    # 更新个人信息
    if profile_data.nickname is not None:
        current_user.nickname = profile_data.nickname
    if profile_data.avatar is not None:
        current_user.avatar = profile_data.avatar

    db.commit()
    db.refresh(current_user)

    return current_user


@router.get("/me/quota")
async def get_user_quota(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户额度信息"""
    usage_quota = db.query(UsageQuota).filter(UsageQuota.user_id == current_user.id).first()

    if not usage_quota:
        # 如果没有额度记录，创建一个
        from datetime import date
        usage_quota = UsageQuota(
            user_id=current_user.id,
            daily_quota=100,
            used_today=0,
            last_reset=date.today()
        )
        db.add(usage_quota)
        db.commit()
        db.refresh(usage_quota)

    # 计算今日剩余额度
    remaining_quota = max(0, usage_quota.daily_quota - usage_quota.used_today)

    return {
        "daily_quota": usage_quota.daily_quota,
        "used_today": usage_quota.used_today,
        "remaining_quota": remaining_quota,
        "last_reset": str(usage_quota.last_reset)
    }


@router.get("/badges", response_model=List[BadgeResponse])
async def get_badges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户徽章列表"""
    # 查询用户获得的徽章
    user_badges = db.query(UserBadge).filter(UserBadge.user_id == current_user.id).all()
    badge_ids = [ub.badge_id for ub in user_badges]

    # 查询徽章详情
    badges = db.query(Badge).filter(Badge.id.in_(badge_ids)).all()

    return badges