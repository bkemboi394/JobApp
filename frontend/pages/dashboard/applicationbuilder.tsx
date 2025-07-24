// frontend/pages/applicationbuilder.tsx
import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Layout } from '../../components/layout'
import api from '../../lib/api'

interface ApplicationData {
  resume?: File
  job_description: string
}

interface ToastState {
  show: boolean
  message: string
  type: 'success' | 'error' | 'warning'
}

interface FileError {
  type: 'size' | 'format' | 'upload'
  message: string
}

// Simple inline Toast component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'warning'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 6000)
    return () => clearTimeout(timer)
  }, [onClose])

  const getToastStyles = () => {
    switch (type) {
      case 'success': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      case 'warning': return 'bg-amber-500'
      default: return 'bg-blue-500'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${getToastStyles()} text-white max-w-sm`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getIcon()}
          <span className="text-sm font-medium">{message}</span>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function ApplicationBuilderPage() {
  const [file, setFile] = useState<File | null>(null)
  const [jobText, setJobText] = useState('')
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' })
  const [fileError, setFileError] = useState<FileError | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // Configuration constants
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_FILE_TYPES = ['application/pdf']
  const MIN_JOB_DESCRIPTION_LENGTH = 50

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ show: true, message, type })
  }

  const validateFile = (selectedFile: File): FileError | null => {
    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      return {
        type: 'format',
        message: 'Please upload a PDF file only.'
      }
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      return {
        type: 'size',
        message: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
      }
    }

    return null
  }

  const handleFileChange = (selectedFile: File | null) => {
    setFileError(null)

    if (!selectedFile) {
      setFile(null)
      return
    }

    const error = validateFile(selectedFile)
    if (error) {
      setFileError(error)
      setFile(null)
      showToast(error.message, 'error')
      return
    }

    setFile(selectedFile)
    showToast('Resume uploaded successfully!', 'success')
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const validateForm = (): boolean => {
    if (!file && !jobText.trim()) {
      showToast('Please upload a resume or enter job details.', 'warning')
      return false
    }

    if (jobText.trim() && jobText.trim().length < MIN_JOB_DESCRIPTION_LENGTH) {
      showToast(`Job description must be at least ${MIN_JOB_DESCRIPTION_LENGTH} characters long.`, 'warning')
      return false
    }

    return true
  }

  const mutation = useMutation({
    mutationFn: (formData: FormData) =>
      api.post('applications/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    onSuccess: (response) => {
      showToast('Analysis complete! Check your dashboard for results.', 'success')
      // Reset form after successful submission
      setFile(null)
      setJobText('')
      setFileError(null)
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          'Failed to process your application. Please try again.'
      showToast(errorMessage, 'error')
    }
  })

  const handleSubmit = () => {
    if (!validateForm()) return

    const formData = new FormData()
    if (file) {
      formData.append('resume', file)
    }
    formData.append('job_description', jobText.trim())

    mutation.mutate(formData)
  }

  const removeFile = () => {
    setFile(null)
    setFileError(null)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Layout>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      )}

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Builder</h1>
          <p className="text-gray-600">Upload your resume and job description to get personalized application insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resume Upload Section */}
          <div className="space-y-4">
            <div>
              <label htmlFor="resume-upload" className="block text-sm font-medium text-gray-700 mb-2">
                Upload Resume (PDF) *
              </label>

              {!file ? (
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center hover:border-purple-400 transition-colors ${
                    dragActive ? 'border-purple-400 bg-purple-50' : 'border-gray-300'
                  } ${fileError ? 'border-red-300 bg-red-50' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-2">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-purple-600 hover:text-purple-500">Click to upload</span>
                      <span> or drag and drop</span>
                    </div>
                    <p className="text-xs text-gray-500">PDF up to {MAX_FILE_SIZE / (1024 * 1024)}MB</p>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="h-8 w-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={removeFile}
                      className="flex-shrink-0 ml-4 text-gray-400 hover:text-red-500"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {fileError && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {fileError.message}
                </p>
              )}
            </div>

            {/* File Upload Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Tips for better results:</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Use a well-formatted PDF resume</li>
                <li>• Ensure text is selectable (not just an image)</li>
                <li>• Include contact information and relevant experience</li>
                <li>• Keep file size under {MAX_FILE_SIZE / (1024 * 1024)}MB</li>
              </ul>
            </div>
          </div>

          {/* Job Description Section */}
          <div className="space-y-4">
            <div>
              <label htmlFor="job-description" className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                id="job-description"
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                rows={12}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none ${
                  jobText.trim() && jobText.trim().length < MIN_JOB_DESCRIPTION_LENGTH
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
                placeholder="Paste the complete job description here or enter the job posting URL..."
              />
              <div className="mt-2 flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  {jobText.length}/{MIN_JOB_DESCRIPTION_LENGTH} minimum characters
                </p>
                {jobText.trim() && jobText.trim().length < MIN_JOB_DESCRIPTION_LENGTH && (
                  <p className="text-xs text-red-600">
                    Need {MIN_JOB_DESCRIPTION_LENGTH - jobText.trim().length} more characters
                  </p>
                )}
              </div>
            </div>

            {/* Job Description Tips */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-800 mb-2">What to include:</h3>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• Complete job posting text</li>
                <li>• Required qualifications and skills</li>
                <li>• Company information and culture</li>
                <li>• Responsibilities and expectations</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {!file && !jobText.trim() && (
                <span className="flex items-center text-amber-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Please provide either a resume or job description to continue
                </span>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={mutation.isPending || (!file && !jobText.trim())}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium"
            >
              {mutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Application...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Analyze & Generate Application
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}