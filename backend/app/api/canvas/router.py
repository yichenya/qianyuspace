#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
画布管理模块路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import User, Project, CanvasState
from app.schemas.canvas import CanvasStateUpdate, CanvasStateResponse
from app.api.auth.router import get_current_user

# 创建路由器
router = APIRouter()


@router.get("/{project_id}/canvas", response_model=CanvasStateResponse)
async def get_canvas_state(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取画布状态"""
    # 检查项目是否存在且属于当前用户
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="项目不存在"
        )
    
    # 获取画布状态
    canvas_state = db.query(CanvasState).filter(CanvasState.project_id == project_id).first()
    if not canvas_state:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="画布状态不存在"
        )
    
    return canvas_state


@router.put("/{project_id}/canvas", response_model=CanvasStateResponse)
async def update_canvas_state(
    project_id: int,
    canvas_data: CanvasStateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """保存画布状态"""
    # 检查项目是否存在且属于当前用户
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="项目不存在"
        )
    
    # 获取或创建画布状态
    canvas_state = db.query(CanvasState).filter(CanvasState.project_id == project_id).first()
    if not canvas_state:
        canvas_state = CanvasState(
            project_id=project_id,
            state_data=canvas_data.state_data
        )
        db.add(canvas_state)
    else:
        canvas_state.state_data = canvas_data.state_data
    
    db.commit()
    db.refresh(canvas_state)
    
    return canvas_state
