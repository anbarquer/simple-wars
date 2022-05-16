FROM mysql:5.5.41

RUN echo "innodb_file_per_table=1" >> /etc/mysql/my.cnf
RUN echo "innodb_file_format = Barracuda" >> /etc/mysql/my.cnf
RUN echo "query_cache_type=1" >> /etc/mysql/my.cnf
RUN echo "query_cache_size = 10M" >> /etc/mysql/my.cnf
RUN echo "query_cache_limit=256K" >> /etc/mysql/my.cnf
EXPOSE 3306

ADD docker/db/db.sql.gz .
RUN gunzip db.sql.gz
