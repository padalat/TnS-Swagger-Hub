import jwt
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import re
from collections import defaultdict

JWT_SECRET = "a-string-secret-at-least-256-bits-long" 
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
            
            if not payload.get("roles") or not payload.get("roles").get("flipdocs"):
                raise HTTPException(status_code=403, detail="Invalid authorization code.")
            
            return self.convert(payload.get("roles").get("flipdocs"))
        else:
            raise HTTPException(status_code=403, detail="Invalid authorization code.")
    def convert(self,payload):
        team_permissions = defaultdict(dict)

        for key, value in payload.items():
            match = re.match(r"flipdocs\.(\w+)\.(admin|read|write)", key)
            if match:
                team, permission = match.groups()
                team_permissions[team][permission] = value
        team_name = None
        for team, perms in team_permissions.items():
            if any(perms.values()):
                team_name = team
                break

        output_obj = {
            "flipdocs-admin": team_permissions[team_name].get("admin", False),
            "flipdocs-user-read": team_permissions[team_name].get("read", False),
            "flipdocs-user-write": team_permissions[team_name].get("write", False),
            "team_name": team_name
        }

        return output_obj

