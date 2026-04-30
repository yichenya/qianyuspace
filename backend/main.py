#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FastAPI应用主入口
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, projects, materials, generate, usage, profile, admin
from app.core.config import settings

# 创建FastAPI应用实例
app = FastAPI(
    title="千域空间API",
    description="千域空间PC平台后端API接口",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由 - 使用v1版本
app.include_router(auth.router, prefix="/api/v1/auth", tags=["认证"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["项目"])
app.include_router(materials.router, prefix="/api/v1/materials", tags=["素材"])
app.include_router(generate.router, prefix="/api/v1/generate", tags=["AI生成"])
app.include_router(usage.router, prefix="/api/v1/usage", tags=["使用"])
app.include_router(profile.router, prefix="/api/v1/users", tags=["用户"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["管理端"])

# 根路径
@app.get("/")
def read_root():
    """根路径"""
    return {"message": "千域空间API服务运行中"}

# 健康检查
@app.get("/health")
def health_check():
    """健康检查"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )