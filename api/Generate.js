export default async function handler(req, res) {
  // Handle CORS headers and preflight requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { topic, field } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server configuration error: GEMINI_API_KEY missing' });
    }

    const prompt = `ចូលតួជាអ្នកជំនាញស្រាវជ្រាវ។ សូមរៀបចំគ្រោងការស្រាវជ្រាវ (Research Proposal) ផ្លូវការជាភាសាខ្មែរ លើប្រធានបទ៖ "${topic}" ក្នុងវិស័យ "${field || 'ការងារសង្គម និងវិទ្យាសាស្ត្រសង្គម'}"។ 
    គ្រោងការត្រូវមានចំណុចសំខាន់ៗដូចជា៖
    1. ចំណងជើងស្រាវជ្រាវ
    2. ផ្ទាំងទស្សនីយភាព និងបញ្ហាស្រាវជ្រាវ (Background & Statement of the Problem)
    3. បំណងនៃការសិក្សា (Research Objectives)
    4. សំណួរស្រាវជ្រាវ (Research Questions)
    5. វិធីសាស្ត្រស្រាវជ្រាវ (Research Methodology)`;

    // Updated API call to v1beta endpoint with gemini-2.5-flash
    const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await googleResponse.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.status(200).json({ text: resultText });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}