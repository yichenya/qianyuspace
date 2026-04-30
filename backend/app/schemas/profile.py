#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
个人中心相关的数据模型
"""
from typing import Optional, List
from pydantic import BaseModel, Field


class ProfileUpdate(BaseModel):
    """更新个人信息请求模型"""
    nickname: Optional[str] = Field(None, max_length=50, description="昵称最大长度50")
    avatar: Optional[str] = None


class BadgeResponse(BaseModel):
    """徽章响应模型"""
    id: int
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    
    class Config:
        from_attributes = True
