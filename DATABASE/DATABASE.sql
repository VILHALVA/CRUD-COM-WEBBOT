-- Criar o banco de dados
CREATE DATABASE bot_database;

-- Usar o banco de dados
USE bot_database;

-- Criar a tabela de usuários
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL
);
