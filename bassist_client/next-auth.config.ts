// import NextAuth from "next-auth";
// import SpotifyProvider from "next-auth/providers/spotify";
// import { JWT } from "next-auth/jwt";
// import { Account } from "next-auth";
// import { Session } from "next-auth";

// export const authOptions = {
//   providers: [
//     SpotifyProvider({
//       clientId: process.env.SPOTIFY_CLIENT_ID!,
//       clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
//       authorization: {
//         url: "https://accounts.spotify.com/authorize",
//         params: {
//           scope:
//             "user-read-private user-read-email user-modify-playback-state streaming user-read-playback-state",
//         },
//       },
//     }),
//   ],
//   secret: process.env.NEXTAUTH_SECRET,
//   callbacks: {
//     async jwt({ token, account }: { token: JWT; account?: Account | null }) {
//       if (account) {
//         token.accessToken = account.access_token;
//       }
//       return token;
//     },
//     async session({ session, token }: { session: Session; token: JWT }) {
//       session.accessToken = token.accessToken;
//       return session;
//     },
//   },
// };


import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import type { JWT } from "next-auth/jwt";
import type { Account, Session } from "next-auth";
import axios from "axios";

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: token.refreshToken as string,
      client_id: process.env.SPOTIFY_CLIENT_ID!,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
    });

    const response = await axios.post("https://accounts.spotify.com/api/token", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const refreshed = response.data;

    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpires: Date.now() + refreshed.expires_in * 1000, // expires_in is in seconds
      refreshToken: refreshed.refresh_token ?? token.refreshToken, // use new if provided
    };
  } catch (err) {
    console.error("Failed to refresh Spotify access token", err);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        url: "https://accounts.spotify.com/authorize",
        params: {
          scope:
            "user-read-private user-read-email user-modify-playback-state streaming user-read-playback-state user-read-currently-playing",
          prompt: "conset",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }: { token: JWT; account?: Account | null }) {
      // Initial login
      if (account) {
        const customAccount = account as Account & {
          access_token: string;
          refresh_token: string;
          expires_in: number;
        };


        return {
          accessToken: customAccount.access_token,
          accessTokenExpires: Date.now() + customAccount.expires_in * 1000,
          refreshToken: customAccount.refresh_token,
        };
      }

      // If token is still valid, return it
      if (typeof token.accessTokenExpires === "number" && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Otherwise, refresh it
      return await refreshAccessToken(token);
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
};
