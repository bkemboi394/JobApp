# users/serializers.py

from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from .models import UserProfile

class UserSerializer(serializers.ModelSerializer):
    # your existing fields…

    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class UserProfileSerializer(serializers.ModelSerializer):


    class Meta:
        model = UserProfile
        fields = ['id', 'bio', 'resume', 'user']


class UserCreateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        # Uses Django's create_user to hash the password
        return User.objects.create_user(**validated_data)
