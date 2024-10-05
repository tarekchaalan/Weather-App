# Weather App 🌦️

WeatherCentral is a standalone web application that provides weather forecasts for a specified location. Users can enter an address, and the application will fetch and display the weather information, including current conditions, hourly forecasts, and a 7-day forecast.

## Features

- Weather data retrieved from OpenWeather API.
- Location data retrieved from Google Maps Geocoding API.
- Display of current weather conditions.
- Hourly and 7-day weather forecasts.
- Responsive design for both mobile and desktop.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed.

## Getting Started

To get started with *WeatherApp*, follow these steps:

1. Clone this repository:

```
git clone https://github.com/tarekchaalan/Weather-App.git
```

2. Navigate to the project directory and install the required dependencies:

```
cd Weather-App
npm install
```

3. Set up your environment variables by creating a `.env` file in the project directory with the following:

```
OPENWEATHER_API_KEY=your_openweather_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. Build the application:

```
npm run build
```

5. Start the development server:

```
npm run start
```

## Usage

- Enter a location address in the search bar and click the "Search" button.
- Weather information for the specified location, including current conditions, hourly forecasts, and a 7-day forecast, will be displayed.

Specify the `dist` directory as the directory to be deployed when prompted.

## License

This project is licensed under the [MIT License](https://github.com/tarekchaalan/Weather-App/blob/master/LICENSE).
