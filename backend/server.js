const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3001;

// Enable CORS to allow requests from different origins
app.use(cors());

// Enable JSON parsing for incoming requests
app.use(express.json());

// Replace with your Weatherbit API key
const apikey = 'a80e1a402339481a90ce76e51264328e'; // Replace with your actual API key

// Route to get the current weather for a specific city and country
app.get('/current-weather', async (req, res) => {
  const city = req.query.city;
  const country = req.query.country;

  try {
    const response = await axios.get(`https://api.weatherbit.io/v2.0/current?city=${city}&country=${country}&key=${apikey}`);
    res.json(response.data); // Send the weather data back to the client
  } catch (error) {
    console.error('Error fetching current weather:', error);
    res.status(500).json({ message: 'Failed to fetch current weather data' });
  }
});

// Route to get the 16-day weather forecast for a specific city and country
app.get('/forecast', async (req, res) => {
  const city = req.query.city;
  const country = req.query.country;

  try {
    const response = await axios.get(`https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&country=${country}&key=${apikey}`);
    res.json(response.data); // Send the forecast data back to the client
  } catch (error) {
    console.error('Error fetching forecast:', error);
    res.status(500).json({ message: 'Failed to fetch forecast data' });
  }
});

// Start the server and listen on all network interfaces (0.0.0.0) and port 3001
app.listen(port, '0.0.0.0', () => {
  console.log(`Server started on http://localhost:${port}`);
});
