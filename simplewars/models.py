# -*- encoding: utf-8 -*-
# Antonio Diego Barquero Cuadrado - TFG - UEX - 2014/2015
# models.py
# Modelo de datos de la aplicación


from django.db import models
from django.contrib.auth.models import User
from typification import LEVEL_VALUE, MAX_LEVEL, COLUMNS


# -----------------------------------------------------------------------------------------------------------
# Usuario del juego. Es una extensión del modelo propio de Django
# - user: clave externa hacia el modelo User de Django
# - credits: créditos del jugador
class GameUser(models.Model):
    user = models.OneToOneField(User)
    credits = models.IntegerField(default=300)
    units_created = models.IntegerField(default=0)
    units_deleted = models.IntegerField(default=0)
    units_lost = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    loses = models.IntegerField(default=0)
    upgrade_points = models.IntegerField(default=0)

    def get_credits(self):
        return self.credits

    def subtract_credits(self, unit_cost):
        if 0 < unit_cost <= self.credits:
            self.credits -= unit_cost

    def get_user_info(self):
        return self.user

    def add_credits(self, more_credits):
        if more_credits > 0:
            self.credits += more_credits


# -----------------------------------------------------------------------------------------------------------
# Unidad, tiene una clave externa con respecto a usuario del juego
# - user: usuario
# - life: vida
# - attack: ataque
# - scope: alcande
# - defense: defensa
# - type: tipo
# - 0: Cuerpo a cuerpo
# - 1: Defensa
# - 2: Distancia
class Unit(models.Model):
    user = models.ForeignKey(GameUser)

    life = models.IntegerField()
    attack = models.IntegerField()
    scope = models.IntegerField()
    defense = models.IntegerField()
    type = models.IntegerField()

    upgrade_points = models.IntegerField(default=0)
    level = models.IntegerField(default=0)
    in_formation = models.BooleanField(default=False)


    def set_life(self, life):
        if life > 0:
            self.life = life

    def set_attack(self, attack):
        if attack > 0:
            self.attack = attack

    def set_scope(self, scope):
        if scope > 0:
            self.scope = scope

    def set_defense(self, defense):
        if defense > 0:
            self.defense = defense

    def update_attrs(self, life, attack, scope, defense):
        self.set_life(life)
        self.set_attack(attack)
        self.set_scope(scope)
        self.set_defense(defense)

    # Retorna todos los atributos de la unidad en una lista
    def get_atts_values(self):
        return [self.life, self.attack, self.scope, self.defense]

    # Método que sube de nivel a la unidad. Hay que llevar un control de los puntos
    # que se han utilizado en la unidad por ello en vez de sumarlos hay que ir restando para
    # comprobar cuándo estos puntos hacen que la unidad suba de nivel
    def level_up(self, cost):
        if self.level < MAX_LEVEL:
            while cost > 0:
                self.upgrade_points += 1
                if self.upgrade_points % LEVEL_VALUE == 0:
                    self.level += 1
                cost -= 1

    # Índice con clave múltiple para optimizar búsquedas
    class Meta:
        index_together = ['type', 'in_formation']


# -----------------------------------------------------------------------------------------------------------
# Formación, tiene una clave externa con respecto a la unidad y otra con respecto al mapa
# - name: nombre de la formación
# - unit: unidad
# - position: posición en el mapa
class Formation(models.Model):
    name = models.ForeignKey('FormationNames')
    unit = models.ForeignKey(Unit)
    position = models.ForeignKey('Map')

    # Clave alternativa múltiple para asegurar que las unidades sólo pueden estar
    # en una posición concreta
    class Meta:
        unique_together = ('unit', 'position', 'name')


# Nombre de formación, tiene una clave externa con respecto del usuario para controlar los nombres de formaciones asociadas.
# - formation_name: nombre de la formación
# - formation_count: número total de unidades de la formación
# - formation_map: mapa para el que se creó la formación
# - user: usuario dueño de la formación
class FormationNames(models.Model):
    formation_name = models.CharField(max_length=20, db_index=True)
    formation_count = models.IntegerField()
    formation_map = models.CharField(max_length=20)
    user = models.ForeignKey(GameUser)


# -----------------------------------------------------------------------------------------------------------
# Mapa, tiene una clave externa con respecto a sí mismo
# - name: nombre
# - q: columna en la simulación
# - r: fila en la simulación
# - x: x en la vista
# - y: y en la vista
class Map(models.Model):
    name = models.ForeignKey('MapNames')
    position = models.ForeignKey('Coordinates')

    # Clave alternativa múltiple para asegurar que las unidades sólo pueden estar
    # en una posición concreta e índice para optimizar las búsquedas
    class Meta:
        unique_together = ('name', 'position')


# -----------------------------------------------------------------------------------------------------------
# Nombres de mapas
# - map_name: nombre del mapa
# - map_count: número de posiciones del mapa
#
class MapNames(models.Model):
    map_name = models.CharField(max_length=20, db_index=True)
    map_count = models.IntegerField()


# -----------------------------------------------------------------------------------------------------------
# Coordenadas del juego. Contiene todas las conversiones de las coordenadas del juego
# - q: coordenada columna
# - r: coordenada fila
# - x: posición x de la vista
# - y: posición y de la vista
# - cube_x: coordenada cúbica x
# - cube_y: coordenada cúbica y
# - cube_z_ coordenada cúbica z
class Coordinates(models.Model):
    q = models.IntegerField()
    r = models.IntegerField()
    x = models.IntegerField()
    y = models.IntegerField()

    class Meta:
        index_together = ['x', 'y']
        index_together = ['q', 'r']


# ------------------------------------------------------------------------------------------------------------
# Posiciones vecinas de todas las casillas del mapa
# - position: coordenadas de la posición
# - range_<n>: rango de los vecinos. Va desde 1 (adyacentes) hasta 39 (máximo del mapa)

class Neighbors(models.Model):
    position = models.ForeignKey('Coordinates')
    pass

# Se añaden de forma dinámica todos los campos de la tabla para almacenar los vecinos
for limit in range(1, COLUMNS):
    Neighbors.add_to_class('range_%s' % limit, models.TextField())
# ------------------------------------------------------------------------------------------------------------







