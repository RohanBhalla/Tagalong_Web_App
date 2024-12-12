# FRIENDSHIP FUNCTIONS FILE (IN PROGRESS)

import json, sys, os
import jwt
from tg import expose, RestController, response, request
from tagalong_api.helpers.encrypt import encrypt_string
from tagalong_api.helpers.jwt_tokens_handler import decode_token
from tagalong_api.helpers.enable_cors import enable_cors
from tagalong_api.helpers.datetime_encoder import DateTimeEncoder
from tagalong_api.helpers.auth_check import auth_check

sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/../../../database")
from db_controller import DBController


db_controller = DBController()


class RelationshipsRestController(RestController):

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
        #ADD A Relationship to the Relationships table
        """
        Create a new relationship with specified parameters.

        Example HTTP Request
        POST request to localhost:8080/relationships
        with headers
        {
            "Content-Type": "json"
        }
        and JSON body
        {
            "other": "test",
            "relation": "friend" (can be friend or blocked)
        }
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
            insert into Relationships
            values (
                %s, %s, %s
            );
        """
        raw_data = request.body
        data = json.loads(raw_data.decode('utf-8'))
        params = (
            host_username,
            data.get("other"),
            data.get("relation"),
        )
        results = db_controller.insert(query, params)
        response.status = results.get("status_code")
        # For debugging
        print("RESPONSE POST: " + results.get('response'))
        
        other_person = data.get('other')

        messages = {
            201: {"added_person": other_person, "error": None},
            409: {"added_person": None, "error": f"{other_person if 'friend' in results.get('response') else 'friend'} has already been added"},
            #Foreign key constraint (FIX THIS ERROR STATEMENT/NOT WORKING RN)
            # 404: {"added_person":None, "error": f"{'Friend being added' if 'foreign key constraint' in results.get('response').lower() else 'Username'} not found"},
            500: {"added_person": None, "error": f"Unidentified Error: {results.get('response')}"}
            #404 for friend not found ---> needs to be set
        }
        enable_cors()
        return json.dumps(messages[results.get("status_code")])
    

    #Get one record for given username
    @expose('json')
    def get_one(self, other):
        """
        Intended for loading profile page information about a single user
        User is identified in username included in path
        Should return a dictionary including user information for populating the profile page and user hosted events

        Example HTTP request:
        GET request to localhost:8080/relationships/testPerson
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

        # retrieve relation information
        query = "select * from Relationships where username = %s and other = %s limit 1;"
        params = [host_username, other]
        user_results = db_controller.select(query, params)
        response.status = user_results.get("status_code")
        
        if user_results.get("status_code") == 500:
            response_dict = {
                "relation_data": [],
                "error": f"Unidentified Error: {user_results.get('response')}"
            }
        elif not user_results.get("response"): #Doesn't yet work (Shows code 200 for when no relationship other found)
            response_dict = {
                "relation_data": [],
                "error": f"No Relation Found"
            }
        elif user_results.get("status_code") == 404:
            response_dict = {
                "relation_data": [],
                "error": f"Relation not found {host_username}"
            }
        else:
            profile_data = user_results.get("response")[0]
            # retrieve user hosted events
            response_dict = {
                "relation_data": profile_data,
                "error": None
            }

        print(response.status)
        return json.dumps(response_dict)
    
    # #GET ALL FRIENDS OF USER
    @expose('json')
    def get_all(self, **kwargs):
        """
        Friends list method
        GET ALL FRIENDS OF A GIVEN USER
        Example HTTP request:
        GET request to localhost:8080/relationships?view=followers&type=friend 
        (type can be friend or blocked, view can be followers or following)
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
        

        search_type = kwargs.get("type")
        search_view = kwargs.get("view")
        query = ""

        # check search_type
        if search_type not in ['friend', 'blocked']:
            response.status = 422
            response_dict = {
                "events": [],
                "error": "type param not matching one of [friend, blocked]"
            }
            return json.dumps(response_dict)
        # check search view
        if search_view not in ['following', 'followers']:
            response.status = 422
            response_dict = {
                "events": [],
                "error": "View type not matching one of [following, followers]"
            }
            return json.dumps(response_dict)
        if search_view == "following": 
        # base query for retrieving following and blocked (user follows or blocks other so host is in username field)
            query = """
                SELECT r.other as username, firstName, lastName, profilePic
                FROM Relationships r INNER JOIN Users u ON r.other = u.username
                WHERE r.username = %s AND relation = %s;
            """
        else:
        # different query for followers (user follows host so host is in other field)
            query = """
                SELECT r.username, firstName, lastName, profilePic
                FROM Relationships r INNER JOIN Users u ON r.username = u.username
                WHERE r.other = %s AND relation = %s;
            """
        
        params = [host_username, search_type]
        results = db_controller.select(query, params)
        response.status = results.get("status_code")

        #Testing
        print("username: " + host_username)
        if results.get("status_code") == 200:
            response_dict = {
                "Relations": results.get('response'),
                "error": None
            }
        elif results.get("status_code") == 400:
            response_dict = {
                "Relations": [],
                "error": "Malformed syntax or invalid data values/ types sent"
            }
        elif results.get("status_code") == 500:
            response_dict = {
                "Relations": [],
                "error": f"Unidentified Error: {results.get('response')}"
            }
        
        return json.dumps(response_dict)


    #REMOVE FRIENDSHIP WITH GIVEN FRIEND
    @expose('json')
    def delete(self, other):
        """
        Remove Relationship
        To be called when unblocking or unfollowing a person
        Deletes passed in other
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

        query = "DELETE FROM Relationships WHERE username = %s AND other = %s;"
        params = (host_username, other,)
        
        results = db_controller.delete(query, params)
        response.status = results.get("status_code")

        messages = {
            200: {"username": host_username, "relation": other, "error": None},
            204: {"username": host_username, "relation": other, "error": None, "message": "Successfully deleted"},
            400: {"username": None, "relation": None, "error": "Malformed syntax or invalid data values/ types sent"},
            404: {"username": None, "relation": None, "error": "Relation not found"},
            500: {"username": None, "relation": None, "error": f"Unidentified Error: {results.get('response')}"}
        }
        print("TESTING : " + str(results.get("status_code")))
        return json.dumps(messages[results.get("status_code")])
        
    @expose('json')
    def put(self):
        """
        Update Relationship with specified parameters.
        Can change relation type (options of blocked or friend)
        Called using put
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
            UPDATE Relationships
            SET relation = %s
            WHERE username = %s AND other = %s
        """
        
        raw_data = request.body
        data = json.loads(raw_data.decode('utf-8'))
        params = (
            data.get("relation"),
            host_username,
            data.get("other"),

        )
        results = db_controller.update(query, params)
        response.status = results.get("status_code")

        messages = {
            200: {"updated_user": host_username, "error": None},
            404: {"updated_user": None, "error": "Relation not found"},
            500: {"updated_user": None, "error": f"Unidentified Error: {results.get('response')}"}
        }

        return json.dumps(messages[results.get("status_code")])

