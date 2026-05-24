require('dotenv').config();
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getSummary(text, language = 'English') {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `Summarize the following webpage content in 5 clear bullet points. 
                  Always respond in ${language} language only.`
      },
      {
        role: 'user',
        content: text
      }
    ],
    max_tokens: 500
  });
  return response.choices[0].message.content;
}

module.exports = { getSummary };