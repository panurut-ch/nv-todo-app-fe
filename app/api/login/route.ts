import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { username, password } = await request.json()

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const apiPath_logIn = process.env.NEXT_PUBLIC_API_PATH_LOGIN

  try {
    const response = await fetch(`${apiUrl}${apiPath_logIn}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      throw new Error('Failed to authenticate')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred while logging in', error }, { status: 500 })
  }
}