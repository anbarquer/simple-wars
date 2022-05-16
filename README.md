# Simple wars

Juego de estrategia ideado y desarrollado de forma autodidacta como trabajo de fin de grado.  En el momento de acometer este proyecto se puso como objetivo el que todas las tecnologías utilizadas fuesen desconocidas para el autor. Se hizo especial incapié en el uso de WebGL para mostrar los gráficos y animaciones del juego.

![start](https://raw.githubusercontent.com/anbarquer/simple-wars/master/screen/dashboard.png)
![units](https://raw.githubusercontent.com/anbarquer/simple-wars/master/screen/create_formation2.png)
![params](https://raw.githubusercontent.com/anbarquer/simple-wars/master/screen/battle_params.png)
![sim](https://raw.githubusercontent.com/anbarquer/simple-wars/master/screen/simulation.png)

![battle1](https://raw.githubusercontent.com/anbarquer/simple-wars/master/screen/battle-1.gif)
![battle1](https://raw.githubusercontent.com/anbarquer/simple-wars/master/screen/battle-2.gif)


* [Documentación](http://dehesa.unex.es/handle/10662/3534)

# Local setup

* Run: ``docker-compose -f docker/docker-compose-local.yml up --build``
* Enter mysql docker container``docker exec -it docker_db_1 /bin/bash``
* Inside mysql docker container: ``mysql -u simplewarsadmin -p < db.sql``
* Password: ``12346``
* Run: ``docker-compose -f docker/docker-compose-local.yml up --build``