#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
素材模型
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Material(Base):
    """素材表模型"""
    __tablename__ = "material"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("user.id"), nullable=False, index=True)
    type = Column(String(20), nullable=False)  # image/video
    url = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    duration = Column(Integer, nullable=True)  # 视频时长（秒）
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 关联关系
    user = relationship("User", back_populates="materials")
    favorites = relationship("MaterialFavorite", back_populates="material", cascade="all, delete-orphan")