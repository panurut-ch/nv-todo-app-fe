import { NextResponse } from "next/server";
import { headers } from "next/headers";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET() {
  const headersList = headers();
  const authHeader = headersList.get("Authorization");
  const token = authHeader ? authHeader.split(" ")[1] : null;

  if (!token) {
    return NextResponse.json(
      { error: "No token provided" },
      { status: 401, headers: corsHeaders() }
    );
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    console.error("NEXT_PUBLIC_API_URL is not defined");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500, headers: corsHeaders() }
    );
  }

  try {
    const response = await fetch(`${apiUrl}/todo/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(`Failed to fetch all todolist: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { headers: corsHeaders() });
  } catch (error) {
    console.error("Error in GET /api/todolist/all:", error);
    return NextResponse.json(
      { error: "Failed to fetch all todolist" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
