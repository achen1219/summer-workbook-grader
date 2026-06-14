export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Use POST." });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    response.status(500).json({ error: "OPENAI_API_KEY is not configured." });
    return;
  }

  try {
    const body = await readJson(request);
    const { imageDataUrl, setName, answerKey } = body;

    if (!imageDataUrl || !imageDataUrl.startsWith("data:image/")) {
      response.status(400).json({ error: "Upload a JPG, PNG, WEBP, or GIF image." });
      return;
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_VISION_MODEL || "gpt-5.4-mini",
        input: [
          {
            role: "system",
            content: "You grade elementary workbook pages from photos. Extract only visible student answers. Return JSON only. Mark unclear handwriting or problem order as uncertain, not wrong."
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: JSON.stringify({
                  task: "Extract student answers and compare to the answer key.",
                  workbook_set: setName || "Unknown set",
                  answer_key: answerKey || [],
                  required_json_shape: {
                    page_title: "string",
                    answers: [{ number: 1, expected: "string", student_answer: "string", status: "correct|incorrect|uncertain", confidence: 0.9 }],
                    correct_count: 0,
                    incorrect_count: 0,
                    uncertain_items: [1],
                    parent_note: "short summary"
                  }
                })
              },
              { type: "input_image", image_url: imageDataUrl, detail: "high" }
            ]
          }
        ],
        text: { format: { type: "json_object" } },
        max_output_tokens: 1800
      })
    });

    const data = await openaiResponse.json();
    if (!openaiResponse.ok) {
      response.status(openaiResponse.status).json({ error: data.error?.message || "OpenAI request failed." });
      return;
    }

    response.status(200).json(parseModelJson(data.output_text));
  } catch (error) {
    response.status(500).json({ error: error.message || "Unable to grade page." });
  }
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 12 * 1024 * 1024) {
        reject(new Error("Image is too large. Try taking a smaller photo."));
        request.destroy();
      }
    });
    request.on("end", () => {
      try { resolve(JSON.parse(raw || "{}")); }
      catch { reject(new Error("Invalid JSON request.")); }
    });
    request.on("error", reject);
  });
}

function parseModelJson(text) {
  try { return JSON.parse(text || "{}"); }
  catch {
    return { page_title: "Review needed", answers: [], correct_count: 0, incorrect_count: 0, uncertain_items: [], parent_note: text || "The model did not return valid JSON." };
  }
}
