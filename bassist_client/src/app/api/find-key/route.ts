import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { songName, artist } = await req.json();

    if (!songName || !artist) {
      return NextResponse.json({ error: "Missing song name or artist" }, { status: 400 });
    }

    const prompt = `Find the key and scale of the song \"${songName}\" by \"${artist}\" Respond in this exact JSON format:
{
  \"scale\": \"<scale>\"
}`;

    const chatResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const rawText = chatResponse.choices[0].message.content;
    let json;
    try {
      json = JSON.parse(rawText || "{}");
    } catch (err) {
      console.error("Failed to parse OpenAI response as JSON", rawText);
      return NextResponse.json({ error: "Invalid JSON from OpenAI" }, { status: 500 });
    }

    return NextResponse.json(json);
  } catch (err) {
    console.error("Error in /api/find-key:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}