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

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  let suffix = "th";
  if (day === 1 || day === 21 || day === 31) {
    suffix = "st";
  } else if (day === 2 || day === 22) {
    suffix = "nd";
  } else if (day === 3 || day === 23) {
    suffix = "rd";
  }

  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);

  // Splitting and adding the suffix
  const parts = formattedDate.split(" ");
  parts[parts.length - 1] = parts[parts.length - 1] + suffix;

  return parts.join(" ");
}

function fillCurrentLocation() {
  navigator.geolocation.getCurrentPosition(function(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // Fetching address using latitude and longitude (this is just an example, you can adapt it to your backend)
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
      .then(response => response.json())
      .then(data => {
        const addressData = data.address;
        const formattedAddress = `${addressData.road}, ${addressData.city}, ${addressData.county}, ${addressData.state}, ${addressData.postcode}`;
        document.getElementById("address-input").value = formattedAddress;
      });
  });
}

// Wrap your code inside the DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", function() {
  $('#address-input').hover(
    function() {
      $('#search-container').css('box-shadow', '0 0 30px 5px rgba(255, 255, 255, 0.6)');
    },
    function() {
      $('#search-container').css('box-shadow', 'none');
    }
  );

  $('#search-container').hover(
    function() {
      $(this).css('box-shadow', '0 0 30px 5px rgba(255, 255, 255, 0.6)');
    },
    function() {
      $(this).css('box-shadow', 'none');
    }
  );

  const locateButton = document.getElementById("locate");
  locateButton.addEventListener("click", function(e) {
    e.preventDefault();
    fillCurrentLocation();
  });

  const metricButton = document.getElementById('metric-button');
  const metricHidden = document.getElementById('metric-hidden');

  metricButton.addEventListener('click', function() {
    metricButton.innerHTML = metricButton.innerHTML === "°C" ? "°F" : "°C";
    metricHidden.value = metricButton.innerHTML === "°C" ? "C" : "F";
  });

  document.getElementById("search-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const csrfToken = getCookie("csrftoken");
    const address = document.getElementById("address-input").value;

    fetch("http://127.0.0.1:8000/get_weather/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({
        "address": address,
        "metric": metricHidden.value,
      }),
    })
    .then(response => response.json())
    .then(data => {
      document.addEventListener("DOMContentLoaded", function() {

        document.getElementById("current-temp").innerText = data.current_temp;
        document.getElementById("highest-temp").innerText = "H: " + data.highest_temp;
        document.getElementById("lowest-temp").innerText = "L: " + data.lowest_temp;

        // weather and background image
        const roundedCornerDiv = document.getElementById("roundedCorner");
        roundedCornerDiv.style.backgroundImage = `url('/static/data/images/${data.weather_image}')`;
        document.body.style.backgroundImage = `url('/static/data/images/${data.weather_image}')`;


        // Hourly forecast
        const hourlyForecastDiv = document.getElementById("hourly-forecast");
        let forecastHTMLHourly = "";
        data.hourly_forecast.forEach(hour => {
          forecastHTMLHourly += `<p>${hour.time}: ${hour.temperature}</p>`;
        });
        hourlyForecastDiv.innerHTML = forecastHTMLHourly;

        // 7 Day Forecast
        const weeklyForecastDiv = document.getElementById("forecastdays");
        let forecastHTMLWeekly = "";
        data.forecast_days.forEach(day => {
          forecastHTMLWeekly += `
            <tr>
              <td>${formatDate(day.date)}</td>
              <td>H: ${day.max_temp} L: ${day.min_temp}</td>
              <td>${day.weather_description}</td>
            </tr>`;
        });

        weeklyForecastDiv.innerHTML = forecastHTMLWeekly;

        // Location and Current Date
        const locationElement = document.getElementById("location");
        const currentDateElement = document.getElementById("current-date");
        locationElement.textContent = data.location;
        currentDateElement.textContent = formatDate(data.current_date);

        window.location.href = "/results/";
      })
      .catch(error => {
        console.log("Error:", error);
      });
    });
  });
});