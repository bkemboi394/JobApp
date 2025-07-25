# from django.contrib import admin
# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
#
# # from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
# from users.auth_views import MyTokenObtainPairView
# from rest_framework_simplejwt.views import TokenRefreshView
#
# from users.views import UserViewSet, UserProfileViewSet, RegisterView
# from resumes.views import ResumeViewSet, ApplicationAnalysisView
# from jobs.views import JobViewSet
# from django.contrib.auth import views as auth_views
#
#
# router = DefaultRouter()
# router.register(r'users', UserViewSet, basename='user')
# router.register(r'profiles', UserProfileViewSet, basename='profile')
# router.register(r'resumes', ResumeViewSet, basename='resume')
# router.register(r'jobs', JobViewSet, basename='job')
#
# urlpatterns = [
#     # Admin
#     path('admin/', admin.site.urls),
#
#     # API router
#     path('api/', include(router.urls)),
#
#     # JWT auth
#     # path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
#     path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
#     path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
#
#     # User registration
#     path('api/register/', RegisterView.as_view(), name='register'),
#
#     # Password reset
#     path('api/password-reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
#     path('api/password-reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
#     path(
#         'api/password-reset-confirm/<uidb64>/<token>/',
#         auth_views.PasswordResetConfirmView.as_view(),
#         name='password_reset_confirm'
#     ),
#     path('api/password-reset-complete/', auth_views.PasswordResetCompleteView.as_view(),
#          name='password_reset_complete'),
#     # Resume
#     path('api/resumes/', include('resumes.urls')),
#
# ]
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from users.auth_views import MyTokenObtainPairView
from users.views import UserViewSet, UserProfileViewSet, RegisterView
from resumes.views import ResumeViewSet, ApplicationAnalysisView
from jobs.views import JobViewSet
from django.contrib.auth import views as auth_views

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles', UserProfileViewSet, basename='profile')
router.register(r'resumes', ResumeViewSet, basename='resume')
router.register(r'jobs', JobViewSet, basename='job')

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API router
    path('api/', include(router.urls)),

    # JWT auth
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # User registration
    path('api/register/', RegisterView.as_view(), name='register'),

    # Password reset
    path('api/password-reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
    path('api/password-reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path(
        'api/password-reset-confirm/<uidb64>/<token>/',
        auth_views.PasswordResetConfirmView.as_view(),
        name='password_reset_confirm'
    ),
    path('api/password-reset-complete/', auth_views.PasswordResetCompleteView.as_view(),
         name='password_reset_complete'),

    # Resume analysis - separate endpoint to avoid conflicts
    path('api/analyze-resume/', ApplicationAnalysisView.as_view(), name='analyze-resume'),
]
