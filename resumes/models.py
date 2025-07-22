from django.db import models

# Create your models here.
from django.conf import settings
from django.db import models

class Resume(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='resumes'
    )
    file = models.FileField(upload_to='resumes/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.owner.username} – {self.uploaded_at:%Y-%m-%d %H:%M}"
