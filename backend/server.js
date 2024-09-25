const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const apikey = 'a80e1a402339481a90ce76e51264328e'; // Replace with your Weatherbit API key

app.get('/current-weather', async (req, res) => {
  const city = req.query.city;
  const country = req.query.country;

  try {
    const response = await axios.get(`https://api.weatherbit.io/v2.0/current?city=${city}&country=${country}&key=${apikey}`);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch current weather data' });
  }
});

app.get('/forecast', async (req, res) => {
  const city = req.query.city;
  const country = req.query.country;

  try {
    const response = await axios.get(`https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&country=${country}&key=${apikey}`);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch forecast data' });
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});