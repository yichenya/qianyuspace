#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
项目管理模块路由
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import User, Project, CanvasState
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, CanvasStateResponse, CanvasStateUpdate
from app.api.auth.router import get_current_user

# 创建路由器
router = APIRouter()


@router.get("", response_model=List[ProjectResponse])
async def get_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户的项目列表"""
    projects = db.query(Project).filter(Project.user_id == current_user.id).order_by(Project.created_at.desc()).all()
    return projects


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建新项目"""
    # 创建项目
    new_project = Project(
        user_id=current_user.id,
        name=project_data.name
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    # 为项目创建默认的画布状态
    canvas_state = CanvasState(
        project_id=new_project.id,
        state_json={"elements": [], "scale": 1, "position": {"x": 0, "y": 0}}
    )
    db.add(canvas_state)
    db.commit()

    return new_project


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取项目详情"""
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="项目不存在"
        )
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新项目"""
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="项目不存在"
        )

    # 更新项目信息
    if project_data.name is not None:
        project.name = project_data.name
    if project_data.cover_image is not None:
        project.cover_image = project_data.cover_image

    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除项目"""
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="项目不存在"
        )

    db.delete(project)
    db.commit()

    return {"message": "项目已删除"}


@router.get("/{project_id}/canvas", response_model=CanvasStateResponse)
async def get_canvas_state(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取画布状态"""
    # 验证项目所有权
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="项目不存在"
        )

    # 获取画布状态
    canvas_state = db.query(CanvasState).filter(CanvasState.project_id == project_id).first()
    if not canvas_state:
        # 如果不存在，创建默认状态
        canvas_state = CanvasState(
            project_id=project_id,
            state_json={"elements": [], "scale": 1, "position": {"x": 0, "y": 0}}
        )
        db.add(canvas_state)
        db.commit()
        db.refresh(canvas_state)

    return CanvasStateResponse(
        project_id=project_id,
        elements=canvas_state.state_json.get("elements", []),
        scale=canvas_state.state_json.get("scale", 1),
        position=canvas_state.state_json.get("position", {"x": 0, "y": 0})
    )


@router.put("/{project_id}/canvas", response_model=CanvasStateResponse)
async def update_canvas_state(
    project_id: str,
    canvas_data: CanvasStateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新画布状态"""
    # 验证项目所有权
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="项目不存在"
        )

    # 获取或创建画布状态
    canvas_state = db.query(CanvasState).filter(CanvasState.project_id == project_id).first()
    if not canvas_state:
        canvas_state = CanvasState(project_id=project_id)
        db.add(canvas_state)

    # 更新画布数据
    canvas_state.state_json = {
        "elements": [elem.model_dump() for elem in canvas_data.elements],
        "scale": canvas_data.scale,
        "position": canvas_data.position
    }

    db.commit()
    db.refresh(canvas_state)

    return CanvasStateResponse(
        project_id=project_id,
        elements=canvas_data.elements,
        scale=canvas_data.scale,
        position=canvas_data.position
    )