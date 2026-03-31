import { Hono } from 'hono';

import { sign, verify } from 'hono/jwt';
import bcrypt from 'bcryptjs';

const app = new Hono().basePath('/api');

// Helper to get DB
const getDB = async (c) => {
  const data = await c.env.DB.get('data', { type: 'json' });
  if (!data) return { users: [], outpasses: [] };
  return data;
};

const saveDB = async (c, data) => {
  await c.env.DB.put('data', JSON.stringify(data));
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
};

// Middleware for authentication
const protect = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ message: 'Not authorized, no token' }, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = await verify(token, c.env.JWT_SECRET || 'fallback_secret');
    const db = await getDB(c);
    const user = db.users.find(u => u._id === decoded.id);
    if (!user) {
      return c.json({ message: 'User not found' }, 401);
    }
    const { password, ...userWithoutPassword } = user;
    c.set('user', userWithoutPassword);
    await next();
  } catch (err) {
    return c.json({ message: 'Not authorized, token failed' }, 401);
  }
};

const admin = async (c, next) => {
  const user = c.get('user');
  if (user && user.role === 'admin') {
    await next();
  } else {
    return c.json({ message: 'Not authorized as an admin' }, 403);
  }
};

// Routes - Auth
app.post('/auth/register', async (c) => {
  const { name, email, password, role } = await c.req.json();
  const db = await getDB(c);
  
  const userExists = db.users.find(u => u.email === email);
  if (userExists) {
    return c.json({ message: 'User already exists' }, 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = {
    _id: generateId(),
    name,
    email,
    password: hashedPassword,
    role: role || 'student',
  };

  db.users.push(newUser);
  await saveDB(c, db);

  const token = await sign({ id: newUser._id }, c.env.JWT_SECRET || 'fallback_secret');

  return c.json({
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    token
  }, 201);
});

app.post('/auth/login', async (c) => {
  const { email, password } = await c.req.json();
  const db = await getDB(c);
  
  const user = db.users.find(u => u.email === email);
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = await sign({ id: user._id }, c.env.JWT_SECRET || 'fallback_secret');
    return c.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } else {
    return c.json({ message: 'Invalid email or password' }, 401);
  }
});

// Routes - Outpass
app.post('/outpass', protect, async (c) => {
  const { destination, reason, fromDate, toDate } = await c.req.json();
  const db = await getDB(c);
  const user = c.get('user');

  const newOutpass = {
    _id: generateId(),
    userId: user._id,
    destination,
    reason,
    fromDate,
    toDate,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.outpasses.push(newOutpass);
  await saveDB(c, db);

  return c.json(newOutpass, 201);
});

app.get('/outpass', protect, async (c) => {
  const db = await getDB(c);
  const user = c.get('user');
  let outpasses = [];

  if (user.role === 'admin') {
    outpasses = db.outpasses.map(op => {
      const u = db.users.find(x => x._id === op.userId);
      return {
        ...op,
        userId: u ? { _id: u._id, name: u.name, email: u.email } : null
      };
    });
  } else {
    outpasses = db.outpasses
      .filter(op => op.userId === user._id)
      .map(op => {
        const u = db.users.find(x => x._id === op.userId);
        return {
          ...op,
          userId: u ? { _id: u._id, name: u.name, email: u.email } : null
        };
      });
  }

  return c.json(outpasses);
});

app.put('/outpass/:id', protect, admin, async (c) => {
  const id = c.req.param('id');
  const { status } = await c.req.json();
  
  const db = await getDB(c);
  const outpassIndex = db.outpasses.findIndex(op => op._id === id);

  if (outpassIndex !== -1) {
    db.outpasses[outpassIndex].status = status || db.outpasses[outpassIndex].status;
    db.outpasses[outpassIndex].updatedAt = new Date().toISOString();
    await saveDB(c, db);
    return c.json(db.outpasses[outpassIndex]);
  } else {
    return c.json({ message: 'Outpass not found' }, 404);
  }
});

export default app;
