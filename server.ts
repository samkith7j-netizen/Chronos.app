import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("levelup.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS user_stats (
    id INTEGER PRIMARY KEY,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    name TEXT DEFAULT 'Student'
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    type TEXT CHECK(type IN ('homework', 'exam', 'study')) NOT NULL,
    due_date TEXT,
    completed INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 50
  );

  CREATE TABLE IF NOT EXISTS grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL,
    score REAL NOT NULL,
    max_score REAL DEFAULT 100,
    weight REAL DEFAULT 1.0
  );

  CREATE TABLE IF NOT EXISTS timetable (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    subject TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS timetable_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    num_classes INTEGER DEFAULT 6,
    start_time TEXT DEFAULT '08:00',
    class_duration INTEGER DEFAULT 50,
    break_duration INTEGER DEFAULT 15,
    break_after INTEGER DEFAULT 3
  );

  INSERT OR IGNORE INTO timetable_settings (id) VALUES (1);

  INSERT OR IGNORE INTO user_stats (id, xp, level, name) VALUES (1, 0, 1, 'Student');
  
  -- Seed initial tasks if empty
  INSERT INTO tasks (title, type, due_date, xp_reward) 
  SELECT 'Complete Math Homework', 'homework', '2026-03-10', 50
  WHERE NOT EXISTS (SELECT 1 FROM tasks);
  
  INSERT INTO tasks (title, type, due_date, xp_reward)
  SELECT 'History Midterm Exam', 'exam', '2026-03-15', 500
  WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'History Midterm Exam');

  INSERT INTO tasks (title, type, due_date, xp_reward)
  SELECT 'Daily Study Session', 'study', '2026-03-07', 100
  WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Daily Study Session');
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/stats", (req, res) => {
    const stats = db.prepare("SELECT * FROM user_stats WHERE id = 1").get();
    res.json(stats);
  });

  app.post("/api/stats/xp", (req, res) => {
    const { amount } = req.body;
    const current = db.prepare("SELECT xp, level FROM user_stats WHERE id = 1").get() as { xp: number, level: number };
    let newXp = current.xp + amount;
    let newLevel = current.level;
    
    // Simple level up logic: 1000 XP per level
    while (newXp >= newLevel * 1000) {
      newXp -= newLevel * 1000;
      newLevel++;
    }

    db.prepare("UPDATE user_stats SET xp = ?, level = ? WHERE id = 1").run(newXp, newLevel);
    res.json({ xp: newXp, level: newLevel });
  });

  app.get("/api/tasks", (req, res) => {
    const tasks = db.prepare("SELECT * FROM tasks ORDER BY completed ASC, due_date ASC").all();
    res.json(tasks);
  });

  app.post("/api/tasks", (req, res) => {
    const { title, type, due_date, xp_reward } = req.body;
    const result = db.prepare("INSERT INTO tasks (title, type, due_date, xp_reward) VALUES (?, ?, ?, ?)")
      .run(title, type, due_date, xp_reward);
    res.json({ id: result.lastInsertRowid });
  });

  app.patch("/api/tasks/:id/complete", (req, res) => {
    const { id } = req.params;
    const task = db.prepare("SELECT xp_reward, completed FROM tasks WHERE id = ?").get() as { xp_reward: number, completed: number };
    
    if (task && !task.completed) {
      db.prepare("UPDATE tasks SET completed = 1 WHERE id = ?").run(id);
      // Add XP
      const current = db.prepare("SELECT xp, level FROM user_stats WHERE id = 1").get() as { xp: number, level: number };
      let newXp = current.xp + task.xp_reward;
      let newLevel = current.level;
      while (newXp >= newLevel * 1000) {
        newXp -= newLevel * 1000;
        newLevel++;
      }
      db.prepare("UPDATE user_stats SET xp = ?, level = ? WHERE id = 1").run(newXp, newLevel);
      res.json({ success: true, newXp, newLevel });
    } else {
      res.status(400).json({ error: "Task already completed or not found" });
    }
  });

  app.get("/api/grades", (req, res) => {
    const grades = db.prepare("SELECT * FROM grades").all();
    res.json(grades);
  });

  app.post("/api/grades", (req, res) => {
    const { subject, score, max_score, weight } = req.body;
    db.prepare("INSERT INTO grades (subject, score, max_score, weight) VALUES (?, ?, ?, ?)")
      .run(subject, score, max_score, weight);
    res.json({ success: true });
  });

  app.get("/api/timetable/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM timetable_settings WHERE id = 1").get();
    res.json(settings);
  });

  app.post("/api/timetable/settings", (req, res) => {
    const { num_classes, start_time, class_duration, break_duration, break_after } = req.body;
    db.prepare(`
      UPDATE timetable_settings 
      SET num_classes = ?, start_time = ?, class_duration = ?, break_duration = ?, break_after = ?
      WHERE id = 1
    `).run(num_classes, start_time, class_duration, break_duration, break_after);
    res.json({ success: true });
  });

  app.get("/api/timetable", (req, res) => {
    const timetable = db.prepare("SELECT * FROM timetable").all();
    res.json(timetable);
  });

  app.post("/api/timetable", (req, res) => {
    const { day, start_time, end_time, subject } = req.body;
    db.prepare("INSERT INTO timetable (day, start_time, end_time, subject) VALUES (?, ?, ?, ?)")
      .run(day, start_time, end_time, subject);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
