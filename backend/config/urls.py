from django.urls import path

from api import views

urlpatterns = [
    path("", views.health_check),
    path("health", views.health_check),
    path("analyze", views.analyze),
    path("cesar", views.route_cesar),
    path("cesar/decrypt", views.route_cesar_decrypt),
    path("french-frequencies", views.french_frequencies),
    path("update_attack", views.route_update_attack),
    path("start_attack", views.start_attack),
]
