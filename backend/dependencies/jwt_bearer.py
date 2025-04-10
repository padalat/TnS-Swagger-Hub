import jwt
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

JWT_SECRET = "a-string-secret-at-least-256-bits-long"  # Replace with your actual secret
JWT_ALGORITHM = "HS256"

class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)
        if credentials:
            if credentials.scheme != "Bearer":
                raise HTTPException(status_code=403, detail="Invalid authentication scheme.")
            try:
                payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            except jwt.PyJWTError:
                raise HTTPException(status_code=403, detail="Invalid token or expired token.")
            return payload
        else:
            raise HTTPException(status_code=403, detail="Invalid authorization code.")
