require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const NodeCache = require('node-cache');

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

// Initialize cache
const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

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
  const cacheKey = `current_${city}_${country}`;

  try {
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // If not in cache, fetch from API
    const response = await axios.get(`https://api.weatherbit.io/v2.0/current`, {
      params: {
        city: city,
        country: country,
        key: WEATHERBIT_API_KEY
      }
    });

    // Store in cache
    cache.set(cacheKey, response.data);

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching current weather:', error);
    res.status(500).json({ message: 'Failed to fetch current weather data' });
  }
});

// Route to get the weather forecast for a specific city and country
app.get('/forecast', authenticateToken, async (req, res) => {
  const city = req.query.city;
  const country = req.query.country;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 7; // Default to 7 days per page
  const cacheKey = `forecast_${city}_${country}`;

  try {
    // Check cache first
    let forecastData = cache.get(cacheKey);

    if (!forecastData) {
      // If not in cache, fetch from API
      const response = await axios.get(`https://api.weatherbit.io/v2.0/forecast/daily`, {
        params: {
          city: city,
          country: country,
          key: WEATHERBIT_API_KEY
        }
      });
      forecastData = response.data;
      // Store in cache
      cache.set(cacheKey, forecastData);
    }

    // Paginate the data
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedData = forecastData.data.slice(startIndex, endIndex);

    const paginatedResponse = {
      ...forecastData,
      data: paginatedData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(forecastData.data.length / limit),
        totalItems: forecastData.data.length,
        itemsPerPage: limit
      }
    };

    res.json(paginatedResponse);
  } catch (error) {
    console.error('Error fetching forecast:', error);
    res.status(500).json({ message: 'Failed to fetch forecast data' });
  }
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server started on http://localhost:${port}`);
});