const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const script = express();
const port = 3000;

script.use(express.static('public'));

let db = new sqlite3.Database('./mydb.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run('CREATE TABLE IF NOT EXISTS list (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, date DATE)', (err) => {
      if (err) {
        console.error('Error creating table', err.message);
      } else {
        console.log('Table created or already exists.');
      }
    });
  }
});

script.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

script.use(express.json());

script.post('/add-item', (req, res) => {
    const { name, date } = req.body;
    const sql = `INSERT INTO list (name, date) VALUES (?, ?)`;

    db.run(sql, [name, date], function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({error: err.message});
            return;
        }
        res.json({ id: this.lastID, name, date });
    });
});

script.get('/get-items', (req, res) => {
  const sql = "SELECT * FROM list";
  db.all(sql, [], (err, rows) => {
      if (err) {
          res.status(500).json({ error: err.message });
          return;
      }
      res.json(rows);
  });
});

script.delete('/delete-item/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM list WHERE id = ?`;

  db.run(sql, id, function(err) {
      if (err) {
          res.status(500).json({error: err.message});
          return;
      }
      res.json({message: 'Deleted successfully'});
  });
});

script.patch('/update-item/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body; 
  const sql = `UPDATE list SET name = ? WHERE id = ?`;

  db.run(sql, [name, id], function(err) {
      if (err) {
          console.error(err.message);
          res.status(500).json({ error: err.message });
          return;
      }
      res.json({ message: 'Updated successfully', id, name });
  });
});