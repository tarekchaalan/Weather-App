import fetch from "node-fetch";

export default async function handler(req, res) {
  const { latlng, address } = req.query;

  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  try {
    let apiUrl = "";

    if (latlng) {
      apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(latlng)}&key=${GOOGLE_MAPS_API_KEY}`;
    } else if (address) {
      apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
    } else {
      return res.status(400).json({ error: "Missing required parameters." });
    }

    const response = await fetch(apiUrl);
    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching geocode data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
