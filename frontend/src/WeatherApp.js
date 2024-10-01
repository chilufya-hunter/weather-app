import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WeatherApp.css';

function WeatherApp() {
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [selectedCurrentWeather, setSelectedCurrentWeather] = useState(null);
  const [selectedForecast, setSelectedForecast] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsLoggedIn(true);
      fetchFavorites(storedToken);
    }
  }, []);

  const fetchFavorites = async (token) => {
    try {
      const response = await axios.get('http://localhost:3001/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:3001/register', { username, password });
      alert('Registration successful. Please log in.');
    } catch (error) {
      console.error('Error registering:', error);
      alert('Registration failed.');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:3001/login', { username, password });
      setToken(response.data.accessToken);
      setIsLoggedIn(true);
      localStorage.setItem('token', response.data.accessToken);
      fetchFavorites(response.data.accessToken);
      setShowAuthModal(false);
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Login failed.');
    }
  };

  const handleLogout = () => {
    setToken('');
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    setFavorites([]);
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/current-weather`, {
        params: { city, country }
      });
      setCurrentWeather(response.data.data[0]);
    } catch (error) {
      console.error('Error fetching current weather:', error);
    }

    try {
      const response = await axios.get(`http://localhost:3001/forecast`, {
        params: { city, country }
      });
      setForecast(response.data);
    } catch (error) {
      console.error('Error fetching forecast:', error);
    }

    setSearchHistory([...searchHistory, { city, country }]);
  };

  const handleAddFavorite = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    try {
      await axios.post('http://localhost:3001/favorites', { city, country }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFavorites(token);
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  };

  const handleHistorySearch = async (historyItem) => {
    setSelectedHistory(historyItem);
    try {
      const response = await axios.get(`http://localhost:3001/current-weather`, {
        params: { city: historyItem.city, country: historyItem.country }
      });
      setSelectedCurrentWeather(response.data.data[0]);
    } catch (error) {
      console.error('Error fetching selected history current weather:', error);
    }

    try {
      const response = await axios.get(`http://localhost:3001/forecast`, {
        params: { city: historyItem.city, country: historyItem.country }
      });
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
            <button onClick={handleAddFavorite} className="weather-app__button weather-app__button--favorite">Add to Favorites</button>
          </div>
        </section>

        {isLoggedIn && (
          <section className="weather-app__favorites-section">
            <h2 className="weather-app__section-title">Favorite Cities</h2>
            <ul className="weather-app__favorites-list">
              {favorites.map((favorite, index) => (
                <li key={index} className="weather-app__favorite-item">
                  <button onClick={() => { setCity(favorite.city); setCountry(favorite.country); handleSearch(); }} className="weather-app__button weather-app__button--favorite">
                    {favorite.city}, {favorite.country}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

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

        {isLoggedIn && (
          <button onClick={handleLogout} className="weather-app__button weather-app__button--logout">Logout</button>
        )}

        {showAuthModal && (
          <div className="weather-app__auth-modal">
            <div className="weather-app__auth-modal-content">
              <h2>Login or Register</h2>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="weather-app__input"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="weather-app__input"
              />
              <button onClick={handleRegister} className="weather-app__button">Register</button>
              <button onClick={handleLogin} className="weather-app__button">Login</button>
              <button onClick={() => setShowAuthModal(false)} className="weather-app__button">Cancel</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default WeatherApp;