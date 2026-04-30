#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
素材收藏模型
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class MaterialFavorite(Base):
    """素材收藏表模型"""
    __tablename__ = "material_favorite"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("user.id"), nullable=False, index=True)
    material_id = Column(Integer, ForeignKey("material.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 关联关系
    user = relationship("User")
    material = relationship("Material", back_populates="favorites")