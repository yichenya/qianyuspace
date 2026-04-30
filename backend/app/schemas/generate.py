#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI生成相关的数据模型
"""
from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel


class GenerateImageRequest(BaseModel):
    """生成图片请求模型"""
    prompt: str
    params: Optional[Dict[str, Any]] = None


class GenerateVideoRequest(BaseModel):
    """生成视频请求模型"""
    prompt: str
    params: Optional[Dict[str, Any]] = None


class TaskResponse(BaseModel):
    """生成任务响应模型"""
    task_id: int
    status: str


class TaskStatusResponse(BaseModel):
    """任务状态响应模型"""
    id: int
    status: str
    result: Optional[Dict[str, Any]] = None
