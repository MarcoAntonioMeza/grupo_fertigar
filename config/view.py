from django.shortcuts import render,redirect
from django.views.generic.base import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin,PermissionRequiredMixin

from django.contrib import messages


from main.adminv2.forms.login import LoginForm
from django.contrib.auth import authenticate, login,logout




#from weasyprint import HTML
from django.template.loader import render_to_string
from django.http import HttpResponse
import datetime


class DashboardView(LoginRequiredMixin,TemplateView):
     pass
index_view = DashboardView.as_view(template_name="index.html")





#def boleta_pdf(request):
#    cliente = {
#        'nombre': 'Marco Antonio Meza',
#        'numero_cuenta': '1234567890',
#    }
#    fecha_emision = datetime.date.today().strftime('%d/%m/%Y')
#
#    movimientos = [
#        {'fecha': '01/03/2025', 'descripcion': 'Pago en tienda', 'cargo': 200.00, 'abono': 0.00, 'saldo': 1800.00},
#        {'fecha': '05/03/2025', 'descripcion': 'Transferencia recibida', 'cargo': 0.00, 'abono': 500.00, 'saldo': 2300.00},
#        {'fecha': '10/03/2025', 'descripcion': 'Pago de servicios', 'cargo': 150.00, 'abono': 0.00, 'saldo': 2150.00},
#        {'fecha': '15/03/2025', 'descripcion': 'Compra en línea', 'cargo': 320.50, 'abono': 0.00, 'saldo': 1829.50},
#        {'fecha': '20/03/2025', 'descripcion': 'Depósito en ventanilla', 'cargo': 0.00, 'abono': 700.00, 'saldo': 2529.50},
#    ]
#    
#    
#
#    logo_url = request.build_absolute_uri('/static/images/logo-dark.png')
#
#    html_string = render_to_string('boleta.html', {
#        'logo_url': logo_url,
#        'cliente': cliente,
#        'fecha_emision': fecha_emision,
#        'movimientos': movimientos,
#    })
#
#    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri('/')).write_pdf()
#
#    response = HttpResponse(pdf_file, content_type='application/pdf')
#    response['Content-Disposition'] = 'inline; filename="boleta.pdf"'
#    return response


#==================================================================
#                            LOGIN
#==================================================================
def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)
            if user is not None:
                # Verifica si "Remember me" está marcado
                remember_me = request.POST.get('remember_me', False)
                if remember_me:
                    # Si está marcado, cambia la duración de la sesión a 1 año
                    request.session.set_expiry(31536000)  # 60 * 60 * 24 * 365 días
                else:
                    # Si no está marcado, la sesión se eliminará cuando se cierre el navegador
                    request.session.set_expiry(0)
                    
                login(request, user)
                return redirect('index')  # Redirige a la página principal después del login
            else:
                messages.error(request, "Usuario o contraseña incorrectos")
        else:
            messages.error(request, "Por favor, corrige los errores en el formulario.")
    else:
        form = LoginForm()

    return render(request, 'user/login/login.html', {'form': form})

def logout_view(request):
    logout(request)
    return render(request, 'user/login/logout.html')
    



