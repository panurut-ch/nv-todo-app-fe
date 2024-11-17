"use client";

import { useState } from "react";
import {
  format,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isValid,
  parseISO,
} from "date-fns";

type Todo = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  time?: string;
  created_by: {
    id: string;
    username: string;
  };
};

interface CalendarViewProps {
  todolist: Todo[];
  onAddClick: () => void;
  onTaskClick: (todo: Todo) => void;
  currentUserId: string;
  showOnlyMyTasks: boolean;
}

export default function CalendarView({
  todolist,
  onAddClick,
  onTaskClick,
  currentUserId,
  showOnlyMyTasks,
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get week days
  const weekStart = startOfWeek(selectedDate);
  const weekEnd = endOfWeek(selectedDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Filter todolist for selected date and user preference
  const todosForDay = todolist.filter((todo) => {
    if (!todo.created_at) return false;
    const todoDate = parseISO(todo.created_at);
    const dateMatches =
      isValid(todoDate) &&
      format(todoDate, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
    const userMatches =
      !showOnlyMyTasks || todo.created_by.id === currentUserId;
    return dateMatches && userMatches;
  });

  const formatTime = (dateString: string | undefined): string => {
    if (!dateString) return "12:00";
    const date = parseISO(dateString);
    return isValid(date) ? format(date, "HH:mm") : "12:00";
  };

  return (
    <div className="max-w-md mx-auto bg-gradient-to-b from-white to-blue-50/50 min-h-screen p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {format(selectedDate, "MMMM yyyy").toUpperCase()}
        </h1>
      </div>

      {/* Week View */}
      <div className="flex justify-between mb-8">
        {weekDays.map((day) => {
          const isSelected = format(day, "dd") === format(selectedDate, "dd");
          return (
            <button
              key={day.toString()}
              onClick={() => setSelectedDate(day)}
              className={`flex flex-col items-center ${
                isSelected ? "text-blue-500" : "text-gray-600"
              }`}
            >
              <span className="text-sm">{format(day, "EEE").slice(0, 2)}</span>
              <span
                className={`w-10 h-10 flex items-center justify-center rounded-lg mt-1 
                ${isSelected ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
              >
                {format(day, "dd")}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {todosForDay.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center space-x-4 bg-white rounded-xl p-4 shadow-sm cursor-pointer"
            onClick={() => onTaskClick(todo)}
          >
            <span className="text-sm text-gray-500 w-16">
              {todo.time || formatTime(todo.created_at)}
            </span>
            <div className="bg-blue-500 p-2 rounded-full text-white">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800 truncate">{todo.title}</p>
              <p className="text-xs text-gray-500 truncate">
                {todo.created_by.username}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center items-center">
        <button
          onClick={onAddClick}
          className="bg-blue-500 text-white p-4 rounded-full shadow-lg"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
