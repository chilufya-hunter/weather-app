require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Create an instance of the Express.js framework
const app = express();

// Set the port to use for the server, defaulting to 3001 if no environment variable is set
const port = process.env.PORT || 3001;

// Enable CORS (Cross-Origin Resource Sharing) to allow requests from different origins
app.use(cors());

// Enable JSON parsing for request bodies
app.use(express.json());

// Set environment variables for the Weatherbit API key and JWT secret
const WEATHERBIT_API_KEY = process.env.WEATHERBIT_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

// Check if the JWT secret is set, and exit the process if it's not
if (!JWT_SECRET) {
  console.error('JWT_SECRET is not set. Please set it in your environment variables.');
  process.exit(1);
}

// Check if the Weatherbit API key is set, and exit the process if it's not
if (!WEATHERBIT_API_KEY) {
  console.error('WEATHERBIT_API_KEY is not set. Please set it in your environment variables.');
  process.exit(1);
}

// In-memory storage for users and favorites (replace with a database in production)
let users = [];
let favorites = {};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  // Get the Authorization header from the request
  const authHeader = req.headers['authorization'];
  
  // Split the Authorization header into two parts (Bearer and token) and get the token
  const token = authHeader && authHeader.split(' ')[1];
  
  // If the token is null, return a 401 Unauthorized status code
  if (token == null) return res.sendStatus(401);
  
  // Verify the token using the JWT secret
  jwt.verify(token, JWT_SECRET, (err, user) => {
    // If there's an error verifying the token, return a 403 Forbidden status code
    if (err) return res.sendStatus(403);
    
    // If the token is valid, set the user on the request object and call the next middleware function
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
app.get('/current-weather', async (req, res) => {
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
// Route to get the 16-day weather forecast for a specific city and country
app.get('/forecast', async (req, res) => {
  // Get the city and country from the request query parameters
  const city = req.query.city;
  const country = req.query.country;

  try {
    // Make a GET request to the Weatherbit API to fetch the 16-day weather forecast
    const response = await axios.get(`https://api.weatherbit.io/v2.0/forecast/daily`, {
      // Pass the city, country, and Weatherbit API key as query parameters
      params: {
        city: city,
        country: country,
        key: WEATHERBIT_API_KEY
      }
    });

    // Return the response data from the Weatherbit API as JSON
    res.json(response.data);
  } catch (error) {
    // If there's an error fetching the forecast, log the error and return a 500 Internal Server Error status code
    console.error('Error fetching forecast:', error);
    res.status(500).json({ message: 'Failed to fetch forecast data' });
  }
});

// Start the server and listen on all network interfaces (0.0.0.0) and specified port
app.listen(port, '0.0.0.0', () => {
  console.log(`Server started on http://localhost:${port}`);
});