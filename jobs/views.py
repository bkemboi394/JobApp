from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions
from .serializers import JobSerializer
from .models import Job

class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Job.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

