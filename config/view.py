from django.shortcuts import render,redirect
from django.views.generic.base import TemplateView     
from django.contrib import messages


from main.adminv2.forms.login import LoginForm
from django.contrib.auth import authenticate, login,logout


class DashboardView(TemplateView):
     pass
index_view = DashboardView.as_view(template_name="index.html")

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
    return redirect('login')