const Groq = require("groq-sdk");
require("dotenv").config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
    try {
        const completion = await groq.chat.completions.create({
            model: "meta-llama/llama-3.2-11b-vision-instruct",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "What is in this image?" },
                        { type: "image_url", image_url: { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gnome-face-smile.svg/1200px-Gnome-face-smile.svg.png" } },
                    ],
                },
            ],
        });
        console.log(JSON.stringify(completion, null, 2));
    } catch (err) {
        console.error("ERROR TYPE:", err.constructor.name);
        console.error("ERROR MESSAGE:", err.message);
        if (err.response) {
            console.error("RESPONSE DATA:", JSON.stringify(err.response.data, null, 2));
        } else {
            console.error("NO RESPONSE DATA, ERROR OBJ:", JSON.stringify(err, null, 2));
        }
    }
}

test();
