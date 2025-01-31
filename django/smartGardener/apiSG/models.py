from django.db import models
from django.conf import settings
# from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    name = models.CharField(max_length=30,blank=True,null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    password=models.CharField(max_length=100,blank=True,null=True)

class Plant(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class SensorType(models.Model):
    name = models.CharField(max_length=50)  # Например, 'soil_moisture', 'temperature'
    unit = models.CharField(max_length=20)  # Единицы измерения, например, '%', '°C'

    def __str__(self):
        return f'{self.name} ({self.unit})'

class Sensor(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    plant = models.ForeignKey(Plant, on_delete=models.SET_NULL, null=True, blank=True)
    sensor_type = models.ForeignKey(SensorType, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.sensor_type.name} for {self.plant.name if self.plant else "No plant"}'

class SensorValue(models.Model):
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE)
    value = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.sensor.sensor_type.name}: {self.value} at {self.timestamp}'