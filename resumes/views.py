import os
import tempfile
from PyPDF2 import PdfReader
import numpy as np
from scipy.spatial.distance import cosine
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.viewsets import ModelViewSet
import openai

from .models import Resume
from .serializers import ResumeSerializer, ApplicationAnalysisSerializer


class ResumeViewSet(ModelViewSet):
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(owner=self.request.user)


class ApplicationAnalysisView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def extract_pdf_text(self, file_path):
        """Extract text from PDF using PyPDF2"""
        try:
            reader = PdfReader(file_path)
            pages = [page.extract_text() or "" for page in reader.pages]
            return "\n\n".join(pages)
        except Exception as e:
            raise Exception(f"Error extracting PDF text: {str(e)}")

    def get_embeddings(self, texts):
        """Get embeddings from OpenAI"""
        try:
            response = openai.Embedding.create(
                model="text-embedding-ada-002",
                input=texts
            )
            return [item["embedding"] for item in response["data"]]
        except Exception as e:
            raise Exception(f"Error getting embeddings: {str(e)}")

    def calculate_similarity(self, embedding1, embedding2):
        """Calculate cosine similarity between two embeddings"""
        try:
            similarity = 1 - cosine(embedding1, embedding2)
            return max(0, similarity * 100)
        except Exception as e:
            raise Exception(f"Error calculating similarity: {str(e)}")

    def generate_analysis(self, resume_text, job_description, include_cover_letter, include_network_message):
        """Generate AI analysis using GPT"""
        try:
            prompt = f"""Resume:
\"\"\"{resume_text}\"\"\"

Job Description:
\"\"\"{job_description}\"\"\"

Please provide a comprehensive analysis with the following sections:

1) Match Percentage Analysis: Provide a detailed explanation of how well this resume matches the job requirements.

2) Three Concrete Improvement Tips: Provide specific, actionable advice to improve this résumé for this role.

3) Skills Gap Analysis: For each missing or weak skill, estimate the weeks needed to learn basics and provide learning resources.

4) ATS-Friendly Résumé Suggestions: Provide specific recommendations to make the résumé more ATS-friendly.

{f"5) Cover Letter: Generate a personalized, professional cover letter for this position." if include_cover_letter else ""}

{f"6) Networking Message: Generate a concise LinkedIn message to connect with hiring managers." if include_network_message else ""}

Please format your response clearly with numbered sections."""

            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=2000
            )

            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"Error generating AI analysis: {str(e)}")

    def post(self, request):
        try:
            serializer = ApplicationAnalysisSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(
                    {"error": "Invalid data", "details": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )

            data = serializer.validated_data
            user = request.user

            resume_text = ""
            temp_file_path = None

            try:
                if data.get("resume_id"):
                    try:
                        resume = Resume.objects.get(id=data["resume_id"], owner=user)
                        resume_text = self.extract_pdf_text(resume.file.path)
                    except Resume.DoesNotExist:
                        return Response(
                            {"error": "Resume not found"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                else:
                    file_obj = data["resume"]
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
                        for chunk in file_obj.chunks():
                            temp_file.write(chunk)
                        temp_file_path = temp_file.name

                    resume_text = self.extract_pdf_text(temp_file_path)

                job_description = data["job_description"]

                if not openai.api_key:
                    return Response(
                        {"error": "OpenAI API key not configured"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

                embeddings = self.get_embeddings([resume_text, job_description])
                match_score = self.calculate_similarity(embeddings[0], embeddings[1])

                analysis = self.generate_analysis(
                    resume_text,
                    job_description,
                    data.get("include_cover_letter", False),
                    data.get("include_network_message", False)
                )

                if temp_file_path and os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)

                return Response({
                    "match_score": round(match_score, 1),
                    "analysis": analysis,
                }, status=status.HTTP_200_OK)

            except Exception as e:
                if temp_file_path and os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                raise e

        except Exception as e:
            return Response(
                {"error": f"Analysis failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )