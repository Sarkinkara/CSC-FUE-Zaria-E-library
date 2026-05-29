-- Enums for Role and Course Levels
CREATE TYPE user_role AS ENUM ('student', 'admin');
CREATE TYPE academic_level AS ENUM ('100', '200', '300', '400', 'Postgraduate');

-- Users Table (Unified authentication with polymorphic fields)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    reg_number VARCHAR(50) UNIQUE, -- NULL for admins
    staff_number VARCHAR(50) UNIQUE, -- NULL for students
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff Directory Table
CREATE TABLE staff_directory (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rank VARCHAR(100) NOT NULL,
    image_url VARCHAR(255),
    email VARCHAR(255)
);

-- Course Materials Table
CREATE TABLE course_materials (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    course_code VARCHAR(10) NOT NULL,
    level academic_level NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_by INT REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tutor Board Notices
CREATE TABLE tutor_notices (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Discussion Forum Table
CREATE TABLE discussion_threads (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs Table (Security Requirement)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    resource VARCHAR(255),
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);