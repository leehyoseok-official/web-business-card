'use strict';

const Anthropic = require('@anthropic-ai/sdk');

const SYSTEM_PROMPT = '당신은 18년 경력의 한국 남성복 MD 전문가이자 가격 전략 컨설턴트입니다. 백화점, 온라인, 아울렛 채널의 마진 구조를 정확히 알고 있으며, 실무에 즉시 적용 가능한 가격 전략을 한국어로 작성합니다. 구체적인 수치와 계산 근거를 포함하세요.';

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
    return res.status(500).json({ error: err.message || '분석 중 오류가 발생했습니다.' });
  }
};
