require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const WEATHERBIT_API_KEY = process.env.WEATHERBIT_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('JWT_SECRET is not set. Please set it in your environment variables.');
  process.exit(1);
}

if (!WEATHERBIT_API_KEY) {
  console.error('WEATHERBIT_API_KEY is not set. Please set it in your environment variables.');
  process.exit(1);
}

// In-memory storage for users and favorites (replace with a database in production)
let users = [];
let favorites = {};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// User registration
app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = { username: req.body.username, password: hashedPassword };
    users.push(user);
    res.status(201).send('User registered successfully');
  } catch {
    res.status(500).send('Error registering user');
  }
});

// User login
app.post('/login', async (req, res) => {
  const user = users.find(user => user.username === req.body.username);
  if (user == null) {
    return res.status(400).send('Cannot find user');
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const accessToken = jwt.sign({ username: user.username }, JWT_SECRET);
      res.json({ accessToken: accessToken });
    } else {
      res.status(401).send('Not Allowed');
    }
  } catch {
    res.status(500).send('Error logging in');
  }
});

// Add favorite city
app.post('/favorites', authenticateToken, (req, res) => {
  const { city, country } = req.body;
  const username = req.user.username;
  if (!favorites[username]) {
    favorites[username] = [];
  }
  favorites[username].push({ city, country });
  res.status(201).send('Favorite added successfully');
});

// Get favorite cities
app.get('/favorites', authenticateToken, (req, res) => {
  const username = req.user.username;
  res.json(favorites[username] || []);
});

// Route to get the current weather for a specific city and country
app.get('/current-weather', authenticateToken, async (req, res) => {
  const city = req.query.city;
  const country = req.query.country;

  try {
    const response = await axios.get(`https://api.weatherbit.io/v2.0/current`, {
      params: {
        city: city,
        country: country,
        key: WEATHERBIT_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching current weather:', error);
    res.status(500).json({ message: 'Failed to fetch current weather data' });
  }
});

// Route to get the 16-day weather forecast for a specific city and country
app.get('/forecast', authenticateToken, async (req, res) => {
  const city = req.query.city;
  const country = req.query.country;

  try {
    const response = await axios.get(`https://api.weatherbit.io/v2.0/forecast/daily`, {
      params: {
        city: city,
        country: country,
        key: WEATHERBIT_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching forecast:', error);
    res.status(500).json({ message: 'Failed to fetch forecast data' });
  }
});

// Start the server and listen on all network interfaces (0.0.0.0) and specified port
app.listen(port, '0.0.0.0', () => {
  console.log(`Server started on http://localhost:${port}`);
});