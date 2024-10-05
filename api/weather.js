import fetch from "node-fetch";

export default async function handler(req, res) {
  const { lat, lon } = req.query;

  const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing latitude or longitude." });
  }

  try {
    const apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${OPENWEATHER_API_KEY}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
