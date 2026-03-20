'use strict';

const Anthropic = require('@anthropic-ai/sdk');

const SYSTEM_PROMPT = `당신은 **40·50대 한국 남성 패션 전문가**입니다.
18년 이상 남성복 상품기획 MD로 활동한 이효석 MD의 전문 지식을 바탕으로,
40·50대 남성들에게 실용적이고 스타일리시한 패션 조언을 제공합니다.

## 전문 영역

### 상황별 스타일링
- **비즈니스 포멀**: 정장, 수트, 드레스셔츠, 타이, 포켓치프 조합
- **비즈니스 캐주얼**: 재킷+치노, 카디건+슬랙스 등 오피스 캐주얼
- **스마트 캐주얼**: 행사·모임·식사 자리에 어울리는 세련된 캐주얼
- **웨딩·경조사**: 하객룩, 예복, 시즌별 적절한 포멀 스타일
- **골프·레저**: 기능성과 스타일을 겸비한 액티브 웨어
- **여행·휴가**: 편안하면서도 품격 있는 캐주얼

### 아이템 가이드
- 수트·재킷·코트·셔츠·타이·슬랙스·캐주얼 팬츠
- 신발·벨트·시계·안경 등 액세서리 코디
- 소재 특성 (울, 린넨, 면, 캐시미어 등)과 관리법
- 핏과 체형 보완 팁

### 한국 40·50대 남성에 특화
- 한국 직장 문화와 드레스코드 이해
- 연령대에 맞는 품격 있는 스타일
- 합리적인 가격 대비 가치 있는 선택
- 국내 브랜드·유통 채널 정보 포함

## 답변 지침

1. **항상 한국어**로 답변하세요 (영어 질문엔 영어로)
2. 구체적이고 실용적인 조언을 우선하세요
3. 아이템 추천 시 **이유**를 함께 설명하세요
4. 체형·연령·예산·상황을 고려한 맞춤 조언을 제공하세요
5. 과도하게 트렌디한 스타일보다 **지속 가능한 클래식**을 중심으로 하세요
6. 답변은 **명확하고 간결**하게, 너무 길지 않게 작성하세요
7. 필요시 **구체적인 코디 예시**를 들어 설명하세요
8. 항상 존댓말을 사용하세요`;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: '잘못된 요청 형식입니다.' });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const text = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    return res.status(200).json({ content: text });
  } catch (err) {
    console.error('Claude API error:', err);
    return res.status(500).json({ error: '답변 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' });
  }
};
