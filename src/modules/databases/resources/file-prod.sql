SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE SCHEMA prod;


ALTER SCHEMA prod OWNER TO postgres;

COMMENT ON SCHEMA prod IS 'standard public schema';

CREATE TABLE prod.user (
    username character varying(20) NOT NULL,
    password character varying(64) NOT NULL,
    role character varying(64) NOT NULL
);

ALTER TABLE prod.user OWNER TO postgres;

INSERT INTO prod.user VALUES ('user', '$2y$10$rshvQU7c9GxWeEbq8BGdJuboxgkWDRAo4Cb6N9eC.lr2Sm2OpXbNG', 'admin');

ALTER TABLE ONLY prod.user
    ADD CONSTRAINT pk_user PRIMARY KEY (username);