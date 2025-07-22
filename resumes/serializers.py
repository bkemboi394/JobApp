from rest_framework import serializers
from .models import Resume

class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ['id', 'owner', 'file', 'uploaded_at']
        read_only_fields = ['owner', 'uploaded_at']
