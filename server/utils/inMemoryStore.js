const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// In-Memory Data Store Fallback (used when MongoDB is not running locally)
const memoryStore = {
  users: [],
  items: [
    {
      _id: 'mem_item_1',
      title: 'Inception',
      type: 'Movie',
      genre: 'Sci-Fi',
      authorOrDirector: 'Christopher Nolan',
      description: 'A thief who steals corporate secrets through dream-sharing technology.',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
      rating: 5,
      releaseYear: 2010,
      status: 'Completed',
      favorite: true,
      tags: ['Mind-Bending', 'Sci-Fi'],
      deleted: false,
      createdBy: 'mem_user_demo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'mem_item_2',
      title: 'Atomic Habits',
      type: 'Book',
      genre: 'Self-Help',
      authorOrDirector: 'James Clear',
      description: 'An easy and proven way to build good habits and break bad ones.',
      poster: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      rating: 5,
      releaseYear: 2018,
      status: 'Completed',
      favorite: true,
      tags: ['Productivity', 'Mindset'],
      deleted: false,
      createdBy: 'mem_user_demo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'mem_item_3',
      title: 'Interstellar',
      type: 'Movie',
      genre: 'Sci-Fi',
      authorOrDirector: 'Christopher Nolan',
      description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival.',
      poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
      rating: 5,
      releaseYear: 2014,
      status: 'Completed',
      favorite: false,
      tags: ['Space', 'Epic'],
      deleted: false,
      createdBy: 'mem_user_demo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'mem_item_4',
      title: 'Dune',
      type: 'Book',
      genre: 'Sci-Fi',
      authorOrDirector: 'Frank Herbert',
      description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides.',
      poster: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80',
      rating: 4,
      releaseYear: 1965,
      status: 'Plan to Watch',
      favorite: false,
      tags: ['Classic', 'Sci-Fi'],
      deleted: false,
      createdBy: 'mem_user_demo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  collections: [],
  activityLogs: [],
  reviews: []
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_jwt_key_123', { expiresIn: '30d' });
};

// --- User Operations ---
const registerInMemoryUser = async (name, email, password) => {
  const cleanEmail = email.trim().toLowerCase();
  const existing = memoryStore.users.find(u => u.email === cleanEmail);
  if (existing) {
    throw new Error('User with this email already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const user = {
    _id: userId,
    name: name.trim(),
    email: cleanEmail,
    password: hashedPassword,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
    createdAt: new Date().toISOString()
  };

  memoryStore.users.push(user);

  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    token: generateToken(user._id)
  };

  // Log activity
  logInMemoryActivity(user._id, 'CREATE_USER', 'User registered in-memory system');

  return userData;
};

const loginInMemoryUser = async (email, password) => {
  const cleanEmail = email.trim().toLowerCase();
  const user = memoryStore.users.find(u => u.email === cleanEmail);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    token: generateToken(user._id)
  };
};

const getInMemoryUserById = (userId) => {
  const user = memoryStore.users.find(u => u._id === userId);
  if (!user) return null;
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar
  };
};

// --- Activity Log Operations ---
const logInMemoryActivity = (userId, action, details, targetTitle = '') => {
  const log = {
    _id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdBy: userId,
    action,
    details,
    targetTitle,
    createdAt: new Date().toISOString()
  };
  memoryStore.activityLogs.unshift(log);
};

module.exports = {
  memoryStore,
  registerInMemoryUser,
  loginInMemoryUser,
  getInMemoryUserById,
  logInMemoryActivity
};
