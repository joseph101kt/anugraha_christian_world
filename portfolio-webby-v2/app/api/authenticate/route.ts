// app/api/authenticate/route.js
import { NextResponse } from 'next/server';

export async function POST(request: { json: () => PromiseLike<{ password: unknown; }> | { password: unknown; }; }) {
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Compare the user-provided password with the server-side password.
  if (password === adminPassword) {
    // In a real application, you'd generate a session token or cookie here.
    return NextResponse.json({ authenticated: true });
  } else {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}