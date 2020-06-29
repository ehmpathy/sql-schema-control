FROM postgres:10.7

ADD wait-for-postgres.sh /root/
RUN chmod +x /root/wait-for-postgres.sh

ADD extensions.sql /root/

ADD provision-extensions.sh /root/
RUN chmod +x /root/provision-extensions.sh
