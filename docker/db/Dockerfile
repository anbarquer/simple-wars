FROM mysql:5.7

RUN echo "[mysqld]" >> /etc/mysql/my.cnf && \
    echo "innodb_file_per_table=1" >> /etc/mysql/my.cnf && \
    echo "innodb_file_format=Barracuda" >> /etc/mysql/my.cnf && \
    echo "query_cache_type=1" >> /etc/mysql/my.cnf && \
    echo "query_cache_size=10M" >> /etc/mysql/my.cnf && \
    echo "query_cache_limit=256K" >> /etc/mysql/my.cnf && \
    echo "#!/usr/bin/env bash" > dump && \
    echo "echo -e '\033[33mInstalling game data...\033[0m'" >> dump && \
    echo "gunzip < db.sql.gz | mysql -u root" >> dump && \
    echo "echo -e '\033[32mOK\033[0m'" >> dump && \
    chmod a+x dump

ADD docker/db/db.sql.gz .
EXPOSE 3306