--
-- PostgreSQL database dump
--

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Create schema
--

CREATE SCHEMA IF NOT EXISTS telemetry;

ALTER SCHEMA telemetry OWNER TO postgres;

SET default_tablespace = '';
SET default_table_access_method = heap;

--
-- Create table
--

CREATE TABLE IF NOT EXISTS telemetry.device_telemetry (
    id integer NOT NULL,
    device_id character varying(50) NOT NULL,
    "position" integer,
    motor_current double precision,
    temperature double precision,
    battery_voltage double precision,
    flow_rate double precision,
    "timestamp" timestamp without time zone NOT NULL
);

ALTER TABLE telemetry.device_telemetry OWNER TO postgres;

--
-- Create sequence
--

CREATE SEQUENCE IF NOT EXISTS telemetry.device_telemetry_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE telemetry.device_telemetry_id_seq OWNER TO postgres;

ALTER SEQUENCE telemetry.device_telemetry_id_seq
OWNED BY telemetry.device_telemetry.id;

--
-- Default value for id
--

ALTER TABLE ONLY telemetry.device_telemetry
ALTER COLUMN id SET DEFAULT nextval('telemetry.device_telemetry_id_seq'::regclass);

--
-- Insert sample data
--

INSERT INTO telemetry.device_telemetry
(id, device_id, "position", motor_current, temperature, battery_voltage, flow_rate, "timestamp")
VALUES
(1, 'VALVE_001', 50, 1.2, 32.5, 12.3, 5.8, '2026-03-13 19:13:42.668793'),
(2, 'VALVE_001', 50, 1.2, 32.5, 12.3, 5.8, '2026-03-13 19:13:53.398523');

--
-- Update sequence value
--

SELECT pg_catalog.setval('telemetry.device_telemetry_id_seq', 2, true);

--
-- Primary key
--

ALTER TABLE ONLY telemetry.device_telemetry
ADD CONSTRAINT device_telemetry_pkey PRIMARY KEY (id);