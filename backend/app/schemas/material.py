#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
素材相关的数据模型
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class MaterialResponse(BaseModel):
    """素材响应模型"""
    id: int
    type: str
    url: str
    name: str
    width: Optional[int] = None
    height: Optional[int] = None
    duration: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
