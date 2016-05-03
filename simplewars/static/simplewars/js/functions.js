/*
 * Antonio Diego Barquero Cuadrado - TFG - UEX - 2014/2015
 * functions.js
 * Funciones auxiliares para la gestión general de los elementos de la interfaz de la aplicación
 */
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Expresiones regulares ******************************************************
//------------------------------------------------------------------------------------------------------------------------------------
var USERNAME_REGEX = /^[a-z0-9][\w._-]{4,19}$/i;
var PASS_REGEX = /(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9]{5,20})$/;
var EMAIL_REGEX = /^[0-9a-zA-Z]+([0-9a-zA-Z]*[-._+])*[0-9a-zA-Z]+@[0-9a-zA-Z]+([-.][0-9a-zA-Z]+)*([0-9a-zA-Z]*[.])[a-zA-Z]{2,6}$/;
var NUMBER_REGEX = /^\d*$/;
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Mensajes de error *********************************************************
//------------------------------------------------------------------------------------------------------------------------------------
var USERNAME_ERROR = 'El nombre de usuario no debe comenzar por caracteres no alfanuméricos, debe tener como mínimo 5 caracteres, como máximo 20 y no puede contener espacios';
var PASS_ERROR = 'La contraseña debe contener caracteres alfanuméricos, al menos un número, una letra, debe tener como mínimo 5 caracteres, como máximo 20 y no puede contener espacios';
var EMAIL_ERROR = 'La dirección de correo introducida no es correcta';
var PASS_CONFIRM_ERROR = 'Las contraseñas deben coincidir';
var INSUFFICIENT_CREDITS_ERROR = 'No hay créditos suficientes';
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Identificadores de mensajes de error ***************************************
//------------------------------------------------------------------------------------------------------------------------------------
var USERNAME_ERROR_ID = '#username_error';
var PASS_ERROR_ID = '#password_error';
var EMAIL_ERROR_ID = '#email_error';
var PASS_CONFIRM_ERROR_ID = '#confirm_password_error';
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Identificadores de batalla y formaciones ***********************************
//------------------------------------------------------------------------------------------------------------------------------------
var TOTAL_BATTLE_ID = '#total_battle';
var LIMIT_BATTLE_ID = '#limit_battle';
var MOD_FORMATION_FORM = '#mod_formation';
//------------------------------------------------------------------------------------------------------------------------------------
// ************************************ Identificadores del control de costes en el reclutamiento ************************************
//------------------------------------------------------------------------------------------------------------------------------------
var CREDITS_ID = '.credits';
var TOTAL_COST_ID = '.total_cost';
var FINAL_CREDITS_ID = '.final_credits';
var MELEE_INPUT_ID = '#id_melee';
var DISTANCE_INPUT_ID = '#id_distance';
var DEFENSE_INPUT_ID = '#id_defense';
var MELEE_COST_ID = '#melee_cost';
var DISTANCE_COST_ID = '#distance_cost';
var DEFENSE_COST_ID = '#defense_cost';
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Identificadores de unidades y mejoras **************************************
//------------------------------------------------------------------------------------------------------------------------------------
var RECRUIT_FORM_ID = '#recruit';
var UPGRADE_UNIT_FORM_ID = '#upgrade_unit';
var SELECT_ALL_ID = '#select_all';
var UNIT_UPGRADE_WRAPPER = '#upgrade_in_formlist';
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Identificadores de reclutamiento *******************************************
//------------------------------------------------------------------------------------------------------------------------------------
var MELEE_LIST_ID = '#melee_units';
var DISTANCE_LIST_ID = '#distance_units';
var DEFENSE_LIST_ID = '#defense_units';
var INFO_DELETE_ID = '#deleted_list';
var RECRUIT_NAV_ID = '#units_nav';
var SELECTED_CLASS = 'selected';
//------------------------------------------------------------------------------------------------------------------------------------
// ************************************************************************ Etiquetas ************************************************
//------------------------------------------------------------------------------------------------------------------------------------
var TOTAL_COST_LABEL = 'Coste: ';
var FINAL_LABEL = 'Resto: ';
var MELEE_LABEL = 'Cuerpo a cuerpo: ';
var DEFENSE_LABEL = 'Defensa: ';
var DISTANCE_LABEL = 'Distancia: ';
var LIFE_LABEL = 'Vida: ';
var ATTACK_LABEL = 'Ataque: ';
var SCOPE_LABEL = 'Alcance: ';
var CREDITS_LABEL = 'Créditos: ';
var MELEE_TAB_LABEL = 'Cuerpo a cuerpo';
var DEFENSE_TAB_LABEL = 'Defensa';
var DISTANCE_TAB_LABEL = 'Distancia';
var SELECT_ALL_LABEL = 'Seleccionar todos';
var UNSELECT_ALL_LABEL = 'Descartar todos';
var POINTS_LABEL = 'Puntos: ';
var LEVEL_LABEL = 'Nivel: ';
//------------------------------------------------------------------------------------------------------------------------------------
// ****************** Tabla de unidades, identificadores y valores por defecto de sus atributos **************************************
//------------------------------------------------------------------------------------------------------------------------------------
var SELECTED_UNITS_LIST = []; // Lista de unidades seleccionadas (IMPORTANTE)
var UNITS_TYPES_LABELS = []; // Tipo de las unidades para la carga de los assets
UNITS_TYPES_LABELS[MELEE_TAB_LABEL] = 0;
UNITS_TYPES_LABELS[DEFENSE_TAB_LABEL] = 1;
UNITS_TYPES_LABELS[DISTANCE_TAB_LABEL] = 2;
// Valores por defecto de las unidades. Por orden:
// [ nivel, vida, ataque, alcance, defensa ]
var DEFAULT_MELEE_VALUES = [0, 0, 0, 1, 1];
var DEFAULT_DISTANCE_VALUES = [0, 0, 1, 0, 1];
var DEFAULT_DEFENSE_VALUES = [0, 0, 1, 1, 0];
var LEVEL_MULT = 10;
var MAX_LEVEL = 20;
// Bandera que controla el tipo del último despliegue
var MAX_ATT = 40;
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Identificadores de mejoras *************************************************
//------------------------------------------------------------------------------------------------------------------------------------
var LIFE_ID = '#life';
var ATTACK_ID = '#attack';
var SCOPE_ID = '#scope';
var DEFENSE_ID = '#defense';
var UNIT_ID = '#id';
var UPGRADED_CLASS = 'upgraded';
var POINTS_ID = '#points';
var LEVEL_ID = '#level';
//------------------------------------------------------------------------------------------------------------------------------------
// ******************************************************************* Wrappers ******************************************************
//------------------------------------------------------------------------------------------------------------------------------------
var WRAPPER_UPGRADE = '#wrapper';
var WRAPPER_CREDITS = '#wrapper_credits';
//------------------------------------------------------------------------------------------------------------------------------------
// ******************************************************************** Alertas ******************************************************
//------------------------------------------------------------------------------------------------------------------------------------
var SUCCESS_CLASS = 'li.success.alert';
var ERROR_CLASS = 'li.danger.alert';
var UNIT_LINK_CLASS = '.unit_link';
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Funciones auxiliares *******************************************************
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Retorna si el contenido de un campo concuerda con la expresión regular.
 * - field: campo que se va a comprobar.
 * - regex: expresión regular.
 */
function regex_validation(field, regex) {
    return field.val().match(regex) !== null;
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Escribe un mensaje en el documento dada una etiqueta.
 * - field_id: identificador de la etiqueta.
 * - message: mensaje que se desea mostrar.
 */
function show_message(field_id, message) {
    $(field_id).text(message);
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Retorna si la entrada del usuario es correcta y muestra un mensaje en caso negativo.
 * - field: campo que se va a comprobar.
 * - regex: expresión regular.
 * - field_id: identificador de la etiqueta para mostrar el mensaje en el documento.
 * - message: mensaje que se va a mostrar en caso de error.
 */
function field_validation(field, regex, field_id, message) {
    var valid = false;
    if (regex_validation(field, regex)) {
        message = "";
        valid = true;
    }
    show_message(field_id, message);
    return valid;
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Realiza la comprobación de repetición de contraseñas.
 * - field_id: nombre del campo que va a mostrar el mensaje con el resultado de la validación.
 * - message: mensaje que se va a mostrar.
 */
function password_confirmation(field_id, message) {
    var valid = false;
    var confirm_pass = $('#id_confirm_password');
    var pass = $('#id_password');
    if (confirm_pass.val() === pass.val() && confirm_pass.val() !== "") {
        message = "";
        valid = true;
    }
    show_message(field_id, message);
    return valid;
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Obtiene el número que contiene una cadena en el DOM.
 * - field_id: identificador del campo de donde se quiere extraer el número.
 */
function get_field_value(field_id) {
    //Se utiliza para los párrafos normales HTML
    var result = parseInt($(field_id).text().replace(/^\D+/g, ""));
    if (isNaN(result)) {
        result = 0;
    }
    return result;
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Obtiene el valor de un campo de formulario dado un identificador.
 * - input_id: identificador del campo de formulario.
 */
function get_input_value(input_id) {
    //Se utiliza para los inputs de los formularios
    var result = parseInt($(input_id).val());
    // Si no es un número retorna 0
    if (isNaN(result)) {
        result = 0;
        $(input_id).val(0);
    }

    return result;
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Comprueba que todos los datos introducidos en los campos de reclutamiento de unidades
 * sean numéricos.
 * - field_id: identificador del campo del formulario.
 */
function allow_only_numbers(field_id) {
    $(field_id).on('keypress', function (ev) {
        var key_code = window.event ? ev.keyCode : ev.which;
        // ASCII de los números
        if (key_code < 48 || key_code > 57) {
            if (key_code != 0 && key_code != 8 && key_code != 13 && !ev.ctrlKey) {
                ev.preventDefault();
            }
        }
    });
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Controlan que a la hora de introducir datos en los campos del formulario de reclutamiento
 * esta sea sólo numérica.
 */
// Campo de reclutamiento de unidades cuerpo a cuerpo
allow_only_numbers(MELEE_INPUT_ID);
// Campo de reclutamiento de unidades defensivas
allow_only_numbers(DEFENSE_INPUT_ID);
// Campo de reclutamiento de unidades de ataque a distancia
allow_only_numbers(DISTANCE_INPUT_ID);
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Muestra un mensaje con animación en el selector para informar al usuario sobre un evento determinado.
 * - selector: atributo del DOM.
 * - message: mensaje que se desea mostrar.
 */
function show_animated_message(selector, message) {
    // Animación: muestra el mensaje, espera y lo oculta
    if (!$(selector).is(':animated')) {
        $(selector).text(message).fadeIn('slow').delay(500).fadeOut('slow');
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Retorna el índice de un vector que cumpla una determinada propiedad
 * - list: Vector que se va a recorrer.
 * - id: Valor que se está buscando.
 * - property: Propiedad del objeto que se desea comparar.
 */
function index_of(list, id, property) {
    for (var i = 0; i < list.length; i++) {
        if (list[i][property] == id) {
            return i;
        }
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Manda una petición AJAX.
 * - form: formulario.
 * - data: datos que se van a enviar.
 * - callback: función que se desea ejecutar tras la petición si no han ocurrido errores.
 */
function ajax_form_petition(form, data, callback) {
    $.ajax({
        url: $(form).attr('action'),
        type: $(form).attr('method'),
        data: {
            data: data,
            csrfmiddlewaretoken: $(form).find('input:hidden').val()
        },
        success: function (response) {
            // Si el servidor retorna error se muestra, en caso contrario se llama a la función callback con la respuesta.
            response['error'] !== undefined ? show_animated_message(ERROR_CLASS, response['error']) : callback(response);
        }
    });
}
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Validación de formularios **************************************************
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Comprueba que todos los campos del reclutamiento sean correctos. Esto es que sean mayores que 0
 * y que no sobrepasen el número total de créditos del jugador.
 */
function validate_all_inputs() {
    // Número de unidades de ataque cuerpo a cuerpo
    var melee = get_input_value(MELEE_INPUT_ID);
    // Número de unidades de ataque a distancia
    var distance = get_input_value(DISTANCE_INPUT_ID);
    // Número de unidades defensivas
    var defense = get_input_value(DEFENSE_INPUT_ID);
    var total = melee + distance + defense;
    // El total debe de ser menor o igual al número de créditos
    return total <= get_field_value(CREDITS_ID) && melee >= 0 && distance >= 0 && defense >= 0;
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Actualiza los valores del reclutamiento en curso con el coste total y el resto de créditos
 * que quedan tras la compra.
 */
function set_total_values() {
    var total = get_input_value(MELEE_INPUT_ID) + get_input_value(DEFENSE_INPUT_ID) + get_input_value(DISTANCE_INPUT_ID);
    var user_credits = get_field_value(CREDITS_ID);
    var result = user_credits - total;

    show_message(TOTAL_COST_ID, TOTAL_COST_LABEL + total);
    show_message(FINAL_CREDITS_ID, FINAL_LABEL + result);

    if (result < 0) {
        $(FINAL_CREDITS_ID).css('color', 'rgb(255, 0, 0)');
        $(ERROR_CLASS).text(INSUFFICIENT_CREDITS_ERROR).fadeIn('slow');
    } else {
        $(FINAL_CREDITS_ID).css('color', 'rgb(85, 85, 85)');
        $(ERROR_CLASS).fadeOut('slow');
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Valida que la entrada del formulario de reclutamiento sea correcta.
 * - field: campo que se desea comprobar.
 */
function validate_unit_cost(field) {
    return ((validate_all_inputs() && regex_validation(field, NUMBER_REGEX)) || (field === ""));
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Comprueba que todos los campos del formulario de reclutamiento son correctos
 * y muestra los resultados en los campos de la interfaz
 * - field_id: identificador del campo de coste por unidad.
 * - field_input_id: identificador del campo del formulario.
 * - field: referencia al campo que se va a comprobar.
 * - unit: tipo de unidad.
 */
function validate_recruit(field_id, field_input_id, field, unit) {
    var correct = false;
    var message = unit;
    if (validate_unit_cost(field)) {
        correct = true;
    }

    message += get_input_value(field_input_id);
    show_message(field_id, message);
    set_total_values();
    return correct;
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Comprobación de la entrada del formulario de identificación del usuario
 * Este método se utiliza en la identificación del usuario que contiene la página "login.html"
 * Como parámetros recibe un vector de campos con el nombre que se le ha proporcionado y un método
 * que realice la validación.
 * - username: nombre de usuario.
 * - password: contraseña.
 */
$('#login').validation({
    required: [
        {
            name: 'username',
            validate: function ($el) {
                return field_validation($el, USERNAME_REGEX, USERNAME_ERROR_ID, USERNAME_ERROR);
            }
        },
        {
            name: 'password',
            validate: function ($el) {
                return field_validation($el, PASS_REGEX, PASS_ERROR_ID, PASS_ERROR);
            }
        }
    ]
});
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Comprobación de la entrada del formulario de registro del usuario
 * Este método se utiliza en el registro del usuario que contiene la página "register.html"
 * Como parámetros recibe un vector de campos con el nombre que se le ha proporcionado y un método
 * que realice la validación. También verifica que la confirmación de la contraseña se ha realizado satisfactoriamente.
 * - username: nombre de usuario.
 * - password: contraseña.
 * - confirm_password: confirmación de contraseña.
 * - email: dirección de correo.
 */
$('#register').validation({
    required: [
        {
            name: 'username',
            validate: function ($el) {
                return field_validation($el, USERNAME_REGEX, USERNAME_ERROR_ID, USERNAME_ERROR);
            }
        },
        {
            name: 'password',
            validate: function ($el) {
                return field_validation($el, PASS_REGEX, PASS_ERROR_ID, PASS_ERROR);
            }
        },
        {
            name: 'confirm_password',
            validate: function ($el) {
                // Confirmación de la contraseña correcta
                return password_confirmation(PASS_CONFIRM_ERROR_ID, PASS_CONFIRM_ERROR);
            }
        },
        {
            name: 'email',
            validate: function ($el) {
                return field_validation($el, EMAIL_REGEX, EMAIL_ERROR_ID, EMAIL_ERROR);
            }
        }
    ]
});
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Comprobación de la entrada del formulario cambio de nombre de usuario.
 * Este método se utiliza cambio de nombre de usuario que contiene la página "user.html"
 * Como parámetros recibe un vector de campos con el nombre que se le ha proporcionado y un método
 * que realice la validación.
 * - username: nombre de usuario.
 */
$('#change_user').validation({
    required: [
        {
            name: 'username',
            validate: function ($el) {
                return field_validation($el, USERNAME_REGEX, USERNAME_ERROR_ID, USERNAME_ERROR);
            }
        }
    ],
    fail: function () {
        show_animated_message(ERROR_CLASS, 'El nombre de usuario no es correcto');
    },
    submit: function (data) {
        var username_input = $('#id_username');
        var change_user_form = $('#change_user');
        var username = $('#username');

        if (username_input.val() !== '' && username.text() != username_input.val()) {
            $.ajax({
                url: change_user_form.attr('action'),
                type: change_user_form.attr('method'),
                data: {
                    username: username_input.val(),
                    csrfmiddlewaretoken: change_user_form.find('input:hidden').val()
                },
                success: function (response) {
                    if (response['error'] !== undefined) {
                        show_animated_message(ERROR_CLASS, response['error']);
                    } else {
                        username.text(username_input.val());
                        username_input.text('');
                        show_animated_message(SUCCESS_CLASS, 'Nombre de usuario cambiado');
                    }
                }
            });
        }
    }
});
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Comprobación de la entrada del formulario cambio de contraseña de usuario.
 * Este método se utiliza cambio de contraseña que contiene la página "user.html"
 * Como parámetros recibe un vector de campos con el nombre que se le ha proporcionado y un método
 * que realice la validación. También realiza la validación de confirmación de contraseña.
 * - password: contraseña.
 * - confirm_password: confirmación de contraseña.
 */
$('#change_pass').validation({
    required: [
        {
            name: 'password',
            validate: function ($el) {
                return field_validation($el, PASS_REGEX, PASS_ERROR_ID, PASS_ERROR);
            }
        },
        {
            name: 'confirm_password',
            validate: function ($el) {
                // Confirmación de la contraseña correcta
                return password_confirmation(PASS_CONFIRM_ERROR_ID, PASS_CONFIRM_ERROR);
            }
        }
    ]
});
//------------------------------------------------------------------------------------------------------------------------------------
/* Comprobación de la entrada del formulario cambio de email de usuario.
 * Este método se utiliza cambio de email que contiene la página "user.html"
 * Como parámetros recibe un vector de campos con el nombre que se le ha proporcionado y un método
 * que realice la validación.
 * - email: email de usuario.
 */
$('#change_email').validation({
    required: [
        {
            name: 'email',
            validate: function ($el) {
                return field_validation($el, EMAIL_REGEX, EMAIL_ERROR_ID, EMAIL_ERROR);
            }
        }
    ],
    fail: function () {
        show_animated_message(ERROR_CLASS, 'La dirección de correo no es correcta');
    },
    submit: function (data) {
        var email_input = $('#id_email');
        var email = $('#email');
        var change_email_form = $('#change_email');
        if (email_input.val() !== "" && email.text() != email_input.val()) {
            $.ajax({
                url: change_email_form.attr('action'),
                type: change_email_form.attr('method'),
                data: {
                    email: email_input.val(),
                    csrfmiddlewaretoken: change_email_form.find('input:hidden').val()
                },
                success: function (response) {
                    if (response['error'] !== undefined) {
                        show_animated_message(ERROR_CLASS, response['error']);
                    } else {
                        email.text(email_input.val());
                        email_input.text('');
                        show_animated_message(SUCCESS_CLASS, 'Email cambiado');
                    }
                }
            });
        }
    }
});
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Formulario que valida la entrada de reclutamiento de unidades.
 * Este método se utiliza en el formulario de reclutamiento de la página "army.html"
 * - melee: campo para el reclutamiento de unidades cuerpo a cuerpo.
 * - defense: campo para el reclutamiento de unidades defensivas.
 * - distance: campo para el reclutamiento de unidades de ataque a distancia.
 */
$(RECRUIT_FORM_ID).validation({
    required: [
        {
            name: 'melee',
            validate: function ($el) {
                return validate_recruit(MELEE_COST_ID, MELEE_INPUT_ID, $el, MELEE_LABEL);
            }
        },
        {
            name: 'defense',
            validate: function ($el) {
                return validate_recruit(DEFENSE_COST_ID, DEFENSE_INPUT_ID, $el, DEFENSE_LABEL);
            }
        },
        {
            name: 'distance',
            validate: function ($el) {
                return validate_recruit(DISTANCE_COST_ID, DISTANCE_INPUT_ID, $el, DISTANCE_LABEL);
            }
        }
    ]
});
//------------------------------------------------------------------------------------------------------------------------------------
/* Comprobación de la entrada del formulario de creación de formación.
 * Este método se utiliza en la página "create_formation.html"
 * Como parámetros recibe un vector de campos con el nombre que se le ha proporcionado y un método
 * que realice la validación.
 * - formation_name: email de usuario.
 */
$('#formation').validation({
    required: [
        {
            name: 'formation_name',
            validate: function ($el) {
                return field_validation($el, USERNAME_REGEX, '#formation_name_error', 'El nombre de la formación no debe comenzar por caracteres no alfanuméricos, debe tener como mínimo 5 caracteres, como máximo 20 y no puede contener espacios');
            }
        }
    ],
    fail: function () {
        show_animated_message(ERROR_CLASS, 'El nombre de la formación no es correcto');
    },
    submit: function (data) {
        submit_formation();
    }
});
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Operaciones con unidades ***************************************************
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Selecciona una fila concreta de una tabla y agrega el identificador de la unidad a una lista
 * - table_id: Identificador de la tabla para la que se desea este comportamiento
 */
function set_table(table_id) {
    // Tabla reordenable por atributo de la cabecera.
    $(table_id).stupidtable();
    $(table_id + ' tbody').on('click', 'tr', function () {
        var row = $(this);
        // Identificador de la unidad
        var id = row.attr('id');
        // Nivel de la unidad
        var level = row.find('td').eq(1).text();
        var i = -1;
        // Si la fila ya se ha seleccionado
        if (row.hasClass(SELECTED_CLASS)) {
            // Se elimina la clase
            row.removeClass(SELECTED_CLASS);
            i = index_of(SELECTED_UNITS_LIST, id, 'id');
            if (i > -1) {
                // Se elimina del listado de unidades seleccionadas
                SELECTED_UNITS_LIST.splice(i, 1);
            }
        } else {
            // En caso de no estar seleccionada se añade al listado
            row.addClass(SELECTED_CLASS);
            SELECTED_UNITS_LIST.push({
                'id': id,
                'level': level,
                'label': UNITS_TYPES_LABELS[$('.tab-nav li.active').text()]
            });

        }
        // Cambia la etiqueta del botón "Seleccionar todos" / "Desmarcar todos"
        switch_label_select_all(table_id);
        // En caso de haber unidades seleccionadas se muestra el botón "Eliminar"
        SELECTED_UNITS_LIST.length > 0 ? $(INFO_DELETE_ID).show() : $(INFO_DELETE_ID).hide();

        // Actualización de la interfaz a la hora de desplegar las unidades en el campo de batalla
        // Esto se realiza aquí porque se utiliza la misma tabla.
        update_selected_counters();
    });
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Asociación de las filas de las tablas con el filtro por columnas y la selección de filas.
 */
set_table(MELEE_LIST_ID);
set_table(DISTANCE_LIST_ID);
set_table(DEFENSE_LIST_ID);
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Asociación del enlace de cada fila con el evento del ratón en la pulsación del identificador. Cuando
 * se pulse, en vez de abrir el enlace normalmente se realizará una petición al servidor para mostrar los
 * datos de edición de atributos de la unidad.
 */
bind_link_event();
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Añade una nueva fila a una tabla con unos valores determinados
 * - table_id:
 * - id_: Identificador de la unidad.
 * - life: Atributo vida.
 * - attack: Atributo ataque.
 * - scope: Atributo alcance.
 * - defense: Atributo defensa.
 */
function add_table_row(table_id, id, level, life, attack, scope, defense) {
    // Las primeras columnas de todas las unidades son exactamente iguales, el cambio llega según el tipo:
    // - Cuerpo a cuerpo: ataque
    // - Distancia: alcance
    // - Defensa: defensa
    var table_body = table_id + ' tbody';
    var new_row = '<tr id=\"' + id + '\"><td><a href="#" class="unit_link">' + '<i class=' + '"icon-plus-circled">' + '</i>' + '</a>' + ' </td><td>' + level + '</td><td>' + life + '</td>';
    // Cuerpo a cuerpo
    if (table_id == MELEE_LIST_ID)
        new_row += '<td>' + attack + '</td></tr>';
    // Defensa
    if (table_id == DEFENSE_LIST_ID)
        new_row += '<td>' + defense + '</td></tr>';
    // Distancia
    if (table_id == DISTANCE_LIST_ID)
        new_row += '<td>' + scope + '</td></tr>';
    // Se añade la nueva fila a la tabla
    $(new_row).appendTo(table_body);
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Añade todas las filas de las unidades que han sido reclutadas.
 * - table_id: Identificador de la tabla.
 * - list: Lista de identificadores de las unidades.
 * - values: Valores de los atributos de la unidad.
 */
function recruit_units(table_id, list, values) {
    for (var i = 0; i < list.length; i++) {
        add_table_row(table_id, list[i], values[0], values[1], values[2], values[3], values[4]);
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Añade las filas de unidades reclutadas a cada tabla
 * - melee_list: Lista de unidades cuerpo a cuerpo.
 * - defense_list: Lista de unidades defensivas.
 * - distance_list: Lista de unidades de ataque a distancia.
 */
function recruit_all_units(melee_list, defense_list, distance_list) {
    recruit_units(MELEE_LIST_ID, melee_list, DEFAULT_MELEE_VALUES);
    recruit_units(DEFENSE_LIST_ID, defense_list, DEFAULT_DEFENSE_VALUES);
    recruit_units(DISTANCE_LIST_ID, distance_list, DEFAULT_DISTANCE_VALUES);
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Actualiza la información de los costes en la interfaz de usuario
 * - credits: Créditos del usuario.
 */
function update_costs(credits) {
    var unit = get_input_value(MELEE_INPUT_ID) + get_input_value(DEFENSE_INPUT_ID) + get_input_value(DISTANCE_INPUT_ID);
    var total = credits - unit;
    // Actualiza la sección de coste de reclutamiento
    show_message(CREDITS_ID, CREDITS_LABEL + credits);
    show_message(TOTAL_COST_ID, TOTAL_COST_LABEL + unit);
    show_message(FINAL_CREDITS_ID, FINAL_LABEL + total);
    // Muestra los datos en color rojo en caso que el coste exceda a los créditos totales.
    total < 0 ? $(FINAL_CREDITS_ID).css('color', 'rgb(255, 0, 0)') : $(FINAL_CREDITS_ID).css('color', 'rgb(85, 85, 85)');
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Vuelve a colocar la información sobre el coste de las unidades al valor por defecto.
 * - credits: Créditos del usuario.
 */
function reset_costs(credits) {
    show_message(CREDITS_ID, CREDITS_LABEL + credits);
    show_message(TOTAL_COST_ID, TOTAL_COST_LABEL + 0);
    show_message(FINAL_CREDITS_ID, FINAL_LABEL + credits);
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Cierra la parte de la interfaz en donde se modifican las unidades y vuelve a mostrar el formulario de reclutamiento.
 */
function close_upgrade_unit() {
    // Formulario de reclutamiento
    $(RECRUIT_NAV_ID).fadeIn();
    // Interfaz de los créditos que se muestra al mejorar las unidades.
    $(WRAPPER_CREDITS).slideUp();
    // Botón de eliminar unidades
    if (SELECTED_UNITS_LIST.length > 0) $(INFO_DELETE_ID).show();
    // Interfaz de mejora de unidades.
    $(WRAPPER_UPGRADE).hide();
    $('#recruit_credits').show();
    $(SELECT_ALL_ID).parents(':eq(1)').show();
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Muestra un sombreado verdoso en la fila de la unidad que ha sido modificada correctamente.
 */
function shadow_upgraded() {
    // Muestra un sombreado verde en torno a la fila que se ha actualizado
    var selector = '#' + get_field_value(UNIT_ID);
    $(selector).addClass(UPGRADED_CLASS);
    setTimeout(function () {
        // El sombreado verde dura 1,7 segundos (el mismo tiempo que tarda el mensaje en mostrarse y desaparecer)
        $(selector).removeClass(UPGRADED_CLASS);
    }, 1700);
    close_upgrade_unit();
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Hace que el botón de "submit" del formulario de mejora de la unidad no tenga el comportamiento por defecto
 * ya que se va a realizar una petición AJAX en su lugar. Cuando esta termina se informa al usuario debidamente y se
 * actualizan los parámetros necesarios de la interfaz.
 */
function bind_form_update() {
    // Cuando se pulse sobre el botón de enviar del formulario no se debe hacer nada ya que se va a realizar una petición asíncrona
    $(UPGRADE_UNIT_FORM_ID).submit(function (event) {
        event.preventDefault();
    });
    /*
     * Cuando se realiza una modificación de una unidad:
     * - Éxito: se actualiza en servidor mediante una petición AJAX, se actualizan los datos de la interfaz y se cierra la sección de modificación
     * - Fallo: el usuario no tiene los créditos necesarios para acometer la mejora de la unidad. Se informa y se cierra la sección de modificación
     */
    $('#submit_upgrade').click(function () {
        if (get_field_value(CREDITS_ID) - get_field_value(TOTAL_COST_ID) < 0) {
            show_animated_message(ERROR_CLASS, INSUFFICIENT_CREDITS_ERROR);
        } else {
            if (get_field_value(TOTAL_COST_ID) > 0) {
                upgrade_unit();
                update_costs(get_field_value(CREDITS_ID));
            }
        }
    });
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Hace que el botón de "cancel" del formulario de mejora de la unidad modifique la interfaz para que vuelva a
 * encontrarse como antes. Vuelve a mostrar el formulario de reclutamiento y cierra la parte de dedicada a la
 * mejora de atributos.
 */
function bind_cancel() {
    /*
     * Cierre de la sección de modificación. Esto conlleva volver a actualizar la interfaz para deshacer los cambios y eliminar la información
     * de la actualización de la unidad
     */
    $('#cancel_upgrade').click(function () {
        /*
         * Cuando se pulsa sobre el botón de cancelar:
         * - Los costes de la mejora deben resetearse
         * - Se cierra la parte de la interfaz correspondiente a la modificación de la unidad
         * - Se realizan los efectos de la vista
         */
        $(FINAL_CREDITS_ID).css('color', 'rgb(85, 85, 85)');
        update_costs(get_field_value(CREDITS_ID));
        close_upgrade_unit();
        $(WRAPPER_UPGRADE).empty();
        $(WRAPPER_CREDITS).hide();
        // Botón de elminar unidades, sólo debe mostrarse si existen unidades seleccionadas.
        if (SELECTED_UNITS_LIST.length > 0)
            $(INFO_DELETE_ID).show();
        $(UNIT_UPGRADE_WRAPPER).fadeOut();
    });
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Enlaza las peticiones AJAX y la transformación de la interfaz a la hora de modificar la unidad tanto si se mejora
 * como si se cancela la acción. Esto se ha realizado en un módulo a parte ya que cuando se muestra la interfaz correspondiente
 * a la modificación de la unidad la nueva interfaz carece del comportamiento esperado.
 */
function bind_upgrade_unit() {
    /*
     * Cuando se recluta una nueva unidad y se desea mantener el comportamiento general de la vista se deben de realizar dos acciones:
     * - Acción que se realiza cuando se modifican datos: formulario y peticiones de mejora de unidad asíncronas
     * - Cancelar la mejora, se debe de modificar toda la interfaz
     */
    bind_form_update();
    bind_cancel();
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Realiza una petición AJAX al servidor con la vista de la unidad. Una vez realizada, se realizan los cambios pertinentes
 * en la interfaz. Estos son ocultar el formulario de reclutamiento y mostrar la información de modificación de la unidad.
 */
function bind_link_event() {
    $(UNIT_LINK_CLASS).on('click', function (event) {
        // No se realiza una subida del "scroll" de la página automáticamente.
        event.stopPropagation();
        reset_costs(get_field_value(CREDITS_ID));
        // Obtiene el identificador de la unidad el cual es el 'id' del HTML de la fila de la tabla
        var id = $(this).closest('tr').attr('id');
        // Petición AJAX para la plantilla HTML de la unidad. Se mostrará en la etiqueta del DOM identificada por WRAPPER_UPGRADE
        $.ajax({
            url: '/simplewars/unit/' + id + '/',
            type: 'GET',
            success: function (response) {
                /*
                 * Cambio de la interfaz: se muestra en la parte superior de la vista una sección que permite modificar los
                 * atributos de la unidad
                 */
                $(SELECT_ALL_ID).parents(':eq(1)').hide();
                $(WRAPPER_UPGRADE).html(response).hide().show();
                bind_upgrade_unit();
                $(WRAPPER_CREDITS).hide().show();
                $(INFO_DELETE_ID).hide();
                $(RECRUIT_NAV_ID).hide();
                $('#recruit_credits').hide();
            }
        });
    });
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 *  Añade las filas necesarias a las tablas con las nuevas unidades reclutadas, actualiza los contadores de créditos y unidades
 *  muestra un mensaje al usuario y añade el evento del enlace del identificador para que sea posible actualizar los atributos de las unidades
 *  tras reclutarlas.
 *  - response: Respuesta del servidor con el resultado del reclutamento.
 */
function recruit_result(response) {
    // Se reclutan todas las unidades
    recruit_all_units(response['melee_id'], response['defense_id'], response['distance_id']);
    // Los valores de los campos de reclutamiento se ponen a 0
    $(MELEE_INPUT_ID).val(0);
    $(DEFENSE_INPUT_ID).val(0);
    $(DISTANCE_INPUT_ID).val(0);
    // Los valores de los costes se ponen a 0
    show_message(MELEE_COST_ID, MELEE_LABEL + 0);
    show_message(DISTANCE_COST_ID, DISTANCE_LABEL + 0);
    show_message(DEFENSE_COST_ID, DEFENSE_LABEL + 0);
    // Se muestra un mensaje
    show_animated_message(SUCCESS_CLASS, 'Reclutados ' + response['melee_id'].length + ' unidades cuerpo a cuerpo ' + response['defense_id'].length + ' unidades defensivas y ' + response['distance_id'].length + ' unidades de ataque a distancia');
    // Para que sea posible hacer click en el identificador de la tabla y poder modificar los atributos de la unidad.
    bind_link_event();
    update_costs(response['credits']);
    reset_costs(response['credits']);
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Hace que el evento "submit" del formulario de reclutamiento no realice ninguna función
 * ya que se va a realizar una petición AJAX en su lugar.
 */
$(RECRUIT_FORM_ID).submit(function (event) {
    event.preventDefault();
});
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Petición AJAX con los datos del reclutamiento de unidades. Al terminar se informa al usuario con el resultado
 * de su acción.
 */
$('#submit_recruit').click(function () {
    var data = {
        melee: get_input_value(MELEE_INPUT_ID),
        defense: get_input_value(DEFENSE_INPUT_ID),
        distance: get_input_value(DISTANCE_INPUT_ID)
    };
    if (data['melee'] > 0 || data['defense'] > 0 || data['distance'] > 0) {
        ajax_form_petition(RECRUIT_FORM_ID, data, recruit_result);
    }
});
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Elimina las unidades seleccionadas, realiza los cambios en la interfaz e informa al usuario con el resultado de la operación.
 * - response: Respuesta del servidor con el resultado de la eliminación de las unidades.
 */
function delete_units_result(response) {
    // Hace que no pueda ser eliminada la unidad que se está modificando en este momento.
    _.each(_.reject(_.pluck(SELECTED_UNITS_LIST, 'id'), function (id) {
        return id == get_field_value(UNIT_ID);
    }), function (id) {
        SELECTED_UNITS_LIST = _.without(SELECTED_UNITS_LIST, _.findWhere(SELECTED_UNITS_LIST, {id: id + ""}));
        return $('#' + id).remove();
    });
    show_animated_message(SUCCESS_CLASS, 'Unidades eliminadas');
    update_costs(response['credits']);
    $(INFO_DELETE_ID).hide();
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Realiza una petición AJAX al servidor con una lista de unidades que deben ser eliminadas.
 */
function delete_units() {
    var filtered_units = [];
    if (SELECTED_UNITS_LIST.length > 0) {
        // Se filtran las unidades seleccionadas para no incluir en la eliminación a la unidad que se está modificando en el momento
        filtered_units = _.reject(_.pluck(SELECTED_UNITS_LIST, 'id'), function (id) {
            return id == get_field_value(UNIT_ID);
        });
        if (filtered_units.length > 0) {
            ajax_form_petition(RECRUIT_FORM_ID, filtered_units, delete_units_result);
        } else {
            show_animated_message(ERROR_CLASS, 'No puede eliminar una unidad en proceso de mejora');
        }
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Busca el atributo de la tabla de unidades por identificador y cambia el valor
 * - id: identificador de la fila
 * - att: atributo que se desea cambiar (en orden)
 * - value: valor del atributo
 */
function set_unit_att(id, att, value) {
    if (value > 0) {
        $('#' + id).find('td')[att].innerHTML = value;
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Cambia los valores de los atributos de la unidad llamando al método "set_unit_att"
 * - id: Identificador de la unidad
 * - level: Nivel
 * - life: Vida
 * - attack: Ataque
 * - scope: Alcance
 * - defense: Defensa
 */
function refresh_unit(id, level, life, attack, scope, defense, type) {
    // Atributos comunes: nivel y vida
    set_unit_att(id, 1, level);
    set_unit_att(id, 2, life);
    // Como siempre se van a devolver todos los atributos de la unidad hay que comprobar el tipo antes de modificar los valores del DOM
    switch (type) {
        // Cuerpo a cuerpo
        case 0:
            set_unit_att(id, 3, attack);
            break;
        // Defensa
        case 1:
            set_unit_att(id, 3, defense);
            break;
        // Distancia
        case 2:
            set_unit_att(id, 3, scope);
            break;
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Muestra en la interfaz los cambios que se han realizado a la hora de modificar una unidad sombreando la fila de la unidad,7
 * mostrando un mensaje al usuario y actualizando los contadores de cŕeditos.
 * - response: Respuesta del servidor con el resultado de la modificación de la unidad.
 */
function upgrade_result(response) {
    show_animated_message(SUCCESS_CLASS, 'Unidad mejorada');
    update_costs(response['credits']);
    // Actualiza los valores de la fila de la tabla que han sido modificados
    if ($('#' + response['id']).find('td').length > 0) {
        refresh_unit(response['id'], response['level'], response['life'], response['attack'], response['scope'], response['defense'], response['type']);
        shadow_upgraded();
    }
    // En caso de estar modificando formaciones es necesario cambiar los sprites en caso de haber aumentado de nivel
    if (window.location.href.indexOf('formation') > -1 && SELECTED_UNITS_LIST.length > 0) {
        var index = index_of(SELECTED_UNITS_LIST, get_field_value(UNIT_ID), 'id');
        SELECTED_UNITS_LIST[index].level = get_field_value(LEVEL_ID);
        // Cambia el sprite de la unidad cada vez que se acualice
        level_up_sprite(SELECTED_UNITS_LIST[index]);
        close_upgrade_unit();
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Mejora la unidad realizando una petición AJAX al servidor y mostrando el resultado de esta en la interfaz.
 */
function upgrade_unit() {
    var data = {
        life: get_field_value(LIFE_ID),
        attack: get_field_value(ATTACK_ID),
        scope: get_field_value(SCOPE_ID),
        defense: get_field_value(DEFENSE_ID)
    };
    if (get_field_value(CREDITS_ID) - get_field_value(TOTAL_COST_ID) < 0) {
        show_animated_message(ERROR_CLASS, INSUFFICIENT_CREDITS_ERROR);
    } else {
        ajax_form_petition(UPGRADE_UNIT_FORM_ID, data, upgrade_result);
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Actualiza los contadores de créditos a la hora de modificar las unidades.
 * - ind: Indicador se si el coste debe sumarse o restarse.
 */
function refresh_costs(ind) {
    // Coste total de la modificación
    var actual = get_field_value(TOTAL_COST_ID);
    // Créditos actuales
    var user_credits = get_field_value(CREDITS_ID);
    // Suma o resta el coste cada vez que se hace click en los botones de mejora de unidad
    actual = ind > 0 ? actual + 1 : actual - 1;
    var result = user_credits - actual;
    // En caso de sobrepasar los créditos del usuario se colorea de rojo los créditos del usuario
    result < 0 ? $(FINAL_CREDITS_ID).css('color', 'rgb(255, 0, 0)') : $(FINAL_CREDITS_ID).css('color', 'rgb(85, 85, 85)');
    $(TOTAL_COST_ID).text(TOTAL_COST_LABEL + actual);
    $(FINAL_CREDITS_ID).text(FINAL_LABEL + result);
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Resta en un punto el atributo que se está modificando de la unidad.
 * - field_id: Identificador del campo que se va a restar.
 * - label: Etiqueta que muestra el tipo de campo.
 * - default_value: Valor por defecto del campo.
 */
function subtract_att(field_id, label, default_value) {
    // Nivel de la unidad
    var level = get_field_value(LEVEL_ID);
    // Puntos utilizados en la unidad
    var points = get_field_value(POINTS_ID);
    // Valor actual del atributo
    var actual = get_field_value(field_id);
    // En caso de que el valor no sobrepase el de por defecto y el coste total sea positivo
    if (actual > default_value && get_field_value(TOTAL_COST_ID) > 0) {
        // Se realiza la acción
        actual--;
        refresh_costs(-1);
        points--;
        // Baja de nivel si los puntos lo así lo indican
        if (points >= 0 && level > 0) {
            level = Math.floor(points / LEVEL_MULT);
        }
    }
    // Actualización de los valores de la interfaz
    $(POINTS_ID).text(POINTS_LABEL + points);
    $(LEVEL_ID).text(LEVEL_LABEL + level);
    $(field_id).text(label + actual);
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Resta un punto al ataque en el caso de las unidades cuerpo a cuerpo.
 */
function subtract_attack() {
    subtract_att(ATTACK_ID, ATTACK_LABEL, DEFAULT_MELEE_VALUES[2]);
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Resta un punto al alcance en el caso de las unidades de ataque a distancia.
 */
function subtract_scope() {
    subtract_att(SCOPE_ID, SCOPE_LABEL, DEFAULT_DISTANCE_VALUES[3]);
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Resta un punto a la defensa en el caso de las unidades defensivas.
 */
function subtract_defense() {
    subtract_att(DEFENSE_ID, DEFENSE_LABEL, DEFAULT_DEFENSE_VALUES[4]);
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Suma en un punto el atributo que se está modificando de la unidad.
 * - field_id: Identificador del campo que se va a restar.
 * - label: Etiqueta que muestra el tipo de campo.
 * - life: Bandera que controla que el atributo vida puede ser modificado o no.
 */
function add_att(field_id, label, life) {
    // Valor del atributo actual
    var actual = get_field_value(field_id);
    // Nivel de la unidad
    var level = get_field_value(LEVEL_ID);
    // Puntos utilizados en la unidad
    var points = get_field_value(POINTS_ID);
    // Créditos disponibles
    var total = get_field_value(CREDITS_ID);
    // Si en efecto se han gastado créditos y el nivel es menor que el máximo
    if (total > 0 && level < MAX_LEVEL) {
        if (life || actual < MAX_ATT) {
            // Se realiza la acción
            actual++;
            refresh_costs(1);
            points++;
            // En caso de subit de nivel se actualiza el valor
            if (points > 0 && points % LEVEL_MULT == 0) {
                level++;
            }
        }
    }
    // Actualización de los valores de la interfaz
    $(POINTS_ID).text(POINTS_LABEL + points);
    $(LEVEL_ID).text(LEVEL_LABEL + level);
    $(field_id).text(label + actual);
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Suma un punto al ataque en el caso de todas las unidades.
 */
function add_life() {
    add_att(LIFE_ID, LIFE_LABEL, true);
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Suma un punto al ataque en el caso de las unidades cuerpo a cuerpo.
 */
function add_attack() {
    add_att(ATTACK_ID, ATTACK_LABEL, false);
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Suma un punto al alcance en el caso de las unidades de ataque a distancia.
 */
function add_scope() {
    add_att(SCOPE_ID, SCOPE_LABEL, false);
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Suma un punto a la defensa en el caso de las unidades defensivas.
 */
function add_defense() {
    add_att(DEFENSE_ID, DEFENSE_LABEL, false);
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Resta en un punto la capacidad de la vida de la unidad.
 * - unit_type: Tipo de unidad.
 * - default_value: Valor por defecto de la vida.
 * - type: Cadena tipo de la unidad.
 */
function subtract_life_att(unit_type, default_value, type) {
    /*
     * Aunque el método es parecido a los anteriores el atributo vida tiene una condición
     * diferente ya que no tiene maximo, por lo que se ha considerado realzar la acción en un método
     * distinto
     */
    // Nivel de la unidad
    var level = get_field_value(LEVEL_ID);
    // Puntos gastados en la unidad
    var points = get_field_value(POINTS_ID);
    // Valor actual de la vida
    var actual = get_field_value(LIFE_ID);
    // Si el valor es mayor que el de por defecto y el coste es mayor que 0
    if (unit_type == type && actual > default_value && get_field_value(TOTAL_COST_ID) > 0) {
        // Se realiza la acción
        actual--;
        refresh_costs(-1);
        points--;
        // Baja de nivel si los puntos lo así lo indican
        if (points >= 0 && level > 0) {
            level = Math.floor(points / LEVEL_MULT);
        }
    }
    // Actualización de la interfaz
    $(LIFE_ID).text(LIFE_LABEL + actual);
    $(POINTS_ID).text(POINTS_LABEL + points);
    $(LEVEL_ID).text(LEVEL_LABEL + level);
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Realiza las comprobaciones necesarias y resta un punto de vida de la unidad según el tipo y sus valores por defecto,
 */
function subtract_life(unit_type) {
    // Cuerpo a cuerpo
    subtract_life_att(unit_type, DEFAULT_MELEE_VALUES[1], 0);
    // Defensa
    subtract_life_att(unit_type, DEFAULT_DEFENSE_VALUES[1], 1);
    // Distancia
    subtract_life_att(unit_type, DEFAULT_DISTANCE_VALUES[1], 2);
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * En el caso de encontrarnos en la página correspondiente a las batallas el comportamiento
 * del enlace de cada fila debe cambiar ya que no será posible modificar las unidades en este
 * apartado de la aplicación.
 */
$(document).ready(function () {
    if (window.location.href.indexOf('formation') > -1) {
        if (window.location.href.indexOf('next') <= -1) {
            $('table a').removeAttr('href');
            draw_deploy();
        }
    }
});
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Despliegue de las unidades en el campo *************************************
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Cambia la interfaz y muestra el campo de batalla llamando a la simulación.
 */
function create_battle_deploy() {
    var total = get_field_value(TOTAL_BATTLE_ID);
    var limit = get_field_value(LIMIT_BATTLE_ID);
    var map_selected = $("#selected_name").text().split(' ')[2];
    var message_limit = 'Ha seleccionado más unidades de las que se pueden desplegar';
    var message_no_unit = 'No ha seleccionado unidades para desplegar';
    var invalid_map = 'Primero debe cargar un mapa';
    // Si se supera el límite de unidades
    if (total > limit && total != 0 && limit != 0) {
        show_animated_message(ERROR_CLASS, message_limit);
    } else {
        // Si no hay unidades seleccionadas
        if (total == 0) {
            show_animated_message(ERROR_CLASS, message_no_unit);
        } else {
            if (map_selected == '-') {
                show_animated_message(ERROR_CLASS, invalid_map);
            } else {
                /*
                 *   Se oculta el botón "Desplegar" y "Seleccionar/Descartar todos" y se muestra
                 *   el botón de "Guardar" y "Cancelar". Además se oculta la tabla y se muestra
                 *   el campo en donde se despliegan las unidades
                 */
                deploy_units();
                show_info_deploy(true);
            }
        }
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Cambia la interfaz dependiendo de una bandera. Si es verdadero se muestra el despliegue de las unidades en el campo, si es falso se muestra
 * la tabla de unidades seleccionadas.
 *  - show_deploy: Bandera que indica qué parte del a interfaz se desea mostrar.
 */
function show_info_deploy(show_deploy) {
    var display_save;
    var cancel_display_save;
    var table_battle_units = $('#battle_units_table');
    var simulation_container = $('#simulation_container');
    // Se muestra el campo de batalla
    if (show_deploy) {
        display_save = 'inline-block';
        cancel_display_save = 'none';
        table_battle_units.hide();
        simulation_container.show();
        // Se muestra la tabla de unidades
    } else {
        display_save = 'none';
        cancel_display_save = 'inline-block';
        table_battle_units.show();
        simulation_container.slideUp();
    }
    // Modificación de la interfaz
    $('#save_config').parent().css('display', display_save);
    $('#cancel_deploy').parent().css('display', display_save);
    $('#formation').css('display', display_save);
    $(SELECT_ALL_ID).parent().css('display', cancel_display_save);
    $('#deploy_units').parent().css('display', cancel_display_save);
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Retorna el número de unidades por tipo seleccionadas.
 *  - type: Tipo.
 */
function count_units(type) {
    return _.filter(SELECTED_UNITS_LIST, function (unit) {
        return unit.label == type
    }).length;
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Actualiza los contadores de unidades según su tipo.
 */
function update_selected_counters() {
    var melee_selected = count_units(0);
    var defense_selected = count_units(1);
    var distance_selected = count_units(2);
    var total = melee_selected + defense_selected + distance_selected;
    var limit = get_field_value(LIMIT_BATTLE_ID);
    var total_battle = $(TOTAL_BATTLE_ID);
    // Actualiza los contadores de las unidades seleccionadas
    show_message('#melee_battle', MELEE_LABEL + melee_selected);
    show_message('#defense_battle', DEFENSE_LABEL + defense_selected);
    show_message('#distance_battle', DISTANCE_LABEL + distance_selected);
    total_battle.text('Total: ' + total);
    // En caso se sobrepasar el límite del mapa se colorea de rojo el valor
    if (total > limit && total != 0 && limit != 0) {
        total_battle.css('color', 'rgb(255, 0, 0)');
    } else {
        total_battle.css('color', 'rgb(85, 85, 85)');
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * A la hora de cambiar el texto del botón "Seleccionar/Desmarcar todos" es necesario tener una serie de banderas que
 * indiquen si están todos seleccionados o no ya que se tienen 3 tablas distintas y cada una debe de mostrar el texto
 * según su estado. Al inicio todas las unidades independientemente se su tipo se encuentran desmarcadas por lo que
 * se inicializa el vector con 3 posiciones en "false".
 */
var selected = [false, false, false];
/*
 * El evento de click en la barra de control de los tipos de unidades cambiará el texto del botón anterior en función
 * de las banderas como se ha explicado anteriormente.
 */
$('.tab-nav').click(function () {
    var select_all = $(SELECT_ALL_ID);
    var label = UNITS_TYPES_LABELS[$('.tab-nav li.active').text()];
    // Cambia el texto del botón de "Seleccionar todos" a "Descartar todos" en función del número de unidades seleccionadas por tipo
    _.filter(SELECTED_UNITS_LIST, function (unit) {
        return unit.label == label;
    }).length > 0 ? select_all.text(UNSELECT_ALL_LABEL) : select_all.text(SELECT_ALL_LABEL);
});
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Selecciona todas las filas de una tabla.
 * - table: Identificador de la tabla.
 * - label: Tipo de unidades de la tabla.
 */
function select_all_rows(table, label, select) {
    var i = -1;
    var id;
    var level;
    $(table + ' tbody').find('tr').each(function () {
        select == true ? $(this).addClass(SELECTED_CLASS) : $(this).removeClass(SELECTED_CLASS);
        // Identificador de la unidad
        id = $(this).attr('id');
        // Nivel de la unidad
        level = $(this).find('td').eq(1).text();
        // Se inserta en la lista de unidades seleccionadas
        if (select && !_.contains(_.pluck(SELECTED_UNITS_LIST, 'id'), id)) {
            SELECTED_UNITS_LIST.push({
                id: id,
                level: level,
                label: label
            });
        } else {
            // Se elimina de la lista en caso de descartar todos
            if (!select) {
                i = index_of(SELECTED_UNITS_LIST, id, 'id');
                if (i > -1) {
                    SELECTED_UNITS_LIST.splice(i, 1);
                }
            }
        }
    });
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Cambia el texto del botón en función de si se han seleccionado todos o no.
 * - table: Identificador de la tabla.
 */
function switch_label_select_all(table) {
    /*
     * Aunque este método realiza la misma función que el evento "click" de tab-nav se ha realizado a parte porque cuando se
     * pulsa sobre las celdas de la tabla es posible llegar a seleccionarlas todas, por lo que los cambios de la interfaz del método
     * anterior quedaría inválidos
     */
    // ID del botón "Seleccionar todos"
    var selector = $(SELECT_ALL_ID);
    // Nombre de la pestaña activa de las tablas
    var label = UNITS_TYPES_LABELS[$('.tab-nav li.active').text()];
    // Filtra la lista para quedarse con sólo las que son del tipo que se buscan
    if (_.filter(SELECTED_UNITS_LIST, function (unit) {
            return unit.label == label;
        }).length == $(table + ' tr').length - 1) {
        // Cambia el texto del botón
        selector.text(UNSELECT_ALL_LABEL);
    } else {
        selector.text(SELECT_ALL_LABEL);
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Utilizando las funciones anteriores, cambia el texto del botón que se ha mencionado, obtiene el identificador de la
 * tabla que se encuentra activa en ese momento y actualiza los contadores de las unidades.
 */
function select_all_active() {
    // Tipo de la unidad
    var label = UNITS_TYPES_LABELS[$('.tab-nav li.active').text()];
    var table = "";
    // Boton "Seleccionar todos"
    var select_all = $(SELECT_ALL_ID);
    var sel;
    // Según el tipo de la unidad
    switch (label) {
        // Cuerpo a cuerpo
        case 0:
            table = MELEE_LIST_ID;
            break;
        // Defensa
        case 1:
            table = DEFENSE_LIST_ID;
            break;
        // Distancia
        case 2:
            table = DISTANCE_LIST_ID;
            break;
    }
    // Realiza las acciones para cambiar la interfaz en caso de seleccionar todas las unidades o no
    if ($(table + ' tr').length - 1 > 0) {
        select_all.text() == SELECT_ALL_LABEL ? sel = true : sel = false;
        select_all_rows(table, label, sel);
        SELECTED_UNITS_LIST.length > 0 ? $(INFO_DELETE_ID).show() : $(INFO_DELETE_ID).hide();
        switch_label_select_all(table);
        update_selected_counters();
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Manejo de formaciones ******************************************************
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Selecciona una fila concreta de la tabla de formaciones para su modificación o eliminación.
 * Se encapsula en un método para poder ser reutilizado en caso de necesitarlo para otras tablas
 */
function set_formation_table(table_id) {
    /*
     * Este método en esencia realiza las mismas acciones que el de la tabla de unidades pero como sólo se va a poder seleccionar una unidad
     * cada vez, es necesario realizarlo a parte
     */
    $(table_id).stupidtable();
    $(table_id + ' tbody').on('click', 'tr', function () {
        var row = $(this);
        if (!row.hasClass(SELECTED_CLASS)) {
            row.siblings('tr').removeClass(SELECTED_CLASS);
            row.toggleClass(SELECTED_CLASS);
            $(MOD_FORMATION_FORM).css('display', 'block');
        }
        $('#formation_name').text('Formación: ' + $('.' + SELECTED_CLASS).find('td').eq(0).text());
        $('#selected_formation').text('Formación seleccionada: ' + $('.' + SELECTED_CLASS).find('td').eq(0).text());
        $('#formation_map').text('Mapa: ' + $('.' + SELECTED_CLASS).find('td').eq(1).text());
    });
}
// Inicializa la tabla de formaciones
set_formation_table('#formation_list');
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Cambia la interfaz dependiendo de una bandera. Si es verdadero se muestra el despliegue de las unidades en el campo, si es falso se muestra
 * la tabla de unidades seleccionadas.
 *  - show_formation: Bandera que indica qué parte del a interfaz se desea mostrar.
 */
function show_form_deploy(show_formation) {
    var formation_table = $('#formation_table');
    var simulation_container = $('#simulation_container');
    var display_form;
    var display_buttons;
    // Cambio en la interfaz que oculta la formación
    if (!show_formation) {
        formation_table.show();
        simulation_container.slideUp();
        display_form = 'inline-block';
        display_buttons = 'none';
        $(WRAPPER_UPGRADE).hide();
    } else {
        // Cambio en la interfaz que muestra la formación
        formation_table.hide();
        simulation_container.show();
        display_form = 'none';
        display_buttons = 'inline-block';
    }
    // Cambio en la interfaz para mostrar/ocultar los botones de manejo de formaciones
    $(MOD_FORMATION_FORM).css('display', display_form);
    $('#modify_formation').parent().css('display', display_buttons);
    $('#cancel_load').parent().css('display', display_buttons);
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Se regenera el mapa dependiendo del que se haya elegido.
 */
function reset_map(response) {
    var hex;
    // Posiciones válidas del mapa totales
    var cont = 0;
    // Se recorre la respuesta y se van mostrando sólo los que se corresponden con el mapa
    for (var i = 0; i < response['total']; i++) {
        hex = _.findWhere(hex_coords, {q: response[i + ""].q, r: response[i + ""].r});
        if (hex != undefined) {
            hex.sprite.revive();
            cont++; // Contamos para que el límite muestre cuántas posiciones se tienen como máximo.
        }
    }
    // Muestra los cambios en la interfaz
    show_message(LIMIT_BATTLE_ID, 'Limite: ' + response['total'] / 2);
    update_selected_counters();
    return cont;
}
//------------------------------------------------------------------------------------------------------------------------------------
// Se guardan los últimos cargados para evitar peticiones AJAX al servidor innecesarias
// Última formación cargada
var last_formation = "";
// Último mapa de formación cargado
var last_map = "";
/*
 * Abre el despliegue de la formación en la interfaz y manda una petición AJAX en caso de necesitarlo
 * para obtener las coordenadas del mapa. Una vez que se han obtenido, se eliminan todas las posiciones
 * y se cargan sólo las que se corresponden con esa parte del mapa.
 */
function show_formation() {
    var form_mod_formation = $(MOD_FORMATION_FORM);
    var map_name = $('.' + SELECTED_CLASS).find('td').eq(1).text();
    // Sólo se realiza la petición al servidor si el mapa es distinto al último que se cargó
    if (map_name != last_map) {
        $.ajax({
            url: form_mod_formation.attr('action'),
            type: form_mod_formation.attr('method'),
            data: {
                map: map_name,
                action: 'get_map',
                csrfmiddlewaretoken: form_mod_formation.find('input:hidden').val()
            },
            success: function (response) {
                if (response['error'] != undefined) {
                    show_animated_message(ERROR_CLASS, response['error']);
                } else {
                    // Actualiza el mapa
                    delete_map();
                    reset_map(response);
                    show_form_deploy(true);
                }
            }
        });
    } else {
        // Como el mapa no ha cambiado muestra la formación
        show_form_deploy(true);
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Método que modifica la información relacionada con la formación seleccionada
 * La variable "last_formation" guarda la última petición realizada para no realizar
 * llamadas al servidor innecesarias en caso de cerrar y abrir el campo de despliegue con la
 * misma formación
 */
function load_formation() {
    var selected_row = $('.' + SELECTED_CLASS).find('td');
    var formation_name = selected_row.eq(0).text();
    var map_name = selected_row.eq(1).text();
    var mod_formation_form = $(MOD_FORMATION_FORM);
    if (last_formation != "" && last_formation == formation_name) {
        show_formation();
    } else {
        // Sólo se realiza la petición al servidor si la formación es distinta a la última que se cargó
        if (formation_name != '' && last_formation != formation_name) {
            delete_formation_deploy();
            SELECTED_UNITS_LIST = [];
            $.ajax({
                url: mod_formation_form.attr('action'),
                type: mod_formation_form.attr('method'),
                data: {
                    name: formation_name,
                    action: 'load',
                    csrfmiddlewaretoken: mod_formation_form.find('input:hidden').val()
                },
                success: function (response) {
                    if (response['error'] != undefined) {
                        show_animated_message(ERROR_CLASS, response['error']);
                    } else {
                        var load_unit;
                        // Añade todas las unidades de la formación al entorno gráfico
                        _.each(response, function (unit, i) {
                            load_unit = response[i + ""];
                            add_unit_sprite(load_unit);
                            SELECTED_UNITS_LIST.push({
                                id: load_unit.id,
                                level: load_unit.level,
                                label: load_unit.label
                            });
                        });
                        // Muestra la formación y guarda el nombre y el mapa que se han cargado
                        show_formation();
                        last_formation = formation_name;
                        last_map = map_name;
                    }
                }
            });
        }
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Método que elimina la información relacionada con la formación seleccionada
 */
function delete_formation() {
    var formation_name = $('.' + SELECTED_CLASS).find('td').eq(0).text();
    var mod_formation_form = $(MOD_FORMATION_FORM);
    // Sólo se realiza la petición si en efecto se ha seleccionado una formación
    if (formation_name != '') {
        $.ajax({
            url: mod_formation_form.attr('action'),
            type: mod_formation_form.attr('method'),
            data: {
                name: formation_name,
                action: 'delete',
                csrfmiddlewaretoken: mod_formation_form.find('input:hidden').val()
            },
            success: function (response) {
                if (response['error'] !== undefined) {
                    show_animated_message(ERROR_CLASS, response['error']);
                } else {
                    // Cambios en la interfaz para el borrado de la formación
                    show_animated_message(SUCCESS_CLASS, 'La formación ha sido eliminada');
                    $('.' + SELECTED_CLASS).remove();
                    // Se reutiliza la estructura de unidades seleccionadas por lo que hay que vaciarla
                    SELECTED_UNITS_LIST = [];
                    update_selected_counters();
                    mod_formation_form.css('display', 'none');
                    $('#formation_name').text('');
                    last_formation = "";
                }
            }
        });
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Obtiene en una lista las coordenadas de las unidades desplegadas
 */
function get_units_in_formation() {
    // Unidades de la formación
    var units = [];
    // Sólo se obtienen las posiciones con unidad (unit > 0)
    _.each(_.filter(hex_coords, function (coord) {
        return coord.unit > 0
    }), function (coord) {
        units.push({
            id: coord.unit,
            q: coord.q,
            r: coord.r
        });
    });
    return units;
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Guarda toda la información sobre las unidades desplegadas en el mapa y lo envía al servidor
 * junto con el nombre que se le ha asignado a la formación
 */
function submit_formation() {
    var formation_name = $('#id_formation_name').val();
    var formation_form = $('#formation');
    // Obtiene todas las unidades de la formación
    var units = get_units_in_formation();
    // Sólo se realiza la petición si en efecto hay unidades en la formación
    if (units.length > 0) {
        $.ajax({
            url: formation_form.attr('action'),
            type: formation_form.attr('method'),
            data: {
                name: formation_name,
                units: JSON.stringify(units),
                formation_map: $('#selected_name').text().split(' ')[2],
                csrfmiddlewaretoken: formation_form.find('input:hidden').val()
            },
            success: function (response) {
                if (response['error'] !== undefined) {
                    show_animated_message(ERROR_CLASS, response['error']);
                } else {
                    show_animated_message(SUCCESS_CLASS, 'Formación guardada');
                    // Se eliminan las unidades en formación de la tabla
                    $('.' + SELECTED_CLASS).remove();
                    SELECTED_UNITS_LIST = [];
                    update_selected_counters();
                    show_info_deploy(false);
                    $('#id_formation_name').val('');
                    $(WRAPPER_UPGRADE).hide();
                }
            }
        });
    } else {
        show_animated_message(ERROR_CLASS, 'No hay unidades para guardar en la formación');
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Guarda la modificación de la formación
 */
function save_modified_formation() {
    var selected_row = $('.' + SELECTED_CLASS).find('td');
    var formation_name = selected_row.eq(0).text();
    var map_name = selected_row.eq(1).text();
    var mod_formation_form = $(MOD_FORMATION_FORM);
    // Obtiene todas las unidades de la formación
    var units = get_units_in_formation();
    // Sólo se realiza la petición si en efecto hay unidades en la formación
    if (units.length > 0) {
        $.ajax({
            url: mod_formation_form.attr('action'),
            type: mod_formation_form.attr('method'),
            data: {
                name: formation_name,
                action: 'modify',
                map_name: map_name,
                units: JSON.stringify(units),
                total_units: units.length,
                csrfmiddlewaretoken: mod_formation_form.find('input:hidden').val()
            },
            success: function (response) {
                if (response['error'] !== undefined) {
                    show_animated_message(ERROR_CLASS, response['error']);
                } else {
                    show_animated_message(SUCCESS_CLASS, 'La formación ha sido modificada');
                    $('.' + SELECTED_CLASS).find('td').eq(2).text(get_field_value(TOTAL_BATTLE_ID) + "");
                }
            }
        });
    } else {
        // Si no hay unidades en la formación se informa al usuario de si desea eliminarla
        $('#modal1').addClass('active');
        show_form_deploy(false);
        last_formation = "";
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Recorre todos las previsualizaciones de los mapas y muestra sólo la que se ha seleccionado
 */
function display_map_preview() {
    var selected_map = $('#selected_name').text().split(' ')[2];
    // Recorre todos los mapas ocultándolos
    var maps = $("select#select_map option").map(function () {
        return $(this).val();
    }).get();
    _.each(maps, function (map) {
        if (map != '#') {
            $('#' + map).hide();
        }
    });
    // Sólo muestra el seleccionado
    $('#' + selected_map).show();
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Carga del mapa en la pantalla de creación de formaciones. Al cargarse el nuevo mapa las unidades que se encuentren
 * desplegadas perderán su posición actual y se recolocarán en orden descendente en aquellas posiciones que se
 * encuentren disponibles.
 */
$('#load_map_form').submit(function (event) {
    event.preventDefault();
    event.stopPropagation();
    var cont = 0;
    var load_map_form = $('#load_map_form');
    var select_map = $('#select_map');
    // Si el mapa seleccionado no se ha cargado anteriormente se realiza la petición. Esto nos ahorra peticiones a servidor innecesarias
    if (last_map != select_map.find(':selected').text()) {
        $.ajax({
            url: load_map_form.attr('action'),
            type: load_map_form.attr('method'),
            data: {
                map: select_map.find(":selected").text(),
                csrfmiddlewaretoken: load_map_form.find('input:hidden').val()
            },
            success: function (response) {
                if (response['error'] != undefined) {
                    show_animated_message(ERROR_CLASS, response['error']);
                } else {
                    last_map = select_map.find(':selected').text();
                    $('#selected_name').text('Mapa seleccionado: ' + select_map.find(':selected').text());
                    // Borra el mapa
                    delete_map();
                    // Borra los elementos del mapa ya que al cargar uno nuevo no se pueden mantener las posiciones
                    delete_formation_deploy();
                    // Carga el mapa
                    cont = reset_map(response);
                    // Cuando se carga un nuevo mapa es posible que no pueda contener todas las unidades seleccionadas
                    if (SELECTED_UNITS_LIST.length > cont) {
                        show_animated_message(ERROR_CLASS, 'El límite de unidades excede el máximo');
                        $(TOTAL_BATTLE_ID).css('color', 'rgb(255, 0, 0)');
                    } else {
                        // En caso contrario se muestran los gráficos normalmente
                        deploy_units();
                        $(TOTAL_BATTLE_ID).css('color', 'rgb(85, 85, 85)');
                        display_map_preview();
                    }
                }
            }
        });
    }
});
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Datos de inicio de la simulación *******************************************
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Cambios en la interfaz de los parámetros de la simulación. Si se ha elegido el modo espejo, la batalla
 * se realizará contra la misma formación del usuario controlada por la inteligencia artificial.
 */
$('input:radio[name=mirror]').click(function () {
    var value_selected = $(this).val();
    var retire_selector = $('#mirror');
    if (value_selected == 'mirror_yes') {
        retire_selector.text('Espejo: Si');
        $('#enemy_mult').text('Multiplicador de enemigos: 0 %');
        $('#enemy_types').text('Tipo de enemigos: -');
        $('#max_level').text('Nivel máximo: -');
    } else {
        retire_selector.text('Espejo: No');
        $('#enemy_mult').text('Multiplicador de enemigos: ' + $('#select_enemy_mult option:selected').text());
        $('#enemy_types').text('Tipo de enemigos: ' + $('#select_enemy_types option:selected').text());
        $('#max_level').text('Nivel máximo: ' + $('#select_max_level option:selected').text());
    }
});
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Cambios en la interfaz de los parámetros de la simulación. Si se ha elegido el modo espejo, la batalla
 * se realizará contra la misma formación del usuario controlada por la inteligencia artificial.
 */
$('select#select_enemy_mult').change(function () {
    var mirror_selected = $('input:radio[name=mirror]:checked').val();
    if (mirror_selected == 'mirror_no')
        $('#enemy_mult').text('Multiplicador de enemigos: ' + $(this).val() + ' %');
});
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Cambios en la interfaz de los parámetros de la simulación. Si se ha elegido el modo espejo, la batalla
 * se realizará contra la misma formación del usuario controlada por la inteligencia artificial.
 */
$('select#select_max_level').change(function () {
    var mirror_selected = $('input:radio[name=mirror]:checked').val();
    if (mirror_selected == 'mirror_no')
        $('#max_level').text('Nivel máximo: ' + $(this).val());
});
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Cambios en la interfaz de los parámetros de la simulación. Si se ha elegido el modo espejo, la batalla
 * se realizará contra la misma formación del usuario controlada por la inteligencia artificial.
 */
$('select#select_enemy_types').change(function () {
    var mirror_selected = $('input:radio[name=mirror]:checked').val();
    if (mirror_selected == 'mirror_no')
        $('#enemy_types').text('Tipos de enemigos: ' + $(this).val());
});
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Contador del tiempo que pasa la simulación ejecutándose en el servidor
 * - val: valor actual
 */
function pad(val) {
    return val > 9 ? val : "0" + val;
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Petición AJAX al servidor para la ejecución de la simulación
 */
$('#battle_form').submit(function (event) {
    event.preventDefault();
    event.stopPropagation();

    // Parámetros de la simulación
    var selected_formation = $('#selected_formation');
    var formation_map = $('#formation_map');
    var enemy_mult = $('#enemy_mult');
    var mirror = $('#mirror');
    var battle_form = $('#battle_form');
    var enemy_types = $('#enemy_types');
    var max_level = $('#max_level');
    var modal = $('#modal1');
    // Para poder realizar una batalla se debe de tener seleccionada una formación
    if (selected_formation.text().split(' ')[2] == '-') {
        show_animated_message(ERROR_CLASS, 'No se ha seleccionado formación para la batalla');
    } else {
        avoid_reload(1);
        // Contador del tiempo de la simulación
        var sec = 0;
        document.getElementById('seconds').innerHTML = '00';
        document.getElementById('minutes').innerHTML = '00';
        var timer = setInterval(function () {
            document.getElementById('seconds').innerHTML = pad(++sec % 60);
            document.getElementById('minutes').innerHTML = pad(parseInt(sec / 60, 10));
        }, 1000);
        // Activación del mensaje de espera para la simulación
        modal.addClass('active');
        $('#battle_form').hide();
        // Se elimina la instancia de Phaser en caso de estar activa
        destroy_battle_map();
        // Carga del mapa
        configure_map(formation_map.text().split(' ')[1]);
        // Inicialización de Phaser, carga los sprites y el mapa
        init_battle_map();
        $.ajax({
            url: battle_form.attr('action'),
            type: battle_form.attr('method'),
            data: {
                map: formation_map.text().split(' ')[1],
                formation: selected_formation.text().split(' ')[2],
                enemy_mult: enemy_mult.text().split(' ')[3],
                mirror: mirror.text().split(' ')[1],
                enemy_types: enemy_types.text().split(' ')[3],
                max_level: max_level.text().split(' ')[2],
                csrfmiddlewaretoken: battle_form.find('input:hidden').val()
            },
            success: function (response) {
                // Elimina el contador de tiempo
                clearInterval(timer);
                if (response['error'] != 'OK') {
                    show_animated_message(ERROR_CLASS, response['error']);
                    $('#battle_form').show();
                    destroy_battle_map();
                    avoid_reload(0);
                } else {
                    setTimeout(function () {
                        // Guarda la configuración de inicio de la unidades y las despliega en el mapa
                        configure_beginning_units(response['beginning']);
                        // Muestra el mapa
                        $('#simulation_data').hide();
                        $('#simulation_battle').show();
                        // Guarda los resultados de la simulación
                        load_simulation(response['simulation'], parseInt(response['total']), parseInt(response['results']), response['end']);
                    }, 2000);
                    show_animated_message(SUCCESS_CLASS, 'La simulación se ha realizado correctamente');
                }
                // Oculta el mensaje de espera
                modal.removeClass('active');
            }
        });
    }
});
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Se cierran los resultados y se reinicializa la interfaz
 */
function close_results() {
    $('#simulation_result').hide();
    $('#simulation_data').fadeIn();
    $('#battle_form').show();
    $('.' + SELECTED_CLASS).removeClass(SELECTED_CLASS);
    $('#selected_formation').text('Formación seleccionada: -');
    $('#formation_map').text('Mapa: -');
    $('#turns').text('Turno: ' + 0);
    // Oculta el mensaje de espera
    avoid_reload(0);
}
//------------------------------------------------------------------------------------------------------------------------------------