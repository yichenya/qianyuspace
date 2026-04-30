#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
核心配置文件
"""
from typing import List
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """应用配置类"""
    # 项目配置
    PROJECT_NAME: str = "千域空间"
    API_V1_STR: str = "/api"

    # 数据库配置 - 使用PostgreSQL
    DATABASE_URL: str = "postgresql://yang123:yang123@localhost:5432/qianyu"

    # Redis配置
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT配置
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS配置
    CORS_ORIGINS: List[str] = ["*"]

    # 阿里云百炼API配置
    ALIYUN_BAILIAN_API_KEY: str = "your-aliyun-bailian-api-key"
    ALIYUN_BAILIAN_API_URL: str = "https://bailian.aliyuncs.com/api"

    # 阿里云OSS配置
    ALIYUN_OSS_ACCESS_KEY: str = "your-aliyun-oss-access-key"
    ALIYUN_OSS_SECRET_KEY: str = "your-aliyun-oss-secret-key"
    ALIYUN_OSS_BUCKET: str = "qianyu-space"
    ALIYUN_OSS_ENDPOINT: str = "oss-cn-hangzhou.aliyuncs.com"

    # 邮箱服务配置
    EMAIL_API_KEY: str = "your-email-api-key"
    EMAIL_SENDER: str = "no-reply@qianyu-space.com"

    # 验证码配置
    VERIFICATION_CODE_EXPIRE_MINUTES: int = 5

    # 生成任务配置
    IMAGE_GENERATION_TIMEOUT: int = 30  # 图片生成超时时间（秒）
    VIDEO_GENERATION_TIMEOUT: int = 120  # 视频生成超时时间（秒）

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings():
    """获取配置实例（单例）"""
    return Settings()


settings = get_settings()
