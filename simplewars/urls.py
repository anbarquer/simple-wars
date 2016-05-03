# -*- encoding: utf-8 -*-
# Antonio Diego Barquero Cuadrado - TFG - UEX - 2014/2015
# urls.py
# Enrutador de direcciones de la aplicación


from django.conf.urls import url
from simplewars import views


urlpatterns = [
    # Principal
    url(r'^$', views.index, name='index'),
    # Login
    url(r'login', views.user_login, name='login'),
    # Logout
    url(r'logout', views.user_logout, name='logout'),
    # Panel de control
    url(r'dashboard', views.dashboard, name='dashboard'),
    # Información del usuario
    url(r'user', views.user_settings, name='user'),
    # Reclutamiento de unidades
    url(r'army', views.army, name='army'),
    # Información de la unidad
    url(r'unit/(?P<unit_id>\d+)/$', views.unit, name='unit'),
    # Registro
    url(r'register', views.register, name='register'),
    # Creación de formación
    url(r'create-formation', views.create_formation, name='create-formation'),
    # Listado y modificación de formaciones
    url(r'list-formation', views.list_formation, name='list-formation'),
    # Creador de mapas, sólo administradores
    url(r'map-creator', views.map_creator, name='map-creator'),
    # Batallas
    url(r'battle', views.battle, name='battle')
]