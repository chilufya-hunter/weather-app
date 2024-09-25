import React, { useState, useEffect } from 'react';
import axios from 'axios';

function WeatherApp() {
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [currentWeather, setCurrentWeather] = useState({});
  const [forecast, setForecast] = useState({});
  const [searchHistory, setSearchHistory] = useState(() => {
    const storedHistory = localStorage.getItem('searchHistory');
    return storedHistory ? JSON.parse(storedHistory) : [];
  });
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [selectedCurrentWeather, setSelectedCurrentWeather] = useState({});
  const [selectedForecast, setSelectedForecast] = useState({});

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/current-weather?city=${city}&country=${country}`);
      setCurrentWeather(response.data.data[0]);
    } catch (error) {
      console.error(error);
    }

    try {
      const response = await axios.get(`http://localhost:3001/forecast?city=${city}&country=${country}`);
      setForecast(response.data);
    } catch (error) {
      console.error(error);
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
      console.error(error);
    }

    try {
      const response = await axios.get(`http://localhost:3001/forecast?city=${historyItem.city}&country=${historyItem.country}`);
      setSelectedForecast(response.data);
    } catch (error) {
      console.error(error);
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
          <p>Temperature: {currentWeather.temp}</p>
          <p>Feels like: {currentWeather.app_temp}</p>
          <p>Weather: {currentWeather.weather && currentWeather.weather[0] && currentWeather.weather[0].description}</p>
          <p>Wind Speed: {currentWeather.wind_spd}</p>
          <p>Humidity: {currentWeather.rh}</p>
          <p>Air Quality Index: {currentWeather.aqi}</p>
        </div>
      )}
      {forecast && forecast.data && (
        <div>
          <h2>Forecast</h2>
          {forecast.data.map((day, index) => (
            <div key={index}>
              <p>Date: {day.datetime}</p>
              <p>Max Temperature: {day.max_temp}</p>
              <p>Min Temperature: {day.min_temp}</p>
              <p>Weather: {day.weather && day.weather[0] && day.weather[0].description}</p>
              <p>Precipitation: {day.precip}</p>
              <p>UV Index: {day.uv}</p>
              <p>Wind Direction: {day.wind_cdir_full}</p>
              <p>Wind Speed: {day.wind_spd}</p>
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
      {selectedHistory && (
        <div>
          <h2>Selected History</h2>
          <p>City: {selectedHistory.city}</p>
          <p>Country: {selectedHistory.country}</p>
          <h2>Current Weather</h2>
          <p>Temperature: {selectedCurrentWeather.temp}</p>
          <p>Feels like: {selectedCurrentWeather.app_temp}</p>   
          <p>Weather: {selectedCurrentWeather.weather && selectedCurrentWeather.weather[0] && selectedCurrentWeather.weather[0].description}</ p>
          <p>Wind Speed: {selectedCurrentWeather.wind_spd}</p>
          <p>Humidity: {selectedCurrentWeather.rh}</p>
          <p>Air Quality Index: {selectedCurrentWeather.aqi}</p>
          <h2>Forecast</h2>
          {selectedForecast.data && (
            <div>
              {selectedForecast.data.map((day, index) => (
                <div key={index}>
                  <p>Date: {day.datetime}</p>
                  <p>Max Temperature: {day.max_temp}</p>
                  <p>Min Temperature: {day.min_temp}</p>
                  <p>Weather: {day.weather && day.weather[0] && day.weather[0].description}</p>
                  <p>Precipitation: {day.precip}</p>
                  <p>UV Index: {day.uv}</p>
                  <p>Wind Direction: {day.wind_cdir_full}</p>
                  <p>Wind Speed: {day.wind_spd}</p>
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