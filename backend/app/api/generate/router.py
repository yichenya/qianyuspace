#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI生成模块路由
"""
from datetime import date, datetime
from decimal import Decimal
from typing import Any, Dict, List
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.auth.router import get_current_user
from app.core.database import get_db
from app.models import GenerationLog, Material, UsageQuota, User
from app.schemas.generate import GenerateImageRequest, GenerateVideoRequest, TaskResponse, TaskStatusResponse

router = APIRouter()


def reset_or_create_usage_quota(db: Session, user_id: str) -> UsageQuota:
    """获取或创建额度，并按日重置"""
    usage_quota = db.query(UsageQuota).filter(UsageQuota.user_id == user_id).first()
    if not usage_quota:
        usage_quota = UsageQuota(
            user_id=user_id,
            daily_quota=100,
            used_today=0,
            last_reset=date.today(),
        )
        db.add(usage_quota)
        db.flush()
    elif usage_quota.last_reset < date.today():
        usage_quota.used_today = 0
        usage_quota.last_reset = date.today()
    return usage_quota


def create_generation_task(
    db: Session,
    user_id: str,
    task_type: str,
    prompt: str,
    params: Dict[str, Any],
) -> GenerationLog:
    """创建生成任务并计算成本"""
    safe_params = dict(params or {})

    if task_type == "image":
        unit_cost = Decimal("0.02")
        unit_charge = Decimal("0.03")
        image_count = max(1, min(int(safe_params.get("count", 1)), 4))
        total_cost = unit_cost * image_count
        charge_amount = unit_charge * image_count
        consumed_units = image_count
        safe_params["count"] = image_count
    elif task_type == "video":
        unit_cost = Decimal("0.50")
        unit_charge = Decimal("0.70")
        duration = max(1, min(int(safe_params.get("duration", 5)), 30))
        total_cost = unit_cost * duration
        charge_amount = unit_charge * duration
        consumed_units = duration
        safe_params["duration"] = duration
    else:
        raise ValueError("无效的任务类型")

    usage_quota = reset_or_create_usage_quota(db, user_id)
    if usage_quota.used_today + consumed_units > usage_quota.daily_quota:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="今日生成额度不足")

    safe_params["consumed_units"] = consumed_units
    generation_log = GenerationLog(
        user_id=user_id,
        type=task_type,
        prompt=prompt,
        params=safe_params,
        duration_seconds=safe_params.get("duration") if task_type == "video" else None,
        image_count=safe_params.get("count") if task_type == "image" else None,
        unit_cost=unit_cost,
        total_cost=total_cost,
        charge_amount=charge_amount,
        profit=charge_amount - total_cost,
        status="pending",
    )
    db.add(generation_log)
    db.flush()
    return generation_log


def simulate_ai_generation(task_id: int, task_type: str, prompt: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """模拟AI生成过程；接入真实模型/OSS前保证产品链路可运行"""
    encoded_prompt = prompt.strip() or "qianyu-space"
    if task_type == "image":
        image_count = int(params.get("count", 1))
        return {
            "images": [
                {
                    "url": f"https://placehold.co/1024x1024/1d1d1f/ffffff/png?text={task_id}-{index}",
                    "width": 1024,
                    "height": 1024,
                    "prompt": encoded_prompt,
                }
                for index in range(1, image_count + 1)
            ]
        }

    duration = int(params.get("duration", 5))
    return {
        "video": {
            "url": f"https://example.com/qianyu/generated/{uuid.uuid4()}.mp4",
            "duration": duration,
            "prompt": encoded_prompt,
        }
    }


def persist_generated_materials(
    db: Session,
    current_user: User,
    generation_log: GenerationLog,
    result: Dict[str, Any],
) -> List[Material]:
    """将生成结果写入素材库"""
    created_materials: List[Material] = []

    for index, image in enumerate(result.get("images", []), start=1):
        material = Material(
            user_id=current_user.id,
            type="image",
            url=image["url"],
            name=f"生成图片_T{generation_log.id}_{index}",
            width=image.get("width"),
            height=image.get("height"),
        )
        db.add(material)
        created_materials.append(material)

    video = result.get("video")
    if video:
        material = Material(
            user_id=current_user.id,
            type="video",
            url=video["url"],
            name=f"生成视频_T{generation_log.id}_1",
            duration=video.get("duration"),
        )
        db.add(material)
        created_materials.append(material)

    db.flush()
    return created_materials


def deduct_usage(db: Session, user_id: str, consumed_units: int) -> None:
    """扣减今日额度"""
    usage_quota = reset_or_create_usage_quota(db, user_id)
    usage_quota.used_today = int(usage_quota.used_today or 0) + max(consumed_units, 0)


def serialize_material(material: Material) -> Dict[str, Any]:
    return {
        "id": material.id,
        "type": material.type,
        "url": material.url,
        "name": material.name,
        "width": material.width,
        "height": material.height,
        "duration": material.duration,
        "created_at": material.created_at.isoformat() if material.created_at else None,
    }


def finish_generation(
    db: Session,
    current_user: User,
    generation_log: GenerationLog,
    result: Dict[str, Any],
) -> None:
    generation_log.status = "success"
    generation_log.completed_at = datetime.utcnow()
    persist_generated_materials(db, current_user, generation_log, result)
    deduct_usage(db, current_user.id, int((generation_log.params or {}).get("consumed_units", 1)))
    db.commit()
    db.refresh(generation_log)


@router.post("/image", response_model=TaskResponse)
async def generate_image(
    request: GenerateImageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """生成图片"""
    generation_log = create_generation_task(db, current_user.id, "image", request.prompt, request.params or {})
    result = simulate_ai_generation(generation_log.id, "image", request.prompt, generation_log.params or {})
    finish_generation(db, current_user, generation_log, result)
    return TaskResponse(task_id=generation_log.id, status=generation_log.status)


@router.post("/video", response_model=TaskResponse)
async def generate_video(
    request: GenerateVideoRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """生成视频"""
    generation_log = create_generation_task(db, current_user.id, "video", request.prompt, request.params or {})
    result = simulate_ai_generation(generation_log.id, "video", request.prompt, generation_log.params or {})
    finish_generation(db, current_user, generation_log, result)
    return TaskResponse(task_id=generation_log.id, status=generation_log.status)


@router.get("/tasks/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取任务状态"""
    task = db.query(GenerationLog).filter(
        GenerationLog.id == task_id,
        GenerationLog.user_id == current_user.id,
    ).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="任务不存在")

    response = TaskStatusResponse(id=task.id, status=task.status, result=None)
    if task.status == "success":
        name_prefix = f"生成{'图片' if task.type == 'image' else '视频'}_T{task.id}_"
        generated_materials = db.query(Material).filter(
            Material.user_id == current_user.id,
            Material.name.like(f"{name_prefix}%"),
        ).order_by(Material.created_at.asc()).all()

        response.result = {
            "message": "生成成功",
            "task_type": task.type,
            "charge_amount": float(task.charge_amount or 0),
            "materials": [serialize_material(material) for material in generated_materials],
        }
    return response


@router.delete("/tasks/{task_id}")
async def cancel_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """取消任务"""
    task = db.query(GenerationLog).filter(
        GenerationLog.id == task_id,
        GenerationLog.user_id == current_user.id,
    ).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="任务不存在")

    if task.status not in ["pending", "processing"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="只能取消待处理或处理中的任务")

    task.status = "failed"
    task.completed_at = datetime.utcnow()
    db.commit()
    return {"message": "任务已取消"}
