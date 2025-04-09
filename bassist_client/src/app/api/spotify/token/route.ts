import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
    try{
        const params = new URLSearchParams();
        params.append("grant_type", "client_credentials");

        const response = await axios.post("Https://accounts.spotify.com/api/token", params, {
            headers : {
                Authorization: `Basic ${Buffer.from(
                    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
                ).toString("base64")}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        return NextResponse.json({acessToken: response.data.access_token});
    } catch (error){
        console.error("Error fetching Spotify token", error);
        return NextResponse.json({ error: "Failed to get Spotify access token"}, {status: 500});
    }
}