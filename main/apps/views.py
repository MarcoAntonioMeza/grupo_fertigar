from django.views.generic.base import TemplateView


class AppsView(TemplateView):
    pass

# Calendar
calendar_view = AppsView.as_view(template_name="apps/calendar.html")

#Email
inbox_view = AppsView.as_view(template_name="apps/email/inbox.html")
mail_read_view = AppsView.as_view(template_name="apps/email/read-mail.html")
compose_view = AppsView.as_view(template_name="apps/email/compose.html") 

#Member
member_view = AppsView.as_view(template_name="apps/member.html")





