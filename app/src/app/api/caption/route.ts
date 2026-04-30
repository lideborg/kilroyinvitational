export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return Response.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Strip data URL prefix if present to get raw base64
    const base64Data = image.includes(",") ? image.split(",")[1] : image;

    // Determine mime type from data URL or default to jpeg
    let mimeType = "image/jpeg";
    const mimeMatch = image.match(/^data:(image\/\w+);/);
    if (mimeMatch) {
      mimeType = mimeMatch[1];
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "You're the official photographer for a bachelor party golf trip called The Kilroy Invitational in Florida. Generate a short, funny caption (max 10 words) for this photo. Be witty, bro-ish, and golf-related. Just return the caption text, nothing else.",
                },
                {
                  inlineData: {
                    mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      return Response.json(
        { error: "Failed to generate caption" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const caption =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "No caption generated";

    return Response.json({ caption });
  } catch (error) {
    console.error("Caption API error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
