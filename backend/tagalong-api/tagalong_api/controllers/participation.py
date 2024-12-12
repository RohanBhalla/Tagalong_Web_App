import json, sys, os
from tg import expose, RestController, response, request
from tagalong_api.helpers.auth_check import auth_check
from tagalong_api.helpers.enable_cors import enable_cors

sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/../../../database")
from db_controller import DBController

db_controller = DBController()

class ParticipationRestController(RestController):

    @expose('json')
    def options(self, *args, **kwargs):
        """
        This method handles the OPTIONS HTTP verb which is sent by browsers as a pre-flight request
        to see what HTTP methods and headers are allowed by the server.
        """
        enable_cors()

        return ''
    
    @expose('json')
    def get_one(self, event_id):
        """
        Retrieve participation status of an individual for an event
        username is retrieved through authorization token
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
        
        query = "SELECT * FROM Joined WHERE eventId = %s AND username = %s"
        params = (event_id, host_username,)
        results = db_controller.select(query, params)
        response.status = results.get("status_code")
        
        if results.get("status_code") == 500:
            response_dict = {
                "participation_status": None,
                "error": f"Unidentified Error: {results.get('response')}"
            }
        elif results.get("status_code") == 400:
            response_dict = {
                "participation_status": None,
                "error": "Malformed syntax or invalid data values/ types sent"
            }
        elif results.get("status_code") == 200:
            if not results.get("response"):
                response_dict = {
                    "participation_status": None,
                    "error": None
                }
            else:
                response_dict = {
                    "participation_status": "attending",
                    "error": None
                }
        
        return json.dumps(response_dict)

    @expose('json')
    def get_all(self, event_id):
        """
        Intended for retrieving all users that are participating in an event
        Example HTTP request:
        GET request to localhost:8080/participation?event_id=test
        ({event_id: test} in params)
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
        
        # make sure that Event exists
        query = "SELECT * FROM Events WHERE eventId = %s"
        params = [event_id, ]
        results = db_controller.select(query, params)

        if results.get("status_code") == 200:
            if not results.get('response'):
                event_check_dict = {
                    "participants": [],
                    "error": f"No event with event_id {event_id} found"
                }
                response.status = 404
                return json.dumps(event_check_dict)
        else:
            response.status = results.get("status_code")
            if results.get("status_code") == 400:
                event_check_dict = {
                    "participants": [],
                    "error": "Malformed syntax or invalid data values/ types sent"
                }
            elif results.get("status_code") == 500:
                event_check_dict = {
                    "participants": [],
                    "error": f"Unidentified Error: {results.get('response')}"
                }
            return json.dumps(event_check_dict)
        
        # retrieve usernames only if the user is 
        query = "SELECT Joined.username, Users.profilePic FROM Joined INNER JOIN Users ON Joined.username = Users.username WHERE Joined.eventId = %s"
        params = [event_id, ]
        results = db_controller.select(query, params)
        response.status = results.get("status_code")

        if results.get("status_code") == 200:
            response_dict = {
                "participants": results.get('response'),
                "error": None
            }
        elif results.get("status_code") == 400:
            response_dict = {
                "participants": [],
                "error": "Malformed syntax or invalid data values/ types sent"
            }
        elif results.get("status_code") == 500:
            response_dict = {
                "participants": [],
                "error": f"Unidentified Error: {results.get('response')}"
            }
        
        return json.dumps(response_dict)

    
    @expose('json')
    def post(self):
        """
        Create a new join relation between a user and an event (User joins event)
        User identified through authentication token
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
        
        # retrieve request body data 
        raw_data = request.body
        data = json.loads(raw_data.decode('utf-8'))

        # Make sure joins dont exceed event capacity
        query = """
            SELECT
                e.eventId,
                COUNT(j.username) AS joined_count
            FROM
                Events e
            LEFT JOIN
                Joined j ON e.eventId = j.eventId
            WHERE
                e.eventId = %s
            GROUP BY
                e.eventId
            HAVING
                COUNT(j.username) >= e.eventCapacity;
        """
        params = (data.get("event_id"), )
        cap_results = db_controller.select(query, params)
        cap_code = cap_results.get("status_code")
        if cap_code == 200:
            # if something was selected, we have reached capacity
            if cap_results.get("response"):
                response.status = 409
                return json.dumps({"username": None, "event_id": None, "error": "Event capacity reached"})
        else:
            response.status = cap_code
            messages = {
                400: {"username": None, "event_id": None, "error": "Malformed syntax or invalid data values/ types sent"},
                500: {"username": None, "event_id": None, "error": f"Unidentified Error: {cap_results.get('response')}"}
            }
            return json.dumps(messages[cap_code])

        # try inserting new record
        query = """
            INSERT INTO Joined(eventId, username)
            VALUES (
                %s, %s
            )
        """
        params = (data.get("event_id"), host_username,)
        results = db_controller.insert(query, params, "eventId")
        response.status = results.get("status_code")

        messages = {
            201: {"username": host_username, "event_id": data.get("event_id"), "error": None},
            400: {"username": None, "event_id": None, "error": "Malformed syntax or invalid data values/ types sent"},
            409: {"username": None, "event_id": None, "error": "Unique violation when inserting event"},
            500: {"username": None, "event_id": None, "error": f"Unidentified Error: {results.get('response')}"}
        }
        
        return json.dumps(messages[results.get("status_code")])

    @expose('json')
    def delete(self, eventId):
        """
        Remove participation in event
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
        
        query = "DELETE FROM Joined WHERE username = %s AND eventId = %s"
        params = (host_username, eventId, )
        
        results = db_controller.delete(query, params)
        response.status = results.get("status_code")

        messages = {
            204: {"username": host_username, "event_id": eventId, "error": None},
            400: {"username": None, "event_id": None, "error": "Malformed syntax or invalid data values/ types sent"},
            404: {"username": None, "event_id": None, "error": "User was not participating in event"},
            500: {"username": None, "event_id": None, "error": f"Unidentified Error: {results.get('response')}"}
        }

        return json.dumps(messages[results.get("status_code")])
        