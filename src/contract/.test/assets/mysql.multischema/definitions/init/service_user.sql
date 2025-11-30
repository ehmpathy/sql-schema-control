CREATE USER 'user_name'@'%' IDENTIFIED BY '__CHANGE_M3__';
GRANT ALL PRIVILEGES ON `awesomedb`.* TO 'user_name'@'%';
GRANT ALL PRIVILEGES ON `commsdb`.*   TO 'user_name'@'%';
GRANT ALL PRIVILEGES ON `spacedb`.*   TO 'user_name'@'%';
