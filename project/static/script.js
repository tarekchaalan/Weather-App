function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Check if the cookie name matches the desired name
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Wrap your code inside the DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", function() {
  // Get the submit button element
  const submitButton = document.getElementById("submit-button");

  // Add an event listener to the submit button
  submitButton.addEventListener("click", function() {
    // Get input values from HTML fields
    const address = document.getElementById("address-input").value;
    const metric = document.getElementById("metric-dropdown").value;

    // Get the CSRF token from the cookie
    const csrfToken = getCookie("csrftoken");

    // Make the fetch API call to Django with the CSRF token
    fetch("http://127.0.0.1:8000/get_weather/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Include the CSRF token in the headers
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({
        "address": address,
        "metric": metric
      }),
    })
    .then(response => response.json())
    .then(data => {
      // Existing code
      document.getElementById("current-temp").innerText = "Current:  " + data.current_temp;
      document.getElementById("highest-temp").innerText = "High:  " + data.highest_temp;
      document.getElementById("lowest-temp").innerText = "Low:  " + data.lowest_temp;

      // New code to set the weather image
      const roundedCornerDiv = document.getElementById("roundedCorner");
      roundedCornerDiv.style.backgroundImage = `url('{% static 'data/images/' %}${data.weather_image}')`;

      // New code to handle hourly forecast
      const hourlyForecastDiv = document.getElementById("hourly-forecast");
      let forecastHTML = "<h2>Hourly Forecast</h2>";

      data.hourly_forecast.forEach(hour => {
        forecastHTML += `<p>${hour.time}: ${hour.temperature}</p>`;
      });

      hourlyForecastDiv.innerHTML = forecastHTML;
    })
    .catch(error => {
      console.log("Error:", error);
    });
  });
});