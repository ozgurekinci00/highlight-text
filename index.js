const axios = require("axios");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(cors());
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.post("/highlight", async (req, res) => {
  const { text } = req.body;
  console.log("CONTENT HIGHLIGHT", req.body);
  if (!text.trim()) {
    console.log("Empty or whitespace-only text");
    res.status(400).json({ message: "Empty or whitespace-only text" });
    return;
  }
  try {
    const result = await generateSentences(text);
    console.log("RESULT", result);
    res.json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const generateSentences = async (text) => {
  console.log("TEXT INPUT", text);
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Analyze the text below and extract the most important sentences that capture the main ideas and key points. Be concise and only pick the most relevant sentences. Respond with a JSON object that has a 'sentences' property containing an array of the extracted sentences. \n\n Input text: \n${text}`,
          },
        ],
      },
      {
        headers: {
          Authorization:
            `Bearer ${YOUR_OPENAI_KEY}`,
        },
      }
    );
    console.log("RESPONSE DATAaa", response.data);
    console.log("MESSAGES", response.data.choices[0].message);
    return response.data.choices[0].message.content;
  } catch (err) {
    console.log("ERRORRR???");
    console.error(err);
  }
};