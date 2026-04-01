from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.sockets.socket_manager import manager

router = APIRouter()

@router.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await manager.connect(websocket)

    await manager.broadcast_json({
        "type": "system",
        "message": "A user connected",
    })

    try:
        while True:
            data = await websocket.receive_json()

            await manager.broadcast_json({
                "type": "message",
                "sender": data.get("sender", "Anonymous"),
                "message": data.get("message", ""),
                "timestamp": data.get("timestamp"),
            })

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast_json({
            "type": "system",
            "message": "A user disconnected",
        })