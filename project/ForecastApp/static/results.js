function formatDate(dateString) {
  console.log("Input date:", dateString); // Add this line for debugging
  const date = new Date(dateString);
  console.log("Parsed date:", date); // Add this line for debugging
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
  const metricHidden = document.getElementById("metric-hidden").value;
  const csrfToken = getCookie("csrftoken");
  const address = document.getElementById("address-input").value;

  fetch("http://127.0.0.1:8000/get_weather/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({ address: address, metric: metricHidden }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (document.getElementById("current-temp")) {
        document.getElementById("current-temp").innerText = data.current_temp;
      }

      if (document.getElementById("highest-temp")) {
        document.getElementById("highest-temp").innerText =
          "H: " + data.highest_temp;
      }

      if (document.getElementById("lowest-temp")) {
        document.getElementById("lowest-temp").innerText =
          "L: " + data.lowest_temp;
      }

      const humidityElement = document.getElementById("humidity");
      const windSpeedElement = document.getElementById("wind-speed");
      const sunriseElement = document.getElementById("sunrise");
      const sunsetElement = document.getElementById("sunset");

      humidityElement.innerHTML = `${data.humidity}%`;
      windSpeedElement.innerHTML = `${data.wind_speed} m/s`;
      sunriseElement.innerHTML = data.sunrise;
      sunsetElement.innerHTML = data.sunset;

      const hourlyForecastDiv = document.getElementById("hourly-forecast");
      let forecastHTMLHourly = "";
      if (data.hourly_forecast) {
        data.hourly_forecast.forEach((hour) => {
          forecastHTMLHourly += `<p>${hour.time}: ${hour.temperature}</p>`;
        });
      }

      if (forecastHTMLHourly) {
        hourlyForecastDiv.innerHTML = forecastHTMLHourly;
      }

      const weeklyForecastDiv = document.getElementById("forecastdays");
      let forecastHTMLWeekly = "";
      if (data.forecast_days) {
        data.forecast_days.forEach((day) => {
          forecastHTMLWeekly += `
                  <tr>
                  <td>${formatDate(day.date)}</td>
                  <td>H: ${day.max_temp} L: ${day.min_temp}</td>
                  <td>${day.weather_description}</td>
                  </tr>`;
        });
      }

      if (forecastHTMLWeekly) {
        weeklyForecastDiv.innerHTML = forecastHTMLWeekly;
      }

      const locationElement = document.getElementById("location");
      const currentDateElement = document.getElementById("current-date");

      if (data.location && data.current_date) {
        locationElement.textContent = data.location;
        currentDateElement.textContent = formatDate(data.current_date);
      }
    })
    .catch((error) => {
      console.log("Error:", error);
      alert("An error occurred. Check the console for more details.");
    });
});
