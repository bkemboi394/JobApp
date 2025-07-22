from rest_framework import serializers
from .models import Job

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = ['id', 'owner', 'title', 'company', 'description', 'created_at']
        read_only_fields = ['owner', 'created_at']
