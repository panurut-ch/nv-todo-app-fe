import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { url, method, body, headers: clientHeaders } = req.body

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (clientHeaders?.Authorization) {
      headers.Authorization = clientHeaders.Authorization
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = await response.json()

    res.status(response.status).json(data)
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while proxying the request' })
  }
}