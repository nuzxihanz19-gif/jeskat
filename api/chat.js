export default async function handler(req, res) {
    try {
        // Baca body JSON dari request
        const body = await new Promise(resolve => {
            let data = '';
            req.on('data', chunk => data += chunk);
            req.on('end', () => resolve(JSON.parse(data || '{}')));
        });

        const userMessage = body.message || "";

        if (!userMessage) {
            return res.status(400).json({ reply: "Pesan kosong bro." });
        }

        // Panggil Gemini lewat backend Vercel
        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: userMessage }]
                        }
                    ],
                    systemInstruction: {
                        parts: [{
                            text: "Kamu adalah Stoik Ziyad AI, asisten virtual kreatif yang santai, ringkas, dan helpful. Gaya bahasa lo gue, kadang emoji, tidak kaku. Fokus bantu ide konten, AI tools, dan teknologi."
                        }]
                    }
                })
            }
        );

        const data = await response.json();

        const reply =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "AI lagi bengong bro.";

        return res.status(200).json({ reply });

    } catch (err) {
        console.error("Backend error:", err);
        return res.status(500).json({ reply: "Server error bro." });
    }
}
