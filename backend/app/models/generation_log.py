#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成日志模型
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Numeric, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class GenerationLog(Base):
    """生成日志表模型"""
    __tablename__ = "generation_log"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("user.id"), nullable=False, index=True)
    type = Column(String(20), nullable=False)  # image/video
    prompt = Column(Text, nullable=False)
    params = Column(JSON, nullable=True)  # 生成参数
    duration_seconds = Column(Integer, nullable=True)  # 视频时长（秒）
    image_count = Column(Integer, nullable=True)  # 图片数量
    unit_cost = Column(Numeric(10, 2), nullable=False)  # 单价
    total_cost = Column(Numeric(10, 2), nullable=False)  # 平台成本
    charge_amount = Column(Numeric(10, 2), nullable=False)  # 用户收费
    profit = Column(Numeric(10, 2), nullable=False)  # 平台利润
    status = Column(String(20), nullable=False, index=True)  # pending/processing/success/failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # 关联关系
    user = relationship("User", back_populates="generation_logs")