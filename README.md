# Weather App 🌦️

WeatherCentral is a Django-based web application that provides weather forecasts for a specified location. Users can enter an address, and the application will fetch and display the weather information, including current conditions, hourly forecasts, and a 7-day forecast.

## Features

- Weather data retrieved from OpenWeather API.
- Location data retrieved from Google Maps Geocoding API.
- Display of current weather conditions.
- Hourly and 7-day weather forecasts.
- Responsive design for mobile and desktop.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Python 3.7 or higher installed.
- Django and other required Python packages installed (see requirements.txt).

## Getting Started

To get started with *WeatherApp*, follow these steps:

1. Clone this repository:

```
git clone https://github.com/tarekchaalan/Weather-App.git
```

2. Create a virtual environment and activate it:

- *Mac / Linux:*
```
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
```
- *Windows:*
```
python -m venv env
source env\Scripts\activate
pip install -r requirements.txt
```

3. Set up your environment variables by creating a .env file in the project directory with the following:
```
OPENWEATHER_API_KEY=your_openweather_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. Run the migrations and create the database:
```
python manage.py migrate
```

5. Start the development server:
```
python manage.py runserver
```

## Usage
Enter a location address in the search bar and click the "Search" button.<br>
Weather information for the specified location will be displayed on the next page.

## Usage
This project is licensed under the [MIT License](https://opensource.org/licenses/MIT/).   
