from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..models.account import Account
from ..schemas.account import AccountCreate, AccountUpdate
from typing import List, Optional
import uuid
from fastapi import HTTPException, status
from ..utils.crypto import hash_password


async def create_account(db: AsyncSession, account: AccountCreate) -> Account:
    db_account = Account(
        acc_id=str(uuid.uuid4()),
        username=account.username,
        password=account.password,  # Hash the password
        email=account.email,
        role=account.role,
    )
    try:
        db.add(db_account)
        await db.commit()
        await db.refresh(db_account)
        return db_account
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Username or email already exists")


async def get_account(db: AsyncSession, acc_id: str) -> Optional[Account]:
    result = await db.execute(select(Account).filter(Account.acc_id == acc_id))
    return result.scalar_one_or_none()


async def get_all_accounts(
    db: AsyncSession, skip: int = 0, limit: int = 100
) -> List[Account]:
    result = await db.execute(select(Account).offset(skip).limit(limit))
    return result.scalars().all()


async def update_account(
    db: AsyncSession, acc_id: str, account: AccountUpdate
) -> Optional[Account]:
    db_account = await get_account(db, acc_id)
    if not db_account:
        return None

    update_data = account.dict(exclude_unset=True)
    if 'password' in update_data:
        update_data['password'] = hash_password(update_data['password'])

    for field, value in update_data.items():
        setattr(db_account, field, value)

    try:
        await db.commit()
        await db.refresh(db_account)
        return db_account
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Update failed")


async def delete_account(db: AsyncSession, acc_id: str) -> bool:
    db_account = await get_account(db, acc_id)
    if db_account:
        try:
            await db.delete(db_account)
            await db.commit()
            return True
        except Exception as e:
            await db.rollback()
            raise HTTPException(status_code=400, detail="Delete failed")
    return False
