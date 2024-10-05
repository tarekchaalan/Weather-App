import "../css/search.css";

function fillCurrentLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetch(`/api/geocode?latlng=${latitude},${longitude}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.results && data.results[0]) {
            const addressComponents = data.results[0].address_components;
            let formattedAddress = "";
            addressComponents.forEach((component) => {
              if (component.types.includes("locality")) {
                formattedAddress += component.long_name + ", ";
              }
              if (component.types.includes("administrative_area_level_1")) {
                formattedAddress += component.long_name + ", ";
              }
              if (component.types.includes("country")) {
                formattedAddress += component.long_name;
              }
            });
            document.getElementById("address-input").value = formattedAddress;
          } else {
            alert("Unable to retrieve your location.");
          }
        })
        .catch((error) => {
          console.error("Error fetching location data:", error);
          alert("Error fetching location data.");
        });
    },
    (error) => {
      console.error("Geolocation error:", error);
      alert("Unable to retrieve your location.");
    },
  );
}

document.addEventListener("DOMContentLoaded", () => {
  // Hover effects using jQuery
  $("#address-input").hover(
    function () {
      $("#search-form").css(
        "box-shadow",
        "0 0 30px 5px rgba(255, 255, 255, 0.6)",
      );
    },
    function () {
      $("#search-form").css("box-shadow", "none");
    },
  );

  $("#search-form").hover(
    function () {
      $(this).css("box-shadow", "0 0 30px 5px rgba(255, 255, 255, 0.6)");
    },
    function () {
      $(this).css("box-shadow", "none");
    },
  );

  // Locate button click event
  document.getElementById("locate").addEventListener("click", (e) => {
    e.preventDefault();
    fillCurrentLocation();
  });

  const metricButton = document.getElementById("metric-button");
  const metricHidden = document.getElementById("metric-hidden");

  metricButton.addEventListener("click", () => {
    if (metricButton.innerHTML === "°C") {
      metricButton.innerHTML = "°F";
      metricHidden.value = "F";
    } else {
      metricButton.innerHTML = "°C";
      metricHidden.value = "C";
    }
  });

  // Handle form submission
  document
    .getElementById("search-form")
    .addEventListener("submit", function (e) {
      e.preventDefault(); // Prevent default form submission
      const addressInput = document
        .getElementById("address-input")
        .value.trim();
      const noAddressDiv = document.getElementById("noaddress");
      const invalidAddressDiv = document.getElementById("invalidaddress");

      if (!addressInput) {
        noAddressDiv.style.opacity = "0.8"; // Show the "Please enter an address" message
        invalidAddressDiv.style.opacity = "0"; // Hide the "Invalid address" message
      } else {
        noAddressDiv.style.opacity = "0"; // Hide the message
        fetchWeather(addressInput, metricHidden.value)
          .then((success) => {
            if (success) {
              window.location.href = "results.html";
            }
          })
          .catch((error) => {
            console.error("Error fetching weather:", error);
            invalidAddressDiv.style.opacity = "0.8"; // Show the "Invalid address" message
          });
      }
    });
});

// Function to fetch weather data and store it in localStorage
function fetchWeather(address, metric) {
  return new Promise((resolve, reject) => {
    // Geocode the address to get latitude and longitude
    fetch(`/api/geocode?address=${encodeURIComponent(address)}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (
          data.status !== "OK" ||
          !data.results ||
          data.results.length === 0
        ) {
          throw new Error("Invalid address");
        }

        const locationData = data.results[0];
        const latitude = locationData.geometry.location.lat;
        const longitude = locationData.geometry.location.lng;

        let cityName = address;
        for (let component of locationData.address_components) {
          if (component.types.includes("locality")) {
            cityName = component.long_name;
            break;
          }
        }

        // Fetch weather data from your backend
        return fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((parsedJson) => {
        if (parsedJson.cod) {
          throw new Error(parsedJson.message);
        }

        // Temperature conversion function
        const convertTemp = (kelvin) => {
          if (metric === "C") {
            return Math.round(kelvin - 273.15) + "°C";
          } else if (metric === "F") {
            return Math.round(((kelvin - 273.15) * 9) / 5 + 32) + "°F";
          } else {
            return Math.round(kelvin - 273.15) + "°C";
          }
        };

        const dailyData = parsedJson.daily.slice(1, 8);
        const hourlyData = parsedJson.hourly;

        const currentTemp = convertTemp(parsedJson.current.temp);
        const highestTemp = Math.max(
          ...hourlyData
            .slice(0, 24)
            .map((hour) => parseInt(convertTemp(hour.temp))),
        );
        const lowestTemp = Math.min(
          ...hourlyData
            .slice(0, 24)
            .map((hour) => parseInt(convertTemp(hour.temp))),
        );

        const weatherDescription = parsedJson.current.weather[0].description;
        const weatherMain = parsedJson.current.weather[0].main;
        const feelsLike = convertTemp(parsedJson.current.feels_like);
        const humidity = parsedJson.current.humidity + "%";
        const windSpeed =
          (parsedJson.current.wind_speed * 2.2369).toFixed(2) + " mph";
        const sunrise = new Date(
          parsedJson.current.sunrise * 1000,
        ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const sunset = new Date(
          parsedJson.current.sunset * 1000,
        ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        const timezoneOffset = parsedJson.timezone_offset;

        // Calculate local time in the weather location
        const localDate = new Date(
          (parsedJson.current.dt + timezoneOffset) * 1000,
        );
        const localHour = localDate.getUTCHours();

        const isDaytime = localHour >= 6 && localHour < 18;

        const hourlyForecast = hourlyData.slice(0, 24).map((hour) => {
          const date = new Date((hour.dt + timezoneOffset) * 1000);
          const time = date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          const temp = convertTemp(hour.temp);
          const desc = hour.weather[0].main;
          return { time, temperature: temp, weather_description_h: desc };
        });

        const forecastDays = dailyData.map((day) => {
          const date = new Date((day.dt + timezoneOffset) * 1000);
          const formattedDate = date.toLocaleDateString(undefined, {
            weekday: "long",
            month: "short",
            day: "numeric",
          });
          const maxTemp = convertTemp(day.temp.max);
          const minTemp = convertTemp(day.temp.min);
          const desc = day.weather[0].main;
          return {
            date: formattedDate,
            max_temp: maxTemp,
            min_temp: minTemp,
            weather_description_d: desc,
          };
        });

        // Determine background based on weather condition and time
        const weatherBackgrounds = {
          clear: {
            day: "images/clear_day.jpg",
            night: "images/clear_night.png",
            type: "image",
          },
          clouds: {
            file: "images/scattered-clouds.jpg",
            type: "image",
          },
          rain: {
            day: "videos/rain_day.mp4",
            night: "videos/rain_night.mp4",
            type: "video",
          },
          drizzle: {
            file: "videos/shower-rain.mp4",
            type: "video",
          },
          thunderstorm: {
            file: "videos/thunderstorm.mp4",
            type: "video",
          },
          snow: {
            file: "videos/snow.mp4",
            type: "video",
          },
          mist: {
            file: "videos/mist.mp4",
            type: "video",
          },
          smoke: {
            file: "videos/mist.mp4",
            type: "video",
          },
          haze: {
            file: "videos/mist.mp4",
            type: "video",
          },
          fog: {
            file: "videos/mist.mp4",
            type: "video",
          },
          sand: {
            file: "videos/mist.mp4",
            type: "video",
          },
          dust: {
            file: "videos/mist.mp4",
            type: "video",
          },
          ash: {
            file: "videos/mist.mp4",
            type: "video",
          },
          squall: {
            file: "videos/mist.mp4",
            type: "video",
          },
          tornado: {
            file: "videos/thunderstorm.mp4",
            type: "video",
          },
        };

        let backgroundFile = "images/default.jpg";
        let backgroundType = "image";

        if (weatherBackgrounds[weatherMain.toLowerCase()]) {
          const bg = weatherBackgrounds[weatherMain.toLowerCase()];
          if (bg.day && bg.night) {
            backgroundFile = isDaytime ? bg.day : bg.night;
            backgroundType = bg.type;
          } else {
            backgroundFile = bg.file;
            backgroundType = bg.type;
          }
        }

        const weatherData = {
          current_temp: currentTemp,
          highest_temp: "High: " + highestTemp,
          lowest_temp: "Low: " + lowestTemp,
          hourly_forecast: hourlyForecast,
          weather_image_url: backgroundFile,
          background_url: backgroundFile,
          background_type: backgroundType,
          forecast_days: forecastDays,
          location: cityName,
          timezone: parsedJson.timezone,
          current_date: new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          }),
          weather_description: weatherDescription,
          humidity: humidity,
          feels_like: feelsLike,
          wind_speed: windSpeed,
          sunrise: sunrise,
          sunset: sunset,
        };

        // Store data in localStorage
        localStorage.setItem("weather_data", JSON.stringify(weatherData));

        resolve(true);
      })
      .catch((error) => {
        console.error("Error:", error);
        reject(error);
      });
  });
}
