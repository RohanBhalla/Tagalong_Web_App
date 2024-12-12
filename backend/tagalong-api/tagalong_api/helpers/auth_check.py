from tagalong_api.helpers.jwt_tokens_handler import decode_token
import jwt
import json


def auth_check(request):
    auth_response = {}  # Initialize the auth_response variable

    # retrieve jwt token from Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header:
        # Check if it's a bearer token
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        else:
            token = auth_header
        # decode token to retrieve host username
        try: 
            token_data = decode_token(token)
            host_username = token_data.get("username")
            auth_response = {
                "response_code": 200,
                "response_message": host_username
            }
        except jwt.ExpiredSignatureError:
            auth_response = {
                "response_code": 401,
                "response_message": json.dumps({"error": "Auth token expired"})
            }
        except jwt.InvalidTokenError:
            auth_response = {
                "response_code": 403,
                "response_message": json.dumps({"error": "Incorrect auth token provided"})
            }
    else:
        auth_response = {
            "response_code": 403,
            "response_message": json.dumps({"error": "No auth token provided"})
        }

    return auth_response
