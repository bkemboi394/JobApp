from django.contrib.auth.models import User
from rest_framework import viewsets, permissions, generics

from .models import UserProfile
from .serializers import (
    UserSerializer,
    UserProfileSerializer,
    UserCreateSerializer,
)

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.select_related('user').all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)




class RegisterView(generics.CreateAPIView):
    """
    Endpoint for user signup.
    Accepts POST { username, email, password } and returns the created user.
    """
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [permissions.AllowAny]
