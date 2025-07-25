from rest_framework import serializers
from .models import Resume


class ResumeSerializer(serializers.ModelSerializer):
    filename = serializers.SerializerMethodField()
    owner_username = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = Resume
        fields = ['id', 'file', 'uploaded_at', 'filename', 'owner_username']
        read_only_fields = ['uploaded_at', 'owner_username']

    def get_filename(self, obj):
        if obj.file:
            return obj.file.name.split('/')[-1]
        return None

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class ApplicationAnalysisSerializer(serializers.Serializer):
    # Either upload a file…
    resume = serializers.FileField(required=False)
    # … or use a stored resume by ID
    resume_id = serializers.IntegerField(required=False)

    # Always include the job description text
    job_description = serializers.CharField()

    # Optional outputs
    include_cover_letter = serializers.BooleanField(default=False)
    include_network_message = serializers.BooleanField(default=False)

    def validate(self, data):
        resume_sources = [
            bool(data.get('resume')),
            bool(data.get('resume_id'))
        ]

        if sum(resume_sources) != 1:
            raise serializers.ValidationError(
                "Provide exactly one: resume file or resume_id"
            )

        return data