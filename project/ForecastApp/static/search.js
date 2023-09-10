function fillCurrentLocation() {
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
    )
      .then((response) => response.json())
      .then((data) => {
        const addressData = data.address;
        const formattedAddress = `${addressData.road}, ${addressData.city}, ${addressData.county}, ${addressData.state}, ${addressData.postcode}`;
        document.getElementById("address-input").value = formattedAddress;
      });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Hover effects
  $("#address-input").hover(
    function () {
      $("#search-container").css(
        "box-shadow",
        "0 0 30px 5px rgba(255, 255, 255, 0.6)"
      );
    },
    function () {
      $("#search-container").css("box-shadow", "none");
    }
  );

  $("#search-container").hover(
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

  document
    .getElementById("submit-button")
    .addEventListener("click", function (e) {
      e.preventDefault(); // Prevent form submission
      const addressInput = document.getElementById("address-input").value;
      const noAddressDiv = document.getElementById("noaddress");

      if (!addressInput) {
        noAddressDiv.style.opacity = "0.8"; // Show the div
        document.getElementById("invalidaddress").style.opacity = "0";
      } else {
        noAddressDiv.style.opacity = "0"; // Hide the div
        fetchWeather(); // Call fetchWeather function here if the address is not empty.
      }
    });

  document
    .getElementById("address-input")
    .addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        // Check for the Enter key
        e.preventDefault(); // Prevent the default behavior (e.g., form submission)

        // Call the function that handles the button click event
        const submitButton = document.getElementById("submit-button");
        submitButton.click();
      }
    });

  const metricButton = document.getElementById("metric-button");
  const metricHidden = document.getElementById("metric-hidden").value; // Defined here

  metricButton.addEventListener("click", () => {
    metricButton.innerHTML = metricButton.innerHTML === "°C" ? "°F" : "°C";
    metricHidden.value = metricButton.innerHTML === "°C" ? "C" : "F";
  });

  // Fetch data
  function fetchWeather() {
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
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw err;
          }); // If not OK, read the error message and throw it
        }
        return response.json(); // Otherwise, process the normal response
      })
      .then((data) => {
        // Success: Handle your successful data response here if necessary
        window.location.href = "/results/";
      })
      .catch((error) => {
        // Handle the specific error message
        if (error.error && error.error === "list index out of range") {
          document.getElementById("invalidaddress").style.opacity = "0.8";
          noAddressDiv.style.opacity = "0";
        } else {
          // Instead of alerting the error, we're now showing the div for other errors as well
          document.getElementById("invalidaddress").style.opacity = "0.8";
        }
      });
  }
});
