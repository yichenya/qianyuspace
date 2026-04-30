#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Redis连接管理
"""
import redis
from app.core.config import settings

# 创建Redis连接池
redis_pool = redis.ConnectionPool.from_url(
    settings.REDIS_URL,
    decode_responses=True,
    max_connections=50
)

# 创建Redis客户端
redis_client = redis.Redis(connection_pool=redis_pool)


def get_redis():
    """获取Redis客户端的依赖函数"""
    return redis_client
