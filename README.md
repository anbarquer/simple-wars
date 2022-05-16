# Simple wars

Juego de estrategia ideado y desarrollado de forma autodidacta como trabajo de fin de grado.  En el momento de acometer este proyecto se puso como objetivo el que todas las tecnologías utilizadas fuesen desconocidas para el autor. Se hizo especial incapié en el uso de WebGL para mostrar los gráficos y animaciones del juego.

## Local setup

* Run: ``docker-compose -f docker/simplewars-local.yml up --build -d``
* Enter mysql docker container``docker exec -it docker_db_1 /bin/bash``
* Execute inside mysql docker container: ``mysql -u simplewarsadmin -p < db.sql`` / Password: ``12346``
* Run: ``docker-compose -f docker/simplewars-local.yml up --build -d`` again. 
* Creds: ``simplewarsuser / 123456a``

## Screenshots
![dashboard](https://raw.githubusercontent.com/anbarquer/simple-wars/master/screen/dashboard.png)
---
![formation](https://raw.githubusercontent.com/anbarquer/simple-wars/master/screen/create_formation2.png)
---
![params](https://raw.githubusercontent.com/anbarquer/simple-wars/master/screen/battle_params.png)
---
![sim](https://raw.githubusercontent.com/anbarquer/simple-wars/master/screen/simulation.png)
---
![benchmark](https://raw.githubusercontent.com/anbarquer/simple-wars/master/screen/benchmark.png)


## Simulation
![battle1](https://raw.githubusercontent.com/anbarquer/simple-wars/master/screen/battle-1.gif)
---
![battle2](https://raw.githubusercontent.com/anbarquer/simple-wars/master/screen/battle-2.gif)
---
![battle3](https://raw.githubusercontent.com/anbarquer/simple-wars/master/screen/battle-3.gif)

## Map generation
![map](https://raw.githubusercontent.com/anbarquer/simple-wars/master/screen/map-generation.gif)
---
* [Documentación](http://dehesa.unex.es/handle/10662/3534)
