"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AddTask from "../addtask/page";
import TaskDetail from "../taskdetail/page";
import CalendarView from "./calendar-view";

type User = {
  id: string;
  username: string;
};

type Todo = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  created_by: User;
  time?: string;
};

interface TodoListClientProps {
  initialTodos: Todo[];
  isAuthenticated: boolean;
}

export default function TodoListClient({
  initialTodos,
  isAuthenticated: initialIsAuthenticated,
}: TodoListClientProps) {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [isAuthenticated, setIsAuthenticated] = useState(
    initialIsAuthenticated
  );
  const [error, setError] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null);
  const [isCalendarView, setIsCalendarView] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [updatingTask, setUpdatingTask] = useState<Todo | null>(null);
  const [showOnlyMyTasks, setShowOnlyMyTasks] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const verifyToken = useCallback(async (token: string) => {
    try {
      const response = await fetch("/api/todolist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error("Error verifying token:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      console.log("Token:", token); // For debugging

      if (!token) {
        console.log("No token found, redirecting to login");
        setIsAuthenticated(false);
        router.push("/login");
        return;
      }

      const isValid = await verifyToken(token);

      if (isValid) {
        console.log("Token verified, setting authenticated to true");
        setIsAuthenticated(true);
      } else {
        console.log("Token verification failed, redirecting to login");
        setIsAuthenticated(false);
        localStorage.removeItem("token");
        router.push("/login");
      }
    };

    checkAuth();
  }, [router, verifyToken]);

  const fetchTodos = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found when fetching todos, redirecting to login");
        setIsAuthenticated(false);
        router.push("/login");
        return;
      }

      const response = await fetch(
        showOnlyMyTasks ? "/api/todolist" : "/api/todolist/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          console.log(
            "Unauthorized response when fetching todos, redirecting to login"
          );
          setIsAuthenticated(false);
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch todolist");
      }

      const data = await response.json();
      const sortedTodos = data.data.sort((a: Todo, b: Todo) => {
        const dateA = new Date(a.updated_at || a.created_at).getTime();
        const dateB = new Date(b.updated_at || b.created_at).getTime();
        return dateB - dateA;
      });
      setTodos(sortedTodos);
    } catch (err) {
      setError("Failed to fetch todolist. Please try again later.");
      console.error(err);
    }
  }, [showOnlyMyTasks, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTodos();
    }
  }, [fetchTodos, isAuthenticated]);

  const handleAddTask = async (title: string, description: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/todolist", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        throw new Error("Failed to add task");
      }

      const result = await response.json();

      if (result.isSuccess && result.data) {
        setTodos((prevTodos) => [result.data, ...prevTodos]);
        setIsAddingTask(false);
        return result.data;
      } else {
        throw new Error("Failed to add task: Unexpected response structure");
      }
    } catch (err) {
      setError("Failed to add task. Please try again later.");
      console.error(err);
      throw err;
    }
  };

  const handleUpdateTask = async (
    id: string,
    title: string,
    description: string
  ) => {
    try {
      if (!id) {
        throw new Error("Task ID is required for updating");
      }

      const token = localStorage.getItem("token");
      const response = await fetch(`/api/todolist/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const result = await response.json();

      if (result.isSuccess && result.data) {
        setTodos((prevTodos) =>
          prevTodos.map((todo) =>
            todo.id === id
              ? {
                  ...result.data,
                  updated_at:
                    result.data.updated_at || new Date().toISOString(),
                }
              : todo
          )
        );
        setIsUpdatingTask(false);
        setUpdatingTask(null);
      } else {
        throw new Error("Failed to update task: Unexpected response structure");
      }
    } catch (err) {
      setError("Failed to update task. Please try again later.");
      console.error("Update task error:", err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      if (!id) {
        throw new Error("Invalid task ID");
      }

      const token = localStorage.getItem("token");
      const response = await fetch(`/api/todolist/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete task: ${errorText}`);
      }

      const result = await response.json();

      if (result.isSuccess) {
        setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
      } else {
        throw new Error("Failed to delete task: Operation unsuccessful");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to delete task. Please try again later.";
      setError(errorMessage);
      console.error("Delete task error:", err);
    }
  };

  const toggleTaskSelection = (todoId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(todoId)
        ? prev.filter((id) => id !== todoId)
        : [...prev, todoId]
    );
  };

  const handleMarkSelectedAsDone = useCallback(() => {
    const doneTasks = JSON.parse(localStorage.getItem("doneTasks") || "[]");
    const tasksToMarkDone = todos.filter((todo) =>
      selectedTasks.includes(todo.id)
    );
    const updatedDoneTasks = [
      ...doneTasks,
      ...tasksToMarkDone.map((task) => ({
        ...task,
        completedAt: new Date().toISOString(),
      })),
    ];
    localStorage.setItem("doneTasks", JSON.stringify(updatedDoneTasks));
    setTodos((prevTodos) =>
      prevTodos.filter((todo) => !selectedTasks.includes(todo.id))
    );
    setSelectedTasks([]);
  }, [todos, selectedTasks]);

  const formatDate = useCallback((dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        return { date: "No date", time: "--:--" };
      }
      return {
        date: `${d.toLocaleString("default", {
          month: "short",
        })} ${d.getDate()}`,
        time: d.toLocaleString("default", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      };
    } catch (error) {
      console.error("Error formatting date:", error);
      return { date: "No date", time: "--:--" };
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setTodos([]);
    router.push("/login");
  };

  const totalPages = Math.ceil(todos.length / itemsPerPage);
  const paginatedTodos = todos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const currentUserId = "your-current-user-id"; // Replace with actual user ID logic

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-purple-50">
        <h1 className="text-2xl font-bold text-purple-900 mb-4">
          Welcome to Todo App
        </h1>
        <p className="text-purple-700 mb-8">
          Please log in to view and manage your todos.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition-colors"
        >
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50 pb-24 relative">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-64 bg-white shadow-lg transform ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-20`}
      >
        <div className="p-4">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="mb-4 text-gray-500 hover:text-gray-700"
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
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <nav className="space-y-2">
            <Link
              href="/donetasks"
              className="block py-2 px-4 text-purple-600 hover:bg-purple-100 rounded"
            >
              Done Tasks
            </Link>
            <Link
              href="/datatable"
              className="block py-2 px-4 text-purple-600 hover:bg-purple-100 rounded"
            >
              Data Table
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left py-2 px-4 text-red-600 hover:bg-red-100 rounded"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-md mx-auto pt-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-purple-900">TODO</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">All Tasks</span>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={showOnlyMyTasks}
                onChange={() => setShowOnlyMyTasks(!showOnlyMyTasks)}
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
            <span className="text-sm text-gray-600">My Tasks</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-400 p-2 hover:text-gray-600"
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
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {isCalendarView ? (
          <CalendarView
            todolist={todos}
            onAddClick={() => setIsAddingTask(true)}
            onTaskClick={setSelectedTask}
            currentUserId={currentUserId}
            showOnlyMyTasks={showOnlyMyTasks}
          />
        ) : (
          <div className="space-y-3">
            {paginatedTodos.map((todo) => {
              const { date, time } = formatDate(
                todo?.updated_at || todo?.created_at || ""
              );
              const isSelected = selectedTasks.includes(todo.id);
              return (
                <div
                  key={todo.id || Math.random().toString()}
                  className="bg-white rounded-3xl p-4 shadow-sm flex items-center space-x-4"
                >
                  <div className="bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <div
                    className="flex-grow cursor-pointer min-w-0"
                    onClick={() => setSelectedTask(todo)}
                  >
                    <p className="text-base font-medium text-purple-900 truncate">
                      {todo.title}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 mr-2">
                    <p className="text-sm font-medium text-purple-900">
                      {date}
                    </p>
                    <p className="text-xs text-purple-600">{time}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsUpdatingTask(true);
                        setUpdatingTask(todo);
                      }}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(todo.id);
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskSelection(todo.id);
                      }}
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors
                        ${
                          isSelected
                            ? "bg-purple-500 border-purple-500"
                            : "border-gray-300 hover:border-purple-500"
                        }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                      <span className="sr-only">Select task</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isCalendarView && totalPages > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-4 z-10">
        {selectedTasks.length > 0 ? (
          <>
            <button
              onClick={() => setSelectedTasks([])}
              className="bg-gray-500 text-white rounded-full p-4 shadow-lg hover:bg-gray-600 transition-colors"
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
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <button
              onClick={handleMarkSelectedAsDone}
              className="bg-purple-500 text-white rounded-full p-4 shadow-lg hover:bg-purple-600 transition-colors"
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
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => router.push("/donetasks")}
              className="bg-purple-500 text-white rounded-full p-4 shadow-lg hover:bg-purple-600 transition-colors"
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
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
            <button
              onClick={() => setIsCalendarView(!isCalendarView)}
              className="bg-white text-gray-800 rounded-full p-4 shadow-lg hover:bg-gray-50 transition-colors"
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
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setIsAddingTask(true)}
              className="bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-600 transition-colors"
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
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {isAddingTask && (
        <AddTask
          onAddTask={handleAddTask}
          onClose={() => setIsAddingTask(false)}
        />
      )}
      {selectedTask && (
        <TaskDetail
          title={selectedTask.title}
          description={selectedTask.description}
          date={formatDate(selectedTask.updated_at).date}
          time={formatDate(selectedTask.updated_at).time}
          onClose={() => setSelectedTask(null)}
        />
      )}
      {isUpdatingTask && updatingTask && (
        <AddTask
          onAddTask={(title, description) =>
            handleUpdateTask(updatingTask.id, title, description)
          }
          onClose={() => {
            setIsUpdatingTask(false);
            setUpdatingTask(null);
          }}
          initialTitle={updatingTask.title}
          initialDescription={updatingTask.description}
          isUpdating={true}
        />
      )}
    </div>
  );
}
