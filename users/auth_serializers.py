# users/auth_serializers.py

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed

User = get_user_model()

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username = attrs.get(self.username_field)
        password = attrs.get("password")

        # 1) Check that the username exists
        try:
            user = User.objects.get(**{self.username_field: username})
        except User.DoesNotExist:
            raise AuthenticationFailed("Incorrect username or password", 401)

        # 2) Check the password is correct
        if not user.check_password(password):
            raise AuthenticationFailed("Incorrect username or password", 401)

        # 3) Check the account is active
        if not user.is_active:
            raise AuthenticationFailed("User account is disabled", 401)

        # 4) Delegate to the parent to generate tokens
        data = super().validate(attrs)
     
        return data
