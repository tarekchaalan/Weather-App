from django.shortcuts import render
from django.conf import settings
from django.http import JsonResponse
from django.views import View
import requests
import json
from pytz import timezone
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def index(request):
    return render(request, 'search.html')

def results(request):
    # Access data stored in session
    data = request.session.get('weather_data', {})
    return render(request, 'results.html', {'forecast_days': data.get('forecast_days', [])})

OPENWEATHER_API_KEY = settings.OPENWEATHER_API_KEY
GOOGLE_MAPS_API_KEY = settings.GOOGLE_MAPS_API_KEY

class WeatherView(View):
    def post(self, request):
        data = json.loads(request.body.decode('utf-8'))
        address_input = data.get("address", "")
        metric_input = data.get("metric", "C")

        try:
            response = requests.get(f"https://maps.googleapis.com/maps/api/geocode/json?address={address_input}&key={GOOGLE_MAPS_API_KEY}")
            if response.status_code != 200:
                return JsonResponse({"error": "Invalid address"}, status=400)
            location_data = response.json()
            latitude = location_data['results'][0]['geometry']['location']['lat']
            longitude = location_data['results'][0]['geometry']['location']['lng']
        except:
            return JsonResponse({"error": "Invalid address"}, status=400)
        try:
            response = requests.get(f"http://api.openweathermap.org/data/2.5/onecall?lat={latitude}&lon={longitude}&appid={OPENWEATHER_API_KEY}")
            parsed_json = response.json()
        except:
            return JsonResponse({"error": "Invalid API key"}, status=400)

        def convert_temp(kelvin, metric, *args, **kwargs):
            if metric == 'C':
                return int(round(kelvin - 273.15, 0))
            elif metric == 'F':
                return int(round((kelvin - 273.15) * 9/5 + 32, 0))

        daily_data = parsed_json['daily'][1:8]
        hourly_data = parsed_json['hourly']

        current_temp = convert_temp(hourly_data[0]['temp'], metric_input)
        highest_temp = max([convert_temp(hour['temp'], metric_input) for hour in hourly_data])
        lowest_temp = min([convert_temp(hour['temp'], metric_input) for hour in hourly_data])

        # Get the local timezone
        local_tz = timezone(parsed_json['timezone'])
        local_dt = datetime.now(local_tz)
        current_local_time = local_dt.hour

        hourly_forecast = []

        for i in range(24):
            time = (current_local_time + i + 1) % 24
            temp = convert_temp(hourly_data[i]['temp'], metric_input)
            hourly_forecast.append({
                "time": f"{time:02d}:00",
                "temperature": f"{temp}°{metric_input}"
            })

        # Extract the weather description from the API response
        weather_description = parsed_json['hourly'][0]['weather'][0]['main']

        # Extract relevant forecast data
        forecast_days = []
        for day_data in daily_data:
            date = datetime.utcfromtimestamp(day_data['dt']).strftime('%Y-%m-%d')
            max_temp = convert_temp(day_data['temp']['max'], metric_input)
            min_temp = convert_temp(day_data['temp']['min'], metric_input)
            weather_description = day_data['weather'][0]['main']

            forecast_days.append({
                "date": date,
                "max_temp": f"{max_temp}°{metric_input}",
                "min_temp": f"{min_temp}°{metric_input}",
                "weather_description": weather_description
            })

        # Determine the image based on the time of day
        current_local_time = current_local_time % 24  # Ensure it's within 0-23
        print(weather_description)

        # Determine the image based on the weather description
        if (6 <= current_local_time < 18): # Daytime
            # Daytime
            if weather_description == 'Clear':
                weather_image = 'sunny.jpg'
            elif weather_description == 'Clouds':
                weather_image = 'cloudy.jpg'
            else:
                weather_image = 'clear.jpg'

        else: # Nighttime
            if weather_description == 'Clear':
                weather_image = 'night.jpg'
            else:
                weather_image = 'clear.jpg'


        weather_data = {
            "current_temp": f"{current_temp}°{metric_input}",
            "highest_temp": f"{highest_temp}°{metric_input}",
            "lowest_temp": f"{lowest_temp}°{metric_input}",
            "hourly_forecast": hourly_forecast,
            "weather_image": weather_image,
            "forecast_days": forecast_days,
            "timezone": parsed_json['timezone']
        }

        # Store the data in session
        request.session['weather_data'] = weather_data

        return JsonResponse(weather_data)