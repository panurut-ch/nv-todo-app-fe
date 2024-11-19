'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  username: string
}

type Todo = {
  id: string
  title: string
  description: string
  created_at: string
  updated_at: string
  created_by: User
  time?: string
  completedAt?: string
}

export default function DoneTasks() {
  const router = useRouter()
  const [doneTasks, setDoneTasks] = useState<Todo[]>([])

  useEffect(() => {
    const savedTasks = localStorage.getItem('doneTasks')
    if (savedTasks) {
      const parsedTasks: Todo[] = JSON.parse(savedTasks)
      
      const uniqueTasks = parsedTasks.reduce((acc: Todo[], current) => {
        const existingTaskIndex = acc.findIndex(task => task.id === current.id)
        if (existingTaskIndex >= 0) {
          if (current.completedAt && (!acc[existingTaskIndex].completedAt || new Date(current.completedAt) > new Date(acc[existingTaskIndex].completedAt))) {
            acc[existingTaskIndex] = current
          }
        } else {
          acc.push(current)
        }
        return acc
      }, [])

      uniqueTasks.sort((a, b) => {
        return new Date(b.completedAt || b.updated_at).getTime() - new Date(a.completedAt || a.updated_at).getTime()
      })

      setDoneTasks(uniqueTasks)
    }
  }, [])

  const formatDate = (date: string) => {
    const d = new Date(date)
    return {
      date: `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`,
      time: d.toLocaleString('default', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    }
  }

  return (
    <div className="min-h-screen bg-purple-50 pb-24">
      <div className="max-w-md mx-auto pt-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-purple-900">DONE TASKS</h1>
          <button 
            onClick={() => router.back()} 
            className="text-gray-400 p-2 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-3">
          {doneTasks.map((todo) => {
            const { date, time } = formatDate(todo.completedAt || todo.updated_at)
            return (
              <div
                key={`${todo.id}-${todo.completedAt || todo.updated_at}`}
                className="bg-white rounded-3xl p-4 shadow-sm flex items-center space-x-4"
              >
                <div className="bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-base font-medium text-purple-900 truncate line-through">
                    {todo.title}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-purple-900">{date}</p>
                  <p className="text-xs text-purple-600">{time}</p>
                </div>
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}