import Link from 'next/link'

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r p-6 flex flex-col">
      <div className="mb-8 text-xl font-semibold">
        Hello,BK
      </div>
      <nav className="flex-1 space-y-4">
        <Link
          href="/dashboard"
          className="block hover:bg-gray-100 p-2 rounded"
        >
          Home
        </Link>

        <Link
          href="/dashboard/profile"
          className="block hover:bg-gray-100 p-2 rounded"
        >
          Your Profile
        </Link>

        <Link
          href="/dashboard/applicationbuilder"
          className="block hover:bg-gray-100 p-2 rounded"
        >
          Application Builder
        </Link>

        {/* If you need “Applications” later, just add it here */}
        {/*
        <Link
          href="/coverletter"
          className="block hover:bg-gray-100 p-2 rounded"
        >
          Applications
        </Link>
        */}

        <Link
          href="/interviewpractice"
          className="block hover:bg-gray-100 p-2 rounded"
        >
          Interview Practice
        </Link>
      </nav>
    </aside>
  )
}
