'use client';

import { useState } from "react";
import { useCurrentTrackInfo } from "@/hooks/useCurrentTrack";
import { Button } from "@/components/ui/button";
import axios from "axios";

export default function TrackInfo({ accessToken }: { accessToken: string }) {
  const { songName, artist } = useCurrentTrackInfo(accessToken);
  const [scale, setScale] = useState<{ scale: string | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTabs, setLoadingTabs] = useState(false);
  const [songsterrTabs, setSongsterrTabs] = useState<{ title: string; url: string }[] | null>(null);


  const handleFindKey = async () => {
    if (!songName || !artist) return;
    setLoading(true);
    try {
      const res = await axios.post("/api/find-key", {
        songName,
        artist,
      });
      setScale(res.data);
    } catch (err) {
      console.error("Error suggesting tabs:", err);
      setScale(null);
    } finally {
      setLoading(false);
    }
  };
  function searchBassTab() {
    const query = encodeURIComponent(`bass tab ${songName} ${artist} bass tab`);
    const url = `https://www.google.com/search?q=${query}`;
    window.open(url, "_blank");
  }

  return (
    <div className="mt-4 text-white text-center">
      <p className="text-sm">🎵 Currently Playing:</p>
      <p className="text-lg font-bold">
        {songName && artist ? `${songName} — ${artist}` : "Detecting..."}
      </p>

      <Button
        className="mt-3 bg-purple-500 hover:bg-purple-600"
        onClick={handleFindKey}
        disabled={!songName || !artist || loading}
      >
        {loading ? "Searching..." : "Find Scale"}
      </Button>

      {scale && (
        <div className="mt-4 text-left text-sm">
          <p className="font-bold">🎼 Key/Scale: {scale.scale || "Unknown"}</p>
        </div>
      )}
      <Button
        className="mt-4 bg-blue-400 hover:bg-blue-500 text-white"
        onClick={searchBassTab}
        disabled={!songName || !artist || loadingTabs}
      >
        {loadingTabs ? "Searching..." : "Search Bass Tabs on Google"}
      </Button>

      {songsterrTabs && (
        <div className="mt-4 text-left text-sm">
          <p className="font-bold">🎸 Bass Tabs:</p>
          {songsterrTabs.length > 0 ? (
            <ul className="list-disc list-inside">
              {songsterrTabs.map((tab, i) => (
                <li key={i}>
                  <a
                    href={tab.url}
                    className="underline text-blue-400"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {tab.title}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No tabs found on Songsterr for this track.</p>
          )}
        </div>
      )}
    </div>
  );
}

