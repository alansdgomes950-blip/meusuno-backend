// Vercel Serverless Function - MeuSuno + Mureka
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  const apiKey = process.env.MUREKA_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'MUREKA_API_KEY não configurada no Vercel' });

  const body = req.body || {};
  // aceita tanto português quanto inglês
  const title = body.title || body.título || body.titulo || 'Minha música';
  const lyrics = body.lyrics || body.letra;
  const style = body.style || body.estilo || 'Worship intimista';
  const voice = body.voice || body.voz || 'Feminina';
  const bpm = body.bpm || 72;
  const instruments = body.instruments || body.instrumentos || [];
  const promptExtra = body.prompt || '';
  const model = body.model || 'mureka-7';

  if (!lyrics) return res.status(400).json({ error: 'Letra é obrigatória' });

  const musicPrompt = [
    `Style: ${style}`,
    `Voice: ${voice}`,
    `Tempo: ${bpm} BPM`,
    `Instruments: ${Array.isArray(instruments) ? instruments.join(', ') : instruments}`,
    promptExtra ? `Direction: ${promptExtra}` : '',
    `Title: ${title}`
  ].filter(Boolean).join('. ').slice(0, 1024);

  try {
    const genRes = await fetch('https://api.mureka.ai/v1/song/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lyrics: String(lyrics).slice(0, 5000),
        prompt: musicPrompt,
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
