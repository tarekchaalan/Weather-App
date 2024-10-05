import "../css/results.css";

document.addEventListener("DOMContentLoaded", () => {
  const weatherData = JSON.parse(localStorage.getItem("weather_data"));

  if (!weatherData) {
    alert("No weather data found. Please perform a search first.");
    window.location.href = "index.html";
    return;
  }

  // Update background
  if (weatherData.background_type === "video") {
    const bgVideo = document.getElementById("background-video");
    const bgVideoSource = document.getElementById("bg-video-source");
    bgVideoSource.src = weatherData.background_url;
    bgVideo.style.display = "block";
    bgVideo.load();
  } else {
    const bgImage = document.getElementById("background-image");
    bgImage.style.backgroundImage = `url('${weatherData.background_url}')`;
    bgImage.style.display = "block";
  }

  // Update header information
  document.getElementById("location").innerText =
    `Weather in ${weatherData.location}`;
  document.getElementById("current-date").innerText = weatherData.current_date;

  // Function to update local time
  function updateLocalTime(timezone) {
    const localTimeElement = document.getElementById("local-time");
    const updateTime = () => {
      const localTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: timezone,
      });
      localTimeElement.innerText = `Local Time: ${localTime}`;
    };
    updateTime(); // Initial call
    setInterval(updateTime, 60000); // Update every minute
  }

  // Calculate and display local time
  if (weatherData.timezone) {
    updateLocalTime(weatherData.timezone);
  } else {
    document.getElementById("local-time").innerText = "Local Time: N/A";
    console.warn("Timezone information is missing in weatherData.");
  }

  // Update current weather
  document.getElementById("current-temp").innerText = weatherData.current_temp;
  document.getElementById("weather-description").innerText =
    weatherData.weather_description;
  document.getElementById("highest-temp").innerText = weatherData.highest_temp;
  document.getElementById("lowest-temp").innerText = weatherData.lowest_temp;

  // Update additional info
  document.getElementById("feels-like").innerText = weatherData.feels_like;
  document.getElementById("humidity").innerText = weatherData.humidity;
  document.getElementById("wind-speed").innerText = weatherData.wind_speed;
  document.getElementById("sunrise").innerText = weatherData.sunrise;
  document.getElementById("sunset").innerText = weatherData.sunset;

  // Update hourly forecast
  const hourlyForecastDiv = document.getElementById("hourly-forecast");
  weatherData.hourly_forecast.forEach((hour) => {
    const hourDiv = document.createElement("div");
    hourDiv.classList.add("hour");

    const timeP = document.createElement("p");
    timeP.classList.add("hour-time");
    timeP.innerText = hour.time;

    const tempP = document.createElement("p");
    tempP.classList.add("hour-temp");
    tempP.innerText = hour.temperature;

    const descP = document.createElement("p");
    descP.classList.add("hour-desc");
    descP.innerText = hour.weather_description_h;

    hourDiv.appendChild(timeP);
    hourDiv.appendChild(tempP);
    hourDiv.appendChild(descP);

    hourlyForecastDiv.appendChild(hourDiv);
  });

  // Update daily forecast
  const dailyForecastDiv = document.getElementById("daily-forecast");
  weatherData.forecast_days.forEach((day) => {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");

    const dateP = document.createElement("p");
    dateP.classList.add("day-date");
    dateP.innerText = day.date;

    const highP = document.createElement("p");
    highP.classList.add("day-high");
    highP.innerText = day.max_temp;

    const lowP = document.createElement("p");
    lowP.classList.add("day-low");
    lowP.innerText = day.min_temp;

    const descP = document.createElement("p");
    descP.classList.add("day-desc");
    descP.innerText = day.weather_description_d;

    dayDiv.appendChild(dateP);
    dayDiv.appendChild(highP);
    dayDiv.appendChild(lowP);
    dayDiv.appendChild(descP);

    dailyForecastDiv.appendChild(dayDiv);
  });
});
