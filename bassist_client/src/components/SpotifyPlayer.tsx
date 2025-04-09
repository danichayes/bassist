"use client";

import useSpotifyPlayer from "@/hooks/useSpotifyPlayer";
import axios from "axios";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn, signOut, useSession } from "next-auth/react";
import TrackScale from "./TrackInfo";

export default function SpotifyPlayer() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken ?? null;
  const { player, deviceId, isPlaying } = useSpotifyPlayer(accessToken);

  if (!session) {
    return (
      <Card className="w-80 bg-gray-900 text-white text-center p-4">
        <CardHeader>
          <CardTitle>Spotify Login</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">You're not logged in.</p>
          <Button
            onClick={() => signIn("spotify")}
            className="bg-green-500 hover:bg-green-600"
          >
            Log in with Spotify
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handlePlayPause = async () => {
    if (!accessToken || !deviceId) return;

    const endpoint = isPlaying
      ? "https://api.spotify.com/v1/me/player/pause"
      : `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`;

    try {
      await axios.put(
        endpoint,
        {}, // required even for pause
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } catch (error) {
      console.error("Error controlling playback: ", error);
    }
  };

  return (
    <Card className="w-80 bg-gray-900 text-white text-center">
      <CardHeader>
        <CardTitle> Bassist </CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handlePlayPause}
          className="mt-3 bg-green-500 hover:bg-green-600"
        >
          {isPlaying ? "Pause" : "Play"}
        </Button>
        {accessToken && <TrackScale accessToken={accessToken} />}

        <Button
          onClick={() => signOut()}
          className="mt-3 bg-red-500 hover:bg-red-600"
        >
        Log Out
        </Button>
      </CardContent>
    </Card>
  );
}
