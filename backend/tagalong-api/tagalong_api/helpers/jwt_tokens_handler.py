import jwt
from dotenv import load_dotenv
import os, datetime

load_dotenv()
SECRET_KEY = os.getenv('SECRET_KEY')

def generate_token(username):
    """
    helper functions intended to create a jwt token to use as a cookie
    Encodes the logged in user's username and returns the jwt_token to be stored in the frontend
    """
    # TODO: Consider have the JWT expire after a given amount of time
    current_time = datetime.datetime.utcnow()
    expiration_time = current_time + datetime.timedelta(hours=1)
    payload = {
        "username": username,
        "exp": expiration_time,
        "iss": "localhost:8080/session",
        "iat": current_time}
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token

def decode_token(token):
    """
    helper function to decode token and retrieve value
    User should try to catch exceptions:
        jwt.ExpiredSignatureError
        jwt.InvalidTokenError
    """
    decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    return decoded_token
    
# print(generate_token("klikbait"))

print(generate_token("gabru"))