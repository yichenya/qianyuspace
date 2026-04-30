#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
画布状态模型
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class CanvasState(Base):
    """画布状态表模型"""
    __tablename__ = "canvas_state"

    project_id = Column(String(36), ForeignKey("project.id"), primary_key=True)
    state_json = Column(JSON, nullable=False)  # 存储画布上所有元素的序列化数据
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 关联关系
    project = relationship("Project", back_populates="canvas_state")