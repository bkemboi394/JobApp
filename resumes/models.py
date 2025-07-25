from django.db import models
from django.contrib.auth.models import User


class Resume(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes')
    file = models.FileField(upload_to='resumes/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'resumes_resume'
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.owner.username} - Resume {self.id}"