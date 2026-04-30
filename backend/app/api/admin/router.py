#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
管理后台模块路由
"""
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import case, desc, func
from sqlalchemy.orm import Session

from app.api.auth.router import get_current_user
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models import GenerationLog, Material, Project, User

router = APIRouter()


ACTIVE_STATUS = "active"
INACTIVE_STATUS = "inactive"


def _admin_guard(current_user: User = Depends(get_current_user)) -> User:
    if current_user.is_admin != 1:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="无管理员权限")
    return current_user


@router.get("/dashboard")
async def get_dashboard(
    _: User = Depends(_admin_guard),
    db: Session = Depends(get_db),
):
    user_count = db.query(func.count(User.id)).scalar() or 0
    project_count = db.query(func.count(Project.id)).scalar() or 0
    material_count = db.query(func.count(Material.id)).scalar() or 0
    task_count = db.query(func.count(GenerationLog.id)).scalar() or 0
    total_revenue = db.query(func.coalesce(func.sum(GenerationLog.charge_amount), 0)).scalar() or 0

    recent_tasks = (
        db.query(
            GenerationLog.id,
            User.email.label("user_email"),
            GenerationLog.type,
            GenerationLog.prompt,
            GenerationLog.status,
            GenerationLog.charge_amount,
            GenerationLog.created_at,
        )
        .join(User, User.id == GenerationLog.user_id)
        .order_by(GenerationLog.created_at.desc())
        .limit(10)
        .all()
    )

    return {
        "statistics": {
            "user_count": user_count,
            "project_count": project_count,
            "material_count": material_count,
            "task_count": task_count,
            "total_revenue": float(total_revenue),
        },
        "recent_tasks": [
            {
                "id": t.id,
                "user": t.user_email,
                "type": t.type,
                "prompt": t.prompt,
                "status": t.status,
                "cost": float(t.charge_amount or 0),
                "created_at": t.created_at,
            }
            for t in recent_tasks
        ],
    }


@router.get("/users")
async def get_users(
    search: str = Query(default=""),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    _: User = Depends(_admin_guard),
    db: Session = Depends(get_db),
):
    spent_subquery = (
        db.query(
            GenerationLog.user_id.label("user_id"),
            func.coalesce(func.sum(GenerationLog.charge_amount), 0).label("total_spent"),
            func.max(GenerationLog.created_at).label("last_login"),
        )
        .group_by(GenerationLog.user_id)
        .subquery()
    )
    project_subquery = (
        db.query(Project.user_id.label("user_id"), func.count(Project.id).label("project_count"))
        .group_by(Project.user_id)
        .subquery()
    )

    query = (
        db.query(
            User.id,
            User.email,
            User.nickname,
            User.avatar,
            User.is_active,
            User.created_at,
            spent_subquery.c.last_login,
            func.coalesce(spent_subquery.c.total_spent, 0).label("total_spent"),
            func.coalesce(project_subquery.c.project_count, 0).label("project_count"),
        )
        .outerjoin(spent_subquery, spent_subquery.c.user_id == User.id)
        .outerjoin(project_subquery, project_subquery.c.user_id == User.id)
        .order_by(User.created_at.desc())
    )

    if search:
        like_kw = f"%{search.strip()}%"
        query = query.filter((User.email.ilike(like_kw)) | (User.nickname.ilike(like_kw)))

    if status_filter in {ACTIVE_STATUS, INACTIVE_STATUS}:
        query = query.filter(User.is_active == (status_filter == ACTIVE_STATUS))

    rows = query.all()
    return [
        {
            "id": row.id,
            "email": row.email,
            "nickname": row.nickname,
            "avatar": row.avatar,
            "status": ACTIVE_STATUS if row.is_active else INACTIVE_STATUS,
            "created_at": row.created_at,
            "last_login": row.last_login,
            "total_spent": float(row.total_spent or 0),
            "project_count": int(row.project_count or 0),
        }
        for row in rows
    ]


@router.patch("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    payload: dict,
    _: User = Depends(_admin_guard),
    db: Session = Depends(get_db),
):
    new_status = payload.get("status")
    if new_status not in {ACTIVE_STATUS, INACTIVE_STATUS}:
        raise HTTPException(status_code=400, detail="status必须为active或inactive")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    user.is_active = new_status == ACTIVE_STATUS
    db.commit()
    return {"message": "用户状态已更新"}


@router.post("/users/{user_id}/reset-password")
async def reset_user_password(
    user_id: str,
    _: User = Depends(_admin_guard),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    user.password_hash = get_password_hash("12345678")
    db.commit()
    return {"message": "密码已重置为默认密码: 12345678"}


@router.get("/projects")
async def get_projects(
    search: str = Query(default=""),
    _: User = Depends(_admin_guard),
    db: Session = Depends(get_db),
):
    query = (
        db.query(
            Project.id,
            Project.user_id,
            User.email.label("user_email"),
            Project.name,
            Project.cover_image,
            Project.created_at,
            Project.updated_at,
        )
        .join(User, User.id == Project.user_id)
        .order_by(Project.created_at.desc())
    )
    if search:
        like_kw = f"%{search.strip()}%"
        query = query.filter((Project.name.ilike(like_kw)) | (User.email.ilike(like_kw)))

    rows = query.all()
    return [
        {
            "id": row.id,
            "user_id": row.user_id,
            "user_email": row.user_email,
            "name": row.name,
            "cover_image": row.cover_image,
            "created_at": row.created_at,
            "updated_at": row.updated_at,
        }
        for row in rows
    ]


@router.delete("/projects/{project_id}")
async def delete_project(
    project_id: str,
    _: User = Depends(_admin_guard),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    db.delete(project)
    db.commit()
    return {"message": "项目已删除"}


@router.get("/materials")
async def get_materials(

    search: str = Query(default=""),
    material_type: Optional[str] = Query(default=None, alias="type"),
    _: User = Depends(_admin_guard),
    db: Session = Depends(get_db),
):
    query = (
        db.query(
            Material.id,
            Material.user_id,
            User.email.label("user_email"),
            Material.type,
            Material.url,
            Material.name,
            Material.width,
            Material.height,
            Material.duration,
            Material.created_at,
        )
        .join(User, User.id == Material.user_id)
        .order_by(Material.created_at.desc())
    )

    if search:
        like_kw = f"%{search.strip()}%"
        query = query.filter((Material.name.ilike(like_kw)) | (User.email.ilike(like_kw)))

    if material_type in {"image", "video"}:
        query = query.filter(Material.type == material_type)

    rows = query.all()
    return [
        {
            "id": row.id,
            "user_id": row.user_id,
            "user_email": row.user_email,
            "type": row.type,
            "url": row.url,
            "name": row.name,
            "width": row.width,
            "height": row.height,
            "duration": row.duration,
            "created_at": row.created_at,
        }
        for row in rows
    ]


@router.delete("/materials/{material_id}")
async def delete_material(
    material_id: int,
    _: User = Depends(_admin_guard),
    db: Session = Depends(get_db),
):
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="素材不存在")

    db.delete(material)
    db.commit()
    return {"message": "素材已删除"}


@router.get("/tasks")
async def get_tasks(
    search: str = Query(default=""),
    task_type: Optional[str] = Query(default=None, alias="type"),
    task_status: Optional[str] = Query(default=None, alias="status"),
    _: User = Depends(_admin_guard),
    db: Session = Depends(get_db),
):
    query = (
        db.query(
            GenerationLog.id,
            GenerationLog.user_id,
            User.email.label("user_email"),
            GenerationLog.type,
            GenerationLog.prompt,
            GenerationLog.status,
            GenerationLog.charge_amount,
            GenerationLog.created_at,
            GenerationLog.completed_at,
            GenerationLog.duration_seconds,
            GenerationLog.image_count,
        )
        .join(User, User.id == GenerationLog.user_id)
        .order_by(GenerationLog.created_at.desc())
    )

    if search:
        like_kw = f"%{search.strip()}%"
        query = query.filter((GenerationLog.prompt.ilike(like_kw)) | (User.email.ilike(like_kw)))

    if task_type in {"image", "video"}:
        query = query.filter(GenerationLog.type == task_type)

    if task_status in {"pending", "processing", "success", "failed"}:
        query = query.filter(GenerationLog.status == task_status)

    rows = query.all()
    return [
        {
            "id": row.id,
            "user_id": row.user_id,
            "user_email": row.user_email,
            "type": row.type,
            "prompt": row.prompt,
            "status": row.status,
            "charge_amount": float(row.charge_amount or 0),
            "created_at": row.created_at,
            "completed_at": row.completed_at,
            "duration": row.duration_seconds,
            "image_count": row.image_count,
        }
        for row in rows
    ]


@router.post("/tasks/{task_id}/cancel")
async def cancel_task(
    task_id: int,
    _: User = Depends(_admin_guard),
    db: Session = Depends(get_db),
):
    task = db.query(GenerationLog).filter(GenerationLog.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")

    if task.status not in {"pending", "processing"}:
        raise HTTPException(status_code=400, detail="只能取消待处理或处理中的任务")

    task.status = "failed"
    task.completed_at = datetime.utcnow()
    db.commit()
    return {"message": "任务已取消"}


@router.get("/statistics")
async def get_statistics(
    _: User = Depends(_admin_guard),
    db: Session = Depends(get_db),
):
    total_revenue = db.query(func.coalesce(func.sum(GenerationLog.charge_amount), 0)).scalar() or 0
    total_tasks = db.query(func.count(GenerationLog.id)).scalar() or 0
    avg_task_cost = (float(total_revenue) / total_tasks) if total_tasks else 0

    week_start = datetime.utcnow() - timedelta(days=6)
    daily_rows = (
        db.query(
            func.date(GenerationLog.created_at).label("day"),
            func.coalesce(func.sum(GenerationLog.charge_amount), 0).label("amount"),
        )
        .filter(GenerationLog.created_at >= week_start)
        .group_by(func.date(GenerationLog.created_at))
        .order_by(func.date(GenerationLog.created_at))
        .all()
    )

    type_rows = (
        db.query(GenerationLog.type, func.count(GenerationLog.id).label("count"))
        .group_by(GenerationLog.type)
        .all()
    )

    rank_rows = (
        db.query(
            User.id.label("user_id"),
            User.email.label("email"),
            func.coalesce(func.sum(GenerationLog.charge_amount), 0).label("total_spent"),
            func.count(GenerationLog.id).label("total_tasks"),
            func.max(GenerationLog.created_at).label("last_consumption"),
        )
        .join(GenerationLog, GenerationLog.user_id == User.id)
        .group_by(User.id, User.email)
        .order_by(desc(func.sum(GenerationLog.charge_amount)))
        .limit(20)
        .all()
    )

    active_users = (
        db.query(func.count(func.distinct(GenerationLog.user_id)))
        .filter(GenerationLog.created_at >= datetime.utcnow() - timedelta(days=30))
        .scalar()
        or 0
    )

    return {
        "statistics": {
            "total_revenue": float(total_revenue),
            "total_tasks": total_tasks,
            "avg_task_cost": round(avg_task_cost, 2),
            "active_users": active_users,
        },
        "revenue_trend": [
            {"day": str(row.day), "amount": float(row.amount or 0)} for row in daily_rows
        ],
        "type_distribution": [
            {"name": "图片" if row.type == "image" else "视频", "value": row.count}
            for row in type_rows
        ],
        "user_consumption": [
            {
                "user_id": row.user_id,
                "email": row.email,
                "total_spent": float(row.total_spent or 0),
                "total_tasks": int(row.total_tasks or 0),
                "last_consumption": row.last_consumption,
            }
            for row in rank_rows
        ],
    }
