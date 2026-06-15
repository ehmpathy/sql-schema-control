FROM postgres:10.7

ADD wait-for-postgres.sh /root/
RUN chmod +x /root/wait-for-postgres.sh

ADD init.sql /root/
ADD provision-init.sh /root/
RUN chmod +x /root/provision-init.sh
