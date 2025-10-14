import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

interface BackendUser {
  id: number;
  username: string;
  email: string;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    token?: string;
    backendUser?: BackendUser;
  }
  interface JWT {
    id?: string;
    token?: string;
    backendUser?: BackendUser;
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        const response = await fetch("http://localhost:8080/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            provider_id: user.id,
          }),
        });
        if (!response.ok) {
          console.error("Failed to authenticate with backend");
          return false;
        }
        const data = await response.json();
        (user as unknown as { token: string; backendUser: BackendUser }).token =
          data.token;
        (
          user as unknown as { token: string; backendUser: BackendUser }
        ).backendUser = data.user as BackendUser;
      } catch (error) {
        console.error("Error calling backend:", error);
        return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.token = (user as unknown as { token: string }).token;
        token.backendUser = (
          user as unknown as { backendUser: BackendUser }
        ).backendUser;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (
          session as unknown as { token: string; backendUser: BackendUser }
        ).token = token.token as string;
        (
          session as unknown as { token: string; backendUser: BackendUser }
        ).backendUser = token.backendUser as BackendUser;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
