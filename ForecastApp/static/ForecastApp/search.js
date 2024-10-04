function fillCurrentLocation() {
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
    )
      .then((response) => response.json())
      .then((data) => {
        const addressData = data.address;
        const formattedAddress = `${addressData.road || ""}, ${
          addressData.city || ""
        }, ${addressData.county || ""}, ${addressData.state || ""}, ${
          addressData.postcode || ""
        }`;
        document.getElementById("address-input").value = formattedAddress;
      });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Hover effects
  $("#address-input").hover(
    function () {
      $("#search-form").css(
        "box-shadow",
        "0 0 30px 5px rgba(255, 255, 255, 0.6)"
      );
    },
    function () {
      $("#search-form").css("box-shadow", "none");
    }
  );

  $("#search-form").hover(
    function () {
      $(this).css("box-shadow", "0 0 30px 5px rgba(255, 255, 255, 0.6)");
    },
    function () {
      $(this).css("box-shadow", "none");
    }
  );

  // Locate button click event
  document.getElementById("locate").addEventListener("click", (e) => {
    e.preventDefault();
    fillCurrentLocation();
  });

  const metricButton = document.getElementById("metric-button");
  const metricHidden = document.getElementById("metric-hidden");

  metricButton.addEventListener("click", () => {
    metricButton.innerHTML = metricButton.innerHTML === "°C" ? "°F" : "°C";
    metricHidden.value = metricButton.innerHTML === "°C" ? "C" : "F";
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
        fetchWeather(); // Call the function to fetch weather data
      }
    });

  // Fetch data
  function fetchWeather() {
    const csrfToken = getCookie("csrftoken");
    const address = document.getElementById("address-input").value.trim();
    fetch("/get_weather/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({ address: address, metric: metricHidden.value }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw err;
          }); // If not OK, read the error message and throw it
        }
        return response.json(); // Otherwise, process the normal response
      })
      .then((data) => {
        // Success: Redirect to the results page
        window.location.href = "/results/";
      })
      .catch((error) => {
        const invalidAddressDiv = document.getElementById("invalidaddress");
        if (error.error) {
          if (error.error === "list index out of range") {
            invalidAddressDiv.style.opacity = "0.8"; // Show the "Invalid address" message
            document.getElementById("noaddress").style.opacity = "0"; // Hide other messages
          } else {
            invalidAddressDiv.style.opacity = "0.8"; // Show the "Invalid address" message
          }
        } else {
          console.error("An unexpected error occurred:", error);
        }
      });
  }
});
