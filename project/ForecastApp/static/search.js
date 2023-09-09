function fillCurrentLocation() {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
        .then(response => response.json())
        .then(data => {
          const addressData = data.address;
          const formattedAddress = `${addressData.road}, ${addressData.city}, ${addressData.county}, ${addressData.state}, ${addressData.postcode}`;
          document.getElementById("address-input").value = formattedAddress;
        });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Hover effects
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

    // Locate button click event
    document.getElementById("locate").addEventListener("click", e => {
      e.preventDefault();
      fillCurrentLocation();
    });

    const metricButton = document.getElementById('metric-button');
    const metricHidden = document.getElementById("metric-hidden").value; // Defined here

    metricButton.addEventListener('click', () => {
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
        body: JSON.stringify({ "address": address, "metric": metricHidden })
      })
      .then(response => {
        if (response.ok) {
          window.location.href = "/results/";
        } else {
          // Added user-friendly error handling
          alert("Something went wrong. Please try again.");
        }
      })
      .catch(error => {
        console.log("Error:", error);
        alert("An error occurred. Check the console for more details.");
      });
    }
});