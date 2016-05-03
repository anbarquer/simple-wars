# -*- encoding: utf-8 -*-
# Antonio Diego Barquero Cuadrado - TFG - UEX - 2014/2015
# views.py
# Vistas de la aplicación


from django.shortcuts import render
from simplewars.forms import *
from django.contrib.auth import authenticate, login
from util import *
from django.contrib.auth.decorators import login_required
from typification import APP_VIEWS
from django.shortcuts import redirect
from models import Unit
from django.http import JsonResponse
from django.core.urlresolvers import reverse_lazy
from simplewars.simulation import simulation
from django.contrib.admin.views.decorators import staff_member_required


# -----------------------------------------------------------------------------------------------------------
# Identificación del usuario
def user_login(request):
    form = LoginForm(request.POST or None)
    error = ''
    activate = ''

    if request.method == 'GET':
        if request.user.is_authenticated():  # El usuario está identificado, se redirige a la zona de usuario
            return redirect(reverse_lazy('dashboard'))
    else:
        if request.method == 'POST':
            if form.is_valid():
                username = form.cleaned_data['username']
                password = form.cleaned_data['password']
                user = authenticate(username=username, password=password)
                if user is not None:
                    if user.is_active:  # El usuario está activo
                        login(request, user)
                        return redirect(reverse_lazy('dashboard'))
                    elif request.POST.__contains__(
                            'activate'):  # El usuario desea activar su cuenta mediante un campo oculto en la vista
                        activate_user(user)
                        login(request, user)
                        return redirect(reverse_lazy('dashboard'))
                    else:  # El usuario está inactivo, se muestra la opcion de reactivar cuenta
                        error = ERRORS['user_inactive']
                        activate = 'activate'
                else:
                    error = check_username_pass(user, password)
            else:  # Los datos del formulario no tienen el formato adecuado
                error = ERRORS['bad_form_data']

    return render(request, APP_VIEWS['login'], {'form': form, 'error': error, 'activate': activate})


# -----------------------------------------------------------------------------------------------------------
# Registro del usuario
def register(request):
    form = RegisterForm(request.POST or None)
    error = ''

    if request.method == 'GET':
        if request.user.is_authenticated():  # El usuario está identificado, se redirige a la zona de usuario
            return redirect(reverse_lazy('dashboard'))
    else:
        if request.method == 'POST':
            if form.is_valid():
                username = form.cleaned_data['username']
                password = form.cleaned_data['password']
                confirm_password = form.cleaned_data['confirm_password']
                email = form.cleaned_data['email']
                if password == confirm_password:
                    try:  # Se guarda el usuario en el sistema
                        new_user(username, password, email)
                        return redirect(reverse_lazy('login'))
                    except Exception:  # La excepción indica que el usuario ya se encuentra registrado
                        error = ERRORS['user_registered']
                else:  # La contraseña no se introdujo correctamente
                    error = ERRORS['pass_mismatch']
            else:  # Los datos del formulario no tienen el formato adecuado
                error = ERRORS['bad_form_data']

    return render(request, APP_VIEWS['register'], {'form': form, 'error': error})


# -----------------------------------------------------------------------------------------------------------
# En caso de acceder a la raíz del sitio se redirige a dónde corresponda
def index(request):
    if request.user.is_authenticated():  # El usuario está identificado
        return redirect(reverse_lazy('dashboard'))
    else:  # El usuario no está identificado
        return redirect(reverse_lazy('login'))


# -----------------------------------------------------------------------------------------------------------

# Salida del usuario, se redirige al método anterior el cual se encarga de redirigir al usuario
@login_required(login_url=reverse_lazy('login'))
def user_logout(request):
    logout(request)
    return redirect(reverse_lazy('index'))


# -----------------------------------------------------------------------------------------------------------
# Panel de control del usuario
@login_required(login_url=reverse_lazy('login'))
def dashboard(request):
    try:
        # Se intenta obtener una instancia del usuario del juego
        user = get_user(request)
        # Se muestran los 5 primeros usuarios ordenados por victorias
        users = GameUser.objects.all().values('wins', 'loses', 'user__username').order_by('-wins')[:5]
        return render(request, APP_VIEWS['dashboard'], {'game_user': user, 'users': users})
    except:
        # Pueden darse dos errores:
        # - 1): El usuario es administrador y no posee cuenta en el jueg
        # - 2): El usuario no está registrado
        # En ambos casos de realiza el logout del usuario y se envía a la vista de login
        return user_logout(request)


# -----------------------------------------------------------------------------------------------------------
# Creador de mapas. Sólo accesible para usuarios administradores
@staff_member_required
def map_creator(request):
    map_form = MapForm(request.POST or None)
    if request.method == 'POST' and request.is_ajax():
        result_dict = save_map(request)
        return JsonResponse(result_dict)

    return render(request, APP_VIEWS['map_creator'], {'map_form': map_form})


# -----------------------------------------------------------------------------------------------------------
# Información del usuario. Muestra y/o modifica los datos asociados
@login_required(login_url=reverse_lazy('login'))
def user_settings(request):
    user_form = ChangeUserForm(request.POST or None)
    email_form = ChangeEmailForm(request.POST or None)
    pass_form = ChangePassForm(request.POST or None)
    result_dict = {}

    if request.method == 'POST':
        user = User.objects.get(username=request.user)
        if request.is_ajax():
            if user_form.is_valid():  # El nombre de usuario se desea cambiar
                result_dict = change_username(user_form, user)
            elif email_form.is_valid():  # El email de usuario se desea cambiar
                result_dict = change_email(email_form, user)
            return JsonResponse(result_dict)
        else:
            change_password(pass_form, user)  # Cambio de contraseña
            deactivate_user(request, user)  # Desactivar usuario
            delete_user(request, user)  # Eliminar usuario
            return redirect(reverse_lazy('login'))

    return render(request, APP_VIEWS['user_settings'],
                  {'user_form': user_form, 'email_form': email_form, 'pass_form': pass_form})


# -----------------------------------------------------------------------------------------------------------
# Gestión del reclutamiento
@login_required(login_url=reverse_lazy('login'))
def army(request):
    form = RecruitForm(request.POST or None)
    user = get_user(request)
    units = get_units(user)

    if request.method == 'POST' and request.is_ajax():
        units_ids = request.POST.getlist('data[]')
        if not units_ids == []:  # El usuario desea eliminar unidades de su ejécito
            result_dict = delete_units(units_ids, request)
        else:  # El usuario desea reclutar unidades
            result_dict = recruit_units(request)
        return JsonResponse(result_dict)

    return render(request, APP_VIEWS['army'],
                  {'user_credits': user.credits, 'form': form, 'melee': units[0], 'distance': units[1],
                   'defense': units[2]})


# -----------------------------------------------------------------------------------------------------------
# Gestión de la unidad. Sólo se muestra la vista de la unidad en los casos descritos
@login_required(login_url=reverse_lazy('login'))
def unit(request, unit_id):
    user_credits = get_credits(request)
    try:
        mod_unit = Unit.objects.get(pk=unit_id)
    except Exception:  # En caso de acceder a una unidad que no exista se redirige al panel de inicio del usuario
        return redirect(reverse_lazy('dashboard'))

    if request.is_ajax():  # Sólo se retornan resultados si la petición es AJAX
        if request.method == 'GET':  # Se obtiene al vista de la unidad con los datos insertados
            return render(request, APP_VIEWS['unit'], {'unit': mod_unit, 'user_credits': user_credits})
        elif request.method == 'POST':  # Se actualiza la unidad
            result_dict = upgrade_unit(request, mod_unit)
            return JsonResponse(result_dict)
    else:
        return redirect(reverse_lazy('dashboard'))


# -----------------------------------------------------------------------------------------------------------
# Gestión de formaciones creadas
@login_required(login_url=reverse_lazy('login'))
def list_formation(request):
    user = get_user(request)
    # Obtiene el nombre, el mapa y la cantidad total de unidades agrupadas por formación
    formations = FormationNames.objects.filter(user=user)

    if request.method == 'POST' and request.is_ajax():
        action = request.POST.get('action')
        if action == 'load':  # Cargar formación
            result_dict = get_formation(request)
        elif action == 'delete':  # Borrar formación
            result_dict = delete_formation(request)
        elif action == 'modify':  # Modificar formación
            result_dict = mod_formation(request)
        elif action == 'get_map':  # Cargar el mapa que corresponde en caso de necesitarlo
            result_dict = get_map(request)
        return JsonResponse(result_dict)

    return render(request, APP_VIEWS['list_formation'], {'formations': formations, 'user_credits': user.credits})


# -----------------------------------------------------------------------------------------------------------
# Creación de formaciones
@login_required(login_url=reverse_lazy('login'))
def create_formation(request):
    formation_form = FormationForm(request.POST or None)
    units = get_units(get_user(request))
    maps = MapNames.objects.all().values('map_name')

    if request.method == 'POST' and request.is_ajax():
        if request.POST.get('map') is not None:  # Se ha recibido una petición de mapa
            result_dict = get_map(request)
        else:  # Se desea guardar la formación
            result_dict = save_formation(request)
        return JsonResponse(result_dict)

    return render(request, APP_VIEWS['create_formation'], {'melee': units[0], 'distance': units[1],
                                                           'defense': units[2], 'form': formation_form,
                                                           'maps': maps})


# -----------------------------------------------------------------------------------------------------------
# Batallas
@login_required(login_url=reverse_lazy('login'))
def battle(request):
    user = get_user(request)
    # Obtiene el nombre, el mapa y la cantidad total de unidades agrupadas por formación
    formations = FormationNames.objects.filter(user=user)

    if request.is_ajax():
        if request.method == 'POST':
            json_map = simulation(request, user)  # Simulación del combate
            return JsonResponse(json_map)
        elif request.method == 'GET':
            return JsonResponse(get_map_list())  # Listado de mapas disponible

    return render(request, APP_VIEWS['battle'], {'formations': formations})

# -----------------------------------------------------------------------------------------------------------