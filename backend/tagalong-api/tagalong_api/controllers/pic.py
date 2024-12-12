import json, sys, os, io, base64
from tg import expose, RestController, response, request
from PIL import Image

from tagalong_api.helpers.encrypt import encrypt_string
from tagalong_api.helpers.enable_cors import enable_cors
from tagalong_api.helpers.datetime_encoder import DateTimeEncoder
from tagalong_api.helpers.auth_check import auth_check

sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/../../../database")
from db_controller import DBController


db_controller = DBController()


class PicRestController(RestController):

    @expose('json')
    def options(self, *args, **kwargs):
        """
        This method handles the OPTIONS HTTP verb which is sent by browsers as a pre-flight request
        to see what HTTP methods and headers are allowed by the server.
        """
        enable_cors()

        return ''

    @expose('json')
    def get_one(self, username):
        """
        Intended for loading profile page information about a single user
        User is identified in username included in path
        Should return a dictionary including user information for populating the profile page and user hosted events

        Example HTTP request:
        GET request to localhost:8080/pic/username
        """
        enable_cors()

        # retrieve User information
        query = "select * from Pic where username = %s limit 1;"
        params = [username, ]
        user_results = db_controller.select(query, params)
        response.status = user_results.get("status_code")
        
        if user_results.get("status_code") == 500:
            response_dict = {
                "profile_data": None,
                "error": f"Unidentified Error: {user_results.get('response')}"
            }
        elif user_results.get("status_code") == 200:
            if not user_results.get("response"):
                response.status = 404 # set status to custom status
                response_dict = {
                    "profile_data": None,
                    "error": f"No user found matching username {username}"
                }
            else:
                profile_data = user_results.get("response")[0]
                image_data = base64.b64encode(profile_data["profilepic"]).decode('utf-8')
                
                image_data = base64.b64decode(image_data.encode('utf-8'))
                image_data = profile_data["profilepic"]
                # Decode the base64-encoded data
                image_data = base64.b64decode(profile_data["profilepic"])

                # Open the image using PIL
                image = Image.open(io.BytesIO(image_data))

                # Display the image
                image.show()

                response_dict = {
                    "username": profile_data.get("username"),
                    "pic": image_data,
                    "error": None
                }
        
        return json.dumps(response_dict, cls=DateTimeEncoder)
    
    @expose('json')
    def post(self):
        """
        Create a new user with specified parameters.

        Example HTTP Request
        POST request to localhost:8080/pic
        with headers
        {
            "Content-Type": "json"
        }
        and JSON body
        {
            "username": "test"
        }
        """
        enable_cors()
        
        query = """
            insert into Pic
            values (
                %s
            );
        """
        raw_data = request.body
        data = json.loads(raw_data.decode('utf-8'))
        params = (
            data.get("username"),
        )
        results = db_controller.insert(query, params)
        response.status = results.get("status_code")
        created_user = data.get('username')

        messages = {
            201: {"created_user": created_user, "error": None},
            400: {"created_user": None, "error": "Malformed syntax or invalid data values/ types sent"},
            409: {"created_user": None, "error": f"{'Email' if 'email' in results.get('response') else 'Username'} has already been registered"},
            500: {"created_user": None, "error": f"Unidentified Error: {results.get('response')}"}
        }
        return json.dumps(messages[results.get("status_code")])
    
    
    @expose('json')
    def put(self):
        """
        Update user with specified parameters.
        """
        enable_cors()

        query = """
            UPDATE Pic
            SET profilePic = %s
            WHERE username = %s
        """

        # raw_data = request.body
        # data = json.loads(raw_data.decode('utf-8'))
        username = request.POST.get("username")

        # retrieve file
        image_file = request.POST.get("image")

        print(type(image_file))

        # Resize the image to 600x600 pixels
        image = Image.open(io.BytesIO(image_file.file.read()))
        image = image.resize((600, 600))

        # Convert the image to bytes
        image_byte_array = io.BytesIO()
        image.save(image_byte_array, format='PNG')
        image_data = base64.b64encode(image_byte_array.getvalue())


        params = (
            image_data, username, 
        )

        print(type(image_data))

        results = db_controller.update(query, params)
        response.status = results.get("status_code")

        messages = {
            200: {"updated_user": username, "error": None},
            400: {"updated_user": None, "error": "Malformed syntax or invalid data values/ types sent"},
            409: {"updated_user": None, "error": f"{'Email' if 'email' in results.get('response') else 'Username'} has already been registered"},
            404: {"updated_user": None, "error": "User not found"},
            500: {"updated_user": None, "error": f"Unidentified Error: {results.get('response')}"}
        }

        return json.dumps(messages[results.get("status_code")])
