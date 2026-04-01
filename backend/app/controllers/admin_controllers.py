from app.schemas.admin_schemas import AdminDashboardChilDistribution, AdminStatsInfo, AdminDashBoardUserMini, AdminDashboardVaccinationCompletion
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, Response

from app.models.user import User
from sqlalchemy import text
from app.models.child import Child
from app.models.vaccination import VaccinationRecord
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from sqlalchemy import select
import psutil



class AdminDashboardController:
    
    @staticmethod
    async def get_dashboard_stats(db: AsyncSession):
       
        try:
            
            
            user_count_query = select(func.count(User.id))
            user_count_result = await db.execute(user_count_query)
            user_count = user_count_result.scalar() or 0
            
            children_count_query = select(func.count(Child.id))
            children_count_result = await db.execute(children_count_query)
            children_count = children_count_result.scalar() or 0
            
            vaccination_given_query = select(func.count(VaccinationRecord.id))
            vaccination_given_result = await db.execute(vaccination_given_query)
            vaccination_given = vaccination_given_result.scalar() or 0
            
            one_month_ago = datetime.now() - timedelta(days=30)
            
            new_users_query = select(func.count(User.id)).where(
                User.account_created_at >= one_month_ago
            )

            new_users_result = await db.execute(new_users_query)

            new_users_count = new_users_result.scalar() or 0
            
            return {
                "user_count": user_count,
                "children_count": children_count,
                "vaccination_given": vaccination_given,
                "new_users_count": new_users_count
            }
            
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=500,
                detail="Database error occurred while fetching dashboard statistics"
            )
            
        except Exception as e:
            error_dict = e.__dict__
            raise HTTPException(
                status_code=error_dict.get('status_code', 500),
                detail=error_dict.get('detail', 'Internal server error occurred')
            )
        
    @staticmethod
    async def get_dashboard_users_mini(db: AsyncSession):
        try:
            result = await db.execute(
                select(User)
                .order_by(User.account_created_at.desc())
                .limit(8)
            )
            users = result.scalars().all()
            
            print("dasd")
            dashboard_users_mini = [
                AdminDashBoardUserMini(
                    id=user.id, 
                    fullname=f"{user.firstname} {user.lastname}",
                    email=user.email,  
                    no_of_children=user.number_of_children or 0,
                    account_created_at=user.account_created_at
                )
                for user in users
            ]
            
            return dashboard_users_mini
            
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=500,
                detail="Database error occurred while fetching mini user information"
            )
            
        except Exception as e:
            error_dict = e.__dict__
            raise HTTPException(
                status_code=error_dict.get('status_code', 500),
                detail=error_dict.get('detail', 'Internal server error occurred')
            )
    
    @staticmethod
    async def get_dashboard_child_distribution(db: AsyncSession):
        """
        Get child age distribution data for dashboard using SQL for better performance
        """
        try:
            from sqlalchemy import text
            
            # Use raw SQL for complex age calculation - fixed ORDER BY
            query = text("""
                WITH age_calculation AS (
                    SELECT 
                        id,
                        EXTRACT(YEAR FROM age(NOW(), date_of_birth)) * 12 + 
                        EXTRACT(MONTH FROM age(NOW(), date_of_birth)) AS age_months
                    FROM children
                    WHERE date_of_birth IS NOT NULL
                ),
                age_groups AS (
                    SELECT 
                        CASE
                            WHEN age_months <= 6 THEN '0-6'
                            WHEN age_months <= 12 THEN '6-12'
                            WHEN age_months <= 24 THEN '12-24'
                            WHEN age_months <= 36 THEN '24-36'
                            WHEN age_months <= 60 THEN '36-60'
                        END AS age_range,
                        COUNT(*) as count
                    FROM age_calculation
                    WHERE age_months >= 0 AND age_months <= 60
                    GROUP BY age_range
                )
                SELECT 
                    age_range,
                    count
                FROM age_groups
                ORDER BY 
                    CASE age_range
                        WHEN '0-6' THEN 1
                        WHEN '6-12' THEN 2
                        WHEN '12-24' THEN 3
                        WHEN '24-36' THEN 4
                        WHEN '36-60' THEN 5
                        ELSE 6
                    END
            """)
            
            result = await db.execute(query)
            rows = result.fetchall()
            
            # Create a dictionary from results
            count_map = {row[0]: row[1] for row in rows}
            
            # Map to schema with default 0 for missing ranges
            distribution_data = [
                AdminDashboardChilDistribution(
                    start_month=0, 
                    end_montj=6, 
                    child_count=count_map.get('0-6', 0)
                ),
                AdminDashboardChilDistribution(
                    start_month=6, 
                    end_montj=12, 
                    child_count=count_map.get('6-12', 0)
                ),
                AdminDashboardChilDistribution(
                    start_month=12, 
                    end_montj=24, 
                    child_count=count_map.get('12-24', 0)
                ),
                AdminDashboardChilDistribution(
                    start_month=24, 
                    end_montj=36, 
                    child_count=count_map.get('24-36', 0)
                ),
                AdminDashboardChilDistribution(
                    start_month=36, 
                    end_montj=60, 
                    child_count=count_map.get('36-60', 0)
                )
            ]
            
            return distribution_data
            
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=500,
                detail="Database error occurred while fetching child distribution data"
            )
            
        except Exception as e:
            error_dict = e.__dict__
            raise HTTPException(
                status_code=error_dict.get('status_code', 500),
                detail=error_dict.get('detail', 'Internal server error occurred')
            )
    

    @staticmethod
    async def get_system_status(db: AsyncSession):
        try:
            db_size_result = await db.execute(
                text("""
                    SELECT pg_database_size(current_database()) / (1024 * 1024 * 1024.0) as size_gb
                """)
            )
            print("Fisrt")
            db_size = db_size_result.scalar() or 0
            
            # Get active users count (users who have been active in last 24 hours)
            # You may need to adjust this based on your user activity tracking
            
            
            # Alternative: If you don't have last_login, just get total users
            # active_users_result = await db.execute(select(func.count(User.id)))
            # active_users = active_users_result.scalar() or 0
            
            # Get server status (CPU and memory usage)
            cpu_percent = psutil.cpu_percent(interval=1)
            memory_percent = psutil.virtual_memory().percent
            
            # Determine server health status
            if cpu_percent < 70 and memory_percent < 80:
                server_status = "Healthy"
            elif cpu_percent < 85 and memory_percent < 90:
                server_status = "Warning"
            else:
                server_status = "Critical"
            
            # API Response time - you might want to measure actual API response
            # For now, we'll use a simulated value or get from monitoring system
            # In production, you might want to use APM tools or middleware to track this
            api_response = "124ms"  # You can replace with actual monitoring data
            
            # Create response matching the image
            system_status = {
                "server_status": {
                    "label": "Server Status",
                    "value": server_status,
                    "status": "success" if server_status == "Healthy" else "warning" if server_status == "Warning" else "error"
                },
                "api_response": {
                    "label": "API Response",
                    "value": api_response,
                    "unit": "ms"
                },
                "database_size": {
                    "label": "Database Size",
                    "value": round(db_size, 1),
                    "unit": "GB"
                }
            }
            
            return system_status
            
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=500,
                detail="Database error occurred while fetching system status"
            )
        except Exception as e:
            error_dict = e.__dict__
            raise HTTPException(
                status_code=error_dict.get('status_code', 500),
                detail=error_dict.get('detail', 'Internal server error occurred')
            )
    # @staticmethod
    # async def get_dashboard_vaccination_completion(db: AsyncSession):
    #     """
    #     Get vaccination completion statistics for dashboard
    #     """
    #     try:
    #         # Business logic to be implemented
    #         # This should return data matching AdminDashboardVaccinationCompletion schema
    #         pass
            
    #     except SQLAlchemyError as e:
    #         logger.error(f"Database error in get_dashboard_vaccination_completion: {str(e)}")
    #         raise HTTPException(
    #             status_code=500,
    #             detail="Database error occurred while fetching vaccination completion statistics"
    #         )
            
    #     except Exception as e:
    #         logger.error(f"Unexpected error in get_dashboard_vaccination_completion: {str(e)}")
    #         error_dict = e.__dict__
    #         raise HTTPException(
    #             status_code=error_dict.get('status_code', 500),
    #             detail=error_dict.get('detail', 'Internal server error occurred')
    #         )