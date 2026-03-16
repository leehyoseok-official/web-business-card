'use strict';

/* ==========================================================================
   Theme Toggle
   ========================================================================== */
const html   = document.documentElement;
const toggle = document.getElementById('themeToggle');

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  toggle.setAttribute(
    'aria-label',
    theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'
  );
}

// Sync aria-label with the theme that the anti-FOUC script already set
applyTheme(html.getAttribute('data-theme') || 'light');

toggle.addEventListener('click', () => {
  applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

// Follow OS preference only when the user hasn't manually chosen
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (!localStorage.getItem('theme')) {
    applyTheme(e.matches ? 'dark' : 'light');
  }
});

/* ==========================================================================
   vCard (.vcf) Download
   ========================================================================== */
document.getElementById('vcfDownload').addEventListener('click', () => {
  /* ── Edit the fields below to match your information ── */
  const CONTACT = {
    fullName:  '이효석',
    lastName:  '이',
    firstName: '효석',
    title:     '남성복 상품기획 MD 팀장',
    org:       '(주)세정',
    email:     'leehyoseok.official@gmail.com',
    linkedin:  'https://www.linkedin.com/in/이효석',
    portfolio: '', // 포트폴리오 URL 확정 후 입력
    note:      '18년 이상 남성복 상품기획 MD로 활동해온 패션 상품기획 전문가입니다.',
  };

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${CONTACT.fullName}`,
    `N:${CONTACT.lastName};${CONTACT.firstName};;;`,
    `TITLE:${CONTACT.title}`,
    `ORG:${CONTACT.org}`,
    `EMAIL;TYPE=INTERNET,WORK:${CONTACT.email}`,
    `URL;TYPE=LinkedIn:${CONTACT.linkedin}`,
    ...(CONTACT.portfolio ? [`URL;TYPE=Portfolio:${CONTACT.portfolio}`] : []),
    `NOTE:${CONTACT.note}`,
    `REV:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    'END:VCARD',
  ];

  const blob = new Blob([lines.join('\r\n')], { type: 'text/vcard;charset=utf-8' });
  const url  = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href     = url;
  a.download = `이효석_LEE_HYO_SEOK.vcf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});
