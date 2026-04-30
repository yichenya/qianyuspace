#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
初始化管理员用户脚本
"""
import uuid
from sqlalchemy.orm import sessionmaker
from app.core.database import engine, Base
from app.models import User, UsageQuota
from app.core.security import get_password_hash
from datetime import date


def init_admin():
    """初始化管理员用户"""
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        existing_admin = session.query(User).filter(User.is_admin == 1).first()
        if existing_admin:
            print("管理员用户已存在，无需创建")
            return

        admin_user = User(
            id=str(uuid.uuid4()),
            email="admin@qianyu-space.com",
            password_hash=get_password_hash("admin123"),
            nickname="超级管理员",
            is_admin=1
        )
        session.add(admin_user)
        session.commit()
        session.refresh(admin_user)

        usage_quota = UsageQuota(
            user_id=admin_user.id,
            daily_quota=999999,
            used_today=0,
            last_reset=date.today()
        )
        session.add(usage_quota)
        session.commit()

        print("管理员用户创建成功")
        print(f"管理员账号: admin@qianyu-space.com")
        print(f"管理员密码: admin123")

    except Exception as e:
        print(f"创建管理员用户失败: {e}")
        session.rollback()
    finally:
        session.close()


if __name__ == "__main__":
    init_admin()