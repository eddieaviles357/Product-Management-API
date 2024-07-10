\echo 'Delete and recreate product_management db?'
\prompt 'Return for yes or control-c to cancel > ' foo

DROP DATABASE IF EXISTS product_management;
CREATE DATABASE product_management;
\connect product_management

\i pm-schema.sql
\i pm-seed.sql

\echo 'Delete and recreate product_management_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS product_management_test;
CREATE DATABASE product_management_test;
\connect product_management_test

\i pm-schema.sql