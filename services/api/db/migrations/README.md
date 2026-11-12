# PostgreSQL migrations

Put ordered SQL changes here as `YYYYMMDDHHMMSS_short_description.sql`. Run
`npm run db:migrate --workspace @cbf1488/api` with `DATABASE_URL` set. These
TCP migrations target local PostgreSQL and PostgreSQL on Lighthouse (or another
instance with a reachable PostgreSQL endpoint). The current CloudBase shared PG
environment is accessed through its REST API and does not use this TCP runner.

Do not edit a migration after it has been applied to a shared environment;
add a new migration instead. Take a database backup before production schema
changes.
