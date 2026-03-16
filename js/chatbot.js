'use strict';

/* ==========================================================================
   Chatbot — 이효석 MD AI 비서
   ========================================================================== */

const CHATBOT_API = '/.netlify/functions/chat';

/* ---------- State -------------------------------------------------------- */
let isOpen = false;
let isLoading = false;
const conversationHistory = [];

/* ---------- DOM refs (assigned after DOMContentLoaded) ------------------ */
let chatToggleBtn, chatPanel, chatMessages, chatForm, chatInput, chatSendBtn;

/* ---------- Init --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  injectHTML();

  chatToggleBtn = document.getElementById('chatToggleBtn');
  chatPanel     = document.getElementById('chatPanel');
  chatMessages  = document.getElementById('chatMessages');
  chatForm      = document.getElementById('chatForm');
  chatInput     = document.getElementById('chatInput');
  chatSendBtn   = document.getElementById('chatSendBtn');

  chatToggleBtn.addEventListener('click', toggleChat);
  document.getElementById('chatCloseBtn').addEventListener('click', closeChat);
  chatForm.addEventListener('submit', handleSubmit);

  chatInput.addEventListener('input', () => {
    chatSendBtn.disabled = chatInput.value.trim() === '' || isLoading;
  });

  // Close on backdrop click (outside panel)
  document.addEventListener('click', (e) => {
    if (isOpen && !chatPanel.contains(e.target) && !chatToggleBtn.contains(e.target)) {
      closeChat();
    }
  });

  // Keyboard: Escape closes chat
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeChat();
  });
});

/* ---------- HTML injection ---------------------------------------------- */
function injectHTML() {
  const wrapper = document.createElement('div');
  wrapper.id = 'chatbotWrapper';
  wrapper.innerHTML = `
    <!-- Toggle button -->
    <button id="chatToggleBtn" class="chat-toggle-btn" aria-label="AI 비서와 대화하기">
      <svg class="chat-icon-open" xmlns="http://www.w3.org/2000/svg"
           viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <svg class="chat-icon-close" xmlns="http://www.w3.org/2000/svg"
           viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>

    <!-- Chat panel -->
    <div id="chatPanel" class="chat-panel" role="dialog"
         aria-label="이효석 MD AI 비서" aria-hidden="true">
      <header class="chat-header">
        <div class="chat-header-info">
          <div class="chat-avatar-dot" aria-hidden="true">이</div>
          <div>
            <p class="chat-header-name">이효석 MD AI 비서</p>
            <p class="chat-header-sub">무엇이든 물어보세요</p>
          </div>
        </div>
        <button id="chatCloseBtn" class="chat-close-btn" aria-label="채팅 닫기">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </header>

      <div id="chatMessages" class="chat-messages" aria-live="polite" aria-atomic="false">
        <!-- Welcome message -->
        <div class="chat-msg chat-msg--bot">
          <div class="chat-bubble">
            안녕하세요! 👋<br>
            이효석 MD의 AI 비서입니다.<br>
            경력, 전문분야, 협업 등 궁금한 점을 편하게 물어보세요.
          </div>
        </div>
      </div>

      <form id="chatForm" class="chat-form" novalidate>
        <input
          id="chatInput"
          class="chat-input"
          type="text"
          placeholder="메시지를 입력하세요..."
          autocomplete="off"
          maxlength="500"
          aria-label="메시지 입력"
        >
        <button id="chatSendBtn" class="chat-send-btn" type="submit"
                disabled aria-label="전송">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>
    </div>
  `;
  document.body.appendChild(wrapper);
}

/* ---------- Open / Close ------------------------------------------------- */
function toggleChat() {
  isOpen ? closeChat() : openChat();
}

function openChat() {
  isOpen = true;
  chatPanel.classList.add('chat-panel--open');
  chatPanel.setAttribute('aria-hidden', 'false');
  chatToggleBtn.classList.add('chat-toggle-btn--open');
  chatToggleBtn.setAttribute('aria-label', '채팅 닫기');
  chatInput.focus();
}

function closeChat() {
  isOpen = false;
  chatPanel.classList.remove('chat-panel--open');
  chatPanel.setAttribute('aria-hidden', 'true');
  chatToggleBtn.classList.remove('chat-toggle-btn--open');
  chatToggleBtn.setAttribute('aria-label', 'AI 비서와 대화하기');
}

/* ---------- Submit ------------------------------------------------------- */
async function handleSubmit(e) {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text || isLoading) return;

  chatInput.value = '';
  chatSendBtn.disabled = true;

  appendMessage('user', text);
  conversationHistory.push({ role: 'user', content: text });

  setLoading(true);
  const loadingEl = appendTypingIndicator();

  try {
    const res = await fetch(CHATBOT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversationHistory }),
    });

    const data = await res.json();

    loadingEl.remove();

    if (!res.ok || data.error) {
      appendMessage('bot', data.error || '오류가 발생했습니다. 다시 시도해 주세요.');
    } else {
      appendMessage('bot', data.content);
      conversationHistory.push({ role: 'assistant', content: data.content });
    }
  } catch {
    loadingEl.remove();
    appendMessage('bot', '네트워크 오류가 발생했습니다. 연결을 확인하고 다시 시도해 주세요.');
  } finally {
    setLoading(false);
  }
}

/* ---------- Helpers ------------------------------------------------------ */
function appendMessage(role, text) {
  const div = document.createElement('div');
  div.className = `chat-msg chat-msg--${role === 'user' ? 'user' : 'bot'}`;

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.textContent = text;

  div.appendChild(bubble);
  chatMessages.appendChild(div);
  scrollToBottom();
  return div;
}

function appendTypingIndicator() {
  const div = document.createElement('div');
  div.className = 'chat-msg chat-msg--bot';
  div.innerHTML = `
    <div class="chat-bubble chat-bubble--typing" aria-label="답변 생성 중">
      <span></span><span></span><span></span>
    </div>
  `;
  chatMessages.appendChild(div);
  scrollToBottom();
  return div;
}

function setLoading(state) {
  isLoading = state;
  chatInput.disabled = state;
  chatSendBtn.disabled = state;
}

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
