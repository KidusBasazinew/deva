import { NextRequest, NextResponse } from "next/server";
import checkAuth from "./app/actions/checkAuth";

export async function middleware(request: NextRequest) {
  const { isAuthenticated } = await checkAuth();

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/deposit", "/admin/approve", "/admin/withdrawals", "/dashboard"],
};
