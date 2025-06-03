from django.urls import path
from .views import (
   login_view,
   register_view,
   recoverpw_view,
   lock_screen_view,
   logout_view,
   confirm_mail_view,
   error_404_view,
   error_404_alt_view,
   error_500_view,
   starter_view,
   timeline_view,
   profile_view,
   aboutus_view,
   contactus_view,
   faqs_view,
   pricing_view,
   maintenance_view,
   coming_soon_view,
   invoice_view
   )   


urlpatterns = [

   #Auth pages
   path("login", view=login_view, name="login"),
   path("register", view=register_view, name="register"),
   path("recoverpw", view=recoverpw_view, name="recoverpw"),
   path("lock-screen", view=lock_screen_view, name="lock-screen"),
   path("logout", view=logout_view, name="logout"),
   path("confirm-mail", view=confirm_mail_view, name="confirm-mail"),
   path("error-404", view=error_404_view, name="error-404"),
   path("error-404-alt", view=error_404_alt_view, name="error-404-alt"),
   path("error-500", view=error_500_view, name="error-500"),


   #Extra pages 
   path("starter", view=starter_view, name="starter"),
   path("timeline", view=timeline_view, name="timeline"),
   path("profile", view=profile_view, name="profile"),
   path("about-us", view=aboutus_view, name="about-us"),
   path("contact-us", view=contactus_view, name="contact-us"),
   path("faqs", view=faqs_view, name="faqs"),
   path("pricing", view=pricing_view, name="pricing"),
   path("maintenance", view=maintenance_view, name="maintenance"),
   path("coming-soon", view=coming_soon_view, name="coming-soon"),
   path("invoice", view=invoice_view, name="invoice")
   

]