from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions
from .serializers import ResumeSerializer
from .models import Resume

class ResumeViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
