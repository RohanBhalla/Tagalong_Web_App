# FRIENDSHIP FUNCTIONS FILE (View, Add, Delete methods (all will be updated shortly))

import json, sys, os
from tg import expose, RestController, response, request
from tagalong_api.helpers.encrypt import encrypt_string
from tagalong_api.helpers.enable_cors import enable_cors
from tagalong_api.helpers.datetime_encoder import DateTimeEncoder

sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/../../../database")
from db_controller import DBController


db_controller = DBController()


class FriendsRestController(RestController):

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
        #ADD A FRIEND
        """
        Create a new friendship with specified parameters.

        Example HTTP Request
        POST request to localhost:8080/users
        with headers
        {
            "Content-Type": "json"
        }
        and JSON body
        {
            "username": "test",
            "friend": "test"
        }
        """
        enable_cors()
        
        query = """
            insert into Friends
            values (
                %s, %s
            );
        """
        raw_data = request.body
        data = json.loads(raw_data.decode('utf-8'))
        params = (
            data.get("username"),
            data.get("friend"),
        )
        results = db_controller.insert(query, params)
        response.status = results.get("status_code")
        added_friend = data.get('friend')

        messages = {
            201: {"added_friend": added_friend, "error": None},
            409: {"added_friend": None, "error": f"{added_friend if 'friend' in results.get('response') else 'friend'} has already been added"},
            #Foreign key constraint (FIX THIS ERROR STATEMENT/NOT WORKING RN)
            404: {"added_friend":None, "error": f"{'Friend being added' if 'foreign key constraint' in results.get('response').lower() else 'Username'} not found"},
            500: {"added_friend": None, "error": f"Unidentified Error: {results.get('response')}"}


            #404 for friend not found
            #400 for frienship already exists

        }
        enable_cors()
        return json.dumps(messages[results.get("status_code")])
    
    #GET ALL FRIENDS OF USER
    @expose('json')
    def get_all(self, username):
        """
        Friends list method
        GET ALL FRIENDS OF A GIVEN USER
        Example HTTP request:
        GET request to localhost:8080/friends?search=test
        ({search: test} in params)
        """
        enable_cors()
        query = "select friend from Friends where username = %s;"
        params = [username, ]
        results = db_controller.select(query, params)
        response.status = results.get("status_code")

        #Testing
        print("username: " + username)
        if results.get("status_code") == 200:
            response_dict = {
                "Friends": results.get('response'),
                "error": None
            }
        elif results.get("status_code") == 400:
            response_dict = {
                "Friends": [],
                "error": "Malformed syntax or invalid data values/ types sent"
            }
        elif results.get("status_code") == 500:
            response_dict = {
                "Friends": [],
                "error": f"Unidentified Error: {results.get('response')}"
            }
        
        return json.dumps(response_dict)


    #REMOVE FRIENDSHIP WITH GIVEN FRIEND
    @expose('json')
    def delete(self, username, friend):
        """
        Remove participation in event
        """
        enable_cors()
        query = "DELETE FROM Friends WHERE username = %s AND friend = %s"
        params = (username, friend, )
        
        results = db_controller.delete(query, params)
        response.status = results.get("status_code")

        messages = {
            204: {"username": username, "friend": friend, "error": None},
            400: {"username": None, "friend": None, "error": "Malformed syntax or invalid data values/ types sent"},
            404: {"username": None, "friend": None, "error": "Friend not found"},
            500: {"username": None, "friend": None, "error": f"Unidentified Error: {results.get('response')}"}
        }

        return json.dumps(messages[results.get("status_code")])
        


    #BLOCK USER
    
    # 

    #UNBLOCK USER


# # NOTES
# - Great circle route for distance calculation in event filtration 
# - Can do neighborhood 
# - Another simpified table: User | Other | Relationship (F or B)
# - Look into distances 
