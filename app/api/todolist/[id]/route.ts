import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() })
}

// PATCH handler for updating a specific todo item
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const headersList = await headers()
  const authHeader = headersList.get("Authorization")
  const token = authHeader ? authHeader.split(" ")[1] : null

  if (!token) {
    return NextResponse.json(
      { error: 'No token provided' },
      { status: 401, headers: corsHeaders() }
    )
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const { id } = params

  try {
    const body = await request.json()
    const { title, description } = body

    console.log('Making request to:', `${apiUrl}/todo/${id}`)
    console.log('Request body:', { title, description })
    console.log('Token:', token)

    const response = await fetch(`${apiUrl}/todo/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error:', errorText)
      throw new Error(`Failed to update todo: ${errorText}`)
    }

    const data = await response.json()
    console.log('API Response:', data)

    return NextResponse.json(data, { headers: corsHeaders() })
  } catch (error) {
    console.error('Error in PATCH /api/todolist/[id]:', error)
    return NextResponse.json(
      { error: 'An error occurred while updating todo' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

// DELETE handler for deleting a specific todo item
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const headersList = await headers()
  const authHeader = headersList.get("Authorization")
  const token = authHeader ? authHeader.split(" ")[1] : null

  if (!token) {
    return NextResponse.json(
      { error: 'No token provided' },
      { status: 401, headers: corsHeaders() }
    )
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const { id } = params

  try {
    console.log('Making request to:', `${apiUrl}/todo/${id}`)
    console.log('Token:', token)

    const response = await fetch(`${apiUrl}/todo/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error:', errorText)
      throw new Error(`Failed to delete todo: ${errorText}`)
    }

    const data = await response.json()
    console.log('API Response:', data)

    return NextResponse.json(data, { headers: corsHeaders() })
  } catch (error) {
    console.error('Error in DELETE /api/todolist/[id]:', error)
    return NextResponse.json(
      { error: 'An error occurred while deleting todo' },
      { status: 500, headers: corsHeaders() }
    )
  }
}