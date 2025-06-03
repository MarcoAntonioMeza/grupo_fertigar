from django.urls import path
#from apps.views import calendar_view,inbox_view,mail_read_view,compose_view,member_view
from .views import calendar_view, inbox_view, mail_read_view, compose_view, member_view

urlpatterns = [
    # Calaendar
    path("calendar", view=calendar_view, name="calendar"),

    #Email
    path("inbox", view=inbox_view, name="inbox"),
    path("read-mail", view=mail_read_view, name="read-mail"),
    path("compose", view=compose_view, name="compose"),

    #Member
    path("member", view=member_view, name="member"),

]