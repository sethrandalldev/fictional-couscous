-- DEPLOY FRESH DATABASE TABLES 
\i '/docker-entrypoint-initdb.d/tables/users.sql'
\i '/docker-entrypoint-initdb.d/tables/projects.sql'
\i '/docker-entrypoint-initdb.d/tables/tickets.sql'
\i '/docker-entrypoint-initdb.d/tables/project_users.sql'
\i '/docker-entrypoint-initdb.d/tables/project_invitations.sql'
\i '/docker-entrypoint-initdb.d/tables/ticket_comments.sql'

\i '/docker-entrypoint-initdb.d/seed/seed.sql'