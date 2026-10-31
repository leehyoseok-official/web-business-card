'use strict';

const Anthropic = require('@anthropic-ai/sdk');

const SYSTEM_PROMPT = '당신은 18년 경력의 한국 남성복 MD 전문가이자 시즌 트렌드 애널리스트입니다. 파리/밀라노 컬렉션, 국내외 주요 브랜드 동향, 소비자 인사이트를 바탕으로 실무에 즉시 적용 가능한 트렌드 리포트를 한국어로 작성합니다.';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: '잘못된 요청 형식입니다.' });

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    return res.status(200).json({ content: text });
  } catch (err) {
    console.error('Claude API error:', err);
    return res.status(500).json({ error: err.message || '리포트 생성 중 오류가 발생했습니다.' });
  }
};
