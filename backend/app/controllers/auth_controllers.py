from app.schemas.auth_schemas import UserCreateSchema, UserLoginSchema, ChangePassword
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, Response
from sqlalchemy import select
from app.models.user import User
from app.utils.hash_services import hash_password_func, verify_password
from app.utils.token_services import generate_access_token, generate_refresh_token, verify_token
from jose.exceptions import JWTError, ExpiredSignatureError


class AuthController():
    
    @staticmethod
    async def signup_func(data: UserCreateSchema, db: AsyncSession, res: Response):
        try:
            statement = select(User).where((User.email==data.email) | (User.username==data.username))
            
            result = await db.execute(statement)
                        
            user = result.scalar_one_or_none()
                        
            if user:
                raise HTTPException(status_code=400, detail='Email or username already exist!')
                        
            hashed_password = hash_password_func(data.password)
            
            new_user = User(email=data.email, username=data.username, firstname=data.firstname, lastname=data.lastname, password=hashed_password)
                        
            db.add(new_user)
            
            await db.commit()
            
            await db.refresh(new_user)
            
            access_token = generate_access_token({'id': new_user.id})
            
            refresh_token = generate_refresh_token({'id': new_user.id})
            
            res.set_cookie(
                key='refreshToken', 
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite='none',
                max_age=60*60*24*7
            )
            return {'access_token': access_token, 'user': new_user}
                                
        except SQLAlchemyError as e:
            await db.rollback()
            raise HTTPException(status_code=500, detail='Database error!')
        
        except Exception as e:
            await db.rollback()
            print(f"LOGIN ERROR: {type(e).__name__}: {str(e)}", flush=True)
            import traceback
            traceback.print_exc()
            error_dict = e.__dict__
            
            raise HTTPException(
                status_code=error_dict.get('status_code', 500),
                detail=error_dict.get('detail', str(e))
            )   
    
    
    @staticmethod
    async def login_func(data: UserLoginSchema, db: AsyncSession, res: Response):
        try:
            statement1 = select(User).where(User.email==data.email)
            
            result = await db.execute(statement1)
            
            exisiting_user = result.scalar_one_or_none()
            
            if not exisiting_user:
                raise HTTPException(status_code=404, detail='Username or password incorrect!')
            
            is_match = verify_password(data.password, exisiting_user.password)
            
            if not is_match:
                raise HTTPException(status_code=400, detail='Username or password incorrect!')
            
            access_token = generate_access_token({'id': exisiting_user.id})
            
            refresh_token = generate_refresh_token({'id': exisiting_user.id})
            
            res.set_cookie(
                key='refreshToken', 
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite='none',
                max_age=60*60*24*7
            )
            return {'access_token': access_token, 'user': exisiting_user}
                
        except SQLAlchemyError as e:
            await db.rollback()
            raise HTTPException(status_code=500, detail=f'Database error: {str(e)}')
        
        except Exception as e:
            await db.rollback()
            print(f"LOGIN ERROR: {type(e).__name__}: {str(e)}", flush=True)
            import traceback
            traceback.print_exc()
            error_dict = e.__dict__
            
            raise HTTPException(
                status_code=error_dict.get('status_code', 500),
                detail=error_dict.get('detail', str(e))
            )   
        
        
    @staticmethod
    async def refresh_access_token_func(refresh: str):
        try:
            if refresh is None:
                raise HTTPException(status_code=401, detail='You are not authorized to perform this task')
            
            payload = verify_token(refresh, 'refresh')
                        
            if payload.get('type') == 'access':
                raise HTTPException(status_code=403, detail='Invalid token type!')
            
            new_access_token = generate_access_token({'id': payload.get('id')})
                        
            return new_access_token
           
        except ExpiredSignatureError:
            raise HTTPException(status_code=401, detail='Token has expired')
        
        except JWTError:
            raise HTTPException(status_code=403, detail='Invalid token')             
        
        except Exception as e:
            error_dict = e.__dict__
            raise HTTPException(
                status_code=error_dict.get('status_code', 500),
                detail=error_dict.get('detail', 'Internal server error!')
            )

    
    @staticmethod
    async def logout_user_func(res: Response):
        res.set_cookie(
            key="refreshToken",
            value="",
            httponly=True,
            secure=True,
            samesite="none",
            max_age=0,
            expires=0,
        )
        return {"message": "Logged out successfully"}
        
        
    @staticmethod 
    async def authenticated_user_func(auth_id: str, db: AsyncSession):
        try:
            statement = select(User.email, User.id, User.firstname, User.lastname, User.username, User.profile_pic, User.role).where(User.id==auth_id)
            
            result = await db.execute(statement)
            
            row = result.first()
        
            if row:
                email, user_id, firstname, lastname, username, profile_pic, role = row  
                
                return {
                    "email": email, 
                    "id": user_id, 
                    "firstname": firstname, 
                    "lastname": lastname, 
                    "username": username, 
                    "profile_pic": profile_pic,
                    "role": role
                }
            
            raise HTTPException(status_code=404, detail='User not found!')
            
        except SQLAlchemyError:
            await db.rollback()
            
        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__
            
            raise HTTPException(
                status_code=error_dict.get('status_code', 500),
                detail=error_dict.get('detail', 'Internal server error!')
            )
        
        
    @staticmethod 
    async def reset_password(data: ChangePassword, auth_id: str, db: AsyncSession):
        try:
            user = await db.get(User, auth_id)
            
            if not user:
                raise HTTPException(status_code=404, detail='User not found!')
            
            is_match = verify_password(data.password, user.password)
            
            if not is_match:
                raise HTTPException(status_code=403, detail='Password is incorrect!')
            
            new_hashed_password = hash_password_func(data.new_password)
            
            user.password = new_hashed_password
            
            db.add(user)
            
            await db.commit()
            await db.refresh(user)
            
            return True
            
        except SQLAlchemyError:
            await db.rollback()
            
        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__
            
            raise HTTPException(
                status_code=error_dict.get('status_code', 500),
                detail=error_dict.get('detail', 'Internal server error!')
            )
            
    @staticmethod
    async def get_all_users_func(db: AsyncSession):
        try:
            statement = select(
                User.id,
                User.firstname,
                User.lastname,
                User.email,
                User.username,
                User.profile_pic,
                User.role
            ).order_by(User.created_at.desc() if hasattr(User, "created_at") else User.email.asc())

            result = await db.execute(statement)
            rows = result.all()

            users = []
            for row in rows:
                user_id, firstname, lastname, email, username, profile_pic, role = row

                users.append({
                    "id": user_id,
                    "firstname": firstname,
                    "lastname": lastname,
                    "email": email,
                    "username": username,
                    "profile_pic": profile_pic,
                    "role": role
                })

            return users

        except SQLAlchemyError:
            await db.rollback()
            raise HTTPException(status_code=500, detail="Database error!")

        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__
            raise HTTPException(
                status_code=error_dict.get("status_code", 500),
                detail=error_dict.get("detail", "Internal server error!")
            )