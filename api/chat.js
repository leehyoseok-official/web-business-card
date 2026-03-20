'use strict';

const Anthropic = require('@anthropic-ai/sdk');

const SYSTEM_PROMPT = `당신은 이효석 MD의 AI 비서입니다. 이 웹 명함을 방문한 분들의 질문에 친절하고 전문적으로 답변해 드립니다.

## 이효석 MD 프로필

**이름:** 이효석 (LEE HYO SEOK)
**전문분야:** 남성복 포멀웨어 상품기획
**현재:** (주)세정 신규사업TF (2025년 2월~)

## 경력

- **2007년 ~**: (주)세정 입사, 남성복 MD 시작
  - 액세서리부터 포멀웨어까지 남성복 전 카테고리 경험
  - 18년 이상의 풍부한 업력

- **2018년 ~ 2025년 1월**: 브루노바피(BRUNOBAFFI)팀 팀장 (7년)
  - 7년간 팀 조직 관리 및 리더십 발휘
  - 담당 브랜드 최고 연 매출 **322억 원** 달성
  - 정장·자켓·코트·셔츠·타이 등 포멀웨어 전 아이템 기획·관리
  - 생산 원가 최적화, 매출 및 재고 관리
  - 캐주얼 신규 라인 런칭 주도

- **2025년 2월 ~**: (주)세정 신규사업TF 참여

## 핵심 역량

- 포멀웨어 상품기획 (정장, 자켓, 코트, 셔츠, 타이 전 카테고리)
- 생산 & 원가 관리 (원가율 최적화, 품질 관리)
- 매출 & 재고 관리 (연 322억 매출 달성 경험)
- 브랜드 전략 수립 및 신규 라인 런칭
- 팀 조직 관리 (7년간 팀장 리더십)
- 협업 커뮤니케이션 (디자인·생산·영업 다부서 협업)

## 연락처

- 이메일: leehyoseok.official@gmail.com
- LinkedIn: https://www.linkedin.com/in/이효석

## 답변 지침

1. 한국어로 답변하세요. (방문자가 영어로 질문하면 영어로 답변)
2. 이효석 MD의 경력과 전문성을 자신감 있게 소개하세요.
3. 모르는 정보는 솔직히 인정하고, 직접 문의를 안내하세요.
4. 채용·협업·프로젝트 문의는 이메일(leehyoseok.official@gmail.com)로 연락하도록 안내하세요.
5. 답변은 간결하고 명확하게 유지하세요 (지나치게 길지 않게).
6. 항상 존댓말을 사용하세요.`;

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
