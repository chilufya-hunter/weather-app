import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WeatherApp.css';
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"></link>
function WeatherApp() {
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [searchHistory, setSearchHistory] = useState(() => {
    const storedHistory = localStorage.getItem('searchHistory');
    return storedHistory ? JSON.parse(storedHistory) : [];
  });
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [selectedCurrentWeather, setSelectedCurrentWeather] = useState(null);
  const [selectedForecast, setSelectedForecast] = useState(null);

  const clearSearchHistory = () => {
    localStorage.removeItem('searchHistory');
    setSearchHistory([]);
  };

  const refreshPage = () => {
    window.location.reload();
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
    <div className="weather-app">
      <header className="weather-app__header">
        <h1 className="weather-app__title">Weather App</h1>
      </header>

      <main className="weather-app__main">
        <section className="weather-app__search-section">
          <div className="weather-app__search-container">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="weather-app__input"
            />
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Country"
              className="weather-app__input"
            />
            <button onClick={handleSearch} className="weather-app__button weather-app__button--search">Search</button>
          </div>
          
        </section>

        <section className="weather-app__results-section">
          <div className="weather-app__current-weather">
            {currentWeather && (
              <div className="weather-app__current-weather-card">
                <h2 className="weather-app__section-title">Current Weather</h2>
                <p className="weather-app__weather-info">Temperature: {currentWeather.temp}°C</p>
                <p className="weather-app__weather-info">Feels like: {currentWeather.app_temp}°C</p>
                <p className="weather-app__weather-info">Weather: {currentWeather.weather?.description}</p>
                <p className="weather-app__weather-info">Wind Speed: {currentWeather.wind_spd} m/s</p>
                <p className="weather-app__weather-info">Humidity: {currentWeather.rh}%</p>
                <p className="weather-app__weather-info">Air Quality Index: {currentWeather.aqi}</p>
              </div>
            )}
          </div>

          <div className="weather-app__forecast">
            {forecast && forecast.data && (
              <div className="weather-app__forecast-container">
                <h2 className="weather-app__section-title">16-Day Forecast</h2>
                <div className="weather-app__forecast-grid">
                  {forecast.data.map((day, index) => (
                    <div key={index} className="weather-app__forecast-card">
                      <h3 className="weather-app__forecast-date">{day.datetime}</h3>
                      <p className="weather-app__forecast-info">Max Temp: {day.max_temp}°C</p>
                      <p className="weather-app__forecast-info">Min Temp: {day.min_temp}°C</p>
                      <p className="weather-app__forecast-info">Weather: {day.weather?.description}</p>
                      <p className="weather-app__forecast-info">Precipitation: {day.precip} mm</p>
                      <p className="weather-app__forecast-info">UV Index: {day.uv}</p>
                      <p className="weather-app__forecast-info">Wind Speed: {day.wind_spd} m/s</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        

        <section className="weather-app__history-section">
          <h2 className="weather-app__section-title">Search History</h2>
          <ul className="weather-app__history-list">
            {searchHistory.map((historyItem, index) => (
              <li key={index} className="weather-app__history-item">
                <button onClick={() => handleHistorySearch(historyItem)} className="weather-app__button weather-app__button--history">
                  {historyItem.city}, {historyItem.country}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <div className="weather-app__action-buttons">
            <button onClick={clearSearchHistory} className="weather-app__button weather-app__button--clear">Clear History</button>
            <button onClick={refreshPage} className="weather-app__button weather-app__button--refresh">Refresh</button>
          </div>

        {selectedHistory && (
          <section className="weather-app__selected-history-section">
            <h2 className="weather-app__section-title">Selected History</h2>
            <p className="weather-app__selected-history-info">City: {selectedHistory.city}</p>
            <p className="weather-app__selected-history-info">Country: {selectedHistory.country}</p>
            {selectedCurrentWeather && (
              <div className="weather-app__selected-current-weather">
                <h3 className="weather-app__subsection-title">Current Weather</h3>
                <p className="weather-app__weather-info">Temperature: {selectedCurrentWeather.temp}°C</p>
                <p className="weather-app__weather-info">Feels like: {selectedCurrentWeather.app_temp}°C</p>
                <p className="weather-app__weather-info">Weather: {selectedCurrentWeather.weather?.description}</p>
                <p className="weather-app__weather-info">Wind Speed: {selectedCurrentWeather.wind_spd} m/s</p>
                <p className="weather-app__weather-info">Humidity: {selectedCurrentWeather.rh}%</p>
                <p className="weather-app__weather-info">Air Quality Index: {selectedCurrentWeather.aqi}</p>
              </div>
            )}
            {selectedForecast && selectedForecast.data && (
              <div className="weather-app__selected-forecast">
                <h3 className="weather-app__subsection-title">16-Day Forecast</h3>
                <div className="weather-app__forecast-grid">
                  {selectedForecast.data.map((day, index) => (
                    <div key={index} className="weather-app__forecast-card">
                      <h4 className="weather-app__forecast-date">{day.datetime}</h4>
                      <p className="weather-app__forecast-info">Max Temp: {day.max_temp}°C</p>
                      <p className="weather-app__forecast-info">Min Temp: {day.min_temp}°C</p>
                      <p className="weather-app__forecast-info">Weather: {day.weather?.description}</p>
                      <p className="weather-app__forecast-info">Precipitation: {day.precip} mm</p>
                      <p className="weather-app__forecast-info">UV Index: {day.uv}</p>
                      <p className="weather-app__forecast-info">Wind Speed: {day.wind_spd} m/s</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default WeatherApp;