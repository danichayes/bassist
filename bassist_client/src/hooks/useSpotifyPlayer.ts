"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: typeof Spotify;
  }
}

export default function useSpotifyPlayer(accessToken: string | null) {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    if (!accessToken) return;

    // Ensure the SDK is not already loaded
    if (!window.Spotify) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      script.onload = () => {
        window.onSpotifyWebPlaybackSDKReady?.();
      };
      document.body.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: "Bassist Web Player",
        getOAuthToken: (cb) => cb(accessToken),
        volume: 0.5,
      });

      if (!spotifyPlayer) return;

      setPlayer(spotifyPlayer);

      spotifyPlayer.addListener("ready", ({ device_id }) => {
        console.log("Spotify Player Ready:", device_id);
        setDeviceId(device_id);
      });

      spotifyPlayer.addListener("player_state_changed", (state) => {
        setIsPlaying(state ? !state.paused : false);
      });

      spotifyPlayer
        .connect()
        .catch((err) => console.error("Spotify Player connection error:", err));
    };

    return () => {
      player?.disconnect();
    };
  }, [accessToken]);

  return { player, deviceId, isPlaying };
}





