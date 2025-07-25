from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResumeViewSet, ApplicationAnalysisView

router = DefaultRouter()
router.register(r'', ResumeViewSet, basename='resume')

urlpatterns = [
    path('analyze/', ApplicationAnalysisView.as_view(), name='application-analysis'),
] + router.urls

