pg_ctl start -D "C:\Program Files\PostgreSQL\16\data"

pg_dump -U postgres -h localhost -p 5432 -d PracticeBD > mydatabase_dump.sql

createdb -U postgres -h localhost -p 5432 mydatabase

psql -U postgres -h localhost -p 5432 -d PracticeBD -f mydatabase_dump.sql
