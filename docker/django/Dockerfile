FROM python:2.7

ADD requirements.txt .

RUN apt-get update && apt-get install -y default-libmysqlclient-dev && \
    sed '/st_mysql_options options;/a unsigned int reconnect;' /usr/include/mysql/mysql.h -i.bkp && \
    pip install -r requirements.txt

ADD . /home
WORKDIR /home
EXPOSE 8000

