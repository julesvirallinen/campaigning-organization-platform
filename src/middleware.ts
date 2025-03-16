import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Check if basic auth is enabled
  const username = process.env.BASIC_AUTH_USERNAME;
  const password = process.env.BASIC_AUTH_PASSWORD;

  // If both username and password are set, enable basic auth
  if (username && password) {
    const basicAuth = request.headers.get("authorization");

    if (basicAuth) {
      const authValue = basicAuth.split(" ")[1];
      const [authUser, authPassword] = atob(authValue).split(":");

      if (authUser === username && authPassword === password) {
        return NextResponse.next();
      }
    }

    // Return response that requires authentication
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    });
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
