import json, sys, os
from tg import expose, RestController, response, request
from tagalong_api.helpers.auth_check import auth_check
from tagalong_api.helpers.enable_cors import enable_cors
from tagalong_api.helpers.code_reuse import create_and_send_announcement

sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/../../../database")
from db_controller import DBController

db_controller = DBController()

class AnnouncementsRestController(RestController):

    @expose('json')
    def options(self, *args, **kwargs):
        """
        This method handles the OPTIONS HTTP verb which is sent by browsers as a pre-flight request
        to see what HTTP methods and headers are allowed by the server.
        """
        enable_cors()

        return ''
    
    @expose('json')
    def get_one(self, announcmentId):
        """
        Retrieves information regarding announcementId

        localhost:8080/participation/ANNOUNCEMENT_ID_HERE
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
        query = "select * from Announcements where announcementId = %s limit 1;"
        params = [announcmentId,]
        results = db_controller.select(query, params)

        response.status = results.get("status_code")
        print(results.get("response"))

        response_dict = {}
        if results.get("status_code") == 500:
            response_dict = {
                "announcement_data": None,
                "error": f"Unidentified Error: {results.get('response')}"
            }
        elif results.get("status_code") == 200:
            if not (results.get("response")):
                response.status = 404  # set status to custom status
                response_dict = {
                    "announcement_data": None,
                    "error": f"No announcement found matching announcement ID {announcmentId}"
                }
            else:
                response_dict = results.get("response")[0]

        return json.dumps(response_dict)




    @expose('json')
    def get_all(self, searchType, **kwargs):
        """
        Retrieve all announcements involving one user or one event

        localhost:8080/announcements?searchType=test&searchId=test ANNOUNCEMENT ID HERE

        searchType can be user or event
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
        user_results = {}

        if not (searchType == 'event' or searchType == 'user'):
            sent_code = 400
        else:
            if(searchType == 'event'):
                searchId = kwargs.get("searchId")
                query = "SELECT * FROM Announcements WHERE eventId = %s;"
                params = [searchId,]
            elif(searchType == 'user'):
                # edit to only select active events and include seen attribute from sentAnnouncements
                query = """
                    SELECT Announcements.*, SentAnnouncements.active
                    FROM Announcements
                    JOIN SentAnnouncements ON Announcements.announcementId = SentAnnouncements.announcementId
                    WHERE SentAnnouncements.username = %s AND SentAnnouncements.active = 'true';
                    """
                # (SELECT ALL THE ANNOUNCEMENTS FOR A USER-- QUERY NEEDS TO BE FIXED)
                params = [host_username, ]

            user_results = db_controller.select(query, params)
            response.status = user_results.get("status_code")
            sent_code = user_results.get("status_code")

        messages = {
            200: {"searchId": kwargs.get("searchId"), "searchType":searchType, "announcements": user_results.get("response") ,"error": None},
            400: {"announcementId": None, "error": "Malformed syntax or invalid data values/ types sent"},
            409: {"announcementId": None, "error": "Unique violation when inserting event"},
            500: {"announcementId": None, "error": f"Unidentified Error: {user_results.get('response')}"}
        }

        response.status = sent_code
        return json.dumps(messages[sent_code])
        

    @expose('json')
    def post(self):
        """
        Make an announcement to all users currently attending your event
        {
            "eventId": 0,
            "aContent": "test"
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
        
        # retrieve request body data 
        raw_data = request.body
        data = json.loads(raw_data.decode('utf-8'))

        # ensure user is host of event
        eventId = data.get("eventId")
        query = "SELECT * FROM Events WHERE eventId = %s AND host = %s"
        params = (eventId, host_username)
        host_check_results = db_controller.select(query, params)
        host_check_code = host_check_results.get("status_code")
        if host_check_code == 200:
            # if there is no rows returned then the logged in user is the not the host of the event
            if not host_check_results.get("response"):
                response.status = 403
                return json.dumps({"announcementId": None, "error": "User not authorized to create announcement for event"})
        else:
            response.status = host_check_code
            messages = {
                400: {"announcementId": None, "error": "Malformed syntax or invalid data values/ types sent"},
                500: {"announcementId": None, "error": f"Unidentified Error: {host_check_results.get('response')}"}
            }
            return json.dumps(messages[host_check_code])
        
        # create and send announcements
        result_dict = create_and_send_announcement(db_controller, eventId, data.get("aContent"))
        response_code, response_json = result_dict["response_code"], result_dict["response_json"]

        response.status = response_code
        return json.dumps(response_json)
    
    @expose('json')
    def put(self):
        """
        Mark an announcement as seen for the users
        """
        enable_cors()
        print("Put Test Announcement")
        # check auth
        auth_response = auth_check(request)
        if auth_response.get("response_code") == 200:
            # successful auth -> identify username
            host_username = auth_response.get("response_message")
            print(host_username)
        else:
            # failed auth -> return error
            response.status = auth_response.get("response_code")
            return auth_response.get("response_message")
        query = """
            UPDATE SentAnnouncements
            SET seen = true
            WHERE username = %s AND announcementId = %s;
            """
        raw_data = request.body
        data = json.loads(raw_data.decode('utf-8'))
        params = (
            host_username,
            data.get("announcementId"),
        )
        results = db_controller.update(query, params)
        response.status = results.get("status_code")
        messages = {
            200: {"updated_user": host_username, "error": None},
            404: {"updated_user": None, "error": "Relation not found"},
            500: {"updated_user": None, "error": f"Unidentified Error: {results.get('response')}"}
        }

        return json.dumps(messages[results.get("status_code")])

    @expose('json')
    def delete(self, readOnly):
        """
        clear announcements from notifications, readOnly True clears read announcements otherwise all announcements
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
        
        query = """UPDATE SentAnnouncements
            SET active = False
            WHERE username = %s
        """
        query += " AND seen = true;" if readOnly else ";"
        params = (host_username, )

        results = db_controller.update(query, params)
        response.status = results.get("status_code")

        messages = {
            200: {"removed_user_announcements": host_username, "error": None},
            400: {"removed_user_announcements": None, "error": "Malformed syntax or invalid data values/ types sent"},
            409: {"removed_user_announcements": None, "error": "Unique key violation"},
            404: {"removed_user_announcements": None, "error": "User not found"},
            500: {"removed_user_announcements": None, "error": f"Unidentified Error: {results.get('response')}"}
        }

        return json.dumps(messages[results.get("status_code")])


        