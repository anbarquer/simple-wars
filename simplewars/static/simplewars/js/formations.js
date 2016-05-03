/*
 * Antonio Diego Barquero Cuadrado - TFG - UEX - 2014/2015
 * formations.js
 * Funciones gráficas de gestión de formaciones
 */
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Datos del hexágono *********************************************************
//------------------------------------------------------------------------------------------------------------------------------------
// Lado del hexágono
var HEX_SIZE = 20;
// Ancho del hexágono
var HEX_WIDTH = HEX_SIZE * 2;
// Alto del hexágono
var HEX_HEIGHT = Math.round(Math.sqrt(3) * HEX_SIZE);
// Distancia horizontal entre hexágonos
var HEX_HORIZ = HEX_WIDTH * 3 / 4;
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Datos del mapa *************************************************************
//------------------------------------------------------------------------------------------------------------------------------------
// Medidas del mapa de batalla
var GRID_ROWS = 20;
var GRID_COLUMNS = 40;
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Sprites ********************************************************************
//------------------------------------------------------------------------------------------------------------------------------------
var MELEE_ASSET = 'melee_';
var DEFENSE_ASSET = 'def_';
var DISTANCE_ASSET = 'dist_';
// Lista de de sprites de las unidades aliadas
var formation_assets = [MELEE_ASSET, DEFENSE_ASSET, DISTANCE_ASSET];
var HEXAGON_ASSET = 'hexagon.png';
var DISCARD_ASSET = 'discard_zone.png';
// Lista de de sprites de la intefaz
var interface_assets = [HEXAGON_ASSET, DISCARD_ASSET];
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Estructuras ****************************************************************
//------------------------------------------------------------------------------------------------------------------------------------
// Objeto del framework que contiene toda la información de la creación de formaciones
var formation = null;
/* Vector mapa. Almacena las coordenadas del mapa y las posiciones de las unidades. La estructura
 *  del objeto que se va a almacenar es la siguiente:
 * - sprite: sprite asociado a la posición (hexágono)
 * - unit: identificador de la unidad
 * - q: coordenada q de la simulación
 * - r: coordenada r de la simulación
 */
var hex_coords = [];
/* Almacenará las coordenadas finales en donde la unidad se ha desplegado finalmente. Se trata de un vector
 *  asociativo por clave a través del identificador de la unidad. Cada objeto almacenado por clave contiene:
 * - sprite: sprite de la unidad
 * - hex: sprite de la posición de la unidad
 */
var unit_info = [];
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Métodos auxiliares *********************************************************
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Obtiene el alto en función de las filas del mapa
 * - grid_rows: filas que se van a considerar
 */
function get_game_height(grid_rows) {
    return Math.round(HEX_HEIGHT * grid_rows) + HEX_HEIGHT / 1.9;
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Calcula el ancho en función de las columnas del mapa
 * - grid_columns: columnas que se van a considerar
 */
function get_game_width(grid_columns) {
    return Math.round(grid_columns / 2 * ( HEX_WIDTH + HEX_SIZE) + HEX_WIDTH / 4);
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Realiza una animación entre dos colores de un sprite
 * - canvas: objeto de juego.
 * - obj: sprite.
 * - startColor: color de inicio
 * - endColor: color de final
 * - time: tiempo de animación
 */
function tween_tint(canvas, obj, startColor, endColor, time) {
    var colorBlend = {step: 0};
    var colorTween = canvas.add.tween(colorBlend).to({step: 100}, time);
    colorTween.onUpdateCallback(function () {
        obj.tint = Phaser.Color.interpolateColor(startColor, endColor, 100, colorBlend.step);
    });
    obj.tint = startColor;
    colorTween.start();
}
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Manejo de formaciones ******************************************************
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Elimina todos los sprites de las unidades del mapa
 */
function delete_formation_deploy() {
    _.each(_.filter(hex_coords, function (coord) {
        return coord.unit > 0;
    }), function (coord) {
        unit_info[coord.unit].sprite.kill();
        coord.unit = 0;
    });
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Elimina el mapa de la formación
 */
function delete_map() {
    // Se eliminan los sprites que se encuentren mostrándose en este momento
    _.each(_.filter(hex_coords, function (coord) {
        return coord.sprite.alive == true;
    }), function (coord) {
        coord.sprite.kill();
    });
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Muestra las unidades seleccionadas en el mapa de formaciones
 */
function deploy_units() {
    // Listado de todas las unidades que se encuentran desplegadas pero no se han seleccionado
    var deleted = _.filter(hex_coords, function (coord) {
        return coord.unit > 0 && _.find(SELECTED_UNITS_LIST, {id: coord.unit}) == undefined;
    });
    // Borrado de todas las unidades no seleccionadas
    _.each(deleted, function (i) {
        unit_info[i.unit + ""].sprite.kill();
        i.unit = 0;
    });
    // Listado de todas las unidades que se encuentran seleccionadas pero no desplegadas
    var added = _.filter(SELECTED_UNITS_LIST, function (unit) {
        return _.find(hex_coords, {unit: unit.id}) == undefined;
    });
    // Creación de todos los sprites de las unidades anteriores
    _.each(added, function (i) {
        add_unit_sprite(i, _.findIndex(hex_coords, function (coord) {
            return coord.unit == 0 && coord.sprite.alive == true;
        }));
    });
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Instancia los gráficos para el despliegue de unidades
 */
function draw_deploy() {
    var grid_rows = GRID_ROWS;
    var grid_columns = GRID_ROWS;
    if (formation == null) {
        formation = new Phaser.Game(get_game_width(grid_columns), get_game_height(grid_rows) + 50, Phaser.AUTO, 'battle_deploy', {
            preload: preload_formation,
            create: create_formation
        }, true);
    } else {
        formation.destroy();
        formation = null;
        hex_coords = [];
        draw_deploy();
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Creación del mapa de hexágonos *********************************************
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Dibuja una columna en el mapa y guarda en "hex_coords" todos los datos asociados al mapa
 * (unidad, sprite, q, r)
 * - canvas: objeto del framework de juego
 * - rows: columnas
 * - x: coordenada x de la columna
 * - y: coordenada y de la primera posición de la columna
 * - q: marca de la columna para la simulación
 * - map: bandera que controla que el mapa generado tenga la interacción necesaria para el creador de mapas
 */
function draw_column(canvas, rows, x, y, q, map) {
    var hexagon;
    var offset_x = canvas.cache.getImage(HEXAGON_ASSET.slice(0, -4)).width / 2;
    var offset_y = canvas.cache.getImage(HEXAGON_ASSET.slice(0, -4)).height / 2;
    for (var i = 0; i < rows; i++) {
        hexagon = canvas.add.sprite(x + offset_x, (y + HEX_HEIGHT * i) + offset_y, HEXAGON_ASSET.slice(0, -4));
        hexagon.anchor.set(0.5, 0.5);
        hex_coords.push({sprite: hexagon, unit: 0, r: i, q: q});
        if (map) {
            add_input_hexagon(hexagon, i, q);
        }
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Creación del mapa con casillas hexagonales siguiendo un desplazamiento en cada columna
 *  - game: instancia de juego del framework
 *  - map: bandera que controla si se está en el creador de mapas o no
 */
function create_hex_grid(canvas, map, battle) {
    /*
     * Desplazamiento de cada columna del mapa hexagonal. Debe de ser positivo o negativo
     * en función de si la fila que se está pintando sea par o impar.
     */
    var grid_rows = GRID_ROWS;
    var grid_columns = GRID_ROWS;
    if (map || battle)
        grid_columns = GRID_COLUMNS;
    var offset = 0;
    for (var i = 0; i < grid_columns; i++) {
        offset = (i % 2 ? offset - HEX_HEIGHT * 0.5 : offset + HEX_HEIGHT * 0.5);
        draw_column(canvas, grid_rows, HEX_HORIZ * i, Math.round(offset), i, map);
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Crea el mapa de la formación
 */
function create_formation() {
    create_hex_grid(formation, false, false);
    hex_coords.reverse();
    var grid_rows = GRID_ROWS;
    formation.add.sprite(0, get_game_height(grid_rows), DISCARD_ASSET.slice(0, -4));
}
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Carga de assets y recursos *************************************************
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Hace que el objeto de la formación se adapte a todas las resoluciones
 * - canvas: objeto juego
 */
function scale_canvas(canvas) {
    // El tamaño de la ventana de simulación se adapta al contenedor
    canvas.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    canvas.scale.pageAlignHorizontally = true;
    canvas.scale.pageAlignVertically = true;
    canvas.scale.setScreenSize(true);
    // La simulación continúa si se deja de tener la ventana activa o se cambia de tamaño
    canvas.stage.disableVisibilityChange = true;
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Carga los assets relacionados con los tipos de unidades. Utiliza los nombres definidos
 *  - canvas: objeto juego
 *  - unit_prefix: nombre compuesto del sprite que representa a la unidad. <tipo_nivel>
 */
function units_load(canvas, unit_prefix) {
    for (var i = 0; i <= MAX_LEVEL; i++) {
        canvas.load.image(unit_prefix + i, ASSETS_PATH + '/' + unit_prefix + i + '.png');
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Carga de los assets para el despliegue de formaciones
 */
function preload_formation() {
    // Carga de assets para los elementos de la simulación
    _.each(interface_assets, function (asset) {
        formation.load.image(asset.slice(0, -4), ASSETS_PATH + '/' + asset);
    });
    // Carga de assets para los distintos tipos de unidades
    _.each(formation_assets, function (unit) {
        units_load(formation, unit);
    });
    // Adapta los gráficos a la resolución
    scale_canvas(formation);
}
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Manejo de unidades ********************************************************
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Dadas unas coordenadas obtiene el índice en donde se encuentra posicionada la unidad
 * - x: coordenada x
 * - y: coordenada y
 */
function get_index(x, y) {
    return _.findIndex(hex_coords, function (coord) {
        return coord.sprite.x == x && coord.sprite.y == y;
    })
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Obtiene el asset asociado a la unidad
 * - unit: objeto unidad, contiene el identificador, el tipo y el nivel
 */
function get_unit_asset(unit) {
    var asset_name = "";
    switch (unit.label) {
        // Cuerpo a cuerpo
        case 0:
            asset_name = MELEE_ASSET;
            break;
        // Defensa
        case 1:
            asset_name = DEFENSE_ASSET;
            break;
        // Distancia
        case 2:
            asset_name = DISTANCE_ASSET;
            break;
    }
    // El nombre del asset que se corresponde con la unidad es <tipo_nivel>
    asset_name += unit.level;
    return asset_name;
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Vuelve a mostrar el sprite asociado a la unidad en pantalla
 * - id: identificador de la unidad
 * - x: coordenada x.
 * - y: coordenda y
 * - index: índice en el vector mapa
 */
function revive_unit_sprite(id, x, y, index) {
    unit_info[id + ""].sprite.x = x;
    unit_info[id + ""].sprite.y = y;
    unit_info[id + ""].sprite.revive();
    unit_info[id + ""].hex = hex_coords[index].sprite;
    hex_coords[index].unit = id;
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Añade un nuevo sprite o lo revive del vector de unidades
 * - unit: unidad
 * - index: índice en el vector mapa
 */
function add_unit_sprite(unit, index) {
    var sprite;
    // Si no se tiene el índice en el vector mapa se busca
    if (index == undefined) {
        index = get_index(unit.x, unit.y);
    }
    // Si la unidad ya se desplegado se vuelve a mostrar
    if (unit_info[unit.id + ""] != undefined) {
        unit.x != undefined && unit.y != undefined ? revive_unit_sprite(unit.id, unit.x, unit.y, index) : revive_unit_sprite(unit.id, hex_coords[index].sprite.x, hex_coords[index].sprite.y, index);
    } else {
        // Si no se crea un sprite nuevo
        sprite = formation.add.sprite(hex_coords[index].sprite.x, hex_coords[index].sprite.y, get_unit_asset(unit));
        sprite.anchor.set(0.5, 0.5);
        sprite.name = unit.id + "";
        hex_coords[index].unit = unit.id;
        unit_info[sprite.name] = {sprite: sprite, hex: hex_coords[index].sprite};
        sprite.inputEnabled = true;
        sprite.input.useHandCursor = true;
        sprite.input.priorityID = 1;
        sprite.input.enableDrag(false, true);
        sprite.events.onDragStop.add(on_drag_stop_unit, formation);
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Animación del sprite de posición del mapa en donde se ha realizado una mejora de los atributos de la unidad. También se cambia el sprite
 * asociado a la unidad en caso de aumentar de nivel
 * - unit: identificador de la unidad
 */
function level_up_sprite(unit) {
    unit_info[unit.id].sprite.loadTexture(get_unit_asset(unit), 0);
    $('#updrade_in_formlist').hide();
    // Colorear el sprite de verde
    tween_tint(formation, unit_info[unit.id].hex, 0xffffff, 0x00ff00, 1000);
    // Volver a colorear el sprite de blanco
    tween_tint(formation, unit_info[unit.id].hex, 0x00ff00, 0xffffff, 1000);
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Realiza la animación de movimiento de la unidad
 * - canvas: objeto juego
 * - sprite: sprite de la unidad
 * - hexagon: sprite posición del mapa
 */
function move_unit(canvas, sprite, hexagon) {
    canvas.add.tween(sprite).to({
        x: hexagon.x,
        y: hexagon.y
    }, 500, Phaser.Easing.Linear.None, true);
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Obtiene la posición del hexágono más próximo a la unidad
 * - unit_position: posición de la unidad
 */
function get_closest_hex(unit_position) {
    var distance = 10000000;
    var calculated_distance = 0;
    var hex = null;
    for (var i = 0; i < hex_coords.length; i++) {
        // Distancia euclidiana
        calculated_distance = Phaser.Point.distance(unit_position, hex_coords[i].sprite.position);
        if (calculated_distance < distance) {
            distance = calculated_distance;
            hex = hex_coords[i];
        }
    }
    return hex
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Método que controla el evento drag and drop de la unidad
 * - sprite: sprite de la unidad
 * - pointer: puntero del ratón
 */
function on_drag_stop_unit(sprite, pointer) {
    // Evento click
    // Se realizará un click en la unidad cuando las coordenadas de esta y del sprite de la posición sean las mismas
    if (unit_info[sprite.name].hex.x == sprite.x && unit_info[sprite.name].hex.y == sprite.y) {
        $.ajax(
            {
                url: '/simplewars/unit/' + sprite.name + '/',
                type: 'GET',
                success: function (response) {
                    $(UNIT_UPGRADE_WRAPPER).show();
                    $(WRAPPER_UPGRADE).html(response).hide().show();
                    bind_upgrade_unit();
                }
            });
    } else {
        // Evento drag and drop
        // Índice antes de realizar el movimiento
        var index_before = _.indexOf(hex_coords, _.findWhere(hex_coords, {sprite: unit_info[sprite.name].hex}));
        // Hexágono del mapa más próximo a donde se ha dejado la unidad
        var hex = get_closest_hex(sprite.position);
        // Índice después del movimiento
        var index_after = _.indexOf(hex_coords, hex);
        var destiny_unit_name = hex_coords[index_after].unit;
        var i = -1;
        // La unidad se desea descartar de la formación
        if (sprite.y > get_game_height(GRID_ROWS)) {
            // Se elimina del listado de unidades seleccionadas
            $('#' + sprite.name).removeClass(SELECTED_CLASS);
            i = index_of(SELECTED_UNITS_LIST, sprite.name, 'id');
            if (i > -1) {
                SELECTED_UNITS_LIST.splice(i, 1);
            }
            // Actualización de contadores
            update_selected_counters();
            // Se elimina del mapa
            hex_coords[index_before].unit = 0;
            sprite.kill();
        } else {
            // Se ha arrastrado la unidad a un espacio sin mapa
            if (hex_coords[index_after].sprite.alive == false) {
                move_unit(formation, sprite, unit_info[sprite.name].hex);
            } else {
                // Intercambio de la información de la unidad en caso de tener la posición ocupada
                if (destiny_unit_name > 0) {
                    move_unit(formation, unit_info[destiny_unit_name].sprite, unit_info[sprite.name].hex);
                    hex_coords[index_before].unit = destiny_unit_name;
                    unit_info[destiny_unit_name].hex = unit_info[sprite.name].hex;
                } else {
                    hex_coords[index_before].unit = 0;
                }
                // Movimiento normal de unidad con la posición vacía
                move_unit(formation, sprite, hex.sprite);
                hex_coords[index_after].unit = sprite.name;
                unit_info[sprite.name].hex = hex.sprite;
            }
        }
    }
}
//------------------------------------------------------------------------------------------------------------------------------------