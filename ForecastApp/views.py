from django.shortcuts import render
from django.http import JsonResponse
from django.views import View
import requests
import json
from pytz import timezone
from datetime import datetime
from dotenv import load_dotenv
import os
from django.templatetags.static import static

load_dotenv()

def index(request):
    return render(request, 'search.html')

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

class WeatherView(View):
    def post(self, request):
        data = json.loads(request.body.decode('utf-8'))
        address_input = data.get("address", "")
        metric_input = data.get("metric", "C")  # Default to Celsius if not provided

        try:
            response = requests.get(
                f"https://maps.googleapis.com/maps/api/geocode/json?address={address_input}&key={GOOGLE_MAPS_API_KEY}"
            )
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
            response = requests.get(
                f"http://api.openweathermap.org/data/2.5/onecall?lat={latitude}&lon={longitude}&appid={OPENWEATHER_API_KEY}"
            )
            parsed_json = response.json()
        except:
            return JsonResponse({"error": "Invalid API key"}, status=400)

        def convert_temp(kelvin):
            if metric_input == 'C':
                return int(round(kelvin - 273.15, 0))
            elif metric_input == 'F':
                return int(round((kelvin - 273.15) * 9/5 + 32, 0))
            else:
                return int(round(kelvin - 273.15, 0))  # Default to Celsius

        daily_data = parsed_json['daily'][1:8]
        hourly_data = parsed_json['hourly']

        current_temp = convert_temp(hourly_data[0]['temp'])
        highest_temp = max([convert_temp(hour['temp']) for hour in hourly_data])
        lowest_temp = min([convert_temp(hour['temp']) for hour in hourly_data])

        weather_description = parsed_json['current']['weather'][0]['description']
        weather_main = parsed_json['current']['weather'][0]['main']
        feels_like = convert_temp(parsed_json['current']['feels_like'])
        humidity = parsed_json['current']['humidity']
        wind_speed = round(parsed_json['current']['wind_speed'] * 2.2369, 2)
        sunrise_ts = parsed_json['current']['sunrise']
        sunset_ts = parsed_json['current']['sunset']

        # Get the local timezone
        local_tz = timezone(parsed_json['timezone'])
        local_dt = datetime.now(local_tz)
        current_date_str = local_dt.strftime('%A, %B %d')
        current_time = local_dt

        # Convert sunrise and sunset to local time
        sunrise_local_dt = datetime.fromtimestamp(sunrise_ts, local_tz)
        sunset_local_dt = datetime.fromtimestamp(sunset_ts, local_tz)
        sunrise_local = sunrise_local_dt.strftime('%I:%M %p')
        sunset_local = sunset_local_dt.strftime('%I:%M %p')

        hourly_forecast = []

        for i in range(24):
            forecast_time = datetime.fromtimestamp(hourly_data[i]['dt'], local_tz)
            time_in_12_hr_format = forecast_time.strftime('%I:%M %p')
            weather_description_h = hourly_data[i]['weather'][0]['main']
            temp = convert_temp(hourly_data[i]['temp'])
            hourly_forecast.append({
                "time": time_in_12_hr_format,
                "temperature": f"{temp}°{metric_input}",
                "weather_description_h": weather_description_h
            })

        # Extract relevant forecast data
        forecast_days = []
        for day_data in daily_data:
            date = datetime.fromtimestamp(day_data['dt'], local_tz).strftime('%A %m-%d')
            max_temp = convert_temp(day_data['temp']['max'])
            min_temp = convert_temp(day_data['temp']['min'])
            weather_description_d = day_data['weather'][0]['main']

            forecast_days.append({
                "date": date,
                "max_temp": f"{max_temp}°{metric_input}",
                "min_temp": f"{min_temp}°{metric_input}",
                "weather_description_d": weather_description_d
            })

        # Determine the image or video based on the weather condition
        is_daytime = sunrise_local_dt <= local_dt < sunset_local_dt
        weather_condition = weather_main.lower()

        # Map weather conditions to background filenames and types
        weather_backgrounds = {
            'clear': {
                'day': {'file': 'clear_day.jpg', 'type': 'image'},
                'night': {'file': 'clear_night.png', 'type': 'image'},
            },
            'clouds': {'file': 'scattered-clouds.jpg', 'type': 'image'},
            'rain': {
                'day': {'file': 'rain_day.mp4', 'type': 'video'},
                'night': {'file': 'rain_night.mp4', 'type': 'video'},
            },
            'drizzle': {'file': 'shower-rain.mp4', 'type': 'video'},
            'thunderstorm': {'file': 'thunderstorm.mp4', 'type': 'video'},
            'snow': {'file': 'snow.mp4', 'type': 'video'},
            'mist': {'file': 'mist.mp4', 'type': 'video'},
            'smoke': {'file': 'mist.mp4', 'type': 'video'},
            'haze': {'file': 'mist.mp4', 'type': 'video'},
            'fog': {'file': 'mist.mp4', 'type': 'video'},
            'sand': {'file': 'mist.mp4', 'type': 'video'},
            'dust': {'file': 'mist.mp4', 'type': 'video'},
            'ash': {'file': 'mist.mp4', 'type': 'video'},
            'squall': {'file': 'mist.mp4', 'type': 'video'},
            'tornado': {'file': 'thunderstorm.mp4', 'type': 'video'},
        }

        if weather_condition in weather_backgrounds:
            background = weather_backgrounds[weather_condition]
            if 'day' in background and 'night' in background:
                # Has day and night options
                if is_daytime:
                    background_file = background['day']['file']
                    background_type = background['day']['type']
                else:
                    background_file = background['night']['file']
                    background_type = background['night']['type']
            else:
                background_file = background['file']
                background_type = background['type']
        else:
            background_file = 'default.jpg'
            background_type = 'image'

        # Generate the static URL for the background
        background_url = static(f'data/images/{background_file}')

        weather_data = {
            "current_temp": f"{current_temp}°{metric_input}",
            "highest_temp": f"{highest_temp}°{metric_input}",
            "lowest_temp": f"{lowest_temp}°{metric_input}",
            "hourly_forecast": hourly_forecast,
            "weather_image_url": background_url,  # For backward compatibility
            "background_url": background_url,
            "background_type": background_type,
            "forecast_days": forecast_days,
            "location": city_name,
            "timezone": parsed_json['timezone'],
            "current_date": current_date_str,
            "weather_description": weather_description,
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
    city_name = request.session.get('city_name', data.get('location', 'Unknown City'))

    # Create the additional_info list here
    additional_info = [
        {'title': 'Feels Like', 'value': data.get('feels_like')},
        {'title': 'Humidity', 'value': data.get('humidity')},
        {'title': 'Wind Speed', 'value': data.get('wind_speed')},
        {'title': 'Sunrise', 'value': data.get('sunrise')},
        {'title': 'Sunset', 'value': data.get('sunset')}
    ]

    return render(request, 'results.html', {
        'forecast_days': data.get('forecast_days', []),
        'hourly_forecast': data.get('hourly_forecast', []),
        'weather_data': data,
        'city': city_name,
        'additional_info': additional_info  # Pass it to the template
    })
