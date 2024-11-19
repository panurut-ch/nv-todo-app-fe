import { Suspense } from "react";
import { cookies } from "next/headers";
import TodoListClient from "./todolistclient";

export const dynamic = "force-dynamic";

async function getTodos(showAll = true) {
  try {
    const cookieStore = await cookies();
    const token = await cookieStore.get("token")?.value;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/todo/${showAll ? "all" : ""}`,
      {
        cache: "no-store",
        headers,
      }
    );

    if (!res.ok) {
      if (res.status === 401) {
        return { data: [], isAuthenticated: false };
      }
      throw new Error(`Failed to fetch todos: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return { data, isAuthenticated: true };
  } catch (error) {
    console.error("Error fetching todos:", error);
    return { data: [], isAuthenticated: false };
  }
}

async function TodoListServer() {
  const { data: todos, isAuthenticated } = await getTodos();
  return (
    <TodoListClient initialTodos={todos} isAuthenticated={isAuthenticated} />
  );
}

export default function TodoListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-500">Loading...</div>
        </div>
      }
    >
      <TodoListServer />
    </Suspense>
  );
}
