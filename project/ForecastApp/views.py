from django.shortcuts import render
from django.http import JsonResponse
from django.views import View
import requests
import json
from pytz import timezone
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

def index(request):
    return render(request, 'search.html')

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

class WeatherView(View):
    def post(self, request):
        data = json.loads(request.body.decode('utf-8'))
        address_input = data.get("address", "")
        metric_input = data.get("metric", "")

        try:
            response = requests.get(f"https://maps.googleapis.com/maps/api/geocode/json?address={address_input}&key={GOOGLE_MAPS_API_KEY}")
            if response.status_code != 200:
                return JsonResponse({"error": "Couldn't get address"}, status=400)
            location_data = response.json()
            latitude = location_data['results'][0]['geometry']['location']['lat']
            longitude = location_data['results'][0]['geometry']['location']['lng']
            city_name = None
            for component in location_data['results'][0]['address_components']:
                if "locality" in component['types']:
                    city_name = component['long_name']
                    break
            if city_name is None:
                city_name = address_input
            request.session['city_name'] = city_name
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
        try:
            response = requests.get(f"http://api.openweathermap.org/data/2.5/onecall?lat={latitude}&lon={longitude}&appid={OPENWEATHER_API_KEY}")
            parsed_json = response.json()
        except:
            return JsonResponse({"error": "Invalid API key"}, status=400)

        def convert_temp(kelvin, metric_input=metric_input):
            if metric_input == 'C':
                return int(round(kelvin - 273.15, 0))
            elif metric_input == 'F':
                return int(round((kelvin - 273.15) * 9/5 + 32, 0))

        daily_data = parsed_json['daily'][1:8]
        hourly_data = parsed_json['hourly']

        current_temp = convert_temp(hourly_data[0]['temp'], metric_input)
        highest_temp = max([convert_temp(hour['temp'], metric_input) for hour in hourly_data])
        lowest_temp = min([convert_temp(hour['temp'], metric_input) for hour in hourly_data])

        weather_description = parsed_json['current']['weather'][0]['description']
        feels_like = convert_temp(parsed_json['current']['feels_like'], metric_input)
        humidity = parsed_json['current']['humidity']
        #wind_speed = parsed_json['current']['wind_speed']
        wind_speed = round(parsed_json['current']['wind_speed'] * 2.2369, 2)
        sunrise_ts = parsed_json['current']['sunrise']
        sunset_ts = parsed_json['current']['sunset']

        # Get the local timezone
        local_tz = timezone(parsed_json['timezone'])
        local_dt = datetime.now(local_tz)
        current_date_str = local_dt.strftime('%A, %B %d')
        current_local_time = local_dt.hour

        # Convert sunrise and sunset to local time
        sunrise_local = datetime.fromtimestamp(sunrise_ts).astimezone(local_tz).strftime('%I:%M %p')
        sunset_local = datetime.fromtimestamp(sunset_ts).astimezone(local_tz).strftime('%I:%M %p')

        hourly_forecast = []

        for i in range(24):
            time_in_24_hr_format = (current_local_time + i + 1) % 24
            # Extract the weather description from the API response
            weather_description_h = parsed_json['hourly'][i]['weather'][0]['main']
            if 0 < time_in_24_hr_format < 12:
                time_suffix = 'AM'
            elif time_in_24_hr_format == 0:  # Handle midnight
                time_in_24_hr_format = 12
                time_suffix = 'AM'
            elif time_in_24_hr_format == 12:  # Handle noon
                time_suffix = 'PM'
            else:
                time_suffix = 'PM'
                time_in_24_hr_format -= 12

            time_in_12_hr_format = f"{time_in_24_hr_format:02d}:00 {time_suffix}"

            temp = convert_temp(hourly_data[i]['temp'], metric_input)
            hourly_forecast.append({
                "time": time_in_12_hr_format,
                "temperature": f"{temp}°{metric_input}",
                "weather_description_h": weather_description_h
            })


        # Extract relevant forecast data
        forecast_days = []
        for day_data in daily_data:
            date = datetime.utcfromtimestamp(day_data['dt']).strftime('%A %m-%d')
            max_temp = convert_temp(day_data['temp']['max'], metric_input)
            min_temp = convert_temp(day_data['temp']['min'], metric_input)
            weather_description_d = day_data['weather'][0]['main']

            forecast_days.append({
                "date": date,
                "max_temp": f"{max_temp}°{metric_input}",
                "min_temp": f"{min_temp}°{metric_input}",
                "weather_description_d": weather_description_d
            })

        # Determine the image based on the time of day
        current_local_time = current_local_time % 24  # Ensure it's within 0-23

        # Determine the image based on the weather description
        if (sunrise_ts <= current_local_time < sunset_ts): # Daytime
            # Daytime
            if weather_description == 'Clear':
                weather_image = 'static/data/images/sunny.jpg'
            elif weather_description == 'Clouds':
                weather_image = 'static/data/images/cloudy.jpg'
            else:
                weather_image = 'static/data/images/clear.jpg'

        else: # Nighttime
            weather_image = '{% static "project/ForecastApp/data/images/night.jpg" %'

        weather_data = {
            "current_temp": f"{current_temp}°{metric_input}",
            "highest_temp": f"{highest_temp}°{metric_input}",
            "lowest_temp": f"{lowest_temp}°{metric_input}",
            "hourly_forecast": hourly_forecast,
            "weather_image": weather_image,
            "forecast_days": forecast_days,
            "location": address_input,
            "timezone": parsed_json['timezone'],
            "current_date": current_date_str,
            "weather_description": weather_description,
            "weather_description_h": weather_description_h,
            "weather_description_d": weather_description_d,
            "humidity": f"{humidity}%",
            "feels_like": f"{feels_like}°{metric_input}",
            "wind_speed": f"{wind_speed} mph",
            "sunrise": sunrise_local,
            "sunset": sunset_local
        }

        # Store the data in session
        request.session['weather_data'] = weather_data

        return JsonResponse(weather_data)

def results(request):
    # Access data stored in session
    data = request.session.get('weather_data', {})
    city_name = request.session.get('city_name', data.get('location', 'Unknown City'))  # default to the full address or 'Unknown City' if city is not found
    return render(request, 'results.html', {
        'forecast_days': data.get('forecast_days', []),
        'hourly_forecast': data.get('hourly_forecast', []),
        'weather_data': data,
        'city': city_name
})