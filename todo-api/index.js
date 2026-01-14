const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'rahasia';

app.use(cors());
app.use(express.json());


const users = [];
const todos = [];
let userIdCounter = 1;
let todoIdCounter = 1;


const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token tidak ada' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token tidak valid' });
  }
};


const validateRegister = (data) => {
  const errors = [];
  if (!data.username || data.username.length < 3) {
    errors.push('Username minimal 3 karakter');
  }
  if (!data.email || !data.email.includes('@')) {
    errors.push('Email tidak valid');
  }
  if (!data.password || data.password.length < 6) {
    errors.push('Password minimal 6 karakter');
  }
  return errors;
};

const validateTodo = (data) => {
  const errors = [];
  if (!data.title || data.title.trim() === '') {
    errors.push('Title wajib diisi');
  }
  if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
    errors.push('Priority harus low, medium, atau high');
  }
  return errors;
};



app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    const errors = validateRegister(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    // Check existing user
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: userIdCounter++,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };
    users.push(user);


    const token = jwt.sign({ id: user.id, username }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      success: true,
      message: 'Register berhasil',
      data: {
        user: { id: user.id, username, email },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    // Check password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        user: { id: user.id, username: user.username, email },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get Profile
app.get('/api/auth/profile', auth, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
  }
  res.json({
    success: true,
    data: { id: user.id, username: user.username, email: user.email }
  });
});


app.get('/api/todos', auth, (req, res) => {
  let userTodos = todos.filter(t => t.userId === req.user.id);

  // Filter by query params
  const { completed, priority, search } = req.query;

  if (completed !== undefined) {
    userTodos = userTodos.filter(t => t.completed === (completed === 'true'));
  }
  if (priority) {
    userTodos = userTodos.filter(t => t.priority === priority);
  }
  if (search) {
    userTodos = userTodos.filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  res.json({ success: true, data: userTodos, total: userTodos.length });
});

// Get Todo by ID
app.get('/api/todos/:id', auth, (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id) && t.userId === req.user.id);
  if (!todo) {
    return res.status(404).json({ success: false, message: 'Todo tidak ditemukan' });
  }
  res.json({ success: true, data: todo });
});

// Create Todo
app.post('/api/todos', auth, (req, res) => {
  const { title, description, priority, dueDate } = req.body;

  // Validation
  const errors = validateTodo(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', ') });
  }

  const todo = {
    id: todoIdCounter++,
    userId: req.user.id,
    title,
    description: description || '',
    completed: false,
    priority: priority || 'medium',
    dueDate: dueDate || null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  todos.push(todo);

  res.status(201).json({ success: true, message: 'Todo dibuat', data: todo });
});

// Update Todo
app.put('/api/todos/:id', auth, (req, res) => {
  const index = todos.findIndex(t => t.id === parseInt(req.params.id) && t.userId === req.user.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Todo tidak ditemukan' });
  }

  const { title, description, completed, priority, dueDate } = req.body;

  todos[index] = {
    ...todos[index],
    title: title ?? todos[index].title,
    description: description ?? todos[index].description,
    completed: completed ?? todos[index].completed,
    priority: priority ?? todos[index].priority,
    dueDate: dueDate ?? todos[index].dueDate,
    updatedAt: new Date()
  };

  res.json({ success: true, message: 'Todo diupdate', data: todos[index] });
});

// Delete Todo
app.delete('/api/todos/:id', auth, (req, res) => {
  const index = todos.findIndex(t => t.id === parseInt(req.params.id) && t.userId === req.user.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Todo tidak ditemukan' });
  }

  const deleted = todos.splice(index, 1)[0];
  res.json({ success: true, message: 'Todo dihapus', data: deleted });
});

// Toggle Todo
app.patch('/api/todos/:id/toggle', auth, (req, res) => {
  const index = todos.findIndex(t => t.id === parseInt(req.params.id) && t.userId === req.user.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Todo tidak ditemukan' });
  }

  todos[index].completed = !todos[index].completed;
  todos[index].updatedAt = new Date();

  res.json({
    success: true,
    message: `Todo ${todos[index].completed ? 'selesai' : 'belum selesai'}`,
    data: todos[index]
  });
});


app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route tidak ditemukan' });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
