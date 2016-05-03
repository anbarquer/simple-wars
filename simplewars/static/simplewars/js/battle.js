/*
 * Antonio Diego Barquero Cuadrado - TFG - UEX - 2014/2015
 * battle.js
 * Funciones para la representación de batallas
 */
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Sprites ********************************************************************
//------------------------------------------------------------------------------------------------------------------------------------
// Sprites para los ataques
var PROJECTILE_ASSET = 'projectile.png';
var EXPLOSION_ASSET = 'explosion.png';
var MISS_ASSET = 'miss.png';
// Lista de de sprites de ataques
var animations_assets = [PROJECTILE_ASSET, EXPLOSION_ASSET, MISS_ASSET];
//------------------------------------------------------------------------------------------------------------------------------------
// Sprites de las unidades enemigas
var MELEE_ENEMY_ASSET = 'enemy_melee_';
var DEFENSE_ENEMY_ASSET = 'enemy_def_';
var DISTANCE_ENEMY_ASSET = 'enemy_dist_';
// Lista de todos los sprites de unidades
var unit_assets = [MELEE_ASSET, MELEE_ENEMY_ASSET, DISTANCE_ASSET, DISTANCE_ENEMY_ASSET, DEFENSE_ASSET, DEFENSE_ENEMY_ASSET];
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Mapas **********************************************************************
//------------------------------------------------------------------------------------------------------------------------------------
// Listado de mapas
var map_list = [];
var map_selected = '';
//------------------------------------------------------------------------------------------------------------------------------------
// **************************************************Datos de la simulación **********************************************************
//------------------------------------------------------------------------------------------------------------------------------------
// Velocidad de la simulación
var speed = 500;
// Turno de la simulación
var turn = 0;
// Bandera para controlar la simulación
var playing = false;
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Estructuras ****************************************************************
//------------------------------------------------------------------------------------------------------------------------------------
// Acciones de cada turno
var simulation_frames;
// Turnos totales
var total_turns = 0;
// Intervalo que va a repetir la ejecución
var turn_interval;
// Resultado final para informar al usuario
var end_result;
// Créditos que el usuario va a ganar
var end_credits = 0;
//------------------------------------------------------------------------------------------------------------------------------------
/* Sprites de todas las unidades, es una estructura clave - valor identificada por los nombres de las unidades. Contiene
 * - unit: sprite de la unidad
 * - explosion: sprite de la explosión
 * - projectile: sprite del proyectil de ataque
 * - missed: sprite de ataque fallido
 * Esto se realiza de la siguiente forma para asegurar que todas las unidades que forman parte de la simulación pueden atacar o moverse al
 * mismo tiempo
 */
var simulation_sprites = [];
/* Movimientos de las unidades, es un vector que contiene objetos con lo siguiente:
 * - sprite: sprite de la unidad
 * - x: coordenada x destino del movimiento
 * - y: coordenada y destino del movimiento
 */
var movements = [];
/* Ataques de las unidades
 * - x1: coordenada x origen del ataque
 * - y1: coordenada y origen del ataque
 * - x2: coordenada x destino del ataque
 * - y2: coordenada y destino del ataque
 * - missed: indica si el ataque es fallido o no
 * - name: identificador de la unidad
 */
var attacks = [];
// Unidades muertas. Contiene un listado de identificadores de unidades que ya no forman parte de la simulación en cada turno
var units_dead = [];
//------------------------------------------------------------------------------------------------------------------------------------
// Objeto del framework que contiene toda la información de la batalla
var battle_map = null;
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Carga de assets y recursos *************************************************
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Inicialización del mapa de la batalla. Instancia el objeto del framework y establece las dimensiones
 */
function init_battle_map() {
    var grid_rows = GRID_ROWS;
    var grid_columns = GRID_COLUMNS;
    // Carga todos los mapas desde el servidor
    if (map_list.length == 0) {
        $.ajax({
            url: 'simplewars/battle',
            type: 'GET',
            success: function (response) {
                if (response['error'] != undefined) {
                    show_animated_message(ERROR_CLASS, response['error']);
                } else {
                    _.each(_.range(parseInt(response['total'])), function (i) {
                        map_list.push(response[i] + '.png');
                    });
                    if (battle_map == null) {
                        battle_map = new Phaser.Game(get_game_width(grid_columns), get_game_height(grid_rows), Phaser.AUTO, 'battle', {
                            preload: preload_battle_map,
                            create: create_battle_map
                        }, true);
                    }
                }
            }
        });
    } else {
        if (battle_map == null) {
            battle_map = new Phaser.Game(get_game_width(grid_columns), get_game_height(grid_rows), Phaser.AUTO, 'battle', {
                preload: preload_battle_map,
                create: create_battle_map
            }, true);
        }
    }


}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Elimina el objeto del framework y modifica la interfaz
 */
function destroy_battle_map() {
    if (battle_map != null) {
        battle_map.destroy();
        battle_map = null;
        $('#simulation_battle').hide();
        map_list = [];
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Establece de fondo del canvas la imagen del mapa seleccionado. Guardado en "map_selected"
 */
function create_battle_map() {
    battle_map.add.tileSprite(0, 0, get_game_width(GRID_COLUMNS), get_game_height(GRID_ROWS), map_selected);
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Carga todos los sprites y mapas de la simulación
 */
function preload_battle_map() {
    // Carga de assets para los elementos de la simulación
    _.each(animations_assets, function (animation) {
        battle_map.load.image(animation.slice(0, -4), ASSETS_PATH + '/' + animation);
    });
    // Carga de los mapas
    _.each(map_list, function (map) {
        battle_map.load.image(map.slice(0, -4), BACKGROUND_PATH + '/' + map);
    });
    // Carga de assets para los distintos tipos de unidades
    _.each(unit_assets, function (asset) {
        units_load(battle_map, asset);
    });
    // Escala el canvas para soportar todas las resoluciones
    scale_canvas(battle_map);
}
/*
 * Carga los datos resultado de la simulación del servidor
 * - simulation: acciones de todos los turnos
 * - total: turnos totales
 * - credits: créditos que se han ganado
 * - results: unidades perdidas y eliminadas de la simulación
 */
function load_simulation(simulation, total, credits, results) {
    turn = 0;
    simulation_frames = simulation;
    total_turns = total;
    end_result = results;
    end_credits = credits;
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Se guarda en "map_selected" el nombre del mapa de la batalla
 * - map: nombre del mapa
 */
function configure_map(map) {
    map_selected = map;
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Se obtiene el nombre del sprite asociado dependiendo del tipo de unidad
 * - unit: unidad
 */
function get_enemy_asset(unit) {
    var asset_name = "";
    switch (unit.label) {
        // Cuerpo a cuerpo
        case 0:
            asset_name = MELEE_ENEMY_ASSET;
            break;
        // Defensa
        case 1:
            asset_name = DEFENSE_ENEMY_ASSET;
            break;
        // Distancia
        case 2:
            asset_name = DISTANCE_ENEMY_ASSET;
            break;
    }
    // El nombre del asset que se corresponde con la unidad es <tipo_nivel>
    asset_name += unit.level;
    return asset_name;
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Configuración inicial de las unidades. Guarda en la estructura "simulation_sprites" todos los sprites de todas las unidades
 * y genera los nombres asociados a los aliados y enemigos
 * - units: listado inicial de las unidades de la simulación
 */
function configure_beginning_units(units) {
    var unit;
    var sprite;
    var asset = '';
    var explosion;
    var projectile;
    var missed;
    _.each(_.range(GRID_COLUMNS), function (i) {
        _.each(_.range(GRID_ROWS), function (j) {
            /*
             * La estructura "unit" es de tipo clave-valor. Cada clave es del tipo (i + " " +j) siendo i,j fila,columna del mapa
             * Contiene lo siguiente:
             *  - nivel: nivel de la unida
             *  - x: coordenada x del canvas
             *  - y: coordenada y del canvas
             *  - lado: indica si la unidad es enemiga o aliada
             *  - tipo: tipo de la unidad
             *  - sprite: nombre del sprite asociado a la unidad
             * Esto se realiza de esta forma porque dependiendo de si la unidad es aliada o enemiga y de su nivel, su sprite variará
             */
            unit = units[i + ' ' + j];
            if (units[i + ' ' + j] != undefined) {
                switch (unit.side) {
                    // Unidades aliadas
                    case 0:
                        asset = get_unit_asset(unit);
                        break;
                    // Unidades enemigas
                    case 1:
                        asset = get_enemy_asset(unit);
                        break;
                }
                // Carga el sprite de la unidad
                sprite = battle_map.add.sprite(unit.x, unit.y, asset);
                // Centra el sprite
                sprite.anchor.set(0.5, 0.5);
                // Le asocia al sprite para identificarlo. Los aliados son del tipo "ally_x" y los enemigos "enemy_x"
                sprite.name = unit.sprite + "";
                // Carga los sprites de explosión, fallo y ataque
                explosion = battle_map.add.sprite(unit.x, unit.y, EXPLOSION_ASSET.slice(0, -4)).kill();
                projectile = battle_map.add.sprite(unit.x, unit.y, PROJECTILE_ASSET.slice(0, -4)).kill();
                missed = battle_map.add.sprite(unit.x, unit.y, MISS_ASSET.slice(0, -4)).kill();
                // Centra los sprites
                explosion.anchor.set(0.5, 0.5);
                projectile.anchor.set(0.5, 0.5);
                missed.anchor.set(0.5, 0.5);
                /* Estructura de los sprites de la simulación
                 * - unit: unidad
                 * - explosion: ataque exitoso
                 * - projectile: proyectil
                 * - missed: ataque fallido
                 */
                simulation_sprites[unit.sprite + ""] = {
                    unit: sprite,
                    explosion: explosion,
                    projectile: projectile,
                    missed: missed
                };
            }
        });
    });
}
//------------------------------------------------------------------------------------------------------------------------------------
// ****************************************************** Acciones de la simulación **************************************************
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Guarda en la estructura que corresponda la información de las animaciones para ejecutar en orden después
 * - action: acción que se va a realizar (mover, atacar, morir)
 * - name: identificador de la unidad que va a realizar la acción
 */
function unit_animations(action, name) {
    if (action != undefined && simulation_sprites[name].unit.alive) {
        var position;
        // Las acciones de cada unidad se almancenan en vectores
        _.each(action, function (animation) {
            position = simulation_sprites[name];
            /* Ataques (fallidos o exitosos):
             * - x1: coordenada x origen del ataque
             * - y1: coordenada y origen del ataque
             * - x2: coordenada x destino del ataque
             * - y2: coordenada y destino del ataque
             * - missed: indica si se ha fallado o no
             * - name: nombre asociado al sprite que realiza la acción
             */
            // Fallo de ataque
            if (animation.missed_x != undefined && animation.missed_y != undefined) {
                attacks.push({
                    x1: position.unit.x,
                    y1: position.unit.y,
                    x2: animation.missed_x,
                    y2: animation.missed_y,
                    missed: true,
                    name: name
                });
            }
            // Ataque exitoso
            if (animation.attack_x != undefined && animation.attack_y != undefined) {
                attacks.push({
                    x1: position.unit.x,
                    y1: position.unit.y,
                    x2: animation.attack_x,
                    y2: animation.attack_y,
                    missed: false,
                    name: name
                });
            }
            /* Movimientos:
             * - x: coordenada x destino del movimiento
             * - y: coordenada y destino del movimiento
             * - missed: indica si se ha fallado o no
             * - sprite: sprite de la unidad
             */
            // Movimiento
            if (animation.move_x != undefined && animation.move_y != undefined) {
                movements.push({sprite: position.unit, x: animation.move_x, y: animation.move_y});
            }
            // Muerte. Cada nombre de unidad muerta se guarda en un listado para eliminar su sprite de la simulación
            if (animation == -1) {
                death(simulation_sprites[name].unit);
            }
        });
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Elimina todas las unidades muertas de la simulación
 */
function wipe_deads() {
    // Para cada unidad de la lista de muertas, se difumina su sprite y una vez acabado, se elimina del juego
    if (units_dead.length > 0) {
        _.each(units_dead, function (unit) {
            // El sprite de la unidad se desvanece
            battle_map.add.tween(simulation_sprites[unit].unit).to({alpha: 0}).delay(speed).start().onComplete.add(function () {
                // Una vez elminada la unidad de la batalla se eliminan todos los sprites asociados a esta
                simulation_sprites[unit].unit.kill();
                simulation_sprites[unit].explosion.kill();
                simulation_sprites[unit].projectile.kill();
                simulation_sprites[unit].missed.kill();
            });
        });
        // Se vacía la lista para el siguiente turno
        units_dead = [];
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Ejecuta todas las animaciones del turno de la simulación
 * - frame: acciones que forman parte del turno
 * - list: listado de unidades que realizan acciones en el turno
 */
function actions(frame) {
    /*
     * Se realizan todas las acciones de las unidades y se van guardando en las estructuras convenientes:
     * - Ataques: attacks
     * - Movimientos: movements
     * - Muertes: units_deads
     */
    _.each(frame, function (name, key) {
        unit_animations(name, key);
    });
    /*
     * En primer lugar se realizan los ataques y después los movimientos por el tiempo que tarda la animación, esto es:
     *  - Si el ataque es una posición destino de movimiento, esperar.
     *  - Si el ataque es una posición de inicio de movimiento, atacar.
     * Para el caso de los movimientos:
     *  - Si se va a recibir un ataque al inicio del movimiento, esperar
     *  - Si no, moverse normalmente.
     *  Por ello es necesario mantener dos listados distintos ya que las acciones de las unidades están condicionadas
     */
    // Se recorren los ataques y se llama a la función en orden según corresponda
    _.each(attacks, function (attck) {
        attack(battle_map, attck.x1, attck.y1, attck.x2, attck.y2, attck.missed, attck.name);
    });
    // Se recorren los movimientos y se llama a la función según corresponda
    _.each(movements, function (move) {
        move_unit_simulation(battle_map, move.sprite, move.x, move.y);

    });
    // Se resetean ambas listas de acciones para el siguiente turno
    attacks = [];
    movements = [];
}

//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Inicializa las estructuras de ataques y movimientos e inicializa el intervalo de ejecución
 */
function play_simulation() {
    if (!playing) {
        // Inicialización de las estructuras
        attacks = [];
        movements = [];
        units_dead = [];
        playing = true;
        // Inicio del intervalo de simulación
        turn_interval = setInterval(function () {
            simulation(wipe_deads);
        }, speed * 2);
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Simulación. Para cada turno se ejecutan las acciones, las animaciones y se indica el turno en la interfaz
 */
function simulation(callback) {
    // Lista de acciones del turno
    var frame = simulation_frames[turn + ""];
    // Se guardan las acciones
    actions(frame);
    turn++;
    if (turn > total_turns) {
        clearInterval(turn_interval);
        playing = false;
    } else {
        $('#turns').text('Turno: ' + turn);
        // Se eliminan las unidades muertas
        callback();
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Resultado de la simulación. Actualiza los datos de la vista y destruye el objeto del framework
 */
function simulation_results() {
    $('#enemy_lost').text('Unidades eliminadas: ' + end_result['units_killed']);
    $('#user_lost').text('Unidades perdidas: ' + end_result['units_lost']);
    var win = 'Batalla ganada';
    if (parseInt(end_result['lose']) == 1) {
        win = 'Batalla perdida';
    }
    $('#win_lose').text('Resultado: ' + win);
    $('#credits_earned').text('Créditos ganados: ' + end_credits);
    $('#simulation_result').fadeIn();
    destroy_battle_map();
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Detiene la simulación y muestra los resultados directamente
 */
function stop_simulation() {
    pause_simulation();
    simulation_results();
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Detiene el intervalo de ejecución de la simulación.
 */
function pause_simulation() {
    if (playing) {
        clearInterval(turn_interval);
        playing = false;
    }
}
//------------------------------------------------------------------------------------------------------------------------------------
// ************************************************************* Animaciones *********************************************************
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Animación del ataque
 * - canvas: objeto del framework en donde se va a realizar la simulación
 * - origin_x: coordenada x origen del ataque
 * - origin_y: coordenada y origen del ataque
 * - destiny_x: coordenada x destino del ataque
 * - destiny_y: coordenada y destino del ataque
 */
function attack(canvas, origin_x, origin_y, destiny_x, destiny_y, missed, name) {
    var projectile;
    var result;
    var delay;
    // Si se ha fallado, se carga el sprite de fallo, si no el de éxito
    missed == true ? result = simulation_sprites[name].missed : result = simulation_sprites[name].explosion;
    result.x = destiny_x;
    result.y = destiny_y;
    // Carga del proyectul
    projectile = simulation_sprites[name].projectile;
    projectile.x = origin_x;
    projectile.y = origin_y;
    projectile.revive();
    // Se comprueba si el destino del ataque es el final de algún movimiento pendiente. En caso afirmativo la animación se retrasará
    _.findWhere(movements, {x: destiny_x, y: destiny_y}) != undefined ? delay = speed : delay = 0;
    // Primero se anima el proyectil
    canvas.world.bringToTop(projectile);
    canvas.add.tween(projectile).to({
        x: destiny_x,
        y: destiny_y
        // A continuación se elimina y se anima el resultado (fallo o éxito)
    }, speed / 2).delay(delay).start().onComplete.add(function () {
            projectile.kill();
            result.revive();
            canvas.world.bringToTop(result);
            canvas.add.tween(result.scale).to({x: 1, y: 1}, speed / 2).start().onComplete.add(function () {
                result.kill();
            });
        }
    );
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Animación de movimiento de la simulación
 * - canvas: objeto del framework en donde se va a realizar la simulación
 * - sprite: sprite de la unidad que se va a animar
 * - destiny_x: coordenada x destino del movimiento
 * - destiny_y: coordenada y destino del movimiento
 */
function move_unit_simulation(canvas, sprite, destiny_x, destiny_y) {
    var delay;
    // Se comprueba si el destino de algún ataque tiene las mismas coordenadas que el sprite. En caso afirmativo la animación se retrasará
    _.findWhere(attacks, {x2: sprite.x, y2: sprite.y}) != undefined ? delay = speed : delay = 0;
    canvas.add.tween(sprite).to({
        x: destiny_x,
        y: destiny_y
    }, speed).delay(delay).start();
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * Muerte de la unidad. Se guarda en "units_dead" el nombre de esta
 * - sprite: sprite de la unidad
 */
function death(sprite) {
    units_dead.push(sprite.name);
}
//------------------------------------------------------------------------------------------------------------------------------------