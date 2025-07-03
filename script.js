// API Configuration
const API_KEY = '5cb53130442127cea91ac471faf7b379'; // Replace with your OpenWeatherMap key
const VISUAL_CROSSING_API_KEY = 'GKGLG29VRQ3EWX7V74Z5K2QAZ'; // Replace with your Visual Crossing key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const locationBtn = document.getElementById('location-btn');
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const toggleUnit = document.getElementById('toggle-unit');
const weatherAlert = document.getElementById('weather-alert');
const hourlyForecast = document.getElementById('hourly-forecast');
const dailyForecast = document.getElementById('daily-forecast');
const currentYear = document.getElementById('current-year');

// Chart.js initialization
let historyChart = null;
let weatherMap = null;

// State management
let isCelsius = true;
let currentWeatherData = null;
let currentLocation = "Nairobi, Kenya";

// Weather condition mapping for icons
const weatherIconMap = {
    200: 'fa-bolt', 201: 'fa-bolt', 202: 'fa-bolt', 
    210: 'fa-bolt', 211: 'fa-bolt', 212: 'fa-bolt', 
    221: 'fa-bolt', 230: 'fa-bolt', 231: 'fa-bolt', 
    232: 'fa-bolt',
    300: 'fa-cloud-rain', 301: 'fa-cloud-rain', 
    302: 'fa-cloud-rain', 310: 'fa-cloud-rain', 
    311: 'fa-cloud-rain', 312: 'fa-cloud-rain', 
    313: 'fa-cloud-rain', 314: 'fa-cloud-rain', 
    321: 'fa-cloud-rain',
    500: 'fa-cloud-showers-heavy', 501: 'fa-cloud-showers-heavy', 
    502: 'fa-cloud-showers-heavy', 503: 'fa-cloud-showers-heavy', 
    504: 'fa-cloud-showers-heavy', 511: 'fa-icicles', 
    520: 'fa-cloud-rain', 521: 'fa-cloud-rain', 
    522: 'fa-cloud-rain', 531: 'fa-cloud-rain',
    600: 'fa-snowflake', 601: 'fa-snowflake', 
    602: 'fa-snowflake', 611: 'fa-sleet', 
    612: 'fa-sleet', 613: 'fa-sleet', 
    615: 'fa-sleet', 616: 'fa-sleet', 
    620: 'fa-snowflake', 621: 'fa-snowflake', 
    622: 'fa-snowflake',
    701: 'fa-smog', 711: 'fa-smog', 
    721: 'fa-smog', 731: 'fa-wind', 
    741: 'fa-smog', 751: 'fa-wind', 
    761: 'fa-wind', 762: 'fa-volcano', 
    771: 'fa-wind', 781: 'fa-tornado',
    800: 'fa-sun',
    801: 'fa-cloud-sun', 802: 'fa-cloud', 
    803: 'fa-cloud', 804: 'fa-cloud'
};

// Weather condition mapping for background
const weatherBackgrounds = {
    'clear': 'linear-gradient(135deg, #56CCF2, #2F80ED)',
    'clouds': 'linear-gradient(135deg, #BBD2C5, #536976)',
    'rain': 'linear-gradient(135deg, #3a7bd5, #00d2ff)',
    'thunderstorm': 'linear-gradient(135deg, #0F2027, #203A43, #2C5364)',
    'snow': 'linear-gradient(135deg, #E6DADA, #274046)',
    'default': 'linear-gradient(135deg, #1a2a6c, #b21f1f)'
};

// Initialize the application
function initApp() {
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }
    setupEventListeners();
    initHistoricalWeather();
    updateWeatherUI('Nairobi', 'KE');
}

// Set up all event listeners
function setupEventListeners() {
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (toggleUnit) toggleUnit.addEventListener('click', toggleTemperatureUnit);
    if (locationBtn) locationBtn.addEventListener('click', handleLocationClick);
    if (searchBtn && cityInput) {
        searchBtn.addEventListener('click', searchCity);
        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchCity();
        });
    }
}

// Theme toggle handler
function toggleTheme() {
    if (!themeToggle) return;
    document.body.classList.toggle('dark-theme');
    const icon = themeToggle.querySelector('i');
    if (!icon) return;

    if (document.body.classList.contains('dark-theme')) {
        icon.classList.replace('fa-moon', 'fa-sun');
        document.body.style.background = 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)';
        document.documentElement.style.setProperty('--text-primary', '#ffffff');
        document.documentElement.style.setProperty('--glass-intensity', '0.15');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
        document.body.style.background = 'linear-gradient(135deg, #1a2a6c, #b21f1f, #1a2a6c)';
        document.documentElement.style.setProperty('--text-primary', '#ffffff');
        document.documentElement.style.setProperty('--glass-intensity', '0.2');
    }
}

// Temperature unit toggle handler
function toggleTemperatureUnit() {
    if (!toggleUnit) return;
    isCelsius = !isCelsius;
    toggleUnit.textContent = isCelsius ? '°C / °F' : '°F / °C';
    updateTemperatures();
}

// Helper function to convert temperatures
function convertTemp(celsius, toFahrenheit) {
    if (toFahrenheit) {
        return Math.round((celsius * 9/5) + 32);
    }
    return Math.round(celsius);
}

// Update all temperatures based on current unit
function updateTemperatures() {
    if (!currentWeatherData) return;

    const currentTempEl = document.getElementById('current-temp');
    const detailTempEl = document.getElementById('detail-temp');
    const feelsLikeEl = document.getElementById('detail-feels-like');
    const highTempEl = document.getElementById('high-temp');
    const lowTempEl = document.getElementById('low-temp');

    if (currentTempEl) {
        const currentTemp = currentWeatherData.main.temp;
        currentTempEl.textContent = `${convertTemp(currentTemp, !isCelsius)}${isCelsius ? '°C' : '°F'}`;
    }
    if (detailTempEl) {
        const currentTemp = currentWeatherData.main.temp;
        detailTempEl.textContent = `${convertTemp(currentTemp, !isCelsius)}${isCelsius ? '°C' : '°F'}`;
    }
    if (feelsLikeEl) {
        const feelsLike = currentWeatherData.main.feels_like;
        feelsLikeEl.textContent = `${convertTemp(feelsLike, !isCelsius)}${isCelsius ? '°C' : '°F'}`;
    }
    if (highTempEl) {
        const highTemp = currentWeatherData.main.temp_max;
        highTempEl.textContent = `${convertTemp(highTemp, !isCelsius)}°`;
    }
    if (lowTempEl) {
        const lowTemp = currentWeatherData.main.temp_min;
        lowTempEl.textContent = `${convertTemp(lowTemp, !isCelsius)}°`;
    }

    const hourlyItems = document.querySelectorAll('#hourly-forecast .temp');
    hourlyItems.forEach(item => {
        const celsius = parseFloat(item.getAttribute('data-celsius'));
        item.textContent = `${convertTemp(celsius, !isCelsius)}°`;
    });

    const dailyHighs = document.querySelectorAll('#daily-forecast .high');
    const dailyLows = document.querySelectorAll('#daily-forecast .low');
    dailyHighs.forEach(item => {
        const celsius = parseFloat(item.getAttribute('data-celsius'));
        item.textContent = `${convertTemp(celsius, !isCelsius)}°`;
    });
    dailyLows.forEach(item => {
        const celsius = parseFloat(item.getAttribute('data-celsius'));
        item.textContent = `${convertTemp(celsius, !isCelsius)}°`;
    });
}

// Set dynamic background based on weather condition
function setWeatherBackground(weatherCondition) {
    const condition = weatherCondition.toLowerCase();
    let background = weatherBackgrounds.default;

    if (condition.includes('clear')) {
        background = weatherBackgrounds.clear;
    } else if (condition.includes('cloud')) {
        background = weatherBackgrounds.clouds;
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
        background = weatherBackgrounds.rain;
    } else if (condition.includes('thunder')) {
        background = weatherBackgrounds.thunderstorm;
    } else if (condition.includes('snow')) {
        background = weatherBackgrounds.snow;
    }

    document.body.style.background = background;
    document.body.style.backgroundSize = '400% 400%';
    document.body.style.animation = 'gradientBG 15s ease infinite';
}

// Apply time-of-day styles
function applyTimeStyles(hour) {
    if (hour > 18 || hour < 6) {
        document.documentElement.style.setProperty('--text-primary', '#ffffff');
        document.documentElement.style.setProperty('--glass-intensity', '0.15');
    } else {
        document.documentElement.style.setProperty('--text-primary', '#2d3748');
        document.documentElement.style.setProperty('--glass-intensity', '0.25');
    }
}

// Create wind visualization
function createWindVisualization(speed, degree) {
    const windContainer = document.createElement('div');
    windContainer.className = 'wind-indicator';

    const particleCount = Math.min(Math.floor(speed / 5), 10);
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'wind-particle';
        particle.style.top = `${Math.random() * 20}px`;
        particle.style.animationDuration = `${3 - (speed / 15)}s`;
        particle.style.animationDelay = `${i * 0.3}s`;
        windContainer.appendChild(particle);
    }

    return windContainer;
}

// Create AQI visualization
function createAQIVisualization(aqiValue) {
    const aqiContainer = document.createElement('div');
    aqiContainer.className = 'aqi-indicator-container';

    const aqiPercentage = Math.min(aqiValue / 3, 100);
    let aqiColor = '#00e400';
    if (aqiValue > 50) aqiColor = '#ffff00';
    if (aqiValue > 100) aqiColor = '#ff7e00';
    if (aqiValue > 150) aqiColor = '#ff0000';
    if (aqiValue > 200) aqiColor = '#8f3f97';
    if (aqiValue > 300) aqiColor = '#7e0023';

    const marker = document.createElement('div');
    marker.className = 'aqi-marker';
    marker.style.left = `${aqiPercentage}%`;
    marker.style.color = aqiColor;

    aqiContainer.innerHTML = `<div class="aqi-indicator"></div>`;
    aqiContainer.querySelector('.aqi-indicator').appendChild(marker);

    return aqiContainer;
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
        const data = await response.json();
        if (!data.weather || !data.main) {
            throw new Error('Invalid weather data');
        }
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

// Generate dynamic weather alerts
function generateWeatherAlert(weatherData) {
    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;
    const weatherId = weatherData.weather[0].id;
    const description = weatherData.weather[0].description.toLowerCase();

    let alertType = 'info';
    let alertTitle = 'Weather Advisory';
    let alertMessage = '';
    let alertIcon = 'fa-info-circle';

    if (temp > 35) {
        alertType = 'high';
        alertTitle = 'Heat Wave Warning';
        alertIcon = 'fa-temperature-high';
        alertMessage = `Extreme heat (${Math.round(temp)}°C). Stay hydrated, avoid direct sun, and check on vulnerable individuals.`;
    } else if (temp < 5) {
        alertType = 'high';
        alertTitle = 'Freezing Conditions';
        alertIcon = 'fa-temperature-low';
        alertMessage = `Freezing temperatures (${Math.round(temp)}°C). Dress warmly and be cautious of icy conditions.`;
    } else if (windSpeed > 10) {
        alertType = 'medium';
        alertTitle = 'High Winds';
        alertIcon = 'fa-wind';
        alertMessage = `Strong winds (${Math.round(windSpeed * 3.6)} km/h). Secure outdoor items and drive carefully.`;
    } else if (humidity > 80) {
        alertType = 'medium';
        alertTitle = 'High Humidity';
        alertIcon = 'fa-tint';
        alertMessage = `High humidity levels (${humidity}%). Stay hydrated and avoid strenuous activities.`;
    } else if (description.includes('rain') || description.includes('drizzle')) {
        alertType = 'low';
        alertTitle = 'Rain Expected';
        alertIcon = 'fa-cloud-rain';
        alertMessage = `Rain forecasted. Carry an umbrella and be cautious on roads.`;
    } else if (description.includes('thunderstorm')) {
        alertType = 'high';
        alertTitle = 'Thunderstorm Warning';
        alertIcon = 'fa-bolt';
        alertMessage = `Thunderstorms expected. Stay indoors and avoid using electrical equipment.`;
    } else if (description.includes('snow') || description.includes('sleet')) {
        alertType = 'medium';
        alertTitle = 'Winter Conditions';
        alertIcon = 'fa-snowflake';
        alertMessage = `Snow/sleet forecasted. Drive carefully and dress warmly.`;
    } else if (description.includes('fog') || description.includes('mist')) {
        alertType = 'low';
        alertTitle = 'Reduced Visibility';
        alertIcon = 'fa-smog';
        alertMessage = `Low visibility conditions. Drive carefully and use headlights.`;
    } else if (description.includes('clear') || description.includes('sunny')) {
        alertType = 'good';
        alertTitle = 'Perfect Weather';
        alertIcon = 'fa-sun';
        alertMessage = `Ideal conditions for outdoor activities. Enjoy the beautiful day!`;
    } else {
        alertType = 'info';
        alertTitle = 'Weather Advisory';
        alertIcon = 'fa-info-circle';
        alertMessage = `No severe weather alerts. ${description.charAt(0).toUpperCase() + description.slice(1)} conditions expected.`;
    }

    return { type: alertType, title: alertTitle, message: alertMessage, icon: alertIcon };
}

// Update weather alert display
function updateWeatherAlert(alert) {
    if (!weatherAlert) return;
    weatherAlert.className = 'weather-alert';
    weatherAlert.classList.add(`alert-${alert.type}`);
    const alertIcon = weatherAlert.querySelector('.alert-icon');
    const alertTitle = weatherAlert.querySelector('h3');
    const alertMessage = weatherAlert.querySelector('p');
    if (alertIcon) alertIcon.innerHTML = `<i class="fas ${alert.icon}"></i>`;
    if (alertTitle) alertTitle.textContent = alert.title;
    if (alertMessage) alertMessage.textContent = alert.message;
}

// Generate hourly forecast items
function generateHourlyForecast() {
    if (!hourlyForecast) return;
    hourlyForecast.innerHTML = '';
    const now = new Date();
    const currentHour = now.getHours();

    for (let i = 0; i < 8; i++) {
        const hour = (currentHour + i) % 24;
        const displayHour = hour === 0 ? '12 AM' : 
                           hour < 12 ? `${hour} AM` : 
                           hour === 12 ? '12 PM' : `${hour - 12} PM`;
        const baseTemp = currentWeatherData ? currentWeatherData.main.temp : 24;
        const tempVariation = Math.round((Math.random() * 6) - 3);
        const temp = baseTemp + tempVariation;
        const conditions = ['sun', 'cloud-sun', 'cloud', 'cloud-rain', 'cloud-showers-heavy'];
        const condition = conditions[Math.floor(Math.random() * conditions.length)];

        const item = document.createElement('div');
        item.className = 'hourly-item';
        item.innerHTML = `
            <div class="time">${i === 0 ? 'Now' : displayHour}</div>
            <div class="icon"><i class="fas fa-${condition}"></i></div>
            <div class="temp" data-celsius="${temp}">${convertTemp(temp, !isCelsius)}°</div>
        `;
        hourlyForecast.appendChild(item);
    }
}

// Generate daily forecast items
function generateDailyForecast() {
    if (!dailyForecast) return;
    dailyForecast.innerHTML = '';
    const now = new Date();

    for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(now.getDate() + i);
        const dayName = i === 0 ? 'Today' : 
                       i === 1 ? 'Tomorrow' : 
                       date.toLocaleDateString('en-US', { weekday: 'long' });
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const conditions = [
            { icon: 'sun', desc: 'Sunny', high: 28, low: 18 },
            { icon: 'cloud-sun', desc: 'Partly Cloudy', high: 25, low: 17 },
            { icon: 'cloud', desc: 'Cloudy', high: 22, low: 16 },
            { icon: 'cloud-rain', desc: 'Rainy', high: 20, low: 15 },
            { icon: 'cloud-showers-heavy', desc: 'Heavy Rain', high: 19, low: 14 }
        ];
        const condition = conditions[Math.floor(Math.random() * conditions.length)];

        const item = document.createElement('div');
        item.className = 'daily-item';
        item.innerHTML = `
            <div class="day">${dayName}</div>
            <div class="date">${dateStr}</div>
            <div class="icon"><i class="fas fa-${condition.icon}"></i></div>
            <div class="desc">${condition.desc}</div>
            <div class="temps">
                <span class="high" data-celsius="${condition.high}">${convertTemp(condition.high, !isCelsius)}°</span>
                <span class="low" data-celsius="${condition.low}">${convertTemp(condition.low, !isCelsius)}°</span>
            </div>
        `;
        dailyForecast.appendChild(item);
    }
}

// Initialize historical weather controls
function initHistoricalWeather() {
    const historicalBtns = document.querySelectorAll('.historical-btn');
    historicalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            historicalBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const yearsBack = parseInt(btn.dataset.years);
            if (currentWeatherData) {
                fetchHistoricalWeather(yearsBack);
            }
        });
    });
}

// Fetch historical weather data
async function fetchHistoricalWeather(yearsBack) {
    try {
        const tempEl = document.getElementById('historical-temp');
        const precipEl = document.getElementById('historical-precip');
        const conditionsEl = document.getElementById('historical-conditions');
        if (tempEl) tempEl.textContent = '...';
        if (precipEl) precipEl.textContent = '...';
        if (conditionsEl) conditionsEl.textContent = '...';

        const historicalDate = new Date();
        historicalDate.setFullYear(historicalDate.getFullYear() - yearsBack);
        const dateStr = historicalDate.toISOString().split('T')[0];
        const lat = currentWeatherData.coord.lat;
        const lon = currentWeatherData.coord.lon;
        const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}/${dateStr}?unitGroup=metric&include=days&key=${VISUAL_CROSSING_API_KEY}&contentType=json`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Historical data unavailable');
        const historicalData = await response.json();
        updateHistoricalUI(historicalData, yearsBack);
    } catch (error) {
        console.error('Historical data error:', error);
        const tempEl = document.getElementById('historical-temp');
        const precipEl = document.getElementById('historical-precip');
        const conditionsEl = document.getElementById('historical-conditions');
        if (tempEl) tempEl.textContent = '--';
        if (precipEl) precipEl.textContent = '--';
        if (conditionsEl) conditionsEl.textContent = 'Data unavailable';
    }
}

// Update historical comparison UI
function updateHistoricalUI(historicalData, yearsBack) {
    const historicalDay = historicalData.days[0];
    const currentTemp = currentWeatherData.main.temp;
    const currentPrecip = currentWeatherData.rain ? currentWeatherData.rain["1h"] || 0 : 0;

    const tempDiff = currentTemp - historicalDay.temp;
    const precipDiff = currentPrecip - (historicalDay.precip || 0);

    const tempEl = document.getElementById('historical-temp');
    const tempDiffEl = document.getElementById('temp-diff');
    const precipEl = document.getElementById('historical-precip');
    const precipDiffEl = document.getElementById('precip-diff');
    const conditionsEl = document.getElementById('historical-conditions');

    if (tempEl) tempEl.textContent = `${Math.round(historicalDay.temp)}°C`;
    if (tempDiffEl) {
        tempDiffEl.textContent = `${tempDiff >= 0 ? '+' : ''}${Math.round(tempDiff)}° vs current`;
        tempDiffEl.className = `difference ${tempDiff >= 0 ? 'positive' : 'negative'}`;
    }
    if (precipEl) precipEl.textContent = `${historicalDay.precip || 0}mm`;
    if (precipDiffEl) {
        precipDiffEl.textContent = `${precipDiff >= 0 ? '+' : ''}${Math.round(precipDiff)}mm vs current`;
        precipDiffEl.className = `difference ${precipDiff >= 0 ? 'positive' : 'negative'}`;
    }
    if (conditionsEl) conditionsEl.textContent = historicalDay.conditions;

    updateHistoryChart(historicalDay, yearsBack);
}

// Update history chart
function updateHistoryChart(historicalDay, yearsBack) {
    const historicalYear = new Date().getFullYear() - yearsBack;
    const data = {
        labels: ['Temperature (°C)', 'Precipitation (mm)', 'Humidity (%)'],
        datasets: [
            {
                label: `${historicalYear} Historical`,
                data: [
                    historicalDay.temp,
                    historicalDay.precip || 0,
                    historicalDay.humidity
                ],
                backgroundColor: 'rgba(79, 172, 254, 0.7)'
            },
            {
                label: 'Current',
                data: [
                    currentWeatherData.main.temp,
                    currentWeatherData.rain ? currentWeatherData.rain["1h"] || 0 : 0,
                    currentWeatherData.main.humidity
                ],
                backgroundColor: 'rgba(0, 242, 254, 0.7)'
            }
        ]
    };

    const historyCtx = document.getElementById('historyChart')?.getContext('2d');
    if (!historyCtx) return;

    if (historyChart) {
        historyChart.destroy();
    }

    historyChart = new Chart(historyCtx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary')
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary')
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary')
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Weather animation function
function updateWeatherAnimation(weatherId) {
    const container = document.getElementById('weather-animation');
    if (!container) {
        console.error('Weather animation container not found');
        return;
    }

    const fallbackIcon = container.querySelector('.fallback-icon');
    container.innerHTML = '';
    if (fallbackIcon) {
        container.appendChild(fallbackIcon);
    }

    container.className = 'weather-icon';

    if (weatherId === 800) {
        container.innerHTML = `
            <svg viewBox="0 0 100 100" class="sun-animation">
                <circle cx="50" cy="50" r="30" fill="#FFD700" />
                <g id="sun-rays">
                    ${Array(8)
                        .fill()
                        .map(
                            (_, i) =>
                                `<rect x="48" y="5" width="4" height="15" fill="#FFD700" transform="rotate(${i * 45} 50 50)"/>`
                        )
                        .join('')}
                </g>
            </svg>
        `;
    } else if (weatherId >= 500 && weatherId <= 531) {
        container.innerHTML = `
            <svg viewBox="0 0 100 100">
                <path d="M20,20 Q50,10 80,20" stroke="#666" fill="none"/>
                ${Array(10)
                    .fill()
                    .map(
                        (_, i) =>
                            `<rect x="${10 + i * 8}" y="${30 + Math.random() * 10}" width="2" height="10" class="rain-drop" style="animation-delay: ${i * 0.1}s"/>`
                    )
                    .join('')}
            </svg>
        `;
        container.classList.add('weather-rain');
    } else if (weatherId >= 600 && weatherId <= 622) {
        container.innerHTML = `
            ${Array(15)
                .fill()
                .map(
                    (_, i) =>
                        `<text x="${Math.random() * 100}" y="${Math.random() * 30}" class="snow-flake" style="animation-delay: ${i * 0.2}s">❄</text>`
                )
                .join('')}
        `;
        container.classList.add('weather-snow');
    }

    if (!container.hasChildNodes() && fallbackIcon) {
        container.appendChild(fallbackIcon);
    }
}

// Initialize weather map
function initWeatherMap(lat, lon) {
    const mapContainer = document.getElementById('weather-map');
    if (!mapContainer) return;

    if (weatherMap) {
        weatherMap.remove();
    }

    weatherMap = L.map('weather-map').setView([lat, lon], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(weatherMap);
    L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`, {
        opacity: 0.7
    }).addTo(weatherMap);
    L.marker([lat, lon]).addTo(weatherMap)
        .bindPopup(`Current location: ${currentLocation}`)
        .openPopup();

    weatherMap.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        try {
            const response = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`);
            const data = await response.json();
            updateWeatherUI(data.name, data.sys.country);
        } catch (error) {
            console.error('Map click error:', error);
        }
    });
}

// Update daylight bar
function updateDaylightBar(sunrise, sunset) {
    const daylightProgress = document.querySelector('.daylight-progress');
    const sunPosition = document.querySelector('.sun-position');
    const sunriseTime = document.querySelector('.sunrise-time');
    const sunsetTime = document.querySelector('.sunset-time');
    if (!daylightProgress || !sunPosition || !sunriseTime || !sunsetTime) return;

    const now = new Date();
    const sunriseDate = new Date(sunrise * 1000);
    const sunsetDate = new Date(sunset * 1000);
    const totalDaylight = sunsetDate - sunriseDate;
    const currentProgress = (now - sunriseDate) / totalDaylight;

    daylightProgress.style.width = `${Math.min(100, Math.max(0, currentProgress * 100))}%`;
    sunPosition.style.left = `${currentProgress * 100}%`;
    sunriseTime.textContent = sunriseDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    sunsetTime.textContent = sunsetDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Update UI with real weather data
async function updateWeatherUI(city, country = '') {
    try {
        showLoading();
        currentWeatherData = await fetchWeatherData(city, country);

        const weatherId = currentWeatherData.weather[0].id;
        const icon = weatherIconMap[weatherId] || 'fa-cloud';
        currentLocation = `${currentWeatherData.name}, ${currentWeatherData.sys.country}`;

        const currentLocationEl = document.getElementById('current-location');
        const detailLocationEl = document.getElementById('detail-location');
        if (currentLocationEl) currentLocationEl.textContent = currentLocation;
        if (detailLocationEl) detailLocationEl.textContent = currentLocation;

        const description = currentWeatherData.weather[0].description;
        const descEl = document.querySelector('.temp-display .desc');
        const detailDescEl = document.getElementById('detail-description');
        if (descEl) descEl.textContent = description;
        if (detailDescEl) detailDescEl.textContent = description;

        const weatherIconContainer = document.querySelector('.weather-icon-container');
        if (weatherIconContainer) {
            const weatherIcon = weatherIconContainer.querySelector('.weather-icon i');
            if (weatherIcon) {
                weatherIcon.className = `fas ${icon}`;
            }

            const weatherIconDiv = weatherIconContainer.querySelector('.weather-icon');
            if (weatherIconDiv) {
                weatherIconDiv.className = 'weather-icon';
                if (description.includes('rain')) {
                    weatherIconDiv.classList.add('weather-rain');
                } else if (description.includes('snow')) {
                    weatherIconDiv.classList.add('weather-snow');
                } else if (description.includes('thunder')) {
                    weatherIconDiv.classList.add('weather-thunderstorm');
                }
            }

            updateWeatherAnimation(weatherId);
        }

        const humidity = currentWeatherData.main.humidity;
        const humidityEl = document.getElementById('humidity');
        const detailHumidityEl = document.getElementById('detail-humidity');
        if (humidityEl) humidityEl.textContent = `${humidity}%`;
        if (detailHumidityEl) detailHumidityEl.textContent = `${humidity}%`;

        const windSpeed = Math.round(currentWeatherData.wind.speed * 3.6);
        const windEl = document.getElementById('wind');
        const detailWindEl = document.getElementById('detail-wind');
        if (windEl) windEl.textContent = `${windSpeed} km/h`;
        if (detailWindEl) detailWindEl.textContent = `${windSpeed} km/h`;

        const windDetail = document.querySelector('.detail-card:nth-child(3) .detail-info');
        if (windDetail) {
            const existingWindViz = windDetail.querySelector('.wind-indicator');
            if (existingWindViz) existingWindViz.remove();
            windDetail.appendChild(createWindVisualization(windSpeed, currentWeatherData.wind.deg));
        }

        const pressure = currentWeatherData.main.pressure;
        const pressureEl = document.getElementById('detail-pressure');
        if (pressureEl) pressureEl.textContent = `${pressure} hPa`;

        const aqiDetail = document.querySelector('.detail-card:nth-child(5) .detail-info');
        if (aqiDetail) {
            const existingAQIViz = aqiDetail.querySelector('.aqi-indicator-container');
            if (existingAQIViz) existingAQIViz.remove();
            aqiDetail.appendChild(createAQIVisualization(Math.floor(Math.random() * 150) + 30));
        }

        updateTemperatures();
        const alert = generateWeatherAlert(currentWeatherData);
        updateWeatherAlert(alert);
        setWeatherBackground(description);
        applyTimeStyles(new Date().getHours());
        generateHourlyForecast();
        generateDailyForecast();

        if (currentWeatherData?.coord) {
            initWeatherMap(currentWeatherData.coord.lat, currentWeatherData.coord.lon);
        }

        if (currentWeatherData?.sys) {
            updateDaylightBar(currentWeatherData.sys.sunrise, currentWeatherData.sys.sunset);
        }

        const todayBtn = document.querySelector('.historical-btn[data-years="0"]');
        if (todayBtn) todayBtn.click();

        hideLoading();
    } catch (error) {
        hideLoading();
        alert(`Error: ${error.message}`);
        console.error('Error updating UI:', error);
    }
}

// Location button handler
async function handleLocationClick() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }

    showLoading();
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        const { latitude, longitude } = position.coords;
        const response = await fetch(`${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        updateWeatherUI(data.name, data.sys.country);
    } catch (error) {
        hideLoading();
        alert('Please enable location services to use this feature');
        console.error(error);
    }
}

// Search city function
function searchCity() {
    if (!cityInput || !searchBtn) return;
    const city = cityInput.value.trim();
    if (city) {
        updateWeatherUI(city);
        cityInput.value = '';
    } else {
        alert('Please enter a city name');
    }
}

// Loading states
function showLoading() {
    if (!searchBtn) return;
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
    searchBtn.disabled = true;
}

function hideLoading() {
    if (!searchBtn) return;
    searchBtn.innerHTML = '<i class="fas fa-search"></i> Search';
    searchBtn.disabled = false;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', initApp);