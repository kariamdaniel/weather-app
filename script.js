// API Configuration
const API_KEY = '5cb53130442127cea91ac471faf7b379'; // Your API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements - keep your existing ones
const themeToggle = document.getElementById('theme-toggle');
const locationBtn = document.getElementById('location-btn');
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const toggleUnit = document.getElementById('toggle-unit');

// Keep your existing city arrays
const kenyanCities = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", 
    // ... rest of your cities array
];

const worldCities = [
    "New York", "London", "Tokyo", "Paris", "Dubai",
    // ... rest of your world cities array
];

// Weather condition mapping for icons
const weatherIconMap = {
    // Thunderstorm
    200: 'fa-bolt',
    201: 'fa-bolt',
    202: 'fa-bolt',
    210: 'fa-bolt',
    211: 'fa-bolt',
    212: 'fa-bolt',
    221: 'fa-bolt',
    230: 'fa-bolt',
    231: 'fa-bolt',
    232: 'fa-bolt',
    
    // Drizzle
    300: 'fa-cloud-rain',
    301: 'fa-cloud-rain',
    302: 'fa-cloud-rain',
    310: 'fa-cloud-rain',
    311: 'fa-cloud-rain',
    312: 'fa-cloud-rain',
    313: 'fa-cloud-rain',
    314: 'fa-cloud-rain',
    321: 'fa-cloud-rain',
    
    // Rain
    500: 'fa-cloud-showers-heavy',
    501: 'fa-cloud-showers-heavy',
    502: 'fa-cloud-showers-heavy',
    503: 'fa-cloud-showers-heavy',
    504: 'fa-cloud-showers-heavy',
    511: 'fa-icicles', // Freezing rain
    520: 'fa-cloud-rain',
    521: 'fa-cloud-rain',
    522: 'fa-cloud-rain',
    531: 'fa-cloud-rain',
    
    // Snow
    600: 'fa-snowflake',
    601: 'fa-snowflake',
    602: 'fa-snowflake',
    611: 'fa-sleet', // Sleet
    612: 'fa-sleet',
    613: 'fa-sleet',
    615: 'fa-sleet',
    616: 'fa-sleet',
    620: 'fa-snowflake',
    621: 'fa-snowflake',
    622: 'fa-snowflake',
    
    // Atmosphere
    701: 'fa-smog', // Mist
    711: 'fa-smog', // Smoke
    721: 'fa-smog', // Haze
    731: 'fa-wind', // Sand/dust whirls
    741: 'fa-smog', // Fog
    751: 'fa-wind', // Sand
    761: 'fa-wind', // Dust
    762: 'fa-volcano', // Volcanic ash
    771: 'fa-wind', // Squalls
    781: 'fa-tornado', // Tornado
    
    // Clear
    800: 'fa-sun',
    
    // Clouds
    801: 'fa-cloud-sun', // Few clouds
    802: 'fa-cloud', // Scattered clouds
    803: 'fa-cloud', // Broken clouds
    804: 'fa-cloud'  // Overcast clouds
};

// Keep your existing theme toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const icon = themeToggle.querySelector('i');
    if (document.body.classList.contains('dark-theme')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        document.body.style.background = 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)';
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        document.body.style.background = 'linear-gradient(135deg, #1a2a6c, #b21f1f, #1a2a6c)';
    }
});

// Keep your existing unit toggle
let isCelsius = true;
toggleUnit.addEventListener('click', () => {
    isCelsius = !isCelsius;
    toggleUnit.textContent = isCelsius ? '°C / °F' : '°F / °C';
    updateTemperatures();
});

// Modified to work with real data
function updateTemperatures() {
    const tempElements = document.querySelectorAll('.temp, .high, .low');
    tempElements.forEach(el => {
        const currentValue = parseInt(el.textContent);
        if (isCelsius) {
            // Convert back to Celsius (if needed)
            el.textContent = `${currentValue}°`;
        } else {
            // Convert to Fahrenheit
            const fahrenheit = Math.round((currentValue * 9/5) + 32);
            el.textContent = `${fahrenheit}°`;
        }
    });
}

// Fetch weather data from API
async function fetchWeatherData(city, country = '') {
    try {
        let url;
        if (country) {
            url = `${BASE_URL}/weather?q=${city},${country}&appid=${API_KEY}&units=metric`;
        } else {
            url = `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('City not found');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

// Fetch forecast data
async function fetchForecastData(city, country = '') {
    try {
        let url;
        if (country) {
            url = `${BASE_URL}/forecast?q=${city},${country}&appid=${API_KEY}&units=metric`;
        } else {
            url = `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Forecast data not available');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching forecast data:', error);
        throw error;
    }
}

// Update UI with real weather data
async function updateWeatherUI(city, country = '') {
    try {
        showLoading();
        
        // Fetch current weather
        const weatherData = await fetchWeatherData(city, country);
        const forecastData = await fetchForecastData(city, country);
        
        // Get weather icon
        const weatherId = weatherData.weather[0].id;
        const icon = weatherIconMap[weatherId] || 'fa-cloud';
        
        // Update current weather display
        const locationName = weatherData.name;
        const countryCode = weatherData.sys.country;
        document.getElementById('current-location').textContent = `${locationName}, ${countryCode}`;
        document.querySelector('.temp-display .temp').textContent = `${Math.round(weatherData.main.temp)}°C`;
        document.querySelector('.temp-display .desc').textContent = weatherData.weather[0].description;
        
        // Update main weather display
        document.querySelector('.weather-info h3').textContent = `${locationName}, ${countryCode}`;
        document.querySelector('.weather-info p').textContent = weatherData.weather[0].description;
        document.querySelector('.weather-icon i').className = `fas ${icon}`;
        document.querySelector('.temp-display-large .temp').textContent = `${Math.round(weatherData.main.temp)}°C`;
        
        // Update weather details
        document.querySelector('.detail-info:nth-child(1) p').textContent = `${Math.round(weatherData.main.feels_like)}°C`;
        document.querySelector('.detail-info:nth-child(2) p').textContent = `${weatherData.main.humidity}%`;
        document.querySelector('.detail-info:nth-child(3) p').textContent = `${Math.round(weatherData.wind.speed * 3.6)} km/h`;
        document.querySelector('.detail-info:nth-child(4) p').textContent = `${weatherData.main.pressure} hPa`;
        
        // Update stats
        document.querySelector('.stat-card:nth-child(1) .value').textContent = `${Math.round(weatherData.main.temp_max)}°`;
        document.querySelector('.stat-card:nth-child(2) .value').textContent = `${Math.round(weatherData.main.temp_min)}°`;
        document.querySelector('.stat-card:nth-child(3) .value').textContent = `${weatherData.main.humidity}%`;
        document.querySelector('.stat-card:nth-child(4) .value').textContent = `${Math.round(weatherData.wind.speed * 3.6)} km/h`;
        
        // Update hourly forecast (using 3-hour forecast data)
        const hourlyItems = document.querySelectorAll('.hourly-item');
        for (let i = 0; i < Math.min(hourlyItems.length, 8); i++) {
            const forecast = forecastData.list[i];
            const hourIcon = weatherIconMap[forecast.weather[0].id] || 'fa-cloud';
            
            const time = new Date(forecast.dt * 1000);
            hourlyItems[i].querySelector('.time').textContent = time.getHours() + ':00';
            hourlyItems[i].querySelector('.icon i').className = `fas ${hourIcon}`;
            hourlyItems[i].querySelector('.temp').textContent = `${Math.round(forecast.main.temp)}°`;
        }
        
        // Update daily forecast
        const dailyItems = document.querySelectorAll('.daily-item');
        const today = new Date();
        
        // Today's weather
        dailyItems[0].querySelector('.day').textContent = 'Today';
        dailyItems[0].querySelector('.date').textContent = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dailyItems[0].querySelector('.icon i').className = `fas ${icon}`;
        dailyItems[0].querySelector('.desc').textContent = weatherData.weather[0].description;
        dailyItems[0].querySelector('.high').textContent = `${Math.round(weatherData.main.temp_max)}°`;
        dailyItems[0].querySelector('.low').textContent = `${Math.round(weatherData.main.temp_min)}°`;
        
        // Next 4 days
        for (let i = 1; i < dailyItems.length; i++) {
            const forecastDay = forecastData.list[i * 8]; // Get data for each day (every 24 hours)
            if (forecastDay) {
                const dayIcon = weatherIconMap[forecastDay.weather[0].id] || 'fa-cloud';
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                
                dailyItems[i].querySelector('.day').textContent = date.toLocaleDateString('en-US', { weekday: 'long' });
                dailyItems[i].querySelector('.date').textContent = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                dailyItems[i].querySelector('.icon i').className = `fas ${dayIcon}`;
                dailyItems[i].querySelector('.desc').textContent = forecastDay.weather[0].description;
                
                // Find min/max temp for the day
                let minTemp = forecastDay.main.temp_min;
                let maxTemp = forecastDay.main.temp_max;
                for (let j = 1; j < 8; j++) {
                    const hourForecast = forecastData.list[i * 8 + j];
                    if (hourForecast) {
                        minTemp = Math.min(minTemp, hourForecast.main.temp_min);
                        maxTemp = Math.max(maxTemp, hourForecast.main.temp_max);
                    }
                }
                
                dailyItems[i].querySelector('.high').textContent = `${Math.round(maxTemp)}°`;
                dailyItems[i].querySelector('.low').textContent = `${Math.round(minTemp)}°`;
            }
        }
        
        hideLoading();
    } catch (error) {
        hideLoading();
        alert(`Error: ${error.message}`);
        console.error('Error updating UI:', error);
    }
}

// Update location button to use geolocation
locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        alert('Fetching your current location...');
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(`${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
                    const data = await response.json();
                    updateWeatherUI(data.name, data.sys.country);
                } catch (error) {
                    alert('Error getting your location weather');
                    console.error(error);
                }
            },
            (error) => {
                alert('Please enable location services to use this feature');
                console.error(error);
            }
        );
    } else {
        alert('Geolocation is not supported by your browser');
    }
});

// Update search functionality
searchBtn.addEventListener('click', searchCity);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchCity();
});

function searchCity() {
    const city = cityInput.value.trim();
    if (city) {
        updateWeatherUI(city);
    } else {
        alert('Please enter a city name');
    }
}

// Keep your existing loading functions
function showLoading() {
    const searchBtnIcon = searchBtn.querySelector('i');
    const originalText = searchBtn.innerHTML;
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
    searchBtn.disabled = true;
}

function hideLoading() {
    const originalText = '<i class="fas fa-search"></i> Search';
    searchBtn.innerHTML = originalText;
    searchBtn.disabled = false;
}

// Initialize with Nairobi weather
window.addEventListener('load', () => {
    // Set current date
    const now = new Date();
    document.querySelector('.daily-item .date').textContent = 
        now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
    // Set other dates
    const dailyItems = document.querySelectorAll('.daily-item');
    for (let i = 1; i < dailyItems.length; i++) {
        const date = new Date();
        date.setDate(now.getDate() + i);
        dailyItems[i].querySelector('.date').textContent = 
            date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    // Load initial weather
    updateWeatherUI('Nairobi', 'KE');
});