# garden/views.py

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from .models import Plant, Sensor, SensorType, SensorValue
from .serializers import PlantSerializer, SensorSerializer, SensorTypeSerializer, SensorValueSerializer

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from .serializers import UserSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key}, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if username is None or password is None:
            return Response({'error': 'Please provide both username and password'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Invalid Credentials'}, status=status.HTTP_404_NOT_FOUND)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key}, status=status.HTTP_200_OK)
    
class PlantViewSet(viewsets.ModelViewSet):
    queryset = Plant.objects.all()
    serializer_class = PlantSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Plant.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SensorTypeViewSet(viewsets.ModelViewSet):
    queryset = SensorType.objects.all()
    serializer_class = SensorTypeSerializer
    permission_classes = [IsAuthenticated]

class SensorViewSet(viewsets.ModelViewSet):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Sensor.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def bind_plant(self, request, pk=None):
        sensor = self.get_object()
        plant_id = request.data.get('plant_id')

        if not plant_id:
            return Response({'error': 'plant_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            plant = Plant.objects.get(id=plant_id, user=request.user)
        except Plant.DoesNotExist:
            return Response({'error': 'Plant not found or you do not have permission to access it.'}, status=status.HTTP_404_NOT_FOUND)

        sensor.plant = plant
        sensor.save()

        return Response(SensorSerializer(sensor).data)

    @action(detail=True, methods=['post'])
    def unbind_plant(self, request, pk=None):
        sensor = self.get_object()
        sensor.plant = None
        sensor.save()

        return Response(SensorSerializer(sensor).data)

class SensorValueViewSet(viewsets.ModelViewSet):
    queryset = SensorValue.objects.all()
    serializer_class = SensorValueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SensorValue.objects.filter(sensor__user=self.request.user)