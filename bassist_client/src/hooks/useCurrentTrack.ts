import { useEffect, useState } from "react";
import axios from "axios";

export function useCurrentTrackInfo(accessToken: string | null) {
  const [songName, setSongName] = useState<string | null>(null);
  const [artist, setArtist] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    const fetchTrakInfo = async () => {
      try {
        const trackRes = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const trackId = trackRes.data?.item?.id;
        if (!trackId) return;

        const trackName = trackRes.data?.item?.name;
        const trackArtist = trackRes.data?.item?.artists?.[0]?.name;

        setSongName(trackName);
        setArtist(trackArtist)
      } catch (err) {
        console.error("Failed to fetch track name or artist:", err);
      }
    };

    fetchTrakInfo();
    const interval = setInterval(fetchTrakInfo, 5000);
    return () => clearInterval(interval);
  }, [accessToken]);

  return {songName, artist};
}
