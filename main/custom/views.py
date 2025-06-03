from django.views.generic.base import TemplateView


class CustomView(TemplateView):
    pass

#Auth page
login_view = CustomView.as_view(template_name="custom/auth-pages/login.html")
register_view = CustomView.as_view(template_name="custom/auth-pages/register.html")
recoverpw_view = CustomView.as_view(template_name="custom/auth-pages/recoverpw.html")
lock_screen_view = CustomView.as_view(template_name="custom/auth-pages/lock-screen.html")
logout_view = CustomView.as_view(template_name="custom/auth-pages/logout.html")
confirm_mail_view = CustomView.as_view(template_name="custom/auth-pages/confirm-mail.html")
error_404_view = CustomView.as_view(template_name="custom/auth-pages/error-404.html")
error_404_alt_view = CustomView.as_view(template_name="custom/auth-pages/error-404-alt.html")
error_500_view = CustomView.as_view(template_name="custom/auth-pages/error-500.html")

#Extra page
starter_view = CustomView.as_view(template_name="custom/extra-page/starter.html")
timeline_view = CustomView.as_view(template_name="custom/extra-page/timeline.html")
profile_view = CustomView.as_view(template_name="custom/extra-page/profile.html")
aboutus_view = CustomView.as_view(template_name="custom/extra-page/about-us.html")
contactus_view = CustomView.as_view(template_name="custom/extra-page/contact-us.html")
faqs_view = CustomView.as_view(template_name="custom/extra-page/faqs.html")
pricing_view = CustomView.as_view(template_name="custom/extra-page/pricing.html")
maintenance_view = CustomView.as_view(template_name="custom/extra-page/maintenance.html")
coming_soon_view = CustomView.as_view(template_name="custom/extra-page/coming-soon.html")
invoice_view = CustomView.as_view(template_name="custom/extra-page/invoice.html")
