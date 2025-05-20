from sqlalchemy.ext.asyncio import AsyncSession
from ..models import account as models
from ..schemas import account as schemas
from fastapi import HTTPException, status
from sqlalchemy import select, and_, func, text, delete
from ..utils import crypto
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status, Depends, APIRouter, Query
from sqlalchemy import select, and_, func, text, delete
from ..utils import crypto, jwt, email, otp
from ..configs.database import get_db
from fastapi.security import OAuth2PasswordRequestForm
from pathlib import Path
from ..configs.redis import redis_client
from ..utils.redis_lock import DistributedLock
from ..utils.logger import logger
from datetime import datetime
import uuid
from ..services.account import create_account


async def register(account: schemas.AccountCreate, db: AsyncSession):
    try:
        # Check if username already exists
        stmt = select(models.Account).where(models.Account.username == account.username)
        result = await db.execute(stmt)
        db_account = result.scalars().first()

        if db_account:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered",
            )

        # Check if email already exists
        stmt = select(models.Account).where(models.Account.email == account.email)
        result = await db.execute(stmt)
        db_account = result.scalars().first()

        if db_account:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        # Generate OTP and store it directly in Redis
        otp_code = otp.create_otp()
        await redis_client.setex(account.email, 600, otp_code)

        # Generate acc_id automatically using uuid
        acc_id = str(uuid.uuid4())

        # Store account data temporarily in Redis
        temp_account_data = {
            "acc_id": acc_id,
            "username": account.username,
            "email": account.email,
            "password": crypto.hash_password(account.password),
            "role": account.role.value,  # This will be User by default unless Admin is explicitly set
        }

        # Store account data for 10 minutes
        await redis_client.setex(
            f"pending_registration:{account.email}", 600, str(temp_account_data)
        )

        # Send verification email
        subject = "Email Verification"
        recipient = [account.email]

        template_path = (
            Path(__file__).parent.parent / "templates" / "otp_email_registration.html"
        )
        with open(template_path, "r") as file:
            html_template = file.read()

        message = html_template.format(username=account.username, otp_code=otp_code)
        await email.send_mail(subject, recipient, message)

        await logger.info("Registration OTP sent", {"email": account.email})
        return {"message": "Please check your email for verification code"}

    except Exception as e:
        await logger.error("Registration failed", {"error": str(e)})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}",
        )


async def verify_registration(email: str, otp_code: str, db: AsyncSession):
    try:
        # Get pending registration data
        temp_data = await redis_client.get(f"pending_registration:{email}")
        if not temp_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration request expired or not found",
            )

        # Verify OTP
        redis_otp = await redis_client.get(email)
        if redis_otp is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP expired or not found",
            )

        if redis_otp != otp_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP code",
            )

        # Convert string back to dict
        import ast
        account_data = ast.literal_eval(temp_data)

        # Create verified account using account service
        new_account = await create_account(
            db, 
            schemas.AccountCreate(
                username=account_data["username"],
                password=account_data["password"],  # Already hashed
                email=account_data["email"],
                role=account_data["role"]  # Use the role from stored data
            )
        )

        # Delete temporary data and OTP
        await redis_client.delete(f"pending_registration:{email}")
        await redis_client.delete(email)

        await logger.info("Account registration verified", {"email": email})
        return {"message": "Registration completed successfully"}

    except Exception as e:
        await logger.error("Registration verification failed", {"error": str(e)})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Verification failed: {str(e)}",
        )


async def login(form_data: OAuth2PasswordRequestForm, db: AsyncSession):
    try:
        # Check if input is email or username
        is_email = "@" in form_data.username

        if is_email:
            stmt = select(models.Account).where(
                models.Account.email == form_data.username
            )
        else:
            stmt = select(models.Account).where(
                models.Account.username == form_data.username
            )

        result = await db.execute(stmt)
        account = result.scalars().first()

        if not account:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username/email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not crypto.verify_password(form_data.password, account.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username/email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if account.status == models.StatusEnum.Inactive:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account is inactive",
            )

        access_token_expires = jwt.timedelta(minutes=jwt.ACCESS_TOKEN_EXPIRE_MINUTES)
        refresh_token_expires = jwt.timedelta(days=jwt.REFRESH_TOKEN_EXPIRE_DAYS)

        access_token = await jwt.create_access_token(
            data={"sub": account.acc_id}, expires_delta=access_token_expires
        )
        refresh_token = await jwt.create_refresh_token(data={"sub": account.acc_id})

        await logger.info("Account logged in", {"username": form_data.username})

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }
    except Exception as e:
        await logger.error("Login failed", error=str(e))
        raise


async def logout_me(
    current_account: models.Account, authorization: str, db: AsyncSession
):
    try:
        # Debug logging
        await logger.info(
            "Attempting logout",
            {"auth": authorization, "acc_id": current_account.acc_id},
        )

        if not authorization:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authorization header",
            )

        parts = authorization.split()
        if len(parts) == 1:
            # Assume the header is the token itself
            token = parts[0].strip()
        elif len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1].strip()
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token format. Use: Bearer <token>",
            )

        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Token is missing"
            )

        # Add token to blacklist with its remaining TTL
        try:
            payload = jwt.decode_token(token)
            exp = payload.get("exp")
            if exp:
                ttl = exp - datetime.utcnow().timestamp()
                if ttl > 0:
                    await redis_client.setex(f"blacklist_token:{token}", int(ttl), "1")
        except Exception as e:
            await logger.error(
                "Error processing token for blacklist", {"error": str(e)}
            )

        await logger.info(
            "Account logged out successfully", {"acc_id": current_account.acc_id}
        )
        return {"detail": "Logged out successfully"}
    except Exception as e:
        await logger.error("Error during logout", {"error": str(e)})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during logout: {str(e)}",
        )


async def forgot_password(
    request: schemas.ForgotPassword = Query(...), db: AsyncSession = Depends(get_db)
):
    async with DistributedLock(f"forgot_password:{request.email}"):
        stmt = select(models.Account).where(models.Account.email == request.email)
        result = await db.execute(stmt)
        account_info = (
            result.scalars().first()
        )  # Changed from result.first() to scalars().first()
        if not account_info:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Email Not Found"
            )

        username = account_info.username
        email_account = account_info.email
        reset_code = otp.create_otp()
        await redis_client.setex(email_account, 600, reset_code)
        subject = "Reset code"
        recipient = [email_account]

        template_path = (
            Path(__file__).parent.parent
            / "templates"
            / "otp_email_forgot_password.html"
        )
        with open(template_path, "r") as file:
            html_template = file.read()

        message = html_template.format(username=username, reset_code=reset_code)

        await email.send_mail(subject, recipient, message)

        return {"message": "Password reset email sent"}


async def reset_password(db: AsyncSession, new_password: str, email: str):
    stmt = select(models.Account).where(models.Account.email == email)
    result = await db.execute(stmt)
    account = result.scalars().first()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Account Not Found"
        )

    account.password = crypto.hash_password(new_password)
    db.add(account)
    await db.commit()
    return account.password


async def reset_passwords(
    request: schemas.ResetPassword = Query(...), db: AsyncSession = Depends(get_db)
):
    async with DistributedLock(f"reset_password:{request.email}"):
        try:
            # Check if email exists in database
            stmt = select(models.Account).where(models.Account.email == request.email)
            result = await db.execute(stmt)
            account_info = result.scalars().first()

            if not account_info:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Email not found in system",
                )

            # Verify if email matches OTP request
            redis_otp = await redis_client.get(request.email)
            if redis_otp is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No password reset was requested for this email",
                )

            if redis_otp != request.otp_code:
                raise HTTPException(status_code=400, detail="Invalid OTP code")

            await redis_client.delete(request.email)

            if request.new_password != request.confirm_password:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="New password and confirm password do not match",
                )

            await reset_password(db, request.new_password, request.email)
            await logger.info("Password reset successful", {"email": request.email})
            return {"message": "Password reset successfully"}
        except Exception as e:
            await logger.error("Password reset failed", error=e)
            raise


async def request_change_password(
    request: schemas.RequestChangePassword,
    current_user: models.Account,
    db: AsyncSession = Depends(get_db),
):
    async with DistributedLock(f"change_password_request:{current_user.email}"):
        # Verify old password
        if not crypto.verify_password(request.old_password, current_user.password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect",
            )

        # Validate new password and confirm password
        if request.new_password != request.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password and confirm password do not match",
            )

        # Store the new password temporarily in Redis
        await redis_client.setex(
            f"temp_new_password:{current_user.email}",
            600,
            crypto.hash_password(request.new_password),
        )

        # Generate and store OTP
        otp_code = otp.create_otp()
        await redis_client.setex(current_user.email, 600, otp_code)  # 10 minutes expiry

        # Send email with OTP
        subject = "Password Change Confirmation"
        recipient = [current_user.email]

        template_path = (
            Path(__file__).parent.parent
            / "templates"
            / "otp_email_change_password.html"
        )
        with open(template_path, "r") as file:
            html_template = file.read()

        message = html_template.format(
            username=current_user.username, otp_code=otp_code
        )

        await email.send_mail(subject, recipient, message)
        await logger.info("Change password OTP sent", {"email": current_user.email})

        return {"message": "Please check your email for the OTP code"}


async def change_password(
    request: schemas.ChangePassword,
    current_user: models.Account,
    db: AsyncSession = Depends(get_db),
):
    async with DistributedLock(f"change_password:{current_user.email}"):
        # Verify OTP
        redis_otp = await redis_client.get(current_user.email)
        if redis_otp is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No OTP request found or OTP expired",
            )
        if redis_otp != request.otp_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP code",
            )

        # Get the stored new password
        new_password_hash = await redis_client.get(
            f"temp_new_password:{current_user.email}"
        )
        if new_password_hash is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password change request expired",
            )

        # Update password and commit changes
        current_user.password = new_password_hash
        db.add(current_user)
        await db.commit()

        # Clean up Redis
        await redis_client.delete(current_user.email)
        await redis_client.delete(f"temp_new_password:{current_user.email}")

        await logger.info("Password change successful", {"email": current_user.email})
        return {"message": "Password changed successfully"}
