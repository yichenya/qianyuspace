#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据库初始化脚本：按当前SQLAlchemy模型创建缺失表，并初始化默认徽章与管理员。
不会删除已有表和数据。
"""
from datetime import date
import uuid

from sqlalchemy.orm import sessionmaker

from app.core.database import Base, engine
from app.core.security import get_password_hash
from app.models import Badge, UsageQuota, User  # noqa: F401
from app.models import *  # noqa: F403,F401

DEFAULT_BADGES = [
    ("新手徽章", "完成首次注册", "/badges/newbie.png"),
    ("创作者徽章", "生成第一个作品", "/badges/creator.png"),
    ("收藏家徽章", "收藏10个素材", "/badges/collector.png"),
    ("活跃徽章", "连续使用7天", "/badges/active.png"),
    ("VIP徽章", "升级为VIP用户", "/badges/vip.png"),
]


def init_db():
    """初始化数据库表结构与基础数据"""
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        for name, description, icon in DEFAULT_BADGES:
            exists = session.query(Badge).filter(Badge.name == name).first()
            if not exists:
                session.add(Badge(name=name, description=description, icon=icon))

        admin = session.query(User).filter(User.email == "admin@qianyu-space.com").first()
        if not admin:
            admin = User(
                id=str(uuid.uuid4()),
                email="admin@qianyu-space.com",
                password_hash=get_password_hash("admin123"),
                nickname="超级管理员",
                is_admin=1,
                is_active=True,
            )
            session.add(admin)
            session.flush()
        else:
            # 本地开发统一重置管理员凭据，避免历史脏数据导致无法登录
            admin.password_hash = get_password_hash("admin123")
            admin.is_admin = 1
            admin.is_active = True
            if not admin.nickname:
                admin.nickname = "超级管理员"

        if admin and not session.query(UsageQuota).filter(UsageQuota.user_id == admin.id).first():
            session.add(
                UsageQuota(
                    user_id=admin.id,
                    daily_quota=999999,
                    used_today=0,
                    last_reset=date.today(),
                )
            )

        session.commit()
        print("数据库表结构与基础数据初始化完成")
        print("管理员账号: admin@qianyu-space.com")
        print("管理员密码: admin123")
    except Exception as exc:
        session.rollback()
        raise exc
    finally:
        session.close()


if __name__ == "__main__":
    init_db()
