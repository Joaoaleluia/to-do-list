import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { express } from "express";

const app = express(); // para iniciar as funções do framework express
const PORT =  3000; // Porta da rede local para criar o servidor localhost

// Middleware (comunicação do baonco com o front, intermedia a comunicação)
app.use(express.json());
app.use(express.static('public/'));

// inicia o database do SQLite
let db;

// Função async para definir ordem de excução com await
async function initDB() {
    db - await open({
        filename: '.banco.db',
        driver: sqlite3.Database,
    })

    await db.run(`CREATE TABLE IF NOT EXISTS tasks(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            descripition TEXT NOT NULL,
            completed INTERGER DEFAULT 0
        )`);
}

// API ENDPOINTS
app.get('/tasks', async(req, res) => {
    const tasks = await db.all('SELECT * FROM tasks');
    res.json(tasks);
});

app.post('/tasks', async(req, res) => {
    const { description } = req.body;
    const stmt = await db.prepare('INSERT INTO tasks (description) VALUES (?)');
    await stmt.run(description);
    await stmt.finalize();
    res.status(201).json({message: 'Task added'})
});

app.post('/staks/:id', async(req, res) => {
    const { id } = req.params;
    await db.run(`DELETE FROM tasks WHERE id = ?`, id);
    res.send(204).send();
});

app.patch('tasks/:id/toggle', async(req, res) => {
    const { id } = req.params
    const task = await db.get(`SELECT * FROM tasks WHERE id = ?`, id);
    const completed = task.completed ? 0 : 1; //ToggleComplete
    await db.run(`UPDATE tasks SET completed = ? WHERE id = ?`, completed, id);
    res.status(204).send();
});

app.listen(PORT ,async() => {
    await initDB();
    console.log(`Server running at http://localhost:${PORT}`);
});
