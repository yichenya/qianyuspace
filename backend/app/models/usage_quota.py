#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
使用额度模型
"""
from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class UsageQuota(Base):
    """使用额度表模型"""
    __tablename__ = "usage_quota"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("user.id"), nullable=False, unique=True, index=True)
    daily_quota = Column(Integer, default=0)
    used_today = Column(Integer, default=0)
    last_reset = Column(Date, nullable=False)

    # 关联关系
    user = relationship("User", back_populates="usage_quota")