import json, sys, os
import tg
from tg import expose, RestController, request, response
from tagalong_api.helpers.encrypt import encrypt_string
from tagalong_api.helpers.enable_cors import enable_cors
from tagalong_api.helpers.jwt_tokens_handler import generate_token

sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/../../../database")
from db_controller import DBController

db_controller = DBController()


class SessionRestController(RestController):
   
    @expose('json')
    def options(self, *args, **kwargs):
        """
        This method handles the OPTIONS HTTP verb which is sent by browsers as a pre-flight request
        to see what HTTP methods and headers are allowed by the server.
        """
        enable_cors()

        return ''

    @expose('json')
    def post(self):

        enable_cors()

        raw_data = request.body
        data = json.loads(raw_data.decode('utf-8'))
        query = "select * from Users where username = %s and password = %s"
        params = (
            data.get("username"),
            encrypt_string(data.get("password")),
        )
        results = db_controller.select(query, params)
        status_code = results.get("status_code")
        if status_code == 200:
            if not results.get("response"):
                response.status = 401
                response_dict = {
                    "error": f"Invalid username or password",
                    "token": None
                }
            else:
                response.status = 200
                token = generate_token(data.get("username"))
                response_dict = {
                    "error": None,
                    "token": token
                }
        else:
            response.status = status_code
            if status_code == 400:
                response_dict = {
                    "error": "Malformed syntax or invalid data values/ types sent",
                    "token": None
            }
            elif status_code == 500:
                response_dict = {
                    "error": f"Unidentified Error: {results.get('response')}",
                    "token": None
            }
        return json.dumps(response_dict)