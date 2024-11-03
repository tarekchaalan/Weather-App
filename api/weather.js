// Removed the 'node-fetch' import
// const fetch = require("node-fetch");

module.exports = async function (req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const { lat, lon } = req.query;

  const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

  if (!OPENWEATHER_API_KEY) {
    return res.status(500).json({
      error: "Server misconfiguration: Missing OpenWeather API key.",
    });
  }

  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing latitude or longitude." });
  }

  try {
    const apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${encodeURIComponent(
      lat,
    )}&lon=${encodeURIComponent(lon)}&appid=${OPENWEATHER_API_KEY}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
