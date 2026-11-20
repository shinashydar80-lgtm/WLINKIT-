
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

let genAI;

async function getAI() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing.");
  }

  if (!genAI) {
    const { GoogleGenAI } = await import("@google/genai");
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
  }

  return genAI;
}

async function generateWebsite(prompt, existingHTML = "") {
  const ai = await getAI();

  const instruction = existingHTML
    ? `Modify this existing website according to the user's instruction.
Preserve its existing design and features where possible.

USER INSTRUCTION:
${prompt}

EXISTING WEBSITE:
${existingHTML}`
    : `Create a complete, polished, responsive website from this description.

WEBSITE DESCRIPTION:
${prompt}

Design requirements:
- Premium professional visual design.
- Responsive on mobile and desktop.
- Complete HTML document with embedded CSS.
- Include useful website sections and realistic sample content.
- Use accessible HTML.
- Make buttons and navigation meaningful.
- Do not include external API keys or private credentials.
- Return only the complete HTML document.`;

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
    contents: instruction
  });

  let html = response.text || "";
  html = html.replace(/^```(?:html)?\s*/i, "");
  html = html.replace(/\s*```$/i, "");
  html = html.trim();

  if (!html.toLowerCase().includes("<html")) {
    throw new Error("The AI did not return a valid HTML website. Please try again.");
  }

  if (html.length > 300000) {
    throw new Error("The generated website is too large.");
  }

  return html;
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    app: "WLINKIT",
    aiConnected: Boolean(process.env.GEMINI_API_KEY)
  });
});

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, projectName, siteType, theme } = req.body || {};

    if (typeof prompt !== "string" || prompt.trim().length < 5) {
      return res.status(400).json({
        ok: false,
        error: "Please describe the website you want to build."
      });
    }

    if (prompt.length > 4000) {
      return res.status(400).json({
        ok: false,
        error: "Your prompt is too long. Please shorten it."
      });
    }

    const fullPrompt = `
Website name: ${String(projectName || "My Website").slice(0, 100)}
Website type: ${String(siteType || "General").slice(0, 100)}
Design theme: ${String(theme || "Professional").slice(0, 100)}

${prompt.trim()}
`;

    const html = await generateWebsite(fullPrompt);

    res.json({
      ok: true,
      html,
      title: projectName || "WLINKIT Website"
    });
  } catch (error) {
    console.error("Website generation error:", error.message);

    res.status(500).json({
      ok: false,
      error: error.message || "Website generation failed."
    });
  }
});

app.post("/api/edit", async (req, res) => {
  try {
    const { html, instruction } = req.body || {};

    if (
      typeof html !== "string" ||
      html.length < 20 ||
      html.length > 300000
    ) {
      return res.status(400).json({
        ok: false,
        error: "The website content is missing or too large."
      });
    }

    if (
      typeof instruction !== "string" ||
      instruction.trim().length < 3 ||
      instruction.length > 2000
    ) {
      return res.status(400).json({
        ok: false,
        error: "Please enter a clear editing instruction."
      });
    }

    const updatedHTML = await generateWebsite(
      instruction.trim(),
      html
    );

    res.json({
      ok: true,
      html: updatedHTML
    });
  } catch (error) {
    console.error("Website editing error:", error.message);

    res.status(500).json({
      ok: false,
      error: error.message || "Website editing failed."
    });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`WLINKIT listening on port ${PORT}`);
});
