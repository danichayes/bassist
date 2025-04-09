'use client';

import { useState } from "react";
import { useCurrentTrackInfo } from "@/hooks/useCurrentTrack";
import { Button } from "@/components/ui/button";
import axios from "axios";

export default function TrackInfo({ accessToken }: { accessToken: string }) {
  const { songName, artist } = useCurrentTrackInfo(accessToken);
  const [tabData, setTabData] = useState<{ tabLinks: string[]; scale: string | null } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSuggestTabs = async () => {
    if (!songName || !artist) return;
    setLoading(true);
    try {
      const res = await axios.post("/api/suggest-bass-tab", {
        songName,
        artist,
      });
      setTabData(res.data);
    } catch (err) {
      console.error("Error suggesting tabs:", err);
      setTabData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 text-white text-center">
      <p className="text-sm">🎵 Currently Playing:</p>
      <p className="text-lg font-bold">
        {songName && artist ? `${songName} — ${artist}` : "Detecting..."}
      </p>

      <Button
        className="mt-3 bg-purple-500 hover:bg-purple-600"
        onClick={handleSuggestTabs}
        disabled={!songName || !artist || loading}
      >
        {loading ? "Searching..." : "Find Bass Tabs + Scale"}
      </Button>

      {tabData && (
        <div className="mt-4 text-left text-sm">
          <p className="font-bold">🎼 Key/Scale: {tabData.scale || "Unknown"}</p>
          <p className="font-bold mt-2">🎸 Bass Tabs:</p>
          <ul className="list-disc list-inside">
            {tabData.tabLinks.map((link, i) => (
              <li key={i}>
                <a href={link} className="underline text-blue-400" target="_blank" rel="noreferrer">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

