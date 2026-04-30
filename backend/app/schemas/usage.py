#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
使用统计相关的数据模型
"""
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from decimal import Decimal


class UsageQuotaResponse(BaseModel):
    """使用额度响应模型"""
    daily_quota: int
    used_today: int


class GenerationLogResponse(BaseModel):
    """生成日志响应模型"""
    id: int
    type: str
    prompt: str
    charge_amount: Decimal
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UsageStatsResponse(BaseModel):
    """使用统计响应模型"""
    total_generations: int
    total_spent: Decimal
