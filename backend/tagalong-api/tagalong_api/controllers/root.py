# -*- coding: utf-8 -*-
"""Main Controller"""

from tagalong_api.lib.base import BaseController
from tagalong_api.controllers.error import ErrorController
from tagalong_api.controllers.users import UsersRestController
from tagalong_api.controllers.session import SessionRestController
from tagalong_api.controllers.events import EventsRestController
from tagalong_api.controllers.participation import ParticipationRestController
from tagalong_api.controllers.pic import PicRestController

from tagalong_api.controllers.relationships import RelationshipsRestController
from tagalong_api.controllers.announcements import AnnouncementsRestController



__all__ = ['RootController']


class RootController(BaseController):
    """
    The root controller for the tagalong application.

    All the other controllers and WSGI applications should be mounted on this
    controller. For example::

        panel = ControlPanelController()
        another_app = AnotherWSGIApplication()

    Keep in mind that WSGI applications shouldn't be mounted directly: They
    must be wrapped around with :class:`tg.controllers.WSGIAppController`.

    """

    error = ErrorController()
    users = UsersRestController()
    session = SessionRestController()
    events = EventsRestController()
    relationships = RelationshipsRestController()
    participation = ParticipationRestController()
    announcements = AnnouncementsRestController()
