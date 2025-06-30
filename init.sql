-- KIIS Todo Database Initialization
CREATE DATABASE IF NOT EXISTS kiis_todo;

-- Connect to the database
\c kiis_todo;

-- Create tasks table with additional fields
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO tasks (title, description, priority) VALUES 
    ('Complete KIIS Project', 'Finish all components of the cloud infrastructure project', 'high'),
    ('Test Docker Setup', 'Verify that all containers work correctly', 'medium'),
    ('Deploy to Kubernetes', 'Set up K8s manifests and deploy', 'high');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);