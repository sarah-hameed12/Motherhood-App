import os
from dotenv import load_dotenv # type: ignore
from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from typing import Dict
from uuid import UUID as UUID_type

load_dotenv()

RESET_SECRET = os.getenv("RESET_SECRET") or os.getenv("REFRESH_SECRET")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
RESET_EXPIRY_MINUTES = int(os.getenv("RESET_TOKEN_EXPIRY_MINUTES", 60))  

if not RESET_SECRET:
    raise RuntimeError("No RESET_SECRET or REFRESH_SECRET set in environment for password reset tokens")

def generate_password_reset_token(payload: Dict):
    """
    payload should at minimum contain {'id': <str>}
    """
    to_encode = payload.copy()
    if "id" in to_encode and isinstance(to_encode["id"], (bytes, bytearray)) is False:
        to_encode["id"] = str(to_encode["id"])

    expire_time = datetime.utcnow() + timedelta(minutes=RESET_EXPIRY_MINUTES)
    to_encode.update({"exp": expire_time, "type": "password_reset"})
    token = jwt.encode(to_encode, RESET_SECRET, algorithm=ALGORITHM)
    return token


def verify_password_reset_token(token: str) -> Dict:
    try:
        decoded = jwt.decode(token, RESET_SECRET, algorithms=[ALGORITHM])
        if decoded.get("type") != "password_reset":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token type")
      
        if "id" not in decoded:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token missing user id")
        
        try:
            decoded["id"] = str(UUID_type(decoded["id"]))
        except Exception:
            pass
        return decoded
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired password reset token")