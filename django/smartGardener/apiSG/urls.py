
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlantViewSet, SensorTypeViewSet, SensorViewSet, SensorValueViewSet, RegisterView, LoginView

router = DefaultRouter()
router.register(r'plants', PlantViewSet)
router.register(r'sensors', SensorViewSet)
router.register(r'sensor-types', SensorTypeViewSet)
router.register(r'sensor-values', SensorValueViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
]