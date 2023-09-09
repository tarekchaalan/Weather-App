from django.urls import path
from django.views.generic import TemplateView
from . import views

urlpatterns = [
    path('', TemplateView.as_view(template_name='search.html'), name='template_index'),
    path('results/', views.results, name='results'),
    path('get_weather/', views.WeatherView.as_view(), name='get_weather'),
]
