/*
 * Antonio Diego Barquero Cuadrado - TFG - UEX - 2014/2015
 * map_creator.js
 * Funciones gráficas de creación de mapas
 */
// Bandera que indica si se está guardando un mapa completo a no
var saving = false;
// Instancia del juego para la creación de mapas
var map_creator = null;
/*
 * Diccionario clave valor por el nombre del hexágono para localizar más fácilmente los puntos del mapa
 * y realizar los cálculos de las casillas opuestas. Contiene la misma información que "hex_coords" salvo:
 * - op_q: columna de la posición opuesta
 */
var conversion = [];
// Tiempo de animaciones de las posiciones del mapa
var MAP_ALPHA_TIME = 200;

//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Métodos auxiliares *********************************************************
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Muestra el mensaje de guardado del mapa
 */
function wait() {
    var i = 0;
    setInterval(function () {
        i = ++i % 4;
        $(".loading").text('Espere' + Array(i + 1).join('.'));
    }, 1000);
}
//------------------------------------------------------------------------------------------------------------------------------------
$('#save_map').validation({
    required: [
        {
            name: 'map_name',
            validate: function ($el) {
                return field_validation($el, USERNAME_REGEX, '#map_name_error', 'El nombre del mapa no debe comenzar por caracteres no alfanuméricos, debe tener como mínimo 5 caracteres, como máximo 20 y no puede contener espacios');
            }
        }
    ],
    fail: function () {
        show_animated_message(ERROR_CLASS, 'El nombre del mapa no es correcto');
    },
    submit: function (data) {
        save_map();
    }
});


//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Carga/guardado del mapa ****************************************************
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Guardado del mapa en el servidor
 */
function save_map() {
    if ($('#id_map_name').val() == '') {
        show_animated_message(ERROR_CLASS, 'No se ha introducido el nombre del mapa');
    } else {
        if (hex_coords.length == 0) {
            show_animated_message(ERROR_CLASS, 'No es posible generar el mapa');
        } else {
            if (saving) {
                show_animated_message(ERROR_CLASS, 'Hay una petición en curso');
            } else {
                var data = _.map(_.filter(hex_coords, function (coord) {
                    return coord.sprite.alpha == 1;
                }), function (coord) {
                    coord.sprite.tint = 0xffffff;
                    return {
                        q: coord.q,
                        r: coord.r,
                        x: coord.sprite.x,
                        y: coord.sprite.y
                    }
                });

                saving = true;
                $(".loading").text('Espere');
                $('#modal1').addClass('active');
                wait();
                $.ajax({
                    url: $('#save_map').attr('action'),
                    type: $('#save_map').attr('method'),
                    data: {
                        data: JSON.stringify(data),
                        name: $('#id_map_name').val(),
                        csrfmiddlewaretoken: $('#save_map').find('input:hidden').val(),
                        image: map_creator.canvas.toDataURL().split(',')[1]
                    },
                    success: function (response) {
                        if (response['error'] != null) {
                            show_animated_message(ERROR_CLASS, response['error']);
                        } else {
                            show_animated_message(SUCCESS_CLASS, 'Mapa guardado');
                        }
                        saving = false;
                        $('#modal1').removeClass('active');
                    }
                });
            }
        }
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Creación del objeto del mapa
 */
function show_map() {
    var grid_rows = GRID_ROWS;
    var grid_columns = GRID_COLUMNS;

    if (map_creator == null) {
        map_creator = new Phaser.Game(get_game_width(grid_columns), get_game_height(grid_rows) + 1, Phaser.CANVAS, 'map', {
            preload: preload_map,
            create: create_map
        }, true);
    } else {
        map_creator.destroy();
        map_creator = null;
        hex_coords = [];
        $('#output').text('');
        $('#x2').val('');
        $('#y2').val('');
        $('#q2').val('');
        $('#r2').val('');
        $('#x').val('');
        $('#y').val('');
        $('#q').val('');
        $('#r').val('');
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Dibuja una columna en el mapa y guarda en "hex_coords" todos los datos asociados al mapa
 * - rows: número de filas de la columna
 * - x: coordenada x de la columna
 * - y: coordenada y de la primera posición de la columna
 * - q: marca de la columna para la simulación
 */
function draw_column_map(rows, x, y, q) {
    var hexagon;
    var offset_x = map_creator.cache.getImage(HEXAGON_ASSET.slice(0, -4)).width / 2;
    var offset_y = map_creator.cache.getImage(HEXAGON_ASSET.slice(0, -4)).height / 2;

    _.each(_.range(rows), function (i) {
        hexagon = map_creator.add.sprite(x + offset_x, (y + HEX_HEIGHT * i) + offset_y, HEXAGON_ASSET.slice(0, -4));
        hexagon.anchor.set(0.5, 0.5);

        hexagon.name = hexagon.x + "," + hexagon.y;
        hex_coords.push({sprite: hexagon, unit: 0, r: i, q: q});
        /*
         * Se almacena en esta estructura la siguiente información para obtener con mayor comdidad los sprites por nombre.
         * En caso de necesitar el opuesto se buscará en "hex_coords" mediante el atributo "op_q".
         */
        conversion[hexagon.name] = ({sprite: hexagon, r: i, q: q, op_q: Math.abs(GRID_COLUMNS - 1 - q)});
        // Acciones del usuario en los hexágonos
        add_input_hexagon(hexagon);
    });
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Creación del mapa
 */
function create_map() {
    var offset = 0;
    _.each(_.range(GRID_COLUMNS), function (i) {
        offset = (i % 2 ? offset - HEX_HEIGHT * 0.5 : offset + HEX_HEIGHT * 0.5);
        draw_column_map(GRID_ROWS, HEX_HORIZ * i, Math.round(offset), i);
    });
}
/*
 * Carga de assets para el mapa
 */
function preload_map() {
    map_creator.load.image(HEXAGON_ASSET.slice(0, -4), ASSETS_PATH + "/" + HEXAGON_ASSET);
    scale_canvas(map_creator);
}
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Posiciones del mapa ********************************************************
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Obtiene el índice de la posición en el vector del mapa
 * - sprite: sprite del hexágono del mapa
 */
function index_of_hexagon(sprite) {
    return _.indexOf(hex_coords, _.find(hex_coords, function (coord) {
        return coord.sprite.name == sprite.name;
    }));
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Obtiene el sprite del a posición opuesta del mapa dado un índice
 * - index: índice en el vector del mapa
 */
function get_opposite_hexagon(index) {
    return _.find(_.filter(hex_coords, function (coord) {
        return coord.r == hex_coords[index].r;
    }), function (coord) {
        return Math.abs(GRID_COLUMNS - 1 - hex_coords[index].q) == coord.q;
    });
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Obtiene el sprite de la posición opuesta del mapa
 * - sprite: sprite de posición del mapa
 */
function get_opposite(sprite) {
    return get_opposite_hexagon(index_of_hexagon(sprite));
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Evento on click de cada posición del mapa. En caso de pulsar sobre un hexágono este se eliminará
 * del mapa junto con su opuesto.
 * - sprite: sprite de la posición
 * - pointer: puntero del ratón
 */
function on_click(sprite, pointer) {

    var animation = 1;
    sprite.alpha == 1 ? animation = 0 : animation;
    map_creator.add.tween(sprite).to({alpha: animation}, MAP_ALPHA_TIME).start();
    map_creator.add.tween(get_opposite(sprite).sprite).to({alpha: animation}, MAP_ALPHA_TIME).start();
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Animación cuando el ratón para por encima del sprite de la posición del mapa. La posición a la derecha
 * se mostrará teñida de color rojo y a la izquierda de verde
 * - sprite: sprite de la posición
 * - pointer: puntero del ratón
 */
function mouse_over(sprite, pointer) {
    var opposite = get_opposite(conversion[sprite.name].sprite);
    opposite.sprite.tint = 0xff0000;
    sprite.tint = 0x00ff00;
    $('#x2').val(opposite.sprite.x + '');
    $('#y2').val(opposite.sprite.y + '');
    $('#q2').val(opposite.q + '');
    $('#r2').val(opposite.r + '');
    $('#x').val(sprite.x + '');
    $('#y').val(sprite.y + '');
    $('#q').val(conversion[sprite.name].q + '');
    $('#r').val(conversion[sprite.name].r + '');
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Animación cuando el ratón deja de pasar por encima de la posición
 * - sprite: sprite de la posición del mapa
 * - pointer: puntero del ratón
 */
function mouse_out(sprite, pointer) {
    conversion[sprite.name].sprite.tint = 0xffffff;
    get_opposite(sprite).sprite.tint = 0xffffff;
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Instancia la entrada de los sprites del mapa
 * - hexagon: sprite de la posición
 * - r: coordenada r se la simulación
 * - q: coordenda q de la simulación
 */
function add_input_hexagon(hexagon) {
    hexagon.inputEnabled = true;
    hexagon.events.onInputDown.add(on_click, this);
    hexagon.events.onInputOver.add(mouse_over, this);
    hexagon.events.onInputOut.add(mouse_out, this)
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Comprueba que el número no se encuentre en la lista
 * - number: numero a buscar.
 * - list: lista de números generados
 */
function random_number(number, list) {
    var value = 0;
    _.each(_.range(list.length), function (i) {
        if (number == list[i]) {
            value = -1;
        } else {
            value = list[i];
        }
    });

    if (value >= 0) {
        list.push(number);
        return number;
    } else {
        return value;
    }


}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Genera un mapa aleatorio
 */
function random_map() {
    var number = Math.floor((Math.random() * GRID_COLUMNS * GRID_ROWS) + 0);
    var list = [];
    // Se resetea el mapa
    if (map_creator != null) {
        clean_map_creator();
        _.each(_.range(number), function () {
            /*
             * Mientras no se haya obtenido un número nuevo el método se ejecuta.
             */
            var random = random_number(Math.floor((Math.random() * number) + 0), list);
            while (random < 0) {
                random = random_number(Math.floor((Math.random() * number) + 0), list);
            }

            on_click(hex_coords[random].sprite, null);
        });
    } else {
        show_animated_message(ERROR_CLASS, 'El mapa no se encuentra generado');
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Restaura el mapa por defecto
 */
function clean_map_creator() {
    var filter = [];
    var actual;
    var opposite;
    if (map_creator != null) {
        filter = _.filter(hex_coords, function (i) {
            return i.sprite.alpha == 0;
        });
        _.each(filter, function (i) {
            actual = conversion[i.sprite.name].sprite;
            opposite = get_opposite(conversion[i.sprite.name].sprite);
            actual.tint = 0xffffff;
            opposite.tint = 0xffffff;

            map_creator.add.tween(actual).to({alpha: 1}, MAP_ALPHA_TIME / 2).start();
            map_creator.add.tween(opposite).to({alpha: 1}, MAP_ALPHA_TIME / 2).start();
        });
    } else {
        show_animated_message(ERROR_CLASS, 'El mapa no se encuentra generado');
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
