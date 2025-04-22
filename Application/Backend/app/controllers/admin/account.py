from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from ...configs.database import get_db
from ...services import account as account_service
from ...utils.jwt import get_admin
from ...schemas.account import AccountCreate, AccountUpdate, AccountResponse

router = APIRouter(prefix="/admin/accounts", tags=["admin-accounts"])


@router.get("/{acc_id}", response_model=AccountResponse)
async def get_account(acc_id: str, db: AsyncSession = Depends(get_db)):
    account = await account_service.get_account(db, acc_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.get("/", response_model=List[AccountResponse])
async def get_all_accounts(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_admin),
):
    return await account_service.get_all_accounts(db, skip, limit)


@router.put("/{acc_id}", response_model=AccountResponse)
async def update_account(
    acc_id: str,
    account: AccountUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_admin),
):
    updated_account = await account_service.update_account(db, acc_id, account)
    if not updated_account:
        raise HTTPException(status_code=404, detail="Account not found")
    return updated_account


@router.delete("/{acc_id}")
async def delete_account(
    acc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_admin),
):
    if not await account_service.delete_account(db, acc_id):
        raise HTTPException(status_code=404, detail="Account not found")
    return {"message": "Account deleted successfully"}
