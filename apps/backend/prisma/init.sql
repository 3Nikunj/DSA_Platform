-- Initialize the database
-- This file is executed when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist (already handled by POSTGRES_DB env var)
-- CREATE DATABASE IF NOT EXISTS dsa_learning_platform;

-- Set timezone
SET timezone = 'UTC';

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create a simple health check function
CREATE OR REPLACE FUNCTION health_check()
RETURNS TEXT AS $$
BEGIN
    RETURN 'Database is healthy at ' || NOW();
END;
$$ LANGUAGE plpgsql;