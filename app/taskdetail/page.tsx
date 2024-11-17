'use client'

interface TaskDetailProps {
  title?: string
  description?: string
  date?: string
  time?: string
  onClose?: () => void
}

export default function TaskDetail({ 
  title = "Piggipo TEST",
  description = "WE TESTING YOU",
  date = "30 Jan",
  time = "10:40",
  onClose
}: TaskDetailProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Icon */}
          <div className="w-12 h-12 bg-[#364fc7] rounded-full flex items-center justify-center text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" 
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-gray-800 text-center">
            {title}
          </h1>

          {/* Date and Time */}
          <div className="text-gray-500">
            {date} {time}
          </div>

          {/* Description Section */}
          <div className="w-full space-y-2">
            <h2 className="text-gray-500 font-medium">Description</h2>
            <p className="text-gray-700">
              {description}
            </p>
          </div>

          {/* Done Button */}
          <button
            onClick={onClose}
            className="mt-8 w-full max-w-[200px] py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-600 
              text-white font-semibold rounded-full shadow-md 
              hover:from-blue-600 hover:to-blue-700 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}