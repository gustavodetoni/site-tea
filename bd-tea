CREATE DATABASE IF NOT EXISTS tea;
USE tea;

-- Tabela para armazenar os tipos de usuário
CREATE TABLE IF NOT EXISTS user_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL
);

-- Tabela para armazenar os usuários
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_type_id INT,
    especialidade VARCHAR(100),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    birthdate VARCHAR(100),
    child_name VARCHAR(100),
    child_gender ENUM('M', 'F') DEFAULT NULL,
    child_birthdate VARCHAR(100),
    senha VARCHAR(100) NOT NULL,
    cpf VARCHAR(12),
    FOREIGN KEY (user_type_id) REFERENCES user_types(id)
);

-- Tabela para armazenar os cronogramas de atividades
CREATE TABLE IF NOT EXISTS schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    week_1 TEXT NOT NULL,
    week_2 TEXT NOT NULL,
    week_3 TEXT NOT NULL,
    week_4 TEXT NOT NULL,
    week_5 TEXT NOT NULL,
    week_6 TEXT NOT NULL,
    week_7 TEXT NOT NULL,
    week_8 TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabela para armazenar a relação entre terapeutas e pacientes
CREATE TABLE IF NOT EXISTS therapist_patient (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(100) NOT NULL,
    therapist_id INT,
    patient_id INT,
    FOREIGN KEY (therapist_id) REFERENCES users(id),
    FOREIGN KEY (patient_id) REFERENCES users(id)
);

INSERT INTO user_types (id, type_name) VALUES (1, 'Terapeuta');
INSERT INTO user_types (id, type_name) VALUES (2, 'Pais');
INSERT INTO user_types (id, type_name) VALUES (3, 'Responsavel');