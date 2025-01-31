# garden/serializers.py

from rest_framework import serializers
from .models import Plant, Sensor, SensorType, SensorValue,CustomUser
from django.contrib.auth import get_user_model

User = get_user_model()
    
class PlantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plant
        fields = ['id', 'user', 'name', 'description', 'created_at']
        read_only_fields = ['user']

    def validate(self, data):
        request = self.context.get('request')
        data['user'] = request.user
        return data

class SensorTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorType
        fields = ['id', 'name', 'unit']

class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = ['id', 'user', 'plant', 'sensor_type', 'created_at']
        read_only_fields = ['user', 'created_at']

    def validate(self, data):
        request = self.context.get('request')
        data['user'] = request.user
        return data

class SensorValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorValue
        fields = ['id', 'sensor', 'value', 'timestamp']
        read_only_fields = ['timestamp']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username','name', 'password', 'phone']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            name=validated_data['name'],
            phone=validated_data.get('phone', ''),
            password=validated_data['password'],
            username=validated_data['username']
        )
        return user