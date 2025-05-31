import { type NextRequest, NextResponse } from "next/server"

// Utility functions remain the same
function buildApiUrl(route: string[], search: string): string {
  const baseUrl = process.env.API_URL || "http://localhost:5000"
  const joinedRoute = route?.join("/") || ""
  return `${baseUrl}/api/${joinedRoute}${search}`
}

function buildHeaders(request: NextRequest): Headers {
  const headers = new Headers(request.headers)
  return headers
}

async function parseJsonResponse(response: Response) {
  try {
    return await response.json()
  } catch {
    return { message: "Non-JSON response" }
  }
}

// 💡 Await the `context` param and then access `params`
export async function GET(request: NextRequest, context: Promise<{ params: { route?: string[] } }>) {
  const { params } = await context
  const url = buildApiUrl(params?.route || [], request.nextUrl.search)
  const headers = buildHeaders(request)

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
    })
    const data = await parseJsonResponse(response)
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("API proxy GET error:", error)
    return NextResponse.json({ error: "Failed to fetch from API" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, context: Promise<{ params: { route?: string[] } }>) {
  const { params } = await context
  const url = buildApiUrl(params?.route || [], "")
  const headers = buildHeaders(request)
  headers.set("Content-Type", "application/json")

  const body = await request.json()

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })
    const data = await parseJsonResponse(response)
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("API proxy POST error:", error)
    return NextResponse.json({ error: "Failed to post to API" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: Promise<{ params: { route?: string[] } }>) {
  const { params } = await context
  const url = buildApiUrl(params?.route || [], "")
  const headers = buildHeaders(request)
  headers.set("Content-Type", "application/json")

  const body = await request.json()

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    })
    const data = await parseJsonResponse(response)
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("API proxy PUT error:", error)
    return NextResponse.json({ error: "Failed to put to API" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: Promise<{ params: { route?: string[] } }>) {
  const { params } = await context
  const url = buildApiUrl(params?.route || [], "")
  const headers = buildHeaders(request)

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers,
    })
    const data = await parseJsonResponse(response)
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("API proxy DELETE error:", error)
    return NextResponse.json({ error: "Failed to delete from API" }, { status: 500 })
  }
}
