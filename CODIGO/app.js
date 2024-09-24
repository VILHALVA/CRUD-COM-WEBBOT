require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL');
});

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('/api/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.post('/api/users', (req, res) => {
    const { name, age } = req.body;
    db.query('INSERT INTO users (name, age) VALUES (?, ?)', [name, age], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Usuário cadastrado com sucesso!', id: result.insertId });
    });
});

app.put('/api/users/:id', (req, res) => {
    const { name, age } = req.body;
    const { id } = req.params;
    db.query('UPDATE users SET name = ?, age = ? WHERE id = ?', [name, age, id], (err) => {
        if (err) throw err;
        res.json({ message: 'Usuário atualizado com sucesso!' });
    });
});

app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
        if (err) throw err;
        res.json({ message: 'Usuário removido com sucesso!' });
    });
});

app.listen(5000, () => {
    console.log('Servidor rodando na porta 5000');
});
