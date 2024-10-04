function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  let suffix = ["th", "st", "nd", "rd"][
    day % 100 > 3 && day % 100 < 21 ? 0 : day % 10 < 4 ? day % 10 : 0
  ];
  const options = { weekday: "long", month: "long", day: "numeric" };
  let formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);
  const parts = formattedDate.split(" ");
  parts[parts.length - 1] += suffix;
  return parts.join(" ");
}

document.addEventListener("DOMContentLoaded", () => {
  // Retrieve the weather data embedded in the page
  const weatherData = JSON.parse(
    document.getElementById("weather-data").textContent
  );

  if (document.getElementById("current-temp")) {
    document.getElementById("current-temp").innerText =
      weatherData.current_temp;
  }

  if (document.getElementById("highest-temp")) {
    document.getElementById("highest-temp").innerText =
      "High: " + weatherData.highest_temp;
  }

  if (document.getElementById("lowest-temp")) {
    document.getElementById("lowest-temp").innerText =
      "Low: " + weatherData.lowest_temp;
  }

  const humidityElement = document.getElementById("humidity");
  const windSpeedElement = document.getElementById("wind-speed");
  const sunriseElement = document.getElementById("sunrise");
  const sunsetElement = document.getElementById("sunset");

  humidityElement.innerHTML = `${weatherData.humidity}`;
  windSpeedElement.innerHTML = `${weatherData.wind_speed}`;
  sunriseElement.innerHTML = weatherData.sunrise;
  sunsetElement.innerHTML = weatherData.sunset;

  // Update hourly forecast
  const hourlyForecastDiv = document.querySelector(".hourly-forecast");
  let forecastHTMLHourly = "";
  if (weatherData.hourly_forecast) {
    weatherData.hourly_forecast.forEach((hour) => {
      forecastHTMLHourly += `
        <div class="hour">
          <p class="hour-time">${hour.time}</p>
          <p class="hour-temp">${hour.temperature}</p>
          <p class="hour-desc">${hour.weather_description_h}</p>
        </div>`;
    });
  }

  if (forecastHTMLHourly) {
    hourlyForecastDiv.innerHTML = forecastHTMLHourly;
  }

  // Update daily forecast
  const dailyForecastDiv = document.querySelector(".daily-forecast");
  let forecastHTMLWeekly = "";
  if (weatherData.forecast_days) {
    weatherData.forecast_days.forEach((day) => {
      forecastHTMLWeekly += `
        <div class="day">
          <p class="day-date">${formatDate(day.date)}</p>
          <p class="day-high">High: ${day.max_temp}</p>
          <p class="day-low">Low: ${day.min_temp}</p>
          <p class="day-desc">${day.weather_description_d}</p>
        </div>`;
    });
  }

  if (forecastHTMLWeekly) {
    dailyForecastDiv.innerHTML = forecastHTMLWeekly;
  }

  // Update header information
  const locationElement = document.querySelector("header h1");
  const currentDateElement = document.querySelector("header p");

  if (weatherData.location && weatherData.current_date) {
    locationElement.textContent = `Weather in ${weatherData.location}`;
    currentDateElement.textContent = formatDate(weatherData.current_date);
  }
});
