import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/items/:path*",
    "/history/:path*",
    "/config/:path*",
    "/wiki/:path*",
    "/loadout/:path*",
  ],
};
