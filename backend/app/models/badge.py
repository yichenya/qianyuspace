#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
徽章模型
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Badge(Base):
    """徽章表模型"""
    __tablename__ = "badge"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(255), nullable=True)

    # 关联关系
    user_badges = relationship("UserBadge", back_populates="badge")


class UserBadge(Base):
    """用户徽章关联表模型"""
    __tablename__ = "user_badge"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("user.id"), nullable=False, index=True)
    badge_id = Column(Integer, ForeignKey("badge.id"), nullable=False, index=True)
    earned_at = Column(DateTime(timezone=True), server_default=func.now())

    # 关联关系
    user = relationship("User", back_populates="user_badges")
    badge = relationship("Badge", back_populates="user_badges")