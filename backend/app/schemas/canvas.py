#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
画布相关的数据模型
"""
from typing import Dict, Any
from datetime import datetime
from pydantic import BaseModel


class CanvasStateUpdate(BaseModel):
    """更新画布状态请求模型"""
    state_data: Dict[str, Any]


class CanvasStateResponse(BaseModel):
    """画布状态响应模型"""
    id: int
    project_id: int
    state_data: Dict[str, Any]
    updated_at: datetime
    
    class Config:
        from_attributes = True
