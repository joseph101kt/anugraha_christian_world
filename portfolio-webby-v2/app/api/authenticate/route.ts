// app/api/authenticate/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { password } = await request.json() as { password: string }
  const adminPassword = process.env.ADMIN_PASSWORD

  // Compare the user-provided password with the server-side password
  if (password === adminPassword) {
    // Normally, you'd set a session cookie or token here
    return NextResponse.json({ authenticated: true })
  }

  return NextResponse.json({ authenticated: false }, { status: 401 })
}
