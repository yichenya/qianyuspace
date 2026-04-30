#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
素材管理模块路由
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.auth.router import get_current_user
from app.core.database import get_db
from app.models import Material, MaterialFavorite, User
from app.schemas.material import MaterialResponse

router = APIRouter()


class MaterialCreate(BaseModel):
    type: str = Field(..., pattern="^(image|video)$")
    url: str
    name: str
    width: Optional[int] = None
    height: Optional[int] = None
    duration: Optional[int] = None


@router.get("", response_model=List[MaterialResponse])
async def get_materials(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取用户的素材列表"""
    return db.query(Material).filter(Material.user_id == current_user.id).order_by(Material.created_at.desc()).all()


@router.post("", response_model=MaterialResponse, status_code=status.HTTP_201_CREATED)
async def create_material(
    material_data: MaterialCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """手动导入素材URL，补齐非AI生成素材入口"""
    material = Material(
        user_id=current_user.id,
        type=material_data.type,
        url=material_data.url,
        name=material_data.name,
        width=material_data.width,
        height=material_data.height,
        duration=material_data.duration,
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    return material


@router.get("/favorites", response_model=List[MaterialResponse])
async def get_favorite_materials(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取收藏的素材"""
    favorite_records = db.query(MaterialFavorite).filter(MaterialFavorite.user_id == current_user.id).all()
    material_ids = [record.material_id for record in favorite_records]
    if not material_ids:
        return []
    return db.query(Material).filter(
        Material.user_id == current_user.id,
        Material.id.in_(material_ids),
    ).order_by(Material.created_at.desc()).all()


@router.delete("/{material_id}")
async def delete_material(
    material_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """删除素材"""
    material = db.query(Material).filter(Material.id == material_id, Material.user_id == current_user.id).first()
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="素材不存在")

    db.query(MaterialFavorite).filter(MaterialFavorite.material_id == material_id).delete()
    db.delete(material)
    db.commit()
    return {"message": "素材已删除"}


@router.post("/{material_id}/favorite")
async def favorite_material(
    material_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """收藏素材"""
    material = db.query(Material).filter(Material.id == material_id, Material.user_id == current_user.id).first()
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="素材不存在")

    existing_favorite = db.query(MaterialFavorite).filter(
        MaterialFavorite.user_id == current_user.id,
        MaterialFavorite.material_id == material_id,
    ).first()
    if existing_favorite:
        return {"message": "素材已收藏"}

    db.add(MaterialFavorite(user_id=current_user.id, material_id=material_id))
    db.commit()
    return {"message": "素材已收藏"}


@router.delete("/{material_id}/favorite")
async def unfavorite_material(
    material_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """取消收藏"""
    favorite = db.query(MaterialFavorite).filter(
        MaterialFavorite.user_id == current_user.id,
        MaterialFavorite.material_id == material_id,
    ).first()
    if not favorite:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="收藏记录不存在")

    db.delete(favorite)
    db.commit()
    return {"message": "收藏已取消"}
