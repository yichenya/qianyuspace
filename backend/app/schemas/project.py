#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
项目相关的数据模型
"""
from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    """创建项目请求模型"""
    name: str = Field(..., max_length=255, description="项目名称最大长度255")


class ProjectUpdate(BaseModel):
    """更新项目请求模型"""
    name: Optional[str] = Field(None, max_length=255, description="项目名称最大长度255")
    cover_image: Optional[str] = None


class ProjectResponse(BaseModel):
    """项目响应模型"""
    id: str
    name: str
    cover_image: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CanvasElement(BaseModel):
    """画布元素模型"""
    id: str
    type: str = Field(..., description="元素类型：image | video | text")
    x: float = 0
    y: float = 0
    width: float = 100
    height: float = 100
    scaleX: float = 1
    scaleY: float = 1
    rotation: float = 0
    attrs: dict = Field(default_factory=dict, description="元素属性")


class CanvasStateResponse(BaseModel):
    """画布状态响应模型"""
    project_id: str
    elements: List[CanvasElement] = Field(default_factory=list)
    scale: float = 1
    position: dict = Field(default_factory=lambda: {"x": 0, "y": 0})


class CanvasStateUpdate(BaseModel):
    """更新画布状态请求模型"""
    elements: List[CanvasElement] = Field(default_factory=list)
    scale: float = 1
    position: dict = Field(default_factory=lambda: {"x": 0, "y": 0})