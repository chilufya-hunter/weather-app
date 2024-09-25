import React, { useState, useEffect } from 'react';
import axios from 'axios';

function WeatherApp() {
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null); // Change to null for conditional rendering
  const [forecast, setForecast] = useState(null); // Change to null for conditional rendering
  const [searchHistory, setSearchHistory] = useState(() => {
    const storedHistory = localStorage.getItem('searchHistory');
    return storedHistory ? JSON.parse(storedHistory) : [];
  });
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [selectedCurrentWeather, setSelectedCurrentWeather] = useState(null); // Change to null for conditional rendering
  const [selectedForecast, setSelectedForecast] = useState(null); // Change to null for conditional rendering

  // Function to clear search history
  const clearSearchHistory = () => {
    localStorage.removeItem('searchHistory');
    setSearchHistory([]); // Reset the search history in the state
  };

  // Function to refresh the browser
  const refreshPage = () => {
    window.location.reload(); // Reloads the current page
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/current-weather?city=${city}&country=${country}`);
      setCurrentWeather(response.data.data[0]);
    } catch (error) {
      console.error('Error fetching current weather:', error);
    }

    try {
      const response = await axios.get(`http://localhost:3001/forecast?city=${city}&country=${country}`);
      setForecast(response.data);
    } catch (error) {
      console.error('Error fetching forecast:', error);
    }

    const newHistory = [...searchHistory, { city, country }];
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const handleHistorySearch = async (historyItem) => {
    setSelectedHistory(historyItem);
    try {
      const response = await axios.get(`http://localhost:3001/current-weather?city=${historyItem.city}&country=${historyItem.country}`);
      setSelectedCurrentWeather(response.data.data[0]);
    } catch (error) {
      console.error('Error fetching selected history current weather:', error);
    }

    try {
      const response = await axios.get(`http://localhost:3001/forecast?city=${historyItem.city}&country=${historyItem.country}`);
      setSelectedForecast(response.data);
    } catch (error) {
      console.error('Error fetching selected history forecast:', error);
    }
  };

  return (
    <div>
      <h1>Weather App</h1>
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="City"
      />
      <input
        type="text"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        placeholder="Country"
      />
      <button onClick={handleSearch}>Search</button>

      {currentWeather && (
        <div>
          <h2>Current Weather</h2>
          <p>Temperature: {currentWeather.temp}°C</p>
          <p>Feels like: {currentWeather.app_temp}°C</p>
          <p>Weather: {currentWeather.weather?.description}</p>
          <p>Wind Speed: {currentWeather.wind_spd} m/s</p>
          <p>Humidity: {currentWeather.rh}%</p>
          <p>Air Quality Index: {currentWeather.aqi}</p>
        </div>
      )}

      {forecast && forecast.data && (
        <div>
          <h2>16-Day Forecast</h2>
          {forecast.data.map((day, index) => (
            <div key={index}>
              <p>Date: {day.datetime}</p>
              <p>Max Temperature: {day.max_temp}°C</p>
              <p>Min Temperature: {day.min_temp}°C</p>
              <p>Weather: {day.weather?.description}</p>
              <p>Precipitation: {day.precip} mm</p>
              <p>UV Index: {day.uv}</p>
              <p>Wind Speed: {day.wind_spd} m/s</p>
            </div>
          ))}
        </div>
      )}

      <h2>Search History</h2>
      <ul>
        {searchHistory.map((historyItem, index) => (
          <li key={index}>
            <button onClick={() => handleHistorySearch(historyItem)}>
              {historyItem.city}, {historyItem.country}
            </button>
          </li>
        ))}
      </ul>

      <button onClick={clearSearchHistory}>Clear History</button>
      <button onClick={refreshPage}>Refresh</button>

      {selectedHistory && (
        <div>
          <h2>Selected History</h2>
          <p>City: {selectedHistory.city}</p>
          <p>Country: {selectedHistory.country}</p>
          {selectedCurrentWeather && (
            <div>
              <h2>Current Weather</h2>
              <p>Temperature: {selectedCurrentWeather.temp}°C</p>
              <p>Feels like: {selectedCurrentWeather.app_temp}°C</p>
              <p>Weather: {selectedCurrentWeather.weather?.description}</p>
              <p>Wind Speed: {selectedCurrentWeather.wind_spd} m/s</p>
              <p>Humidity: {selectedCurrentWeather.rh}%</p>
              <p>Air Quality Index: {selectedCurrentWeather.aqi}</p>
            </div>
          )}
          {selectedForecast && selectedForecast.data && (
            <div>
              <h2>16-Day Forecast</h2>
              {selectedForecast.data.map((day, index) => (
                <div key={index}>
                  <p>Date: {day.datetime}</p>
                  <p>Max Temperature: {day.max_temp}°C</p>
                  <p>Min Temperature: {day.min_temp}°C</p>
                  <p>Weather: {day.weather?.description}</p>
                  <p>Precipitation: {day.precip} mm</p>
                  <p>UV Index: {day.uv}</p>
                  <p>Wind Speed: {day.wind_spd} m/s</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WeatherApp;
