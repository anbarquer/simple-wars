# -*- encoding: utf-8 -*-
# Antonio Diego Barquero Cuadrado - TFG - UEX - 2014/2015
# typification.py
# Almacena los valores constantes de la aplicación así como los mensajes de error

# -----------------------------------------------------------------------------------------------------------
# **************************************** Formularios ******************************************************
# -----------------------------------------------------------------------------------------------------------
# Marcado en la vista para el campo de nombre de usuario
TEXT_USERNAME = {'type': 'text', 'class': 'wide text input', 'placeholder': 'Nombre de usuario'}
# Marcado en la vista para el campo contraseña
TEXT_PASSWORD = {'type': 'password', 'class': 'wide text input', 'placeholder': 'Contraseña'}
# Marcado en la vista para el campo correo electrónico
TEXT_EMAIL = {'type': 'email', 'class': 'wide text input', 'placeholder': 'email@tuemail.com'}
# Marcado en la vista para el campo repetir contraseña
TEXT_CONFIRM_PASSWORD = {'type': 'password', 'class': 'wide text input', 'placeholder': 'Confirmar contraseña'}
# Marcado en la vista para el campo de nombre de la formación
TEXT_FORMATION_NAME = {'type': 'text', 'class': 'wide text input', 'placeholder': 'Formación'}
# Marcado en la vista para el campo de nombre del mapa
TEXT_MAP_NAME = {'type': 'text', 'class': 'wide text input', 'placeholder': 'Nombre del mapa'}
# Marcado en la vista para el campo de reclutamiento de unidades cuerpo a cuerpo
MELEE_INPUT = {'type': 'text', 'class': 'wide text input', 'placeholder': 'Cuerpo a cuerpo'}
# Marcado en la vista para el campo de reclutamiento de unidades a distancia
DISTANCE_INPUT = {'type': 'text', 'class': 'wide text input', 'placeholder': 'Distancia'}
# Marcado en la vista para el campo de reclutamiento de unidades defensivas
DEFENSE_INPUT = {'type': 'text', 'class': 'wide text input', 'placeholder': 'Defensa'}
# Tamaños mínimo y máximo para el campo del nombre de usuario y contraseña de la identificación del usuario
NAMES_FIELD_SIZE = (5, 20)
# Tamaño máximo del campo email para el registro
EMAIL_SIZE = 128
# -----------------------------------------------------------------------------------------------------------
# **************************************** Expresiones regulares ********************************************
# -----------------------------------------------------------------------------------------------------------
# Nombre de usuario
USERNAME_REGEX = '^[a-z0-9][\w._-]{4,19}$'
# Contraseña
PASS_REGEX = '(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9]{5,20})$'
# Email
EMAIL_REGEX = '^[0-9a-zA-Z]+([0-9a-zA-Z]*[-._+])*[0-9a-zA-Z]+@[0-9a-zA-Z]+([-.][0-9a-zA-Z]+)*([0-9a-zA-Z]*[.])[a-zA-Z]{2,6}$'
# Número
NUMBER_REGEX = '^[0-9]*$'
# -----------------------------------------------------------------------------------------------------------
# **************************************** Datos de las unidades ********************************************
# -----------------------------------------------------------------------------------------------------------
# Etiqueta para las unidades cuerpo a cuerpo
MELEE_ID = 0
# Etiqueta para las unidades defensivas
DEFENSE_ID = 1
# Etiqueta para las unidades de ataque a distancia
DISTANCE_ID = 2
# Valores de los atributos por defecto de las unidades
# (vida, ataque, alcance, defensa, tipo)
MELEE_DEFAULT_VALUES = (0, 0, 1, 1, MELEE_ID)
DEFENSE_DEFAULT_VALUES = (0, 1, 1, 0, DEFENSE_ID)
DISTANCE_DEFAULT_VALUES = (0, 1, 0, 1, DISTANCE_ID)
# Multiplicador por el cual la unidad subirá de nivel
# Puntos % LEVEL_VALUE == 0
LEVEL_VALUE = 10
# Nivel máximo
MAX_LEVEL = 20
# Tamaño máximo de reclutamiento de unidades
RECRUIT_SIZE = 2
# Unidades máximas por petición
MAX_RECRUIT_REQUEST = int(''.join(str(9) for i in range(RECRUIT_SIZE))) * 3
# -----------------------------------------------------------------------------------------------------------
# **************************************** Datos de la simulación *******************************************
# -----------------------------------------------------------------------------------------------------------
# Filas
ROWS = 20
# Columnas
COLUMNS = 40
# Orientaciones
# Sudeste
SOUTHEAST = 0
# Noreste
NORTHEAST = 1
# Norte
NORTH = 2
# Noroeste
NORTHWEST = 3
# Suroeste
SOUTHWEST = 4
# Sur
SOUTH = 5
# Lista de orientaciones
ORIENTATIONS = [SOUTHEAST, NORTHEAST, NORTH, NORTHWEST, SOUTHWEST, SOUTH]
# Campo de vision
VISION_FIELD = COLUMNS / 2
# Parte del mapa del jugador
PLAYER_COLUMNS = (0, ROWS - 1)
# Parte del mapa del enemigo
IA_COLUMNS = (COLUMNS / 2, COLUMNS - 1)
# Identificador de aliados
ALLY = 0
# Identificador de enemigos
ENEMY = 1
# Tiempo máximo en minutos
MAX_TIME = 60
# Máximo de atributo de clase
MAX_ATT = 40
# Etiquetas del diccionario resultado
# Posiciones iniciales de las unidades
BEGINNING_DICT = 'beginning'
# Turnos totales
TOTAL_DICT = 'total'
# Resultado final
END_DICT = 'end'
# Simulación por turnos
SIMULATION_DICT = 'simulation'
# Etiqueta de aliados
ALLY_LABEL = 'ally_'
# Etiqueta de enemigos
ENEMY_LABEL = 'enemy_'
# Etiqueta para los resultados finales
RESULT_LABEL = 'results'
# Créditos que añadidos al usuario en cada batalla ganada
WIN_CREDITS = 50
# -----------------------------------------------------------------------------------------------------------
# **************************************** Mensajes de error ************************************************
# -----------------------------------------------------------------------------------------------------------
USER_UNREGISTERED = 'El usuario no se encuentra registrado'
USER_INACTIVE = 'El usuario se encuentra inactivo'
BAD_FORM_DATA = 'Los datos introducidos no son correctos'
USER_REGISTERED = 'El usuario ya se encuentra registrado'
PASS_MISMATCH = 'Las contraseñas no coinciden'
WRONG_PASS = 'La contraseña introducida es incorrecta'
WRONG_USERNAME = 'El nombre de usuario es incorrecto'
RECRUIT = 'Ha ocurrido un error al recultar las unidades'
DELETE_UNITS = 'Ha ocurrido un error al eliminar las unidades'
UPGRADE_UNITS = 'Ha ocurrido un error al modificar la unidad'
INSUFFICIENT_CREDITS = 'No hay créditos suficientes'
WRONG_GROUPNAME = 'El nombre del grupo ya se encuentra registrado'
BAD_GROUP_DATA = 'Los datos de filas y columnas no son correctos'
FORMATION_REGISTERED = 'La formación ya se encuentra registrada'
BAD_FORMATION_DATA = 'Los datos de la formación no son correctos'
DELETE_FORMATION = 'La formación no tiene unidades'
BAD_DELETE_FORMATION = 'Ha ocurrido un error al eliminar la formación'
BAD_GET_FORMATION = 'Ha ocurrido un error al obtener la formación'
MAP_CREATION = 'Ha ocurrido algún error al crear el mapa'
MAP_ALREADY_EXISTS = 'Ya existe un mapa con el mismo nombre'
FORMATION_SIZE = 'El tamaño de la formación excede al del mapa'
FORMATION_NOT_FOUND = 'La formación no se encuentra guardada'
MAX_RECRUIT_EXCEED = 'Se ha excedido el límite de unidades por petición'
MAP_NOT_FOUND = 'No existe el mapa'
MAP_LOAD_ERROR = 'Ha ocurrido un error al cargar el mapa'
SIMULATION_ERROR = 'Ha ocurrido un error en la simulación'
# -----------------------------------------------------------------------------------------------------------
# **************************************** Mensajes de email ************************************************
# -----------------------------------------------------------------------------------------------------------
EMAIL_REGISTERED = 'El usuario ha sido registrado en Simple Wars correctamente.'
EMAIL_INACTIVE = 'Has desactivado tu cuenta en Simple Wars, puedes volver a activiarla identificándote.'
EMAIL_ACTIVE = 'Has activado tu cuenta en Simple Wars.'
EMAIL_DELETE = 'Has eliminado tu cuenta en Simple Wars, todos los datos asociados han sido borrados.'
# -----------------------------------------------------------------------------------------------------------
# **************************************** Vistas ***********************************************************
# -----------------------------------------------------------------------------------------------------------
USER_SETTINGS_TEMPLATE = 'simplewars/user.html'
DASHBOARD_TEMPLATE = 'simplewars/dashboard.html'
REGISTER_TEMPLATE = 'simplewars/register.html'
LOGIN_TEMPLATE = 'simplewars/login.html'
ARMY_TEMPLATE = 'simplewars/army.html'
UNIT_TEMPLATE = 'simplewars/unit.html'
CREATE_FORMATION_TEMPLATE = 'simplewars/create_formation.html'
LIST_FORMATION_TEMPLATE = 'simplewars/list_formation.html'
MAP_CREATOR = 'simplewars/map_creator.html'
BATTLE = 'simplewars/battle.html'
# -----------------------------------------------------------------------------------------------------------
# **************************************** Diccionarios *****************************************************
# -----------------------------------------------------------------------------------------------------------
# Expresiones regulares
USER_REGEX = {'username': USERNAME_REGEX, 'password': PASS_REGEX, 'email': EMAIL_REGEX, 'number': NUMBER_REGEX}

# Estilo de los campos para formularios
STYLE_FIELDS = {'username': TEXT_USERNAME, 'password': TEXT_PASSWORD, 'confirm_password': TEXT_CONFIRM_PASSWORD,
                'email': TEXT_EMAIL, 'melee': MELEE_INPUT, 'distance': DISTANCE_INPUT, 'defense': DEFENSE_INPUT,
                'formation_name': TEXT_FORMATION_NAME, 'map_name': TEXT_MAP_NAME}

# Mensajes de error
ERRORS = {'user_unregistered': USER_UNREGISTERED, 'user_inactive': USER_INACTIVE, 'bad_form_data': BAD_FORM_DATA,
          'user_registered': USER_REGISTERED, 'pass_mismatch': PASS_MISMATCH, 'wrong_pass': WRONG_PASS,
          'wrong_username': WRONG_USERNAME, 'recruit_units': RECRUIT, 'delete_units': DELETE_UNITS,
          'upgrade_unit': UPGRADE_UNITS, 'insufficient_credits': INSUFFICIENT_CREDITS,
          'wrong_groupname': WRONG_GROUPNAME, 'bad_group_data': BAD_GROUP_DATA,
          'formation_registered': FORMATION_REGISTERED, 'bad_formation_data': BAD_FORMATION_DATA,
          'delete_formation': DELETE_FORMATION, 'bad_delete_formation': BAD_DELETE_FORMATION,
          'bad_get_formation': BAD_GET_FORMATION, 'map_creation': MAP_CREATION,
          'map_already_exists': MAP_ALREADY_EXISTS, 'formation_size': FORMATION_SIZE,
          'formation_not_found': FORMATION_NOT_FOUND, 'max_recruit_exceed': MAX_RECRUIT_EXCEED,
          'map_not_found': MAP_NOT_FOUND, 'map_load': MAP_LOAD_ERROR, 'simulation_error': SIMULATION_ERROR}
# Vistas
APP_VIEWS = {'user_settings': USER_SETTINGS_TEMPLATE, 'dashboard': DASHBOARD_TEMPLATE,
             'register': REGISTER_TEMPLATE, 'login': LOGIN_TEMPLATE, 'army': ARMY_TEMPLATE, 'unit': UNIT_TEMPLATE,
             'create_formation': CREATE_FORMATION_TEMPLATE, 'list_formation': LIST_FORMATION_TEMPLATE,
             'map_creator': MAP_CREATOR, 'battle': BATTLE}

# Mensajes de email
EMAIL_MESSAGES = {'user_registered': EMAIL_REGISTERED, 'user_inactive': EMAIL_INACTIVE, 'user_active': EMAIL_ACTIVE,
                  'user_delete': EMAIL_DELETE}
# --------------------------------------------------------------------------------------------------