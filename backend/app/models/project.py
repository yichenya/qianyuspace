#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
项目模型
"""
import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Project(Base):
    """项目表模型"""
    __tablename__ = "project"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("user.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    cover_image = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 关联关系
    user = relationship("User", back_populates="projects")
    canvas_state = relationship("CanvasState", back_populates="project", uselist=False, cascade="all, delete-orphan")