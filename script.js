// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const html = document.documentElement;

// Check for saved theme preference or use system preference
const savedTheme = localStorage.getItem('theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
html.classList.add(savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    html.classList.toggle('dark');
    const theme = html.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
});

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        themeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />';
    } else {
        themeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />';
    }
}

// Weather App Functionality
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const errorMessage = document.getElementById('error-message');
const loadingSpinner = document.getElementById('loading-spinner');
const currentWeather = document.getElementById('current-weather');
const forecast = document.getElementById('forecast');
const defaultMessage = document.getElementById('default-message');
const toggleUnit = document.getElementById('toggle-unit');
let isCelsius = true;

// City-to-Country Mapping
const cityCountryMap = {
    // Kenyan Cities
    "Nairobi": "Kenya",
    "Mombasa": "Kenya",
    "Kisumu": "Kenya",
    "Nakuru": "Kenya",
    "Eldoret": "Kenya",
    "Thika": "Kenya",
    "Malindi": "Kenya",
    "Kitale": "Kenya",
    "Kakamega": "Kenya",
    "Nyeri": "Kenya",
    "Meru": "Kenya",
    "Kisii": "Kenya",
    "Garissa": "Kenya",
    "Wajir": "Kenya",
    "Lamu": "Kenya",
    "Machakos": "Kenya",
    "Narok": "Kenya",
    "Bungoma": "Kenya",
    "Busia": "Kenya",
    "Homa Bay": "Kenya",
    "Naivasha": "Kenya",
    "Nanyuki": "Kenya",
    "Kericho": "Kenya",
    "Embu": "Kenya",
    "Isiolo": "Kenya",
    "Marsabit": "Kenya",
    "Voi": "Kenya",
    "Kilifi": "Kenya",
    "Mandera": "Kenya",
    "Lodwar": "Kenya",
    "Kapenguria": "Kenya",
    "Kitui": "Kenya",
    "Nyamira": "Kenya",
    "Siaya": "Kenya",
    "Migori": "Kenya",
    "Bomet": "Kenya",
    "Murang'a": "Kenya",
    "Kiambu": "Kenya",
    "Makueni": "Kenya",
    "Taita Taveta": "Kenya",
    "Trans Nzoia": "Kenya",
    "Uasin Gishu": "Kenya",
    "Elgeyo Marakwet": "Kenya",
    "Nandi": "Kenya",
    "Baringo": "Kenya",
    "Laikipia": "Kenya",

    // World Cities
    "New York": "USA",
    "London": "UK",
    "Tokyo": "Japan",
    "Paris": "France",
    "Dubai": "UAE",
    "Singapore": "Singapore",
    "Shanghai": "China",
    "Hong Kong": "China",
    "Los Angeles": "USA",
    "Chicago": "USA",
    "Toronto": "Canada",
    "Sydney": "Australia",
    "Melbourne": "Australia",
    "Berlin": "Germany",
    "Rome": "Italy",
    "Madrid": "Spain",
    "Moscow": "Russia",
    "Seoul": "South Korea",
    "Beijing": "China",
    "Bangkok": "Thailand",
    "Mumbai": "India",
    "Delhi": "India",
    "Johannesburg": "South Africa",
    "Cairo": "Egypt",
    "Rio de Janeiro": "Brazil",
    "São Paulo": "Brazil",
    "Mexico City": "Mexico",
    "Buenos Aires": "Argentina"
};

// Weather icons mapping
const weatherIcons = {
    "clear-day": "☀️",
    "clear-night": "🌙",
    "rain": "🌧️",
    "snow": "❄️",
    "sleet": "🌨️",
    "wind": "🌬️",
    "fog": "🌫️",
    "cloudy": "☁️",
    "partly-cloudy-day": "⛅",
    "partly-cloudy-night": "🌥️",
    "thunderstorm": "⛈️"
};

// Search functionality
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherData(city);
    } else {
        showError("Please enter a city name");
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeatherData(city);
        } else {
            showError("Please enter a city name");
        }
    }
});

// Toggle temperature unit
toggleUnit.addEventListener('click', () => {
    isCelsius = !isCelsius;
    updateTemperatureUnits();
});

function updateTemperatureUnits() {
    const tempElements = document.querySelectorAll('[data-temp]');
    tempElements.forEach(el => {
        const tempC = parseFloat(el.dataset.temp);
        const tempF = celsiusToFahrenheit(tempC);
        el.textContent = isCelsius ? `${Math.round(tempC)}°C` : `${Math.round(tempF)}°F`;
    });
    const feelsLikeElements = document.querySelectorAll('[data-feels-like]');
    feelsLikeElements.forEach(el => {
        const tempC = parseFloat(el.dataset.feelsLike);
        const tempF = celsiusToFahrenheit(tempC);
        el.textContent = isCelsius ? `Feels like ${Math.round(tempC)}°C` : `Feels like ${Math.round(tempF)}°F`;
    });
    const tempRangeElements = document.querySelectorAll('[data-temp-max], [data-temp-min]');
    tempRangeElements.forEach(el => {
        const tempC = parseFloat(el.dataset.tempMax || el.dataset.tempMin);
        const tempF = celsiusToFahrenheit(tempC);
        if (el.dataset.tempMax) {
            el.textContent = isCelsius ? `${Math.round(tempC)}°` : `${Math.round(tempF)}°`;
        } else {
            el.textContent = isCelsius ? `${Math.round(tempC)}°` : `${Math.round(tempF)}°`;
        }
    });
}

function celsiusToFahrenheit(c) {
    return (c * 9/5) + 32;
}

function fetchWeatherData(city) {
    // Show loading spinner
    loadingSpinner.classList.remove('hidden');
    currentWeather.classList.add('hidden');
    forecast.classList.add('hidden');
    defaultMessage.classList.add('hidden');
    errorMessage.classList.add('hidden');

    // Simulate API call with timeout
    setTimeout(() => {
        if (city.toLowerCase() === "fail") {
            showError("City not found. Please try another location.");
        } else {
            const weatherData = generateMockWeatherData(city);
            displayWeatherData(weatherData);
        }
        loadingSpinner.classList.add('hidden');
    }, 1000);
}

function generateMockWeatherData(city) {
    // Generate random weather conditions based on city name hash
    const cityHash = Array.from(city).reduce((hash, char) => {
        return char.charCodeAt(0) + (hash << 6) + (hash << 16) - hash;
    }, 0);

    // Base temperature between 15-30°C (59-86°F)
    const baseTemp = 15 + Math.abs(cityHash % 15);
    const variation = Math.sin(Date.now() / 1000000) * 5;
    const currentTemp = Math.round(baseTemp + variation);

    // Weather conditions based on hash
    const conditions = [
        {desc: "Sunny", icon: "clear-day"},
        {desc: "Partly cloudy", icon: "partly-cloudy-day"},
        {desc: "Cloudy", icon: "cloudy"},
        {desc: "Rain", icon: "rain"},
        {desc: "Thunderstorm", icon: "thunderstorm"}
    ];
    const condition = conditions[Math.abs(cityHash % conditions.length)];

    // Generate forecast
    const forecastDays = [];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = new Date().getDay();
    for (let i = 1; i <= 5; i++) {
        const dayIndex = (today + i) % 7;
        const dayVariation = Math.sin(cityHash + i) * 3;
        const dayTemp = Math.round(baseTemp + dayVariation);
        forecastDays.push({
            day: days[dayIndex],
            temp_max: dayTemp + 2,
            temp_min: dayTemp - 2,
            description: conditions[(cityHash + i) % conditions.length].desc,
            icon: conditions[(cityHash + i) % conditions.length].icon
        });
    }

    return {
        city: city,
        country: cityCountryMap[city] || "World",
        current: {
            temp: currentTemp,
            feels_like: currentTemp + 2,
            humidity: 40 + Math.abs(cityHash % 40),
            wind: 5 + Math.abs(cityHash % 15),
            description: condition.desc,
            icon: condition.icon
        },
        forecast: forecastDays
    };
}

function displayWeatherData(data) {
    // Update current weather
    document.getElementById('current-city').textContent = `${data.city}, ${data.country}`;
    document.getElementById('current-temp').textContent = `${Math.round(data.current.temp)}°C`;
    document.getElementById('current-temp').dataset.temp = data.current.temp;
    document.getElementById('current-feels-like').textContent = `Feels like ${Math.round(data.current.feels_like)}°C`;
    document.getElementById('current-feels-like').dataset.feelsLike = data.current.feels_like;
    document.getElementById('current-description').textContent = data.current.description;
    document.getElementById('current-humidity').textContent = `${data.current.humidity}%`;
    document.getElementById('current-humidity-mobile').textContent = `${data.current.humidity}%`;
    document.getElementById('current-wind').textContent = `${data.current.wind} km/h`;
    document.getElementById('current-wind-mobile').textContent = `${data.current.wind} km/h`;

    // Update weather icon
    const currentIcon = document.getElementById('current-icon');
    currentIcon.textContent = weatherIcons[data.current.icon] || "☀️";

    // Update forecast
    const forecastContainer = document.querySelector('#forecast > div');
    forecastContainer.innerHTML = '';
    data.forecast.forEach(day => {
        const forecastCard = document.createElement('div');
        forecastCard.className = 'bg-white dark:bg-gray-700 rounded-lg shadow p-4 hover:shadow-lg transition-shadow';
        forecastCard.innerHTML = `
            <h4 class="font-medium text-gray-800 dark:text-white mb-2">${day.day}</h4>
            <div class="weather-icon text-4xl text-center my-3">${weatherIcons[day.icon] || "☀️"}</div>
            <p class="text-gray-600 dark:text-gray-300 text-sm text-center capitalize mb-3">${day.description}</p>
            <div class="flex justify-between text-sm">
                <span class="text-blue-600 dark:text-blue-400 font-medium" data-temp-max="${day.temp_max}">${Math.round(day.temp_max)}°</span>
                <span class="text-gray-500 dark:text-gray-400" data-temp-min="${day.temp_min}">${Math.round(day.temp_min)}°</span>
            </div>
        `;
        forecastContainer.appendChild(forecastCard);
    });

    // Show weather sections
    currentWeather.classList.remove('hidden');
    forecast.classList.remove('hidden');
    defaultMessage.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    loadingSpinner.classList.add('hidden');
    currentWeather.classList.add('hidden');
    forecast.classList.add('hidden');
    defaultMessage.classList.remove('hidden');
}