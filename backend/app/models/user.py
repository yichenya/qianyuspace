#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
用户模型
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    """用户表模型"""
    __tablename__ = "user"

    id = Column(String(36), primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    nickname = Column(String(50), nullable=False)
    avatar = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)  # 用户是否激活
    is_admin = Column(Integer, default=0)  # 0: 普通用户, 1: 管理员
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 关联关系
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    materials = relationship("Material", back_populates="user", cascade="all, delete-orphan")
    generation_logs = relationship("GenerationLog", back_populates="user", cascade="all, delete-orphan")
    user_badges = relationship("UserBadge", back_populates="user", cascade="all, delete-orphan")
    usage_quota = relationship("UsageQuota", back_populates="user", uselist=False, cascade="all, delete-orphan")