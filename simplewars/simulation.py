# -*- encoding: utf-8 -*-

# Antonio Diego Barquero Cuadrado - TFG - UEX - 2014/2015
# simulation.py
# Batallas entre formaciones


from simplewars.typification import *
from simplewars.models import FormationNames, Formation, Map, MapNames, Coordinates, Neighbors
from random import randint, choice, uniform
import json
import time
import math

# -----------------------------------------------------------------------------------------------------------
# ********************************* Variables globales de la simulación *************************************
# -----------------------------------------------------------------------------------------------------------
# Mapa de la simulación que contiene a las unidades
battle_map = [[-1 for rows in range(ROWS)] for columns in range(COLUMNS)]
# Direcciones posibles que pueden tenerse desde cada casilla del mapa
DIRECTIONS = [[(+1, +1), (+1, 0), (0, -1), (-1, 0), (-1, +1), (0, +1)],
              [(+1, 0), (+1, -1), (0, -1), (-1, -1), (-1, 0), (0, +1)]]
# Diccionario de conversión de coordenadas de la simulación a la vista
sim_to_view = [[-1 for rows in range(ROWS)] for columns in range(COLUMNS)]
# Contador de unidades de la batalla
units_count = [0, 0]
# Diccionario con el resultado de la simulación
result_dict = {}
# Turnos
turn = 0


# -----------------------------------------------------------------------------------------------------------
# ********************************* Clase unidad de la simulación *******************************************
# -----------------------------------------------------------------------------------------------------------
# Clase que almacena toda la informacion de la unidad
# - life: vida
# - attack: ataque
# - scope: alcance
# - defense: defensa
# - path: camino que está siguiendo la unidad
# - side: alineación de la unidad (ALIADO o ENEMIGO)
# - path_index: posición del camino que está siguiendo la unidad
# - column: columna en la que se encuentra
# - row: fila en la que se encuentra
# - unit_type: tipo de unidad
# - level: nivel
class SimulationUnit():
    life = 0
    attack = 0
    scope = 0
    defense = 0
    path = []
    side = ALLY
    path_index = 0
    column = 0
    row = 0
    unit_type = 0
    level = 0
    sim_label = ''

    def __init__(self, life, attack, scope, defense, unit_type, side, column, row, level, sim_label):
        self.life = life
        self.attack = attack
        self.scope = scope
        self.defense = defense
        self.unit_type = unit_type
        self.side = side
        self.row = row
        self.column = column
        self.level = level
        self.sim_label = sim_label

    def __str__(self):
        label = 'L: ' + self.life.__str__() + ' A: ' + self.attack.__str__() + ' S: ' + self.scope.__str__() + ' D: ' + \
                self.defense.__str__() + ' LV: ' + self.level.__str__()

        if self.unit_type == MELEE_ID:
            label += ' MELEE'
        elif self.unit_type == DISTANCE_ID:
            label += ' DISTANCE'
        elif self.unit_type == DEFENSE_ID:
            label += ' DEFENSE'

        if self.side == ENEMY:
            label += ' Enemy'
        else:
            label += ' Ally'

        label += ' (' + self.column.__str__() + ',' + self.row.__str__() + ')'

        return label

    def reset_path(self):
        self.path = []
        self.path_index = 0


# -----------------------------------------------------------------------------------------------------------
# ******************************************** Métodos auxilares ********************************************
# -----------------------------------------------------------------------------------------------------------
# Retorna si el parámetro que se ha introducido para la simulación es formación espejo o no
# - mirror: cadena con la información
def mirror_formation(mirror):
    selection = False
    if mirror == 'Si':
        selection = True

    return selection


# -----------------------------------------------------------------------------------------------------------
# Muestra todas las unidades que hay en el mapa por consola
def show_battle_map():
    for i in range(0, COLUMNS):
        for j in range(0, ROWS):
            if isinstance(battle_map[i][j], SimulationUnit):
                print battle_map[i][j].__str__()


# -----------------------------------------------------------------------------------------------------------
# Resetea el mapa guardado en "battle_map" estableciendo todas sus posiciones a -1
def reset_map():
    for i in range(0, COLUMNS):
        for j in range(0, ROWS):
            battle_map[i][j] = -1


# -----------------------------------------------------------------------------------------------------------
# Resetea la estructura que se va a enviar al cliente con el resultado de la simulación
def reset_result_dict():
    result_dict[BEGINNING_DICT] = {}
    result_dict[TOTAL_DICT] = 0
    result_dict[SIMULATION_DICT] = {}
    result_dict['error'] = 'OK'
    result_dict[END_DICT] = {'units_lost': 0, 'units_killed': 0, 'win': 0, 'lose': 0}


# -----------------------------------------------------------------------------------------------------------
# Retorna una posición del mapa aleatoria para los enemigos en la parte que corresponde a los enemigos
# Estos valores se almacenan en IA_COLUMNS
def enemy_position():
    column = -1
    row = -1
    found = False
    while found is False:
        column = randint(IA_COLUMNS[0], IA_COLUMNS[1])
        row = randint(0, ROWS - 1)
        if not isinstance(battle_map[column][row], SimulationUnit) and battle_map[column][row] != -1:
            found = True
    return column, row


# -----------------------------------------------------------------------------------------------------------
# Retorna un tipo aleatorio de unidad
# - enemy: indicador de qué enemigos se desean en la simulación. Estos valores vienen de la vista
def enemy_type(enemy):
    types = []
    if enemy == 'Todos':
        types = [MELEE_ID, DEFENSE_ID, DISTANCE_ID]
    elif enemy == 'Cuerpo':
        types = [MELEE_ID]
    elif enemy == 'Defensa':
        types = [DEFENSE_ID]
    elif enemy == 'Distancia':
        types = [DISTANCE_ID]

    return choice(types)


# -----------------------------------------------------------------------------------------------------------
# Generación aleatoria de atributos para unidades
# - level: nivel
# - type: tipo de unidad
def enemy_atts(level, type):
    # Los posibles puntos que pueden gastarse en una unidad por niveles vienen indicados por esta fórmula
    points = level * LEVEL_VALUE + 9
    values = (0, 0, 0, 0)

    # El atributo propio de clase no puede valer más de MAX_ATT
    if points > MAX_ATT:
        att = randint(0, MAX_ATT - 1)
    else:
        att = randint(0, points)

    life = points - att

    # La tupla que se devuelve es del tipo (vida, ataque, alcance, defensa)
    if type == MELEE_ID:
        values = (life, att, 0, 0)
    elif type == DEFENSE_ID:
        values = (life, 0, 0, att)
    elif type == DISTANCE_ID:
        values = (life, 0, att, 0)

    return values


# -----------------------------------------------------------------------------------------------------------
# Retorna la alineación contraria de la unidad, esto es si es ALLY retorna ENEMY y si es ENEMY retorna ALLY
# - unit: unidad
def get_opposite_side(unit):
    side = ENEMY
    if unit.side == ENEMY:
        side = ALLY

    return side


# -----------------------------------------------------------------------------------------------------------
# Realiza un movimiento de la unidad
# - unit: unidad
def move_forward_unit(unit):
    positions = neighbors_forward(unit.column, unit.row)
    done = False
    # Dirección primera del movimiento
    move_1 = (0, 0)
    # Dirección segunda del movimiento
    move_2 = (0, 0)
    # Si es aliado se mueve a la derecha
    if unit.side == ALLY:
        move_1 = positions[NORTHEAST]
        move_2 = positions[SOUTHEAST]
    # Si es enemigo se mueve a la izquierda
    elif unit.side == ENEMY:
        move_1 = positions[NORTHWEST]
        move_2 = positions[SOUTHWEST]

    # Se guardan las posiciones del mapa
    if move_1 != -1 and done is False:
        position_1 = battle_map[move_1[0]][move_1[1]]
        # Se comprueba si la unidad puede moverse, en caso afirmartivo se realiza la acción
        if isinstance(position_1, SimulationUnit) is False and position_1 == 0:
            battle_map[unit.column][unit.row] = 0
            unit.column = move_1[0]
            unit.row = move_1[1]
            battle_map[move_1[0]][move_1[1]] = unit
            save_move_json(unit)
            done = True
    if move_2 != -1 and done is False:
        position_2 = battle_map[move_2[0]][move_2[1]]
        # Se comprueba si la unidad puede moverse, en caso afirmartivo se realiza la acción
        if isinstance(position_2, SimulationUnit) is False and position_2 == 0:
            battle_map[unit.column][unit.row] = 0
            unit.column = move_2[0]
            unit.row = move_2[1]
            battle_map[move_2[0]][move_2[1]] = unit
            save_move_json(unit)
            done = True

    return done


# -----------------------------------------------------------------------------------------------------------
# ******************************************** Coordenadas **************************************************
# -----------------------------------------------------------------------------------------------------------
# Controla que las coordenadas se encuentren en los límites del mapa
# - column: columna
# - row: fila
def in_limit(column, row):
    return 0 <= column < COLUMNS and 0 <= row < ROWS


# -----------------------------------------------------------------------------------------------------------


# Transforma coordenadas cúbicas a 2d
# - x: coordenada x
# - z: coordenada z
def cube_to_offset(x, z):
    column = x
    row = z + (x + (x & 1)) / 2
    return column, row


# -----------------------------------------------------------------------------------------------------------


# Transforma coordenadas 2d a cúbicas
# - column: columna
# - row: fila
def offset_to_cube(column, row):
    x = column
    z = row - (column + (column & 1)) / 2
    y = -x - z
    return x, y, z


# -----------------------------------------------------------------------------------------------------------


# Retorna la coordenada opuesta
# - column: columna
# - row: fila
def opposite_coord(column, row):
    return abs(COLUMNS - 1 - column), row


# -----------------------------------------------------------------------------------------------------------


# Carga todas las coordenadas para transformar las que se emplean en la simulación en coordenadas de la vista
def init_transformation_dict():
    coordinates = Coordinates.objects.all()
    for i in coordinates:
        sim_to_view[i.q][i.r] = (i.x, i.y)


# -----------------------------------------------------------------------------------------------------------
# ************************************** Distancias y medidas ***********************************************
# -----------------------------------------------------------------------------------------------------------
# Retorna la distancia entre dos puntos
# - column_a: columna del primer punto
# - row_a: fila del primer punto
# - column_b: columna del segundo punto
# - row_b: fila del segundo punto
def distance(column_a, row_a, column_b, row_b):
    point_a = offset_to_cube(column_a, row_a)
    point_b = offset_to_cube(column_b, row_b)
    return (abs(point_a[0] - point_b[0]) + abs(point_a[1] - point_b[1]) + abs(point_a[2] - point_b[2])) / 2


# -----------------------------------------------------------------------------------------------------------

# Retorna el hexágono más cercano a las coordenadas proporcionadas con números reales
# - x: coordenada x
# - y: coordenada y
# - z: coordenada z
def hex_round(x, y, z):
    rx = round(x)
    ry = round(y)
    rz = round(z)

    x_diff = abs(rx - x)
    y_diff = abs(ry - y)
    z_diff = abs(rz - z)

    if x_diff > y_diff and x_diff > z_diff:
        rx = -ry - rz
    elif y_diff > z_diff:
        ry = -rx - rz
    else:
        rz = -rx - ry

    return cube_to_offset(int(rx), int(rz))


# -----------------------------------------------------------------------------------------------------------
# Retorna la posición siguiente del camino entre dos puntos 3D
# - x1: coordenada x del primer punto
# - y1: coordenada y del primer punto
# - z1: coordenada z del primer punto
# - x2: coordenada x del segundo punto
# - y2: coordenada y del segundo punto
# - z2: coordenada z del segundo punto
# - t: posición
def hex_lerp(x1, y1, z1, x2, y2, z2, t):
    return (x1 + (x2 - x1) * t,
            y1 + (y2 - y1) * t,
            z1 + (z2 - z1) * t)


# -----------------------------------------------------------------------------------------------------------
# Retorna el camino a seguir entre dos puntos. Sirve de algoritmo de camino
# - column_a: columna del primer punto
# - row_a: fila del primer punto
# - column_b: columna del segundo punto
# - row_b: fila del segundo punto
def hex_linedraw(column_a, row_a, column_b, row_b):
    N = distance(column_a, row_a, column_b, row_b)
    point_a = offset_to_cube(column_a, row_a)
    point_b = offset_to_cube(column_b, row_b)
    results = []
    step = 1.0 / max(N, 1)
    for i in range(0, N + 1):
        cube = hex_lerp(point_a[0], point_a[1], point_a[2], point_b[0], point_b[1], point_b[2], step * i)
        results.append(hex_round(cube[0], cube[1], cube[2]))

    # El primer valor es donde se encuentra la unidad por lo que no es necesario almacenarlo
    results.pop(0)
    return results


# -----------------------------------------------------------------------------------------------------------
# ************************************** Algoritmo de vecinos ***********************************************
# -----------------------------------------------------------------------------------------------------------
# El mapa guardado en "battle_map" tiene que estar inicializado para que funcionen
# Vecinos de una celda
# - column: columna
# - row: fila
def neighbors(column, row):
    neighbors_list = []
    # ORIENTATIONS es una lista con los siguientes valores [SE, NE, N, NO, SO, S]
    # Es el orden en el que se van a buscar vecinos
    for direction in ORIENTATIONS:
        # Dependiendo de si la columna es par o impar accederá a DIRECTIONS[0] o DIRECTIONS[1]
        parity = column & 1
        # Obtiene las coordendas
        direction = DIRECTIONS[parity][direction]
        # Suma los valores a las coordenadas iniciales
        orientation = column + direction[0], row + direction[1]
        # Si se encuentra entre los límites del mapa y es una posición válida
        if in_limit(orientation[0], orientation[1]) and battle_map[orientation[0]][orientation[1]] != -1:
            neighbors_list.append(orientation)
    return neighbors_list


# -----------------------------------------------------------------------------------------------------------
# Vecinos de una celda. Incluye también las posiciones no válidas para el movimiento hacia delante
# - column: columna
# - row: fila
def neighbors_forward(column, row):
    neighbors_list = []
    # ORIENTATIONS es una lista con los siguientes valores [SE, NE, N, NO, SO, S]
    # Es el orden en el que se van a buscar vecinos
    for direction in ORIENTATIONS:
        # Dependiendo de si la columna es par o impar accederá a DIRECTIONS[0] o DIRECTIONS[1]
        parity = column & 1
        # Obtiene las coordendas
        direction = DIRECTIONS[parity][direction]
        # Suma los valores a las coordenadas iniciales
        orientation = column + direction[0], row + direction[1]
        # Si se encuentra entre los límites del mapa y es una posición válida
        if in_limit(orientation[0], orientation[1]) and battle_map[orientation[0]][orientation[1]] != -1:
            neighbors_list.append(orientation)
        else:
            neighbors_list.append(-1)
    return neighbors_list


# -----------------------------------------------------------------------------------------------------------
# Calcula todos los vecinos de una lista de posiciones y las retorna en una lista
def neighbors_range(list):
    neighbors_list = []
    for i in list:
        neighbors_list += neighbors(i[0], i[1])

    return neighbors_list


# -----------------------------------------------------------------------------------------------------------
# Calcula todos los vecinos desde una columna y una fila determinadas dado un límite
# - column: columna
# - row: fila
# - limit: limite
def calculate_vision_range(column, row, limit):
    coordinates = neighbors(column, row)
    range = 1
    while range < limit:
        # "set" elimina posiciones repetidas
        coordinates += list(set(neighbors_range(coordinates)))
        range += 1
    return set(coordinates)


# -----------------------------------------------------------------------------------------------------------
# Carga el rango de visión de una posición bien en base de datos, bien calculándolo en el momento
# - column: columna
# - row: fila
# - limit: limite
def vision_range(column, row, limit):
    try:
        # Obtiene los vecinos de la base de datos
        neighbors_list = Neighbors.objects.get(position__q=column, position__r=row)
        return json.loads((getattr(neighbors_list, 'range_' + limit.__str__())))
    except:
        # En caso de no existir la tabla o el registro, lo calcula en el momento
        return calculate_vision_range(column, row, limit)


# -----------------------------------------------------------------------------------------------------------
# Calcula todos los vecinos de todas las celdas con un rango desde 1 hasta COLUMNS - 1
def calculate_all_neighbors():
    field_name = 'range_'
    init_map('Plano')
    positions = Coordinates.objects.all()
    for position in positions:
        neighbors_model = Neighbors.objects.create(position=position)
        for limit in range(1, COLUMNS):
            field_name += str(limit)
            # Se retorna una estructura de tipo JSON
            neighbors_list = json.dumps(list(calculate_vision_range(position.q, position.r, limit)))
            # Guarda en el campo que indica "field_name" todos los vecinos
            setattr(neighbors_model, field_name, neighbors_list)
            field_name = 'range_'
        neighbors_model.save()


# -----------------------------------------------------------------------------------------------------------
# ********************************************** Carga de datos *********************************************
# -----------------------------------------------------------------------------------------------------------
# Inicialización del mapa. Carga el mapa de BD y modifica "battle_map" según corresponda
# - mapname: nombre del mapa
def init_map(mapname):
    map_name = MapNames.objects.filter(map_name=mapname).first()
    map_positions = Map.objects.filter(name_id=map_name.pk).values('position_id__q', 'position_id__r')
    for i in map_positions:
        battle_map[i['position_id__q']][i['position_id__r']] = 0

    return map_name.map_count


# -----------------------------------------------------------------------------------------------------------
# Carga una formación en la simulación de BD
# - name: nombre de la formación
# - user: usuario
# - mirror: formación espejo o no
def load_formation(name, user, mirror):
    # Para cada unidad se crea una instancia de SimulatioUnit y se guarda en la estructura "battle_map"
    # Cada instancia de esta clase contiene lo siguiente:
    # - column: columna en donde se encuentra
    # - row: fila en donde se encuentra
    # - life: vida
    # - attack: ataque
    # - scope: alcance
    # - defense: defensa
    # - type: tipo de la unidad
    # - level: nivel para el sprite de la vista
    # - side: alineación de la unidad, esto es si es aliada o enemiga. Se utiliza en la vista
    # - label: identificador para la vista del tipo "ally_x" para aliados o "enemy_x" para enemigos
    ally_count = 0
    enemy_count = 0
    formation_name = FormationNames.objects.filter(user=user, formation_name=name).first()
    formation = Formation.objects.filter(name=formation_name).values('position__position__q',
                                                                     'position__position__r',
                                                                     'unit__life',
                                                                     'unit__attack',
                                                                     'unit__scope',
                                                                     'unit__defense',
                                                                     'unit__type',
                                                                     'unit__level', )
    for unit in formation:
        battle_map[unit['position__position__q']][unit['position__position__r']] = SimulationUnit(
            unit['unit__life'],
            unit['unit__attack'],
            unit['unit__scope'],
            unit['unit__defense'],
            unit['unit__type'],
            ALLY,
            unit['position__position__q'],
            unit['position__position__r'],
            unit['unit__level'],
            ALLY_LABEL + str(ally_count))
        ally_count += 1
        # Se ha indicado que se desea una simulación contra la misma formación "espejada". Esto es, las mismas unidades
        # en coordenadas opuestas. Estas se generan llamando al método "opposite_coord"
        if mirror:
            opposite = opposite_coord(unit['position__position__q'], unit['position__position__r'])
            battle_map[opposite[0]][opposite[1]] = SimulationUnit(
                unit['unit__life'],
                unit['unit__attack'],
                unit['unit__scope'],
                unit['unit__defense'],
                unit['unit__type'],
                ENEMY,
                opposite[0],
                opposite[1],
                unit['unit__level'],
                ENEMY_LABEL + str(enemy_count))
            enemy_count += 1

    # Contador de las unidades enemigas y aliadas
    units_count[ALLY] = ally_count
    units_count[ENEMY] = enemy_count

    return formation.__len__()


# -----------------------------------------------------------------------------------------------------------
# Carga de los enemigos en el mapa.
# - enemy_mult: cuántos enemigos se van a desplegar. Está en función del tamaño de la formación del usuario
# - max_level: nivel máximo de las unidades
# - enemy_types: tipos de unidades
# - formation_length: tamaño de la formación
# - total_map: coordenadas totales de lamap
def load_enemies(enemy_mult, max_level, enemy_types, formation_length, total_map):
    total_units = formation_length + int(math.ceil(formation_length * float(enemy_mult) / 100))
    count = 0
    # Si las unidades son mayores que la mitad del mapa se ajusta
    if total_units > total_map / 2:
        total_units = total_map / 2
    # En caso de ser menor que 0 los enemigos tendrán el mismo número que la formación del usuario
    elif total_units <= 0:
        total_units = 1

    for i in range(total_units):
        position = enemy_position()
        type = enemy_type(enemy_types)
        level = randint(0, int(max_level))
        values = enemy_atts(level, type)
        battle_map[position[0]][position[1]] = SimulationUnit(values[0], values[1], values[2], values[3], type,
                                                              ENEMY, position[0], position[1], level,
                                                              ENEMY_LABEL + str(count))
        count += 1

    units_count[ENEMY] = count


# -----------------------------------------------------------------------------------------------------------
# ********************************* Guardado de información para la vista ***********************************
# -----------------------------------------------------------------------------------------------------------
# Guardado de un movimiento
# - unit: unidad
def save_move_json(unit):
    global turn
    try:
        result_dict[SIMULATION_DICT][turn.__str__()][unit.sim_label].append(
            {'move_x': sim_to_view[unit.column][unit.row][0],
             'move_y': sim_to_view[unit.column][unit.row][1]})
    except:
        result_dict[SIMULATION_DICT][turn.__str__()][unit.sim_label] = []
        result_dict[SIMULATION_DICT][turn.__str__()][unit.sim_label].append(
            {'move_x': sim_to_view[unit.column][unit.row][0],
             'move_y': sim_to_view[unit.column][unit.row][1]})


# -----------------------------------------------------------------------------------------------------------
# Guardado de un ataque exitoso
# - unit: unidad
# - enemy: enemigo
def save_attack_json(unit, enemy):
    global turn
    try:
        result_dict[SIMULATION_DICT][turn.__str__()][unit.sim_label].append(
            {'attack_x': sim_to_view[enemy.column][enemy.row][0],
             'attack_y': sim_to_view[enemy.column][enemy.row][1]})
    except:
        result_dict[SIMULATION_DICT][turn.__str__()][unit.sim_label] = []
        result_dict[SIMULATION_DICT][turn.__str__()][unit.sim_label].append(
            {'attack_x': sim_to_view[enemy.column][enemy.row][0],
             'attack_y': sim_to_view[enemy.column][enemy.row][1]})


# -----------------------------------------------------------------------------------------------------------
# Guardado de un ataque fallido
# - unit: unidad
# - enemy: enemigo
def save_missed_json(unit, enemy):
    global turn
    try:
        result_dict[SIMULATION_DICT][turn.__str__()][unit.sim_label].append(
            {'missed_x': sim_to_view[enemy.column][enemy.row][0],
             'missed_y': sim_to_view[enemy.column][enemy.row][1]})
    except:
        result_dict[SIMULATION_DICT][turn.__str__()][unit.sim_label] = []
        result_dict[SIMULATION_DICT][turn.__str__()][unit.sim_label].append(
            {'missed_x': sim_to_view[enemy.column][enemy.row][0],
             'missed_y': sim_to_view[enemy.column][enemy.row][1]})


# -----------------------------------------------------------------------------------------------------------
# Guardado de una muerte de unidad
# - unit: unidad
def save_death_json(unit):
    global turn
    try:
        result_dict[SIMULATION_DICT][turn.__str__()][unit.sim_label].append(-1)
    except:
        result_dict[SIMULATION_DICT][turn.__str__()][unit.sim_label] = []
        result_dict[SIMULATION_DICT][turn.__str__()][unit.sim_label].append(-1)


# -----------------------------------------------------------------------------------------------------------
# Guardado de la configuración inicial del mapa de batalla. Recorre la estructura "battle_map" y guarda en el
# diccionario resultado identificado por claves de la forma "fila columna' lo siguiente
# - level: nivel de la unidad
# - side: alineación de la unidad, esto es aliado o enemigo
# - label: tipo de unidad
# - x: coordenada x de la vista
# - y: coordenada y de la vista
# - sprite: nombre asociado a la unidad, del tipo "ally_x" o "enemy_x"
# Por ejemplo para la posición (0,0) de la simulación podría ser:
# {'0 0':{'level : 1, 'side' : 0, 'label' : 1, 'x' : 20, 'y':38,'sprite':'ally_0'}}
def get_units_json():
    result = {}
    for i in range(0, COLUMNS):
        for j in range(0, ROWS):
            if isinstance(battle_map[i][j], SimulationUnit):
                unit = battle_map[i][j]
                result[' '.join([i.__str__(), j.__str__()])] = {'level': unit.level,
                                                                'side': unit.side,
                                                                'label': unit.unit_type,
                                                                'x': sim_to_view[unit.column][unit.row][0],
                                                                'y': sim_to_view[unit.column][unit.row][1],
                                                                'sprite': unit.sim_label}
    return result


# -----------------------------------------------------------------------------------------------------------
# Guarda el resultado final de la simulación
# - lost: unidades perdidas
# - killed: unidades matadas
# - win: victoria
# - lose: derrota
# - user: usuario
def save_results(lost, killed, win, lose, user):
    # Unidades perdidas
    result_dict[END_DICT]['units_lost'] = lost
    # Unidades matadas
    result_dict[END_DICT]['units_killed'] = killed
    # Victoria
    result_dict[END_DICT]['win'] = win
    # Derrota
    result_dict[END_DICT]['lose'] = lose
    # Créditos por unidades matadas
    result_dict[RESULT_LABEL] = killed
    # Si el usuario ha ganado se le recompensa
    if win == 1:
        result_dict[RESULT_LABEL] += WIN_CREDITS
        user.wins += win
    elif lose == 1:
        user.loses += 1

    # Actualizacion de parámetros del usuario
    user.credits += result_dict[RESULT_LABEL]
    user.units_lost += lost
    user.save()


# -----------------------------------------------------------------------------------------------------------
# *************************************** Acciones de las unidades ******************************************
# -----------------------------------------------------------------------------------------------------------
# Acción de ataque de la unidad
# - unit: unidad
# - enemy: enemigo
def attack(unit, enemy):
    # Se genera un número real aleatorio entre 0 y 0.5 y se le suma el (nivel / MAX_LEVEL) / 2
    unit_chance = float(float(unit.level) / float(MAX_LEVEL) / 2) + uniform(0, 0.5)
    enemy_chance = float(float(enemy.level) / float(MAX_LEVEL) / 2) + uniform(0, 0.5)
    unit_offset = 0

    if unit.side != enemy.side:
        # Si el ataque de la unidad es 0 se normaliza
        if unit.attack == 0:
            unit_offset = 1
        # Si el número de la unidad es mayor se ataca
        # En caso de que el enemigo tenga defensa, primero se resta el ataque a esta
        if unit_chance > enemy_chance:
            if enemy.defense > 0:
                enemy.defense -= unit.attack + unit_offset
            else:
                enemy.life -= unit.attack + unit_offset
            # Se guarda el resultado del ataque exitoso
            save_attack_json(unit, enemy)
        else:
            # Se guarda el resultado del ataque fallido
            save_missed_json(unit, enemy)
        # Si la unidad enemiga se ha eliminado se borra del mapa en "battle_map"
        if enemy.life < 0:
            battle_map[enemy.column][enemy.row] = 0
            # Se guarda la muerte en el diccionario resultado
            save_death_json(enemy)


# -----------------------------------------------------------------------------------------------------------

# Obtiene una unidad adyacente a las coordenadas con el alineamiento deseado
# - column: columna
# - row: fila
# - side: alineamiento
def get_adjacent_unit(column, row, side):
    positions = neighbors(column, row)
    for i in positions:
        if isinstance(battle_map[i[0]][i[1]], SimulationUnit) and battle_map[i[0]][i[1]].side == side:
            return i
    return -1  # En caso de no encontrar ninguna se retorna -1


# -----------------------------------------------------------------------------------------------------------
# Obtiene la unidad más cercana dadas unas coordenadas
# - column: columna
# - row: fila
# - limit: límite que va a tener la búsqueda
# - side: alineamiento de la unidad que se busca
def get_nearest_unit(column, row, limit, side):
    positions = vision_range(column, row, limit)
    min_distance = 1000
    enemy = (-1, -1)
    for i in positions:
        # Si la posición es una unidad, es del alineamiento que se busca y no tiene las mismas coordenadas
        if isinstance(battle_map[i[0]][i[1]], SimulationUnit) and battle_map[i[0]][i[1]].side == side \
                and i != [column, row]:  # "vision_range" retorna la propia columna desde la que se busca
            enemy_distance = distance(column, row, i[0], i[1])
            if enemy_distance < min_distance:
                min_distance = enemy_distance
                enemy = i

    return enemy  # En caso de no encontrar ninguna se retorna (-1, -1)


# -----------------------------------------------------------------------------------------------------------

# Realiza las acciones pertinentes en caso de que la unidad tenga un camino calculado
# - unit: unidad
# - side: alineamiento de la unidad destino buscada
def next_step_path(unit, side):
    try:
        if unit.path_index < unit.path.__len__():
            # Coordenadas del siguiente paso del camino
            coordinates = unit.path[unit.path_index]
            # Posición del mapa de batalla
            position = battle_map[coordinates[0]][coordinates[1]]
            # Si la siguiente posición es un enemigo:
            # - Es del lado que se está buscando (position.side == side)
            # - Es del bando contrario a la unidad (unit.side != side, por unidades defensivas)
            if isinstance(position, SimulationUnit) and position.side == side and unit.side != side:
                attack(unit, position)
            else:
                if position == 0:  # Si la posición está libre la unidad se mueve
                    battle_map[unit.column][unit.row] = 0
                    unit.column = coordinates[0]
                    unit.row = coordinates[1]
                    unit.path_index += 1
                    battle_map[coordinates[0]][coordinates[1]] = unit
                    save_move_json(unit)
                elif position == -1:  # Si la posición es un camino muerto se anula el camino
                    unit.reset_path()
                    move_random_adjacent(unit)
                # Si la posición es un aliado, se mueve aleatoriamente. Esto se realiza así para restar
                # determinismo a la simulación. Como resultado en la vista, se verán "saltos"
                # de la unidad dada esta circunstancia
                elif isinstance(position, SimulationUnit) and position.side == unit.side:
                    unit.reset_path()
                    move_random_adjacent(unit)
        else:  # Se ha llegado al final del camino
            unit.reset_path()
            move_random_adjacent(unit)
    except:
        # En caso de fallo grave se resetea el camino y se mueve a una posición aleatoria
        unit.reset_path()
        move_random_adjacent(unit)


# -----------------------------------------------------------------------------------------------------------
# Calcula el camino hasta una unidad con un cierto límite
# - unit: unidad
# - limit: límite
# - side: alineamiento de la unidad buscada
def calculate_path(unit, limit, side):
    done = False
    position = get_nearest_unit(unit.column, unit.row, limit, side)
    # Existe una unidad cercana
    if position != (-1, -1):
        unit.path = hex_linedraw(unit.column, unit.row, position[0], position[1])
        done = True

    return done


# ----------------------------------------------------------------------------------------------------------
# Mueve la unidad a una posición adyacente
# - unit: unidad
def move_random_adjacent(unit):
    # En positions se almacenan todas las posiciones adyacentes
    positions = neighbors(unit.column, unit.row)
    done = False
    # En primer lugar se intenta mover hacia delante
    if move_forward_unit(unit) is False:
        # Al realizarse una selección aleatoria, será necesario establecer un límite de intentos
        # Estos serán tantos como posiciones adyacentes se tengan
        intents = 0
        while done is False:
            adjacent = choice(positions)
            position = battle_map[adjacent[0]][adjacent[1]]
            # Una posición adyacente es válida si no es instancia de "SimulationUnit", se encuentra dentro
            # de las casillas del mapa y vacía (position == 0)
            if isinstance(position, SimulationUnit) is False and position == 0:
                battle_map[unit.column][unit.row] = 0
                unit.column = adjacent[0]
                unit.row = adjacent[1]
                battle_map[adjacent[0]][adjacent[1]] = unit
                done = True
                # Se guarda el movimiento
                save_move_json(unit)
            # En caso de alcanzar el límite de intentos se sale del bucle
            if intents == positions.__len__():
                done = True
            else:
                intents += 1


# -----------------------------------------------------------------------------------------------------------
# Acciones de las unidades del tipo cuerpo a cuerpo
# - unit: unidad
def melee_actions(unit):
    # Buscar enemigos adyacentes
    position = get_adjacent_unit(unit.column, unit.row, get_opposite_side(unit))
    if position == -1:  # No hay enemigos adyacentes
        if unit.path.__len__() > 0:  # La unidad tiene camino calculado en curso
            # Siguiente posición del camino
            next_step_path(unit, ENEMY)
            # Se calcula el camino al enemigo más cercano
        elif calculate_path(unit, VISION_FIELD, get_opposite_side(unit)) is False:
            # En caso de no haber enemigos se mueve a la casilla adyacente aleatoria
            move_random_adjacent(unit)
    else:
        # En caso de encontrar enemigos adyacentes se ataca
        attack(unit, battle_map[position[0]][position[1]])


# -----------------------------------------------------------------------------------------------------------
# Acciones de las unidades de ataque a distancia
# - unit: unidad
def distance_actions(unit):
    # Buscar enemigos adyacentes
    position = get_adjacent_unit(unit.column, unit.row, get_opposite_side(unit))
    if position == -1:  # No hay enemigos adyacentes
        limit = int(round((unit.scope / 2))) + 1
        offset = 0
        if unit.scope == 0:
            limit = 2
        if limit > VISION_FIELD:
            offset = 1
        # Se ataca al más cercano por peligrosidad
        position = get_nearest_unit(unit.column, unit.row, VISION_FIELD + offset, get_opposite_side(unit))
        # En caso de estar a tiro se le ataca
        if position[0] > -1 and position[1] > -1 and distance(unit.column, unit.row, position[0],
                                                              position[1]) <= limit:
            attack(unit, battle_map[position[0]][position[1]])
        else:  # Si no se mueve a una posición aleatoria adyacente
            move_random_adjacent(unit)
    else:  # Si hay enemigos se mueve a una posición aleatoria
        move_random_adjacent(unit)


# -----------------------------------------------------------------------------------------------------------
# Acciones de las unidades defensivas
# - unit: unidad
def defense_actions(unit):
    # Buscar enemigos adyacentes
    position = get_adjacent_unit(unit.column, unit.row, get_opposite_side(unit))
    # Si no hay enemigos adyacentes
    if position == -1:
        if unit.path.__len__() > 0:  # La unidad tiene camino calculado en curso
            # Siguiente posición del camino
            next_step_path(unit, get_opposite_side(unit))
            # Se calcula el camino al aliado más cercano
        elif calculate_path(unit, VISION_FIELD, unit.side) is False:
            # En caso de no haber enemigos se mueve a la casilla adyacente aleatoria
            move_random_adjacent(unit)
    else:  # En caso de tener enemigos adyacentes se ataca
        attack(unit, battle_map[position[0]][position[1]])


# -----------------------------------------------------------------------------------------------------------
# ************************************************ Simulación ***********************************************
# -----------------------------------------------------------------------------------------------------------
# Carga de los datos, realización de la simulación y retorno del resultado
# - request: petición, contra de 6 parámetros
# - map: mapa
# - enemy_mult: cantidad de enemigos (desde 0% hasta +-50%)
# - formation: nombre de la formación
# - mirror: indica si el usuario desea espejar la simulación o no. En caso afirmativo el resto de parámetros se ignoran
# - max_level: nivel máximo de los enemigos
# - enemy_types: tipo de la unidad enemiga aleatoria
# - user: usuario
def simulation(request, user):
    try:
        # Resetea el mapa, el diccionario de coordenadas y el resultado
        reset_map()
        reset_result_dict()
        init_transformation_dict()
        # Se obtienen todos los parámetros de la petición
        map_name = request.POST.get('map')
        enemy_mult = request.POST.get('enemy_mult')
        formation_name = request.POST.get('formation')
        mirror = mirror_formation(request.POST.get('mirror'))
        max_level = request.POST.get('max_level')
        enemy_types = request.POST.get('enemy_types')
        # Inicialización del mapa
        total_map = init_map(map_name)
        # Carga de la formación
        formation_length = load_formation(formation_name, user, mirror)
        # Si ha ocurrido algún error en la carga se retorna el error
        if formation_length == 0:
            result_dict['error'] = ERRORS['simulation_error']
            return result_dict
        # Si no se realiza la simulación
        else:
            # Generación de enemigos en caso de no espejar la simulación
            if mirror is False:
                load_enemies(enemy_mult, max_level, enemy_types, formation_length, total_map)
            # Datos iniciales de la simulación para la vista
            result_dict[BEGINNING_DICT] = get_units_json()
            # Batalla
            battle(user)
    except Exception as ex:  # Ha ocurrido un error en la simulación de la batalla
        result_dict['error'] = ERRORS['simulation_error']

    return result_dict


# -----------------------------------------------------------------------------------------------------------
# Contador de unidades en la simulación, retorna dos listas: una de enemigos y otra de aliados
def count_units():
    count = [0, 0]
    # Posiciones en donde se encuentran las unidades
    positions = []

    for i in range(0, COLUMNS):
        for j in range(0, ROWS):
            if isinstance(battle_map[i][j], SimulationUnit):
                unit = battle_map[i][j]
                count[unit.side] += 1
                positions.append((i, j))

    # Actualización de contadores
    units_count[ALLY] = count[ALLY]
    units_count[ENEMY] = count[ENEMY]

    # Se retorna en una tupla las dos listas
    return positions


# -----------------------------------------------------------------------------------------------------------
# Realización de las acciones de las unidades
# - positions: posiciones del mapa en donde se encuentran las unidades
def battle_iteration(positions):
    for position in positions:
        unit = battle_map[position[0]][position[1]]
        if isinstance(unit, SimulationUnit):
            if unit.unit_type == MELEE_ID:  # Acciones de unidades cuerpo a cuerpo
                melee_actions(unit)
            elif unit.unit_type == DISTANCE_ID:  # Acciones de unidades de ataque a distancia
                distance_actions(unit)
            elif unit.unit_type == DEFENSE_ID:  # Acciones de unidades defensivas
                defense_actions(unit)


# -----------------------------------------------------------------------------------------------------------
# Batalla entre formaciones
# - user: usuario
def battle(user):
    # Tiempo de comienzo
    start = time.time()
    global turn
    turn = 0
    done = False
    # Unidades iniciales
    enemies = units_count[ENEMY]
    allies = units_count[ALLY]

    while done is False:
        # Se crea en el diccionario resultado el apartado correspondiente al turno
        result_dict[SIMULATION_DICT][turn.__str__()] = {}
        # Posiciones donde hay enemigos
        positions = count_units()
        # Acciones de las unidades
        battle_iteration(positions)
        # Tiempo de la iteración
        end = time.time()
        # Si alguno de los bandos no tiene unidades o si se ha sobrepasado el tiempo máximo la simulación termina
        if units_count[ALLY] == 0 or units_count[ENEMY] == 0 or (end - start) / 60 >= MAX_TIME:
            done = True
        else:
            turn += 1

        count_units()

    if units_count[ALLY] > units_count[ENEMY]:
        save_results(allies - units_count[ALLY], enemies - units_count[ENEMY], 1, 0, user)
    else:
        save_results(allies - units_count[ALLY], enemies - units_count[ENEMY], 0, 1, user)

    # Númeo de turnos totales
    result_dict[TOTAL_DICT] = turn

# -----------------------------------------------------------------------------------------------------------






