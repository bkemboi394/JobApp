// frontend/pages/profile.tsx
import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import api from '../../lib/api'
import { Layout } from '../../components/layout'


interface Profile {
  id: number
  first_name: string
  last_name: string
  email: string
  summary: string
}

interface ProfileFormData {
  first_name: string
  last_name: string
  email: string
  summary: string
}

interface ToastState {
  show: boolean
  message: string
  type: 'success' | 'error'
}

// Simple inline Toast component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white max-w-sm`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {type === 'success' ? (
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
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

export default function ProfilePage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  // Get user ID from route params, localStorage, or other source
  // For this example, we'll use a hardcoded ID but you should replace this
  // with your actual user identification logic (JWT token, route params, etc.)
  const userId = 1 // Replace with your actual user ID logic

  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const {
    data: profile,
    isLoading,
    error: fetchError,
    isError
  } = useQuery<Profile>({
    queryKey: ['profile', userId],
    queryFn: () => api.get<Profile>(`profiles/${userId}/`).then(res => res.data),
    enabled: !!userId, // Only run query if user ID exists
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty }
  } = useForm<ProfileFormData>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      summary: ''
    }
  })

  // Watch form changes to detect unsaved changes
  const watchedFields = watch()

  useEffect(() => {
    setHasUnsavedChanges(isDirty)
  }, [isDirty])

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        summary: profile.summary
      })
    }
  }, [profile, reset])

  // Warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    const handleRouteChange = () => {
      if (hasUnsavedChanges && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
        throw 'Route change aborted'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    router.events.on('routeChangeStart', handleRouteChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [hasUnsavedChanges, router])

  // Mutation to save changes
  const updateProfile = useMutation({
    mutationFn: (updated: ProfileFormData) => {
      if (!profile?.id) throw new Error('Profile ID not available')
      return api.put(`profiles/${profile.id}/`, { ...updated, id: profile.id })
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
      setToast({ show: true, message: 'Profile updated successfully!', type: 'success' })
      setHasUnsavedChanges(false)
      // Reset form with updated data
      reset(response.data)
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.'
      setToast({ show: true, message: errorMessage, type: 'error' })
    }
  })

  const onSubmit = (data: ProfileFormData) => {
    // Client-side validation passed, submit the form
    updateProfile.mutate(data)
  }



  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="ml-3 text-gray-600">Loading your profile…</p>
        </div>
      </Layout>
    )
  }

  // Error state
  if (isError || !userId) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Profile</h2>
          <p className="text-gray-600 mb-4">
            {fetchError?.message || 'There was an error loading your profile. Please try again.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </Layout>
    )
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

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Profile</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                id="first_name"
                {...register('first_name', {
                  required: 'First name is required',
                  minLength: { value: 2, message: 'First name must be at least 2 characters' },
                  maxLength: { value: 50, message: 'First name must be less than 50 characters' }
                })}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.first_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your first name"
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                id="last_name"
                {...register('last_name', {
                  required: 'Last name is required',
                  minLength: { value: 2, message: 'Last name must be at least 2 characters' },
                  maxLength: { value: 50, message: 'Last name must be less than 50 characters' }
                })}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.last_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your last name"
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address'
                }
              })}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
              Professional Summary
            </label>
            <textarea
              id="summary"
              {...register('summary', {
                maxLength: { value: 500, message: 'Summary must be less than 500 characters' }
              })}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.summary ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={4}
              placeholder="Brief description of your professional background and goals"
            />
            {errors.summary && (
              <p className="mt-1 text-sm text-red-600">{errors.summary.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {watchedFields.summary?.length || 0}/500 characters
            </p>
          </div>

          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center">
              {hasUnsavedChanges && (
                <span className="text-sm text-amber-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Unsaved changes
                </span>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  if (hasUnsavedChanges && confirm('Are you sure you want to discard your changes?')) {
                    reset()
                    setHasUnsavedChanges(false)
                  }
                }}
                disabled={!hasUnsavedChanges}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Discard Changes
              </button>

              <button
                type="submit"
                disabled={updateProfile.isPending || !hasUnsavedChanges}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {updateProfile.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving…
                  </>
                ) : (
                  'Save Profile'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  )
}