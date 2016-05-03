# -*- encoding: utf-8 -*-
# Antonio Diego Barquero Cuadrado - TFG - UEX - 2014/2015
# util.py
# Funciones auxiliares para las vistas de la aplicación


import json
from django.contrib.auth.models import User
from django.core.mail import send_mail
from typification import *
from django.contrib.auth import logout
from simplewars.models import GameUser, Unit, Formation, Map, Coordinates, FormationNames, MapNames
from django.db import transaction
from django.conf import settings as djangoSettings


# -----------------------------------------------------------------------------------------------------------
# **************************************** Gestión del usuario **********************************************
# -----------------------------------------------------------------------------------------------------------
# Comprueba las credenciales del usuario al identificarse
# - user: usuario. Instancia de User
# - password: contraseña
def check_username_pass(user, password):
    message = ''
    try:
        if not User.check_password(user.username, password):  # La contraseña es incorrecta
            message = ERRORS['wrong_pass']
    except Exception:
        message = ERRORS['wrong_username']  # El nombre de usuario es incorrecto

    return message


# -----------------------------------------------------------------------------------------------------------
# Cambia el nombre del usuario
# - form: formulario de cambio de nombre de usuario
# - user: usuario. Instancia de User
def change_username(form, user):
    result_dict = {}
    try:
        new_username = form.cleaned_data['username']
        user.username = new_username
        user.save()
    except Exception:  # El nombre de usuario ya se encuentra
        result_dict['error'] = ERRORS['user_registered']

    return result_dict


# -----------------------------------------------------------------------------------------------------------
# Cambia el email
# - form: formulario de cambio de email
# - user: usuario. Instancia de User
def change_email(form, user):
    result_dict = {}
    try:
        new_email = form.cleaned_data['email']
        user.email = new_email
        user.save()
    except Exception:  # Los datos que se han proporcionado no son correctos
        result_dict['error'] = ERRORS['bad_form_data']

    return result_dict


# -----------------------------------------------------------------------------------------------------------
# Cambia la contraseña
# - form: formulario de cambio de contraseña
# - user: usuario. Instancia de User
def change_password(form, user):
    if form.is_valid():
        password = form.cleaned_data['password']
        confirm_password = form.cleaned_data['confirm_password']
        if password == confirm_password:
            try:
                user.set_password(password)
                user.save()
            except Exception:
                pass


# -----------------------------------------------------------------------------------------------------------
# Desactiva la cuenta del usuario. No elimina los datos asociados
# - request: petición. Para que sea efectiva la desactivación del usuario debe contener la cadena 'deactivate'
# - user: usuario. Instancia de User
def deactivate_user(request, user):
    if request.POST.__contains__('deactivate'):
        user.is_active = False
        user.save()
        # Manda un email informando de la acción
        send_mail('Simple Wars', EMAIL_MESSAGES['user_inactive'], 'simplewarsuex@gmail.com', [user.email])
        logout(request)


# -----------------------------------------------------------------------------------------------------------
# Activa la cuenta del usuario
# - user: usuario. Instancia de User
def activate_user(user):
    user.is_active = True
    user.save()
    # Manda un email informando de la acción
    send_mail('Simple Wars', EMAIL_MESSAGES['user_active'], 'simplewarsuex@gmail.com', [user.email])


# -----------------------------------------------------------------------------------------------------------
# Elimina la cuenta del usaurio. Borra todos los datos asociados
# - request: petición.
# - user: usuario. Instancia de User
def delete_user(request, user):
    try:
        if request.POST.__contains__('delete'):
            deleted = User.objects.get(pk=user.pk)
            deleted.delete()
            # Manda un correo electrónico informando de la acción
            send_mail('Simple Wars', EMAIL_MESSAGES['user_delete'], 'simplewarsuex@gmail.com', [user.email])
    except Exception:
        pass  # Ha ocurrido un error de BD al eliminar el usuario


# -----------------------------------------------------------------------------------------------------------
# Crea un nuevo usuario
# - username: nombre de usuario
# - password: contraseña
# - email: correo electrónico
def new_user(username, password, email):
    try:
        user = User.objects.create_user(username, email, password)
        user.save()
        game_user = GameUser.objects.create(user=user)
        game_user.save()
        # Manda un correo electrónico informando de la acción
        send_mail('Simple Wars', EMAIL_MESSAGES['user_registered'], 'simplewarsuex@gmail.com', [email])
    except Exception:
        pass  # Ha ocurrido un error de BD al crear el usuario


# -----------------------------------------------------------------------------------------------------------
# Retorna los créditos asociados al usuario
# - request: petición
def get_credits(request):
    return GameUser.objects.get(user=request.user).credits


# -----------------------------------------------------------------------------------------------------------
# Retorna el usuario GameUser asociado a una instancia de User
# - request: petición
def get_user(request):
    return GameUser.objects.get(user=request.user.id)


# -----------------------------------------------------------------------------------------------------------
# Gestión de unidades
# Guarda en la base de datos las unidades
# - total_units: número total de unidades
# - user: usuario. Instancia de GameUser
# - values: valores de los atributos de la unidad
# Retorna en una lista los identificadores de las nuevas unidades creadas
def save_units(total_units, user, values):
    id_list = []
    for i in range(total_units):
        unit = Unit.objects.create(user=user, life=values[0], attack=values[1], scope=values[2], defense=values[3],
                                   type=values[4])
        unit.save()
        id_list.append(unit.id)

    return id_list


# -----------------------------------------------------------------------------------------------------------
# **************************************** Gestión de unidades **********************************************
# -----------------------------------------------------------------------------------------------------------
# Reclutamiento de unidades
# request: petición
def recruit_units(request):
    # En la petición recibida por POST existen 3 valores distintos:
    # - melee: número de unidades cuerpo a cuerpo
    # - defense: número de unidades defensivas
    # - distance: número de unidades de ataque a distancia
    melee = int(request.POST['data[melee]'])
    defense = int(request.POST['data[defense]'])
    distance = int(request.POST['data[distance]'])
    # Se suman todos los valores para comprobar que en efecto se puede realizar la acción
    total_cost = melee + distance + defense
    result_dict = {}

    try:
        user = GameUser.objects.get(user=request.user)
        if total_cost > MAX_RECRUIT_REQUEST:  # La petición excede el máximo de unidades
            result_dict['error'] = ERRORS['max_recruit_exceed']
        elif user.credits < total_cost:  # El usuario no tiene los suficientes créditos para reclutar a las unidades
            result_dict['error'] = ERRORS['insufficient_credits']
        else:
            with transaction.atomic():
                # Cada una de las listas anteriores contiene los identificadores de las nuevas unidades creadas
                # Cada una de las filas de la tabla de unidades de la vista debe contener
                # el identificador para realizar peticiones de modificación de la unidad
                melee_ids = save_units(melee, user, MELEE_DEFAULT_VALUES)
                defense_ids = save_units(defense, user, DEFENSE_DEFAULT_VALUES)
                distance_ids = save_units(distance, user, DISTANCE_DEFAULT_VALUES)

                user.subtract_credits(total_cost)
                user.units_created += total_cost
                user.save()

            result_dict = {'melee_id': melee_ids, 'distance_id': distance_ids, 'defense_id': defense_ids,
                           'credits': user.credits}
    except Exception:  # Si ocurre algún error en la transacción se informa al usuario
        result_dict['error'] = ERRORS['recruit_units']
    return result_dict


# -----------------------------------------------------------------------------------------------------------
# Retorna el coste total de la mejora de la unidad
# - values: lista de valores mejorados
# - actual: lista de valores actuales
def upgrade_cost(values, actual):
    # Se recorre la lista de valores actuales y modificados restando su contenido
    # Esto indicará cuánto ha subido el atributo y se sumará al coste. Para evitar
    # problemas de signo se realiza la operación en valor absoluto
    cost = 0
    for i in range(values.__len__()):
        if values[i] > 0:
            cost += abs(values[i] - actual[i])

    return cost


# -----------------------------------------------------------------------------------------------------------
# Modifica los atributos de la unidad
# - request: petición
# - unit: unidad a modificar
def upgrade_unit(request, unit):
    # En la petición recibida por POST existen 4 valores.
    # - life: vida
    # - attack: ataque
    # - scope: alcance
    # - defense: defensa
    # Cada uno de ellos hace referencia al atributo actualizado
    life = int(request.POST['data[life]'])
    attack = int(request.POST['data[attack]'])
    scope = int(request.POST['data[scope]'])
    defense = int(request.POST['data[defense]'])

    user = GameUser.objects.get(user=request.user)
    cost = upgrade_cost([life, attack, scope, defense], unit.get_atts_values())
    result_dict = {}

    if cost > user.credits:  # El usuario no tiene los suficientes créditos para mejorar la unidad
        result_dict['ERROR'] = ERRORS['insufficient_credits']
    else:
        try:
            unit.update_attrs(life, attack, scope, defense)
            unit.level_up(cost)
            unit.save()
            user.subtract_credits(cost)
            user.upgrade_points += cost
            user.save()
            result_dict = {'credits': user.credits, 'id': unit.pk, 'life': unit.life, 'attack': unit.attack,
                           'scope': unit.scope, 'defense': unit.defense, 'level': unit.level, 'type': unit.type}
        except Exception:  # Ha ocurrido un error al mejorar la unidad
            result_dict['error'] = ERRORS['upgrade_unit']

    return result_dict


# -----------------------------------------------------------------------------------------------------------
# Borra unidades del usuario
# - units_ids: identificadores de las unidades a eliminar
# - request: petición
def delete_units(unit_ids, request):
    result_dict = {}
    try:
        with transaction.atomic():
            # Obtener todas las unidades que se correspondan con los identificadores y eliminarlas
            Unit.objects.filter(pk__in=unit_ids).delete()
        # Al eliminar unidades el usuario recibe un crédito por cada una sea cual sea su nivel
        user = GameUser.objects.get(user=request.user)
        user.add_credits(unit_ids.__len__())
        user.units_deleted += unit_ids.__len__()
        user.save()

        result_dict = {'credits': user.credits}

    except Exception:  # Error al eliminar las unidades
        result_dict['error'] = ERRORS['delete_units']
    return result_dict


# -----------------------------------------------------------------------------------------------------------
# Retorna en una tupla los listados de unidades por el siguiente orden:
# - 0: Cuerpo a cuerpo
# - 1: Ataque a distancia
# - 2: Defensa
def get_units(user):
    # Obtener todas las unidades del usuario que se encuentren vivas y sin formación
    all_units = Unit.objects.filter(user=user.id, in_formation=False)
    melee_units = []
    distance_units = []
    defense_units = []
    # Se filtran los resultados para realizar sólo una consulta a la base de datos
    for unit in all_units:
        if unit.type == MELEE_ID:
            melee_units.append(unit)
        elif unit.type == DISTANCE_ID:
            distance_units.append(unit)
        elif unit.type == DEFENSE_ID:
            defense_units.append(unit)

    return melee_units, distance_units, defense_units


# -----------------------------------------------------------------------------------------------------------
# **************************************** Gestión de formaciones *******************************************
# -----------------------------------------------------------------------------------------------------------
# Guardado de la formación
# - request: petición
def save_formation(request):
    # La petición contiene 3 parámetros:
    # - units: listado de unidades que van a formar parte de la formación
    # - name: nombre de la formación
    # - map_name: nombre del mapa en el que se va a usar
    units = json.loads(request.POST.get('units'))
    request_formation_name = request.POST.get('name')
    request_map_name = request.POST.get('formation_map')
    user = get_user(request)
    result_dict = {}

    try:
        find_formation = FormationNames.objects.filter(formation_name=request_formation_name, user=user)
        if find_formation.__len__() == 0:
            formation_name = FormationNames.objects.create(formation_name=request_formation_name,
                                                           formation_count=units.__len__(),
                                                           formation_map=request_map_name,
                                                           user=user)

            map_name = MapNames.objects.filter(map_name=request_map_name).first()
            if map_name.map_count / 2 >= units.__len__():
                with transaction.atomic():
                    for i in units:
                        unit = Unit.objects.get(pk=i['id'])
                        position = Map.objects.filter(position__q=i['q'], position__r=i['r']).first()
                        formation = Formation.objects.create(name=formation_name, unit=unit, position=position)
                        formation.save()
                        unit.in_formation = 1
                        unit.save()
            else:  # El número de unidades excede al máximo de la formación
                result_dict['error'] = ERRORS['formation_size']
        else:  # La formación ya se encuentra creada
            result_dict['error'] = ERRORS['formation_registered']

    except Exception:  # Ha ocurrido un error al crear la formación
        result_dict['error'] = ERRORS['bad_formation_data']

    return result_dict


# -----------------------------------------------------------------------------------------------------------
# Borrado de la formación
# - request: petición
def delete_formation(request):
    # La petición tiene un parámetro que es el nombre de la formación
    request_formation_name = request.POST.get('name')
    result_dict = {}
    user = get_user(request)

    try:
        # Se obtienen los identificadores de las unidades a través del nombre
        formation = Formation.objects.filter(name__user=user, name__formation_name=request_formation_name).values(
            'unit')
        if formation.__len__() > 0:
            with transaction.atomic():
                # Se actualizan las tuplas de las unidades relacionadas con la formación
                Unit.objects.filter(pk__in=formation).update(in_formation=0)
                # Finalmente se elimina la formación
                FormationNames.objects.filter(formation_name=request_formation_name).delete()
        else:  # La formación no existe
            result_dict['error'] = ERRORS['delete_formation']
    except Exception:  # Ha ocurrido un error de base de datos al actualizar las tuplas
        result_dict['error'] = ERRORS['bad_delete_formation']

    return result_dict


# -----------------------------------------------------------------------------------------------------------
# Obtención de la formación
# - request: petición
def get_formation(request):
    # La petición tiene un parámetro que es el nombre de la formación
    request_formation_name = request.POST.get('name')
    result_dict = {}
    user = get_user(request)
    index = 0

    try:
        # Se obtiene de las formaciones la formación con el nombre de la petición asociada al usuario
        # Sólo es necesario seleccionar las coordenadas x, y del mapa y el nivel, identificador y tipo
        # de la unidad
        formation_name = FormationNames.objects.filter(user=user, formation_name=request_formation_name)
        if formation_name.__len__() > 0:
            formation = Formation.objects.filter(name=formation_name).values(
                'unit__id', 'position__position__x', 'position__position__y', 'unit__type', 'unit__level')
            for i in formation:  # Se realiza de esta manera para que tenga el mismo formato que las listas de objetos en Javascript
                result_dict[index] = {'id': i['unit__id'], 'x': i['position__position__x'],
                                      'y': i['position__position__y'],
                                      'label': i['unit__type'], 'level': i['unit__level']}
                index += 1

        else:
            result_dict['error'] = ERRORS['delete_formation']

    except Exception:
        result_dict['error'] = ERRORS['bad_get_formation']

    return result_dict


# -----------------------------------------------------------------------------------------------------------

# Comprueba que la tupla consultada se encuentra dentro de las nuevas unidades de la formación
# En caso de no encontrar nada, se retorna una tupla con 0's
# - query: tupla de la tabla formación
# - units: listado de unidades modificadas de la formación
def is_in_formation(query, units):
    for unit in units:
        if query.unit_id == int(unit['id']):
            return int(unit['id']), int(unit['q']), int(unit['r'])
    return 0, 0, 0


# -----------------------------------------------------------------------------------------------------------
# Modificación de la formación
# - request: petición
def mod_formation(request):
    # La petición tiene 4 parámetros:
    # - units: lista de unidades
    # - name: nombre de la formación
    # - map_name: nombre del mapa
    # - total_units: las unidades que tiene actualmente la formación
    units = json.loads(request.POST.get('units'))
    request_formation_name = request.POST.get('name')
    request_map_name = request.POST.get('map_name')
    request_total_units = int(request.POST.get('total_units'))
    user = get_user(request)
    result_dict = {}

    try:
        # Se obtiene la formación asociada al usuario con el nombre de la petición
        formation = Formation.objects.filter(name__user=user, name__formation_name=request_formation_name)
        if formation.__len__() > 0:
            with transaction.atomic():
                # Se actualiza el número total de unidades de la formación
                FormationNames.objects.filter(formation_name=request_formation_name).update(
                    formation_count=request_total_units)
                for i in formation:
                    position_info = is_in_formation(i, units)
                    if position_info[0] > 0:  # Si la unidad se encuentra en la formación se actualiza su posición
                        position = Map.objects.get(position__q=position_info[1], position__r=position_info[2],
                                                   name__map_name=request_map_name)
                        Formation.objects.filter(unit_id=position_info[0]).update(position=position)
                    else:
                        # Si no se elimina de la formación
                        Unit.objects.filter(pk=i.unit_id).update(in_formation=0)
                        Formation.objects.filter(unit_id=i.unit_id).delete()
        else:  # No se ha encontrado ninguna formación con ese nombre
            result_dict['error'] = ERRORS['formation_not_found']
    except Exception as ex:  # Ha ocurrido algún error en la consulta a la base de datos
        result_dict['error'] = ERRORS['bad_formation_data']
        print type(ex)

    return result_dict


# -----------------------------------------------------------------------------------------------------------
# **************************************** Gestión de mapas *************************************************
# -----------------------------------------------------------------------------------------------------------
# Obtención de mapa
# - request: petición
def get_map(request):
    # Se obtiene el mapa a través del nombre que contiene la petición
    request_map_name = request.POST.get('map')
    result_dict = {}
    index = 0
    try:
        map = Map.objects.filter(name__map_name=request_map_name).values('position__q', 'position__r')
        if map.__len__() > 0:
            result_dict['total'] = map.__len__()
            for i in map:
                result_dict[index] = {'q': i['position__q'], 'r': i['position__r']}
                index += 1
        else:  # No existe un mapa con ese nombre
            result_dict['error'] = ERRORS['map_not_found']
    except Exception:  # Ha ocurrido un error al cargar el mapa
        result_dict['error'] = ERRORS['map_load']

    return result_dict


# -----------------------------------------------------------------------------------------------------------

# Guarda el mapa
# - request: petición
def save_map(request):
    # La petición tiene 2 parámetros
    # - data: coordenadas del mapa. Cada una de estas tiene 4 componentes (x,y,q,r,cube_x, cube_y,cube_z) los cuales son:
    # - x: x en el mapa de la vista
    # - y: y en el mapa de la vista
    # - q: columna en la simulación
    # - r: fila en la simulación
    # - name: nombre del mapa
    # - image: la imagen del mapa codificada en base64
    coordinates = json.loads(request.POST.get('data'))
    request_map_name = request.POST.get('name')
    result_dict = {}
    try:
        map_name, created = MapNames.objects.get_or_create(map_name=request_map_name, map_count=coordinates.__len__())
        if created:  # Si se ha creado el mapa
            # Se guarda el mapa en el directorio de imágenes
            fh = open(''.join(
                [djangoSettings.BASE_DIR, '/simplewars', djangoSettings.STATIC_URL, 'simplewars', '/img/']) + '.'.join(
                [request_map_name, 'png']), 'wb')
            fh.write(request.POST.get('image').decode('base64'))
            fh.close()
            # Listas de coordenadas
            view_list = []  # Coordenadas de la vista
            simulation_list = []  # Coordenadas de la simulación
            # Se recorren las coordenadas y pueblan de datos ambas listas. Contendrán tuplas
            for coord in coordinates:
                data_view = int(coord['x']), int(coord['y'])
                data_simulation = int(coord['q']), int(coord['r'])
                view_list.append(data_view)
                simulation_list.append(data_simulation)
            with transaction.atomic():
                for i in range(coordinates.__len__()):
                    coordinate, created = Coordinates.objects.get_or_create(x=view_list[i][0],
                                                                            y=view_list[i][1],
                                                                            q=simulation_list[i][0],
                                                                            r=simulation_list[i][1])
                    Map.objects.get_or_create(name=map_name, position=coordinate)
        else:  # Si el mapa se encuentra registrado se informa
            result_dict['error'] = ERRORS['map_already_exists']
    except Exception:  # Ha ocurrido un error al crear el mapa
        result_dict['error'] = ERRORS['map_creation']

    return result_dict


# -----------------------------------------------------------------------------------------------------------
# Retorna un listado con todos los mapas
def get_map_list():
    result_dict = {}
    index = 0
    try:
        map_names = MapNames.objects.all().values('map_name')
        if map_names.__len__() > 0:
            result_dict['total'] = map_names.__len__()
            for i in map_names:
                result_dict[index] = i['map_name']
                index += 1
    except Exception:
        result_dict['error'] = ERRORS['simulation_error']

    return result_dict
# -----------------------------------------------------------------------------------------------------------