// Vercel Serverless Function - MeuSuno + Mureka
// Coloque sua chave no Vercel em: Settings > Environment Variables > MUREKA_API_KEY

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  const apiKey = process.env.MUREKA_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'MUREKA_API_KEY não configurada no Vercel' });

  const { title, lyrics, style, voice, bpm, instruments, prompt, model } = req.body || {};
  if (!lyrics) return res.status(400).json({ error: 'Letra é obrigatória' });

  const musicPrompt = [
    `Style: ${style || 'Worship intimista'}`,
    `Voice: ${voice || 'Masculina'}`,
    `Tempo: ${bpm || 74} BPM`,
    `Instruments: ${(instruments || []).join(', ')}`,
    prompt ? `Direction: ${prompt}` : '',
    `Title: ${title || 'Minha música'}`
  ].filter(Boolean).join('. ');

  try {
    const genRes = await fetch('https://api.mureka.ai/v1/song/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'mureka-v6',
        prompt: musicPrompt,
        lyrics: lyrics,
      })
    });

    const genData = await genRes.json();
    if (!genRes.ok) {
      return res.status(genRes.status).json({ error: 'Erro na Mureka', details: genData });
    }
    return res.status(200).json(genData);
  } catch (e) {
    return res.status(500).json({ error: 'Erro interno', details: String(e) });
  }
}
