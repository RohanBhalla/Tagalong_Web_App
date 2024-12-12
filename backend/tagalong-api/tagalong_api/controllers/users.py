import json, sys, os, io, base64, uuid
from tg import expose, RestController, response, request
from PIL import Image

from tagalong_api.helpers.encrypt import encrypt_string
from tagalong_api.helpers.enable_cors import enable_cors
from tagalong_api.helpers.datetime_encoder import DateTimeEncoder
from tagalong_api.helpers.auth_check import auth_check
from tagalong_api.helpers.geoapify import get_lat_long

sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/../../../database")
from db_controller import DBController


db_controller = DBController()


class UsersRestController(RestController):

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
        enable_cors()

        # check auth
        auth_response = auth_check(request)
        if auth_response.get("response_code") == 200:
            # successful auth -> identify username
            host_username = auth_response.get("response_message")
        else:
            # failed auth -> return error
            response.status = auth_response.get("response_code")
            return auth_response.get("response_message")

        # retrieve User information
        query = """
            SELECT 
                firstName, lastName, email, username, userAddress, userCoordinates, profilePic, userDescription 
            FROM 
                Users 
            WHERE 
                username = %s 
                AND NOT EXISTS (
                    SELECT 1
                    FROM Relationships
                    WHERE (username = Users.username AND other = %s AND relation = 'blocked')
                    OR (username = %s AND other = Users.username AND relation = 'blocked')
                )
            LIMIT 1;
        """
        # kind of scuffed logic for loading logged in user's username
        if username == "\x00":
            username = host_username
            
        params = [username, host_username, host_username, ]
        user_results = db_controller.select(query, params)
        response.status = user_results.get("status_code")

        if user_results.get("status_code") == 500:
            response_dict = {
                "profile_data": None,
                "error": f"Unidentified Error: {user_results.get('response')}"
            }
        elif user_results.get("status_code") == 200:
            if not user_results.get("response"):
                response.status = 404  # set status to custom status
                response_dict = {
                    "profile_data": None,
                    "error": f"No user found matching username {username}"
                }
            else:
                profile_data = user_results.get("response")[0]
                # lets frontend know if this is the user's account
                profile_data["profile_host"] = True if username == host_username else False

                # retrieve follower and following counts
                query = """
                    SELECT
                        COALESCE(followers_count, 0) AS followers_count,
                        COALESCE(following_count, 0) AS following_count
                    FROM Users
                    LEFT JOIN (
                        SELECT other AS username, COUNT(*) AS followers_count
                        FROM Relationships
                        WHERE relation = 'friend'
                        GROUP BY other
                    ) AS followers ON Users.username = followers.username
                    LEFT JOIN (
                        SELECT username, COUNT(*) AS following_count
                        FROM Relationships
                        WHERE relation = 'friend'
                        GROUP BY username
                    ) AS following ON Users.username = following.username
                    WHERE Users.username = %s;
                """
                params = [username, ]
                follow_results = db_controller.select(query, params)
                follow_stats = follow_results["response"][0]
                profile_data["following_count"] = follow_stats.get("following_count")
                profile_data["followers_count"] = follow_stats.get("followers_count")

                # retrieve user hosted events
                query = "SELECT Events.*, Users.profilePic FROM Events INNER JOIN Users ON Events.host = Users.username WHERE host = %s ORDER BY dateTime, eventId DESC;"
                params = [username, ]
                events_results = db_controller.select(query, params)
                profile_data["hosted_events"] = events_results.get("response")

                # retrieve user joined events
                query = """
                SELECT Events.*, Users.profilePic
                FROM 
                    Events INNER JOIN Users ON Events.host = Users.username JOIN Joined 
                        ON Events.eventId = Joined.eventId
                WHERE 
                    Joined.username = %s
                ORDER BY Events.dateTime, Events.eventId DESC;
                """
                params = [username, username, ]
                events_results = db_controller.select(query, params)
                profile_data["joined_events"] = events_results.get("response")

                response_dict = {
                    "profile_data": profile_data,
                    "error": None
                }

        return json.dumps(response_dict, cls=DateTimeEncoder)
    
    @expose('json')
    def get_all(self, search):
        """
        Intended for loading results that match a search term
        Will list in order of:
        1. Matches email exactly
        2. Matches username exactly
        3. Entire search term is part of the username (...search...)
        Should return a dictionary of the username (and profile picture when we add it)

        Example HTTP request:
        GET request to localhost:8080/users?search=test
        ({search: test} in params)
        """
        enable_cors()

        # check auth
        auth_response = auth_check(request)
        if auth_response.get("response_code") == 200:
            # successful auth -> identify username
            host_username = auth_response.get("response_message")
        else:
            # failed auth -> return error
            response.status = auth_response.get("response_code")
            return auth_response.get("response_message")

        query = """
            SELECT *
            FROM Users
            WHERE (LOWER(username) LIKE LOWER(%s) OR email = %s)
                AND NOT EXISTS (
                    SELECT 1
                    FROM Relationships
                    WHERE (username = Users.username AND other = %s AND relation = 'blocked')
                        OR (username = %s AND other = Users.username AND relation = 'blocked')
                )
            ORDER BY 
                CASE
                    WHEN email = %s THEN 1
                    WHEN username = %s THEN 2
                    WHEN LOWER(username) LIKE LOWER(%s) THEN 3
                    WHEN LOWER(username) LIKE LOWER(%s) THEN 4
                    ELSE 5
                END;
        """
        params = [f"%{search}%", search, host_username, host_username, search, search, f"{search}%", f"%{search}%", ]
        results = db_controller.select(query, params)
        response.status = results.get("status_code")

        if results.get("status_code") == 200:
            return json.dumps({
                "users": results.get("response"),
                "error": None
            })
        elif results.get("status_code") == 500:
            return json.dumps({
                "users": [],
                "error": f"Unidentified Error: {results.get('response')}"
            })
        
    @expose('json')
    def post(self):
        """
        Create a new user with specified parameters.

        Example HTTP Request
        POST request to localhost:8080/users
        with headers
        {
            "Content-Type": "json"
        }
        and JSON body
        {
            "firstName": "test",
            "lastName": "test",
            "email": "test",
            "username": "test",
            "password": "test"
        }
        """
        enable_cors()
        
        query = """
            insert into Users
            values (
                %s, %s, %s, %s, %s
            );
        """
        raw_data = request.body
        data = json.loads(raw_data.decode('utf-8'))
        params = (
            data.get("firstName"),
            data.get("lastName"),
            data.get("email"),
            data.get("username"),
            encrypt_string(data.get("password")),
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
        Takes in form-data so that images can be passed
        """
        enable_cors()
        
        # check auth
        auth_response = auth_check(request)
        if auth_response.get("response_code") == 200:
            # successful auth -> identify username
            host_username = auth_response.get("response_message")
        else:
            # failed auth -> return error
            response.status = auth_response.get("response_code")
            return auth_response.get("response_message")
        
        # set base query and params
        query = """
            UPDATE Users
            SET 
                firstName = %s, 
                lastName = %s, 
                email = %s, 
                password = %s, 
                userDescription = %s
        """
        field_data = request.POST
        #raw_data = request.body
        #field_data = json.loads(raw_data.decode('utf-8'))
        print(field_data.get("password"))
        print(field_data.get("firstName"))
        print("hello")
        params = [
            field_data.get("firstName"),
            field_data.get("lastName"),
            field_data.get("email"),
            encrypt_string(field_data.get("password")),
            field_data.get("userDescription"),
        ]

        # handle profile picture (save image to local folder)
        uploaded_file = request.POST.get("image")
        if uploaded_file != None:
            output_folder = "../../frontend/public/images"
            print("Current working directory:", os.getcwd())
            unique_id = str(uuid.uuid4())
            file_extension = os.path.splitext(uploaded_file.filename)[1]
            output_filename = f"{unique_id}{file_extension}"
            output_path = os.path.join(output_folder, output_filename)

            with open(output_path, 'wb') as f:
                f.write(uploaded_file.file.read())

            # update query with profile picture path
            query += ", profilePic = %s"
            params.extend([output_filename, ])

        # Handle address
        address = field_data.get("userAddress")
        if address:
            coordinates = get_lat_long(address)
            if not coordinates:
                response.status = 400
                return json.dumps(
                    {
                        "updated_user": None,
                        "error": "Could not convert address to valid longitude/ latitude"
                    }
                )
            longitude, latitude = coordinates

            # update query with address and long,lat
            query += """
                , userAddress = %s, 
                userCoordinates = %s
            """
            params.extend([field_data.get("userAddress"), f"SRID=4326;POINT({longitude} {latitude})", ])

        # Finish query with WHERE statement
        query += " WHERE username = %s;"
        params.extend([host_username, ])

        results = db_controller.update(query, params)
        response.status = results.get("status_code")

        messages = {
            200: {"updated_user": host_username, "error": None},
            400: {"updated_user": None, "error": "Malformed syntax or invalid data values/ types sent"},
            409: {"updated_user": None, "error": f"{'Email' if 'email' in results.get('response') else 'Username'} has already been registered"},
            404: {"updated_user": None, "error": "User not found"},
            500: {"updated_user": None, "error": f"Unidentified Error: {results.get('response')}"}
        }

        return json.dumps(messages[results.get("status_code")])
