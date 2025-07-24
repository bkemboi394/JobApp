// frontend/pages/dashboard/index.tsx
import { useQuery } from '@tanstack/react-query'
import { useState, ChangeEvent } from 'react'
import api from '../../lib/api'
import { Layout } from '../../components/layout'


interface Resume {
  id: number
  title: string
  createdAt?: string
  updatedAt?: string
}

interface Job {
  id: number
  company: string
  title: string
  createdAt?: string
  status?: 'active' | 'closed' | 'draft'
}

interface ApiError {
  message: string
  status?: number
  code?: string
}

// Loading skeleton component
const LoadingSkeleton = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2" role="status" aria-label="Loading content">
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="h-4 bg-gray-200 rounded animate-pulse"
        style={{ width: `${Math.random() * 40 + 60}%` }}
      />
    ))}
  </div>
)

// Error display component
const ErrorMessage = ({
  error,
  onRetry,
  type
}: {
  error: ApiError
  onRetry: () => void
  type: string
}) => (
  <div
    className="bg-red-50 border border-red-200 rounded-lg p-4"
    role="alert"
    aria-live="polite"
  >
    <div className="flex items-center gap-2 text-red-800 mb-2">
      <span className="text-red-500">⚠️</span>
      <span className="font-medium">Failed to load {type}</span>
    </div>
    <p className="text-red-700 text-sm mb-3">
      {error.message || `Unable to fetch ${type}. Please try again.`}
    </p>
    <button
      onClick={onRetry}
      className="px-3 py-1 text-sm text-red-700 border border-red-300 rounded hover:bg-red-100 transition-colors"
    >
      🔄 Try Again
    </button>
  </div>
)

// Empty state component
const EmptyState = ({
  type,
  onAction
}: {
  type: 'resumes' | 'jobs'
  onAction: () => void
}) => {
  const content = {
    resumes: {
      title: "No resumes yet",
      description: "Create your first resume to get started with job applications.",
      actionText: "Create Resume"
    },
    jobs: {
      title: "No jobs found",
      description: "Start by posting your first job or check back later for new opportunities.",
      actionText: "Post Job"
    }
  }

  return (
    <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {content[type].title}
      </h3>
      <p className="text-gray-600 mb-4">
        {content[type].description}
      </p>
      <button
        onClick={onAction}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <span className="mr-2">➕</span>
        {content[type].actionText}
      </button>
    </div>
  )
}

export default function DashboardPage() {
  const [resumeSearchTerm, setResumeSearchTerm] = useState('')
  const [jobSearchTerm, setJobSearchTerm] = useState('')

  const {
    data: resumes = [],
    isLoading: loadingResumes,
    error: resumesError,
    refetch: refetchResumes,
    isRefetching: refetchingResumes
  } = useQuery<Resume[], ApiError>({
    queryKey: ['resumes'],
    queryFn: () => api.get<Resume[]>('resumes/').then((res) => res.data),
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  const {
    data: jobs = [],
    isLoading: loadingJobs,
    error: jobsError,
    refetch: refetchJobs,
    isRefetching: refetchingJobs
  } = useQuery<Job[], ApiError>({
    queryKey: ['jobs'],
    queryFn: () => api.get<Job[]>('jobs/').then((res) => res.data),
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  // Filter functions
  const filteredResumes = resumes.filter((resume: Resume) =>
    resume.title.toLowerCase().includes(resumeSearchTerm.toLowerCase())
  )

  const filteredJobs = jobs.filter((job: Job) =>
    job.company.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
    job.title.toLowerCase().includes(jobSearchTerm.toLowerCase())
  )

  // Action handlers
  const handleCreateResume = () => {
    // Navigate to resume creation page
    console.log('Navigate to create resume')
  }

  const handlePostJob = () => {
    // Navigate to job posting page
    console.log('Navigate to post job')
  }

  const handleRefreshAll = async () => {
    await Promise.all([refetchResumes(), refetchJobs()])
  }

  // Loading state
  if (loadingResumes || loadingJobs) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-medium">Your Resumes</h2>
            <LoadingSkeleton lines={3} />
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-medium">Your Jobs</h2>
            <LoadingSkeleton lines={4} />
          </section>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <button
            onClick={handleRefreshAll}
            disabled={refetchingResumes || refetchingJobs}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className={`mr-2 ${(refetchingResumes || refetchingJobs) ? 'animate-spin' : ''}`}>
              🔄
            </span>
            Refresh
          </button>
        </div>

        {/* Resumes Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Your Resumes ({resumes.length})</h2>
            <button
              onClick={handleCreateResume}
              className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              <span className="mr-1">➕</span>
              New Resume
            </button>
          </div>

          {resumesError ? (
            <ErrorMessage
              error={resumesError}
              onRetry={refetchResumes}
              type="resumes"
            />
          ) : (
            <>
              {resumes.length > 0 && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔍
                  </span>
                  <input
                    type="text"
                    placeholder="Search resumes..."
                    value={resumeSearchTerm}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setResumeSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              )}

              {resumes.length === 0 ? (
                <EmptyState type="resumes" onAction={handleCreateResume} />
              ) : filteredResumes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No resumes match your search criteria.
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredResumes.map((resume) => (
                    <div
                      key={resume.id}
                      className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{resume.title}</h3>
                        {resume.updatedAt && (
                          <p className="text-sm text-gray-500">
                            Updated {new Date(resume.updatedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                          Edit
                        </button>
                        <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* Jobs Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Your Jobs ({jobs.length})</h2>
            <button
              onClick={handlePostJob}
              className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              <span className="mr-1">➕</span>
              Post Job
            </button>
          </div>

          {jobsError ? (
            <ErrorMessage
              error={jobsError}
              onRetry={refetchJobs}
              type="jobs"
            />
          ) : (
            <>
              {jobs.length > 0 && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔍
                  </span>
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={jobSearchTerm}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setJobSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              )}

              {jobs.length === 0 ? (
                <EmptyState type="jobs" onAction={handlePostJob} />
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No jobs match your search criteria.
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {job.company}: {job.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          {job.status && (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              job.status === 'active' ? 'bg-green-100 text-green-800' :
                              job.status === 'closed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </span>
                          )}
                          {job.createdAt && (
                            <p className="text-sm text-gray-500">
                              Posted {new Date(job.createdAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                          Edit
                        </button>
                        <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </Layout>
  )
}