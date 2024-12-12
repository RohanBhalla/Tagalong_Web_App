from tagalong_api.helpers.testSendGridEmail import sendEmail

def send_announcement_emails(db_controller, announcementId):
    query = """
        SELECT Users.email
        FROM Users
        JOIN SentAnnouncements ON Users.username = SentAnnouncements.username
        WHERE SentAnnouncements.announcementId = %s;
    """
    params = [announcementId, ]

    results = db_controller.select(query, params)

    if results.get("status_code") != 200:
        raise Exception(results.get("response"))
    
    emails = results.get("response")

    for email_response in emails:
        sendEmail(email_response[0], "Announcement regarding an event you are attending", "There has been an announcement or change to your event. Please check the application to see further details.")

def create_and_send_announcement(db_controller, eventId, aContent, deleted=False):
    """
    Creates announcement and sends to all users that are currently attending an event
    Assumes logged in user has already be authorized as owning the event
    Returns a dictionary with two keys: response_code, response_json (as a dict, still needs to do json.dumps)
    """
    # create announcement
    query = """
        INSERT INTO Announcements(eventId, aContent)
        VALUES (
            %s, %s
        )
    """
    params = (eventId if not deleted else None, aContent)
    print(params)

    announcement_results = db_controller.insert(query, params, "announcementId")
    announcement_code = announcement_results.get("status_code")
    inserted_records = announcement_results.get("inserted")
    announcement_id = inserted_records.get("announcementid") if inserted_records else None

    messages = {
        400: {"announcementId": None, "error": "Error Creating Announcements: Malformed syntax or invalid data values/ types sent"},
        409: {"announcementId": None, "error": "Error Creating Announcements: Unique violation when inserting event"},
        500: {"announcementId": None, "error": f"Error Creating Announcements: Unidentified Error: {announcement_results.get('response')}"}
    }
    if announcement_code != 201:
        return {
            "response_code": announcement_code,
            "response_json": messages[announcement_code]
        }

    # create sent_announcements for all users attending
    query = """
        INSERT INTO SentAnnouncements (username, announcementId)
        SELECT username, %s
        FROM Joined
        WHERE eventId = %s;
    """
    params = (announcement_id, eventId)

    sent_results = db_controller.insert(query, params)
    sent_code = sent_results.get("status_code")

    # send emails if success (commented out currently)
    # if sent_code == 201:
    #     send_announcement_emails(db_controller, announcement_id)
    
    messages = {
        201: {"announcementId": announcement_id, "error": None},
        400: {"announcementId": None, "error": "Error Sending Announcements: Malformed syntax or invalid data values/ types sent"},
        409: {"announcementId": None, "error": "Error Sending Announcements: Unique violation when inserting event"},
        500: {"announcementId": None, "error": f"Error Sending Announcements: Unidentified Error: {sent_results.get('response')}"}
    }

    return {
        "response_code": announcement_code,
        "response_json": messages[sent_code]
    }