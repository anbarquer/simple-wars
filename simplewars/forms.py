# -*- encoding: utf-8 -*-
# Antonio Diego Barquero Cuadrado - TFG - UEX - 2014/2015
# forms.py
# Campos y formularios de la aplicación


from django import forms
from django.core.validators import RegexValidator
from typification import USER_REGEX, STYLE_FIELDS, NAMES_FIELD_SIZE, EMAIL_SIZE, RECRUIT_SIZE


# -----------------------------------------------------------------------------------------------------------
# Campo nombre de usuario
def get_user_field():
    return forms.CharField(label='username',
                           required=True,
                           min_length=NAMES_FIELD_SIZE[0],
                           max_length=NAMES_FIELD_SIZE[1],
                           widget=forms.TextInput(attrs=STYLE_FIELDS['username']),
                           validators=[RegexValidator(USER_REGEX['username'])])


# -----------------------------------------------------------------------------------------------------------
# Campo contraseña
def get_password_field():
    return forms.CharField(label='password',
                           required=True,
                           min_length=NAMES_FIELD_SIZE[0],
                           max_length=NAMES_FIELD_SIZE[1],
                           widget=forms.PasswordInput(attrs=STYLE_FIELDS['password']),
                           validators=[RegexValidator(USER_REGEX['password'])])


# -----------------------------------------------------------------------------------------------------------
# Campo confirmación de contraseña
def get_password_confirm_field():
    return forms.CharField(label='confirm_password',
                           required=True,
                           min_length=NAMES_FIELD_SIZE[0],
                           max_length=NAMES_FIELD_SIZE[1],
                           widget=forms.PasswordInput(attrs=STYLE_FIELDS['confirm_password']),
                           validators=[RegexValidator(USER_REGEX['password'])])


# -----------------------------------------------------------------------------------------------------------
# Campo email
def get_email_field():
    return forms.CharField(label='email',
                           required=True,
                           max_length=EMAIL_SIZE,
                           widget=forms.EmailInput(attrs=STYLE_FIELDS['email']),
                           validators=[RegexValidator(USER_REGEX['email'])])


# -----------------------------------------------------------------------------------------------------------
# Campo de reclutamiento de unidades cuerpo a cuerpo
def get_melee_recruit_field():
    return forms.CharField(label='Cuerpo a cuerpo',
                           required=False,
                           max_length=RECRUIT_SIZE,
                           widget=forms.TextInput(attrs=STYLE_FIELDS['melee']),
                           validators=[RegexValidator(USER_REGEX['number'])])


# -----------------------------------------------------------------------------------------------------------
# Campo de reclutamiento de unidades defensivas
def get_defense_recruit_field():
    return forms.CharField(label='Defensa',
                           required=False,
                           max_length=RECRUIT_SIZE,
                           widget=forms.TextInput(attrs=STYLE_FIELDS['defense']),
                           validators=[RegexValidator(USER_REGEX['number'])])


# -----------------------------------------------------------------------------------------------------------
# Campo de reclutamiento de unidades de ataque a distancia
def get_distance_recruit_field():
    return forms.CharField(label='Distancia',
                           required=False,
                           max_length=RECRUIT_SIZE,
                           widget=forms.TextInput(attrs=STYLE_FIELDS['distance']),
                           validators=[RegexValidator(USER_REGEX['number'])])


# -----------------------------------------------------------------------------------------------------------
# Campo de nombre de formación
def get_formation_field():
    return forms.CharField(label='formationname',
                           required=True,
                           min_length=NAMES_FIELD_SIZE[0],
                           max_length=NAMES_FIELD_SIZE[1],
                           widget=forms.TextInput(attrs=STYLE_FIELDS['formation_name']),
                           validators=[RegexValidator(USER_REGEX['username'])])


# -----------------------------------------------------------------------------------------------------------
# Campo de nombre del mapa
def get_map_field():
    return forms.CharField(label='mapname',
                           required=True,
                           min_length=NAMES_FIELD_SIZE[0],
                           max_length=NAMES_FIELD_SIZE[1],
                           widget=forms.TextInput(attrs=STYLE_FIELDS['map_name']),
                           validators=[RegexValidator(USER_REGEX['username'])])


# -----------------------------------------------------------------------------------------------------------
# Formulario de identificación
class LoginForm(forms.Form):
    username = get_user_field()
    password = get_password_field()


# -----------------------------------------------------------------------------------------------------------
# Formulario de registro
class RegisterForm(forms.Form):
    username = get_user_field()
    password = get_password_field()
    confirm_password = get_password_confirm_field()
    email = get_email_field()


# -----------------------------------------------------------------------------------------------------------
# Formulario de cambio de usuario
class ChangeUserForm(forms.Form):
    username = get_user_field()


# -----------------------------------------------------------------------------------------------------------
# Formulario de cambio de contraseña
class ChangePassForm(forms.Form):
    password = get_password_field()
    confirm_password = get_password_confirm_field()


# -----------------------------------------------------------------------------------------------------------
# Formulario de email
class ChangeEmailForm(forms.Form):
    email = get_email_field()


# -----------------------------------------------------------------------------------------------------------
# Formulario de reclutamiento de unidades
class RecruitForm(forms.Form):
    melee = get_melee_recruit_field()
    defense = get_defense_recruit_field()
    distance = get_distance_recruit_field()


# -----------------------------------------------------------------------------------------------------------
# Formulario de nombre de formación
class FormationForm(forms.Form):
    formation_name = get_formation_field()


class MapForm(forms.Form):
    map_name = get_map_field()

# -----------------------------------------------------------------------------------------------------------