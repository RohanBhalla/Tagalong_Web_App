import json, sys, os
from tg import expose, RestController, response, request
from tagalong_api.helpers.enable_cors import enable_cors
from tagalong_api.helpers.datetime_encoder import DateTimeEncoder
from tagalong_api.helpers.auth_check import auth_check
from tagalong_api.helpers.code_reuse import create_and_send_announcement
from tagalong_api.helpers.geoapify import get_lat_long

sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/../../../database")
from db_controller import DBController

db_controller = DBController()

class EventsRestController(RestController):

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
        Intended for loading event page information about a single event
        Event is identified in event_id included in path
        Should return a dictionary including event information for populating the event description page

        Example HTTP request:
        GET request to localhost:8080/events/event_id
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
        
        # retrieve Event information
        query = """
            SELECT Events.*, Users.profilePic
            FROM Events INNER JOIN Users ON Events.host = Users.username
            WHERE eventId = %s
            AND NOT EXISTS (
                SELECT 1
                FROM Relationships
                WHERE (username = Events.host AND other = %s AND relation = 'blocked')
                OR (username = %s AND other = Events.host AND relation = 'blocked')
            )
            LIMIT 1;
        """
        params = [event_id, host_username, host_username]
        event_results = db_controller.select(query, params)
        response.status = event_results.get("status_code")
        if event_results.get("status_code") == 500:
            response_dict = {
                "event_data": [],
                "error": f"Unidentified Error: {event_results.get('response')}"
            }
        elif event_results.get("status_code") == 400:
            response_dict = {
                "event_data": [],
                "error": "Malformed syntax or invalid data values/ types sent"
            }
        elif not event_results.get("response"):
            response_dict = {
                "event_data": [],
                "error": f"No event found matching id {event_id}"
            }
        else:
            event_data = event_results.get("response")[0]
            # retrieve users registered for event
            query = "SELECT COUNT(*) FROM Joined WHERE eventId = %s"
            params = [event_id, ]
            attendee_response = db_controller.select(query, params)
            attendee_count = attendee_response.get("response")[0].get("count")
            event_data["attendee_count"] = attendee_count

            # add "event_host" to say if logged in user is the host for the event
            host = event_data.get("host")
            event_data["event_host"] = True if host == host_username else False

            response_dict = {
                "event_data": event_data,
                "error": None
            }
        
        return json.dumps(response_dict, cls=DateTimeEncoder)

    @expose('json')
    def get_all(self, search, **kwargs):
        """
        Intended for loading results that match a search 
        Can search on host_name and event_title based on what is passed through the search_type param [host, event, homepage]
        User can optionally add additional filter options to refine the search
        - Date range (start_date, end_date)
        - Only events that are not full (exclude_full)
        - Category (category)
        - Distance in miles (distance)

        NOTE: search_type of homepage is expected to not have any accompanying filters. This will just show events that friends have interacted with

        Example HTTP request:
        GET request to localhost:8080/events?search=test?

        SAMPLE REQUEST: GET to localhost:8080/events?search=host&search_type=friend

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
        
        # construct where statement based on search_type
        search_type = kwargs.get("search_type")

        # no filters for just friends view     
        if search_type == "friend": #Only gets events that friends are joining and not hosting currently
            query = """
                -- friends view
                CREATE OR REPLACE TEMPORARY VIEW UserFriendsView AS
                SELECT
                    r.other AS friend_username
                FROM
                    Relationships r
                WHERE
                    r.username = %s AND r.relation = 'friend';
                
                -- valid events view
                CREATE OR REPLACE TEMPORARY VIEW ValidEventsView AS
                SELECT DISTINCT
                	e.*
                FROM
                    Events e
                WHERE
                    e.host IN (SELECT friend_username FROM UserFriendsView)
                    OR
                    e.eventId IN (
                		SELECT eventId FROM Joined WHERE username IN 
                		(SELECT friend_username FROM UserFriendsView)
                	);
                
                -- query using friends and valid events views
                SELECT
                    ve.eventId,
                    MAX(ve.eventTitle) AS eventTitle,
                    MAX(ve.host) AS host_username,
                    MAX(u.profilePic) AS host_profilePic,
                	MAX(ve.eventDescription) AS eventDescription,
                	MAX(ve.dateTime) AS dateTime,
                	MAX(ve.eventAddress) AS eventAddress,
                	MAX(ve.eventCapacity) AS eventCapacity,
                	MAX(ve.category) AS category,
                    array_agg(j.username) AS attendingFriends
                FROM
                    ValidEventsView ve
                JOIN
                    Users u ON ve.host = u.username
                LEFT JOIN
                    Joined j ON ve.eventId = j.eventId AND j.username IN (SELECT friend_username FROM UserFriendsView)
                GROUP BY
                    ve.eventId;
            """
            params = [host_username, ]
        # build onto query using filters if not friends view
        else:
            # base query
            query = "SELECT Events.*, Users.profilePic FROM Events INNER JOIN Users ON Events.host = Users.username"
            if search_type == "host":
                query += " where LOWER(host) LIKE LOWER(%s)"
                params = [f"%{search}%", ]
            elif search_type == "event":
                query += " where LOWER(eventTitle) LIKE LOWER(%s)"
                params = [f"%{search}%", ]
            else:
                response.status = 400
                response_dict = {
                    "events": [],
                    "error": "Search type not matching on of [event, host, friend]"
                }
                return json.dumps(response_dict, cls=DateTimeEncoder)
            
            # filter out blocked users
            query += """
                AND NOT EXISTS (
                    SELECT 1
                    FROM Relationships
                    WHERE (username = Events.host AND other = %s AND relation = 'blocked')
                    OR (username = %s AND other = Events.host AND relation = 'blocked')
                )
            """
            params.extend([host_username, host_username, ])
            
            # add date range to query
            start_date = kwargs.get("start_date")
            end_date = kwargs.get("end_date")
    
            if start_date:
                query += " AND dateTime >= %s"
                params.append(start_date)
            
            if end_date:
                query += " AND dateTime <= %s"
                params.append(end_date + "T23:59:59")
            
            # add exclude full to query
            exclude_full = kwargs.get("exclude_full")
            exclude_full = json.loads(exclude_full.lower()) if exclude_full else None # parses bool
            if exclude_full:
                query += """
                    AND eventId IN
                    (
                        SELECT
                            e.eventId
                        FROM
                            Events e
                        LEFT JOIN
                            Joined j ON e.eventId = j.eventId
                        GROUP BY
                            e.eventId
                        HAVING
                            COUNT(j.username) < e.eventCapacity
                    )
                """
    
            # add category filtering if specified
            category = kwargs.get("category")
            if category:
                query += " AND category = %s"
                params.extend([category, ])
    
            # add filter by distance if specified (assuming miles currently)
            distance_in_miles = kwargs.get("distance")
            if distance_in_miles:
                # try to retrieve user location
                user_query = "SELECT userCoordinates FROM Users WHERE username = %s;"
                user_params = [host_username, ]
                coord_set_results = db_controller.select(user_query, user_params)
                print(coord_set_results)
                coord_set_code = coord_set_results.get("status_code")
                coord_set_response = coord_set_results.get("response")
    
                if coord_set_code == 200:
                    # if nothing was selected, the coordinates were not set
                    user_coords = coord_set_response[0].get("usercoordinates")
                    print(type(user_coords), user_coords)
                    if not user_coords:
                        response.status = 400
                        return json.dumps({"events": [], "error": "User location not set"})
                else:
                    response.status = coord_set_code
                    messages = {
                        400: {"events": [], "error": "Malformed syntax or invalid data values/ types sent"},
                        500: {"events": [], "error": f"Unidentified Error: {coord_set_response}"}
                    }
                    return json.dumps(messages[coord_set_code])
                
                # modify query once user coords are confirmed
                query += """
                    AND ST_DWithin(
                        eventCoordinates,
                        %s::geography,
                        %s * 1609.34  -- Convert miles to meters
                    )
                """
                params.extend([user_coords, distance_in_miles])
    
            # finish off query by ordering events
            if search_type == "host":
                query += """
                    ORDER BY 
                        CASE
                            WHEN host = %s THEN 1
                            WHEN LOWER(host) like LOWER(%s) THEN 2
                            WHEN LOWER(host) like LOWER(%s) THEN 3
                            ELSE 4
                        END;
                """
                params.extend([search, f"{search}%", f"%{search}%",])
            elif search_type == "event":
                query += """
                    order by 
                        case
                            when LOWER(eventTitle) = LOWER(%s) then 1
                            when LOWER(eventTitle) like LOWER(%s) then 2
                            WHEN LOWER(eventTitle) like LOWER(%s) THEN 3
                            else 4
                        end;
                """
                params.extend([search, f"{search}%", f"%{search}%",])

        # execute query
        results = db_controller.select(query, params)
        response.status = results.get("status_code")
        if results.get("status_code") == 200:
            response_dict = {
                "events": results.get("response"),
                "error": None
            }
            print(response_dict)
        elif results.get("status_code") == 400:
            response_dict = {
                "event_data": [],
                "error": "Malformed syntax or invalid data values/ types sent"
            }
        elif results.get("status_code") == 500:
            response_dict = {
                "events": [],
                "error": f"Unidentified Error: {results.get('response')}"
            }
        
        return json.dumps(response_dict, cls=DateTimeEncoder)
    
    @expose('json')
    def post(self):
        """
        Create a new event with specified parameters, assuming authorization is provided

        Example HTTP Request
        POST request to localhost:8080/events
        with headers
        {
            "Content-Type": "json"
            "Authorization": <token>
        }
        and JSON body
        {
            "eventTitle": "test",
            "eventDescription": "test",
            "dateTime": "test",
            "eventAddress": "test",
            "event_cap": "test",
            "category": "test"
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
        
        raw_data = request.body
        data = json.loads(raw_data.decode('utf-8'))

        # eventId is automatically incremented
        query = """
            INSERT INTO Events (eventTitle, host, eventDescription, dateTime, eventCapacity, category)
            VALUES (%s, %s, %s, %s, %s, ST_MakePoint(%s, %s)::point, %s, %s);
        """

        params = (
            data.get("eventTitle"),
            host_username,
            data.get("eventDescription"),
            data.get("dateTime"),
            data.get("eventCapacity"),
            data.get("category"),
        )
        print(params)
        # process address into long_lat
        address = data.get("eventAddress")
        print(address)
        if address:
            coordinates = get_lat_long(address)
            print(coordinates)
            if not coordinates:
                response.status = 400
                return json.dumps(
                    {
                        "updated_user": None,
                        "error": "Could not convert address to valid longitude/latitude"
                    }
                )
            longitude, latitude = coordinates
            # overwrite query and params
            query = """
                INSERT INTO Events (eventTitle, host, eventDescription, dateTime, eventAddress, eventCoordinates, eventCapacity, category)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
            """

            params = (
                data.get("eventTitle"),
                host_username,
                data.get("eventDescription"),
                data.get("dateTime"),
                data.get("eventAddress"),
                f"SRID=4326;POINT({longitude} {latitude})",
                data.get("eventCapacity"),
                data.get("category"),
            )
            print(params)

        results = db_controller.insert(query, params, "eventId")
        response.status = results.get("status_code")
        inserted_records = results.get("inserted")
        event_id = inserted_records.get("eventid") if inserted_records else None

        messages = {
            201: {"created_event": event_id, "error": None},
            400: {"created_event": None, "error": "Malformed syntax or invalid data values/ types sent"},
            409: {"created_event": None, "error": "Unique violation when inserting event"},
            500: {"created_event": None, "error": f"Unidentified Error: {results.get('response')}"}
        }
        print(results.get("response"))
        return json.dumps(messages[results.get("status_code")])

    @expose('json')
    def put(self):
        """modify event with specified parameters"""
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
        
        # retrieve changed event data
        raw_data = request.body
        data = json.loads(raw_data.decode('utf-8'))

        # check that logged in user is hosting the event
        query = "SELECT * FROM Events WHERE eventId = %s AND host = %s"
        params = (data.get("eventId"), host_username)
        owner_results = db_controller.select(query, params)
        owner_code = owner_results.get("status_code")
        if owner_code == 200:
            # if nothing was selected, the user doesn't own the event
            if not owner_results.get("response"):
                response.status = 403
                return json.dumps({"updated_event": None, "error": "User must be event host to modify event"})
        else:
            response.status = owner_code
            messages = {
                400: {"updated_event": None, "error": "Malformed syntax or invalid data values/ types sent"},
                500: {"updated_event": None, "error": f"Unidentified Error: {owner_results.get('response')}"}
            }
            return json.dumps(messages[owner_code])

        #TODO: What if the event capacity is changed to less than the people currently registered
        
        # set base query and params
        query = """
            UPDATE Events
            SET eventTitle = %s, eventDescription = %s, dateTime = %s, eventCapacity = %s, category = %s
        """
        params = (
            data.get("eventTitle"),
            data.get("eventDescription"),
            data.get("dateTime"),
            data.get("eventCapacity"),
            data.get("category"),
        )

        # handle location setting
        address = data.get("eventAddress")
        if address:
            coordinates = get_lat_long(address)
            if not coordinates:
                response.status = 400
                return json.dumps(
                    {
                        "updated_event": None,
                        "error": "Could not convert address to valid longitude/ latitude"
                    }
                )
            longitude, latitude = coordinates

            # update query with address and long,lat
            query += """
                , eventAddress = %s, 
                eventCoordinates = %s
            """
            additional_params = (data.get("eventAddress"), f"SRID=4326;POINT({longitude} {latitude})",)
            params = params + additional_params
        
        # Finish query with WHERE statement
        query += " WHERE eventId = %s;"
        params = params + (data.get("eventId"),)

        results = db_controller.update(query, params)
        response.status = results.get("status_code")

        # if success, send announcement that event has changed to all users
        if results.get("status_code") == 200:
            result_dict = create_and_send_announcement(db_controller, data.get("eventId"), "An event you are attending has been updated")
            response_code, response_json = result_dict["response_code"], result_dict["response_json"]
            # shouldn't raise the error since updating the event was a success, print an error to raise issue
            if response_code != 201:
                print(f"ERROR: Problem with sending announcements\nResponse code: {response_code}\nResponse: {response_json}")

        messages = {
            200: {"updated_event": data.get("eventId"), "error": None},
            400: {"updated_event": None, "error": "Malformed syntax or invalid data values/ types sent"},
            409: {"updated_event": None, "error": "Unique key violation"},
            404: {"updated_event": None, "error": "Event not found"},
            500: {"updated_event": None, "error": f"Unidentified Error: {results.get('response')}"}
        }

        return json.dumps(messages[results.get("status_code")])
    
    @expose('json')
    def delete(self, eventId):
        """delete event"""
          
        # check auth
        auth_response = auth_check(request)
        if auth_response.get("response_code") == 200:
            # successful auth -> identify username
            host_username = auth_response.get("response_message")
        else:
            # failed auth -> return error
            response.status = auth_response.get("response_code")
            return auth_response.get("response_message")
        
        # check that logged in user is hosting the event
        query = "SELECT * FROM Events WHERE eventId = %s AND host = %s"
        params = (eventId, host_username)
        owner_results = db_controller.select(query, params)
        owner_code = owner_results.get("status_code")
        if owner_code == 200:
            # if nothing was selected, the user doesn't own the event
            if not owner_results.get("response"):
                response.status = 403
                return json.dumps({"username": None, "event_id": None, "error": "User must be event host to delete event or event doesnt exist"})
        else:
            response.status = owner_code
            messages = {
                400: {"username": None, "event_id": None, "error": "Malformed syntax or invalid data values/ types sent"},
                500: {"username": None, "event_id": None, "error": f"Unidentified Error: {owner_results.get('response')}"}
            }
            return json.dumps(messages[owner_code])
        
        # Send announcement that event has been deleted to all users before deleting event
        # due to cascading reasons
        result_dict = create_and_send_announcement(db_controller, eventId, "An event you are attending has been deleted. NOTE: This is sent out before the event is deleted so if there is an issue with deleting the event, you may have received this notification in error!", True)
        response_code, response_json = result_dict["response_code"], result_dict["response_json"]
        # shouldn't raise the error since deleting the event was a success, print an error to raise issue
        if response_code != 201:
            print(f"ERROR: Problem with sending announcements\nResponse code: {response_code}\nResponse: {response_json}")

        # delete event after verifying ownership
        query = "DELETE FROM Events WHERE eventId = %s"
        params = (eventId, )

        results = db_controller.delete(query, params)
        response.status = results.get("status_code")
                
        messages = {
            204: {"event_id": eventId, "error": None},
            400: {"username": None, "event_id": None, "error": "Malformed syntax or invalid data values/ types sent"},
            404: {"username": None, "event_id": None, "error": "No such event exists"},
            500: {"username": None, "event_id": None, "error": f"Unidentified Error: {results.get('response')}"}
        }

        return json.dumps(messages[results.get("status_code")])
