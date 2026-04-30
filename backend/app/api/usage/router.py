#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
消费统计模块路由
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models import User, UsageQuota, GenerationLog
from app.schemas.usage import UsageQuotaResponse, GenerationLogResponse, UsageStatsResponse
from app.api.auth.router import get_current_user
from datetime import date, datetime, timedelta

# 创建路由器
router = APIRouter()


def reset_daily_quota(db: Session, user_id: str):
    """重置每日额度"""
    usage_quota = db.query(UsageQuota).filter(UsageQuota.user_id == user_id).first()
    if usage_quota:
        # 检查是否需要重置额度
        if usage_quota.last_reset < date.today():
            usage_quota.used_today = 0
            usage_quota.last_reset = date.today()
            db.commit()
    return usage_quota


@router.get("/quota", response_model=UsageQuotaResponse)
async def get_usage_quota(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取使用额度"""
    # 重置每日额度
    usage_quota = reset_daily_quota(db, current_user.id)
    
    if not usage_quota:
        # 如果没有额度记录，创建一个
        usage_quota = UsageQuota(
            user_id=current_user.id,
            daily_quota=100,
            used_today=0,
            last_reset=date.today()
        )
        db.add(usage_quota)
        db.commit()
        db.refresh(usage_quota)
    
    return UsageQuotaResponse(
        daily_quota=usage_quota.daily_quota,
        used_today=usage_quota.used_today
    )


@router.get("/history", response_model=List[GenerationLogResponse])
async def get_consumption_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取消费历史"""
    # 查询用户的生成日志
    logs = db.query(GenerationLog).filter(
        GenerationLog.user_id == current_user.id
    ).order_by(GenerationLog.created_at.desc()).all()
    
    return logs


@router.get("/stats", response_model=UsageStatsResponse)
async def get_usage_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取使用统计"""
    # 计算总生成次数
    total_generations = db.query(func.count(GenerationLog.id)).filter(
        GenerationLog.user_id == current_user.id
    ).scalar() or 0
    
    # 计算总消费金额
    total_spent = db.query(func.sum(GenerationLog.charge_amount)).filter(
        GenerationLog.user_id == current_user.id
    ).scalar() or 0
    
    return UsageStatsResponse(
        total_generations=total_generations,
        total_spent=total_spent
    )
