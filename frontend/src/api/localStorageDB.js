// Simulated local browser database
const DB_KEY = 'gatepassx_db';

// Initialize DB if empty
const initDB = () => {
  if (!localStorage.getItem(DB_KEY)) {
    localStorage.setItem(DB_KEY, JSON.stringify({ users: [], outpasses: [] }));
  }
};

const getDB = () => {
  initDB();
  return JSON.parse(localStorage.getItem(DB_KEY));
};

const saveDB = (db) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
};

// Simulate network delay
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const loginUser = async ({ email, password }) => {
  await delay();
  const db = getDB();
  const user = db.users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return { data: { ...userWithoutPassword, token: 'mock-jwt-token-123' } };
  } else {
    // Mirror Axios error shape
    throw { response: { data: { message: 'Invalid email or password' } } };
  }
};

export const registerUser = async ({ name, email, password, role }) => {
  await delay();
  const db = getDB();
  const userExists = db.users.find(u => u.email === email);
  
  if (userExists) {
    throw { response: { data: { message: 'User already exists' } } };
  }

  const newUser = {
    _id: generateId(),
    name,
    email,
    password, // Storing plaintext in localStorage for this pure frontend mockup
    role: role || 'student',
  };

  db.users.push(newUser);
  saveDB(db);

  const { password: _, ...userWithoutPassword } = newUser;
  return { data: { ...userWithoutPassword, token: 'mock-jwt-token-123' } };
};

export const getOutpasses = async () => {
  await delay();
  const db = getDB();
  const currentUser = JSON.parse(localStorage.getItem('user'));
  if (!currentUser) throw new Error('Not logged in');

  let filteredOutpasses = [];

  if (currentUser.role === 'admin') {
    filteredOutpasses = db.outpasses.map(op => {
      const u = db.users.find(x => x._id === op.userId);
      return {
        ...op,
        userId: u ? { _id: u._id, name: u.name, email: u.email } : null
      };
    });
  } else {
    filteredOutpasses = db.outpasses
      .filter(op => op.userId === currentUser._id)
      .map(op => {
        const u = db.users.find(x => x._id === op.userId);
        return {
          ...op,
          userId: u ? { _id: u._id, name: u.name, email: u.email } : null
        };
      });
  }

  return { data: filteredOutpasses };
};

export const createOutpass = async (formData) => {
  await delay();
  const db = getDB();
  const currentUser = JSON.parse(localStorage.getItem('user'));
  if (!currentUser) throw new Error('Not logged in');

  const newOutpass = {
    _id: generateId(),
    userId: currentUser._id,
    ...formData,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.outpasses.push(newOutpass);
  saveDB(db);

  return { data: newOutpass };
};

export const updateOutpassStatus = async (id, status) => {
  await delay();
  const db = getDB();
  const outpassIndex = db.outpasses.findIndex(op => op._id === id);

  if (outpassIndex !== -1) {
    db.outpasses[outpassIndex].status = status;
    db.outpasses[outpassIndex].updatedAt = new Date().toISOString();
    saveDB(db);
    return { data: db.outpasses[outpassIndex] };
  } else {
    throw new Error('Outpass not found');
  }
};
