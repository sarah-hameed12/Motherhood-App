from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from typing import List
from app.schemas.community_schemas import PostCreate, PostResponse, PostUpdate, PostChangeVisiblity
from app.database.postgres import connect_db
from app.middleware.protect_endpoints import verify_authentication
from sqlalchemy.ext.asyncio import AsyncSession
from app.controllers.community_controllers import PostControllers, PostLikeControllers, CommunityStatsControllers
from app.schemas.community_schemas import CommentCreate, CommentResponse, CommentUpdate
from app.controllers.community_controllers import CommentControllers, CommentLikeControllers
from app.schemas.community_schemas import PostReportCreate, PostReportResponse, PostReportDetailResponse, PostReportUpdateStatus
from app.controllers.community_controllers import PostReportControllers


community_router = APIRouter(
    prefix='/api/community',
    tags=['Community Routes']
)


@community_router.post('/create-post', status_code=201)
async def create_post_route(data: PostCreate, payload = Depends(verify_authentication), db: AsyncSession = Depends(connect_db)):
    return await PostControllers.create(payload['id'], data, db)


@community_router.get('/my-posts', response_model=List[PostResponse])
async def my_posts_route(payload = Depends(verify_authentication), db: AsyncSession = Depends(connect_db)):
    return await PostControllers.auth_posts(payload['id'], db)


@community_router.get('/feed', response_model=List[PostResponse])
async def feed_posts_route(payload = Depends(verify_authentication), db: AsyncSession = Depends(connect_db)):
    return await PostControllers.other_posts(payload['id'], db)


@community_router.get('/post/{post_id}')
async def post_detail_route(post_id: str, payload = Depends(verify_authentication), db: AsyncSession = Depends(connect_db)):
    return await PostControllers.detail(UUID(post_id), payload['id'], db)


@community_router.put('/update-post/{post_id}')
async def update_post_route(post_id: str, data: PostUpdate, payload = Depends(verify_authentication), db: AsyncSession = Depends(connect_db)):
    return await PostControllers.update(UUID(post_id), payload['id'], data, db)


@community_router.patch('/change-visibility/{post_id}')
async def change_visibility_route(post_id: str, data: PostChangeVisiblity, payload = Depends(verify_authentication), db: AsyncSession = Depends(connect_db)):
    return await PostControllers.change_visibility(UUID(post_id), payload['id'], data, db)


@community_router.delete('/delete-post/{post_id}', status_code=204)
async def delete_post_route(post_id: str, payload = Depends(verify_authentication), db: AsyncSession = Depends(connect_db)):
    return await PostControllers.delete(UUID(post_id), payload['id'], db)


@community_router.post('/post/toogle-like/{post_id}')
async def toogle_like(post_id: str, payload = Depends(verify_authentication), db: AsyncSession = Depends(connect_db)):
    print("hdasdasda")
    return await PostLikeControllers.toggle_like(post_id, payload['id'], db)



@community_router.get('/members/all')
async def all_community_members(payload = Depends(verify_authentication), db: AsyncSession = Depends(connect_db)):
    return await CommunityStatsControllers.totol_members(db)
    

@community_router.get('/posts/latest')
async def todays_posts(payload = Depends(verify_authentication), db: AsyncSession = Depends(connect_db)):
    return await CommunityStatsControllers.today_posts_count(db)
    



@community_router.post('/post/{post_id}/comment', status_code=201, response_model=CommentResponse)
async def create_comment_route(
    post_id: str, 
    data: CommentCreate, 
    payload = Depends(verify_authentication), 
    db: AsyncSession = Depends(connect_db)
):
    return await CommentControllers.create(UUID(post_id), payload['id'], data, db)


@community_router.get('/post/{post_id}/comments', response_model=List[CommentResponse])
async def get_post_comments_route(
    post_id: str, 
    payload = Depends(verify_authentication), 
    db: AsyncSession = Depends(connect_db)
):
    return await CommentControllers.get_post_comments(UUID(post_id), payload['id'], db)


@community_router.put('/comment/{comment_id}', response_model=CommentResponse)
async def update_comment_route(
    comment_id: str, 
    data: CommentUpdate, 
    payload = Depends(verify_authentication), 
    db: AsyncSession = Depends(connect_db)
):
    return await CommentControllers.update(UUID(comment_id), payload['id'], data, db)


@community_router.delete('/comment/{comment_id}', status_code=204)
async def delete_comment_route(
    comment_id: str, 
    payload = Depends(verify_authentication), 
    db: AsyncSession = Depends(connect_db)
):
    return await CommentControllers.delete(UUID(comment_id), payload['id'], db)


@community_router.post('/comment/{comment_id}/toggle-like')
async def toggle_comment_like_route(
    comment_id: str, 
    payload = Depends(verify_authentication), 
    db: AsyncSession = Depends(connect_db)
):
    return await CommentLikeControllers.toggle_like(UUID(comment_id), payload['id'], db)


@community_router.post('/post/{post_id}/report', status_code=201, response_model=PostReportResponse)
async def report_post_route(
    post_id: str, 
    data: PostReportCreate, 
    payload = Depends(verify_authentication), 
    db: AsyncSession = Depends(connect_db)
):
    return await PostReportControllers.create(UUID(post_id), payload['id'], data, db)


@community_router.get('/my-reports', response_model=List[PostReportResponse])
async def get_my_reports_route(
    payload = Depends(verify_authentication), 
    db: AsyncSession = Depends(connect_db)
):
    return await PostReportControllers.get_user_reports(payload['id'], db)


@community_router.get('/reports/all', response_model=List[PostReportDetailResponse])
async def get_all_reports_route(
    payload = Depends(verify_authentication), 
    db: AsyncSession = Depends(connect_db)
):
    """Admin endpoint to view all reports"""
    return await PostReportControllers.get_all_reports(payload['id'], db)


@community_router.get('/report/{report_id}', response_model=PostReportDetailResponse)
async def get_report_detail_route(
    report_id: str, 
    payload = Depends(verify_authentication), 
    db: AsyncSession = Depends(connect_db)
):
    return await PostReportControllers.get_report_detail(UUID(report_id), payload['id'], db)


@community_router.patch('/report/{report_id}/status', response_model=PostReportResponse)
async def update_report_status_route(
    report_id: str, 
    data: PostReportUpdateStatus, 
    payload = Depends(verify_authentication), 
    db: AsyncSession = Depends(connect_db)
):
    """Admin endpoint to update report status"""
    return await PostReportControllers.update_report_status(UUID(report_id), payload['id'], data, db)


@community_router.delete('/report/{report_id}', status_code=204)
async def delete_report_route(
    report_id: str, 
    payload = Depends(verify_authentication), 
    db: AsyncSession = Depends(connect_db)
):
    return await PostReportControllers.delete(UUID(report_id), payload['id'], db)


from fastapi import Query
from typing import Optional


@community_router.get('/search', response_model=List[PostResponse])
async def search_posts_route(
    q: str = Query(..., min_length=1),
    post_type: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    payload = Depends(verify_authentication),
    db: AsyncSession = Depends(connect_db),
):
    return await PostControllers.search(
        auth_id=payload['id'],
        q=q,
        db=db,
        post_type=post_type,
        category=category,
        limit=limit,
        offset=offset,
    )