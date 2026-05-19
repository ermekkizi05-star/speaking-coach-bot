import express from "express";
import Anthropic from "@anthropic-ai/sdk";

const app = express();
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>AI Speaking Coach</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style>
:root {
  --bg: #f7f9fc; --surface: #ffffff; --surface2: #f0f4f8;
  --primary: #0D9E75; --primary-light: #E1F5EE; --primary-dark: #0a7d5e;
  --text: #1a2332; --text2: #5a6a7e; --text3: #9aaabb;
  --border: rgba(0,0,0,0.08); --radius: 16px; --radius-sm: 10px;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0f1923; --surface: #1a2535; --surface2: #222f42;
    --text: #e8f0fa; --text2: #8899b0; --text3: #4a5a6e;
    --border: rgba(255,255,255,0.07);
  }
}
* { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
html, body { height: 100%; overflow: hidden; }
body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: var(--bg); color: var(--text); font-size: 15px; }
.app { display: flex; flex-direction: column; height: 100vh; height: 100dvh; }
.header { padding: 14px 18px 10px; background: var(--surface); border-bottom: 0.5px solid var(--border); flex-shrink: 0; }
.header-row { display: flex; align-items: center; gap: 10px; }
.logo { width: 34px; height: 34px; border-radius: 10px; background: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; }
.htitle { font-size: 16px; font-weight: 700; }
.hsub { font-size: 11px; color: var(--text2); }
.screens { flex: 1; overflow: hidden; position: relative; min-height: 0; }
.screen { position: absolute; inset: 0; overflow-y: auto; padding: 14px; display: none; }
.screen.active { display: block; }
.screen-chat { position: absolute; inset: 0; display: none; flex-direction: column; padding: 14px; min-height: 0; }
.screen-chat.active { display: flex; }
.nav { display: flex; background: var(--surface); border-top: 0.5px solid var(--border); flex-shrink: 0; }
.nav-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 8px 4px 10px; border: none; background: transparent; color: var(--text3); font-size: 10px; font-weight: 600; cursor: pointer; }
.nav-btn.active { color: var(--primary); }
.nav-btn svg { width: 22px; height: 22px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.slabel { font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }
.topic-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
.topic-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--radius); padding: 14px 12px; cursor: pointer; transition: all 0.15s; position: relative; }
.topic-card.sel { border-color: var(--primary); background: var(--primary-light); }
.tc-check { position: absolute; top: 8px; right: 8px; width: 18px; height: 18px; border-radius: 50%; background: var(--primary); display: none; align-items: center; justify-content: center; }
.topic-card.sel .tc-check { display: flex; }
.tc-check svg { width: 10px; height: 10px; stroke: white; fill: none; stroke-width: 3; }
.tc-emoji { font-size: 26px; margin-bottom: 6px; display: block; }
.tc-name { font-size: 12px; font-weight: 700; color: var(--text); }
.tc-level { font-size: 10px; color: var(--text2); margin-top: 2px; }
.start-btn { width: 100%; padding: 15px; background: var(--primary); color: white; border: none; border-radius: var(--radius); font-size: 15px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 16px rgba(13,158,117,0.3); display: flex; align-items: center; justify-content: center; gap: 8px; }
.start-btn:disabled { background: var(--text3); box-shadow: none; }
.chat-topbar { background: var(--surface); border: 0.5px solid var(--border); border-radius: var(--radius-sm); padding: 9px 13px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; flex-shrink: 0; }
.ct-name { font-size: 13px; font-weight: 700; }
.ct-count { font-size: 11px; color: var(--text2); background: var(--surface2); padding: 2px 9px; border-radius: 20px; }
.chat-msgs { flex: 1; overflow-y: scroll; margin-bottom: 10px; scroll-behavior: smooth; min-height: 0; }
.msg { display: flex; gap: 7px; margin-bottom: 12px; }
.msg-user { flex-direction: row-reverse; }
.av { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; }
.av-ai { background: var(--primary-light); color: var(--primary-dark); }
.av-me { background: #EEF2FF; color: #4338ca; }
.bubble { max-width: 83%; padding: 10px 13px; font-size: 14px; line-height: 1.5; border-radius: 18px; }
.b-ai { background: var(--surface); border: 0.5px solid var(--border); color: var(--text); border-radius: 4px 18px 18px 18px; }
.b-me { background: var(--primary); color: white; border-radius: 18px 4px 18px 18px; }
.fb-card { background: var(--primary-light); border: 1px solid rgba(13,158,117,0.2); border-radius: var(--radius-sm); padding: 10px 12px; margin-top: 6px; }
.fb-head { font-size: 11px; font-weight: 700; color: var(--primary-dark); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 7px; }
.fb-pills { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 7px; }
.fb-pill { background: white; border: 1px solid rgba(13,158,117,0.2); border-radius: 20px; padding: 3px 9px; font-size: 11px; font-weight: 600; color: var(--primary-dark); }
.fb-row { font-size: 12px; color: var(--primary-dark); line-height: 1.5; }
.fb-row+.fb-row { margin-top: 2px; }
.dots-wrap { display: flex; gap: 4px; align-items: center; padding: 6px 0; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: var(--text3); animation: dp 1.2s infinite; }
.dot:nth-child(2){animation-delay:.2s} .dot:nth-child(3){animation-delay:.4s}
@keyframes dp{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}
.input-area { flex-shrink: 0; }
.input-bar { display: flex; gap: 8px; align-items: flex-end; background: var(--surface); border: 0.5px solid var(--border); border-radius: var(--radius); padding: 8px 8px 8px 13px; margin-bottom: 8px; }
.input-bar textarea { flex: 1; border: none; background: transparent; resize: none; font-size: 14px; font-family: inherit; color: var(--text); outline: none; max-height: 90px; min-height: 22px; line-height: 1.4; }
.input-bar textarea::placeholder { color: var(--text3); }
.send-btn { width: 36px; height: 36px; border-radius: 50%; background: var(--primary); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.send-btn:disabled { background: var(--text3); }
.send-btn svg { width: 16px; height: 16px; fill: white; margin-left: 2px; }
.mic-bar { display: flex; gap: 8px; }
.mic-btn { flex: 1; padding: 11px; border: 1.5px solid var(--border); border-radius: var(--radius); background: var(--surface); color: var(--text2); font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
.mic-btn.recording { border-color: #E24B4A; color: #E24B4A; background: #FCEBEB; animation: pulse-rec 1s infinite; }
@keyframes pulse-rec { 0%,100%{opacity:1} 50%{opacity:.7} }
.mic-btn svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2; }
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; }
.scard { background: var(--surface); border: 0.5px solid var(--border); border-radius: var(--radius); padding: 14px; text-align: center; }
.snum { font-size: 28px; font-weight: 800; color: var(--primary); }
.slab { font-size: 11px; color: var(--text2); margin-top: 2px; }
.hcard { background: var(--surface); border: 0.5px solid var(--border); border-radius: var(--radius); padding: 13px; margin-bottom: 9px; }
.hcard-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px; }
.hcard-name { font-size: 13px; font-weight: 600; }
.hcard-score { font-size: 13px; font-weight: 700; color: var(--primary); }
.prog-bg { height: 5px; background: var(--surface2); border-radius: 3px; overflow: hidden; }
.prog-fill { height: 5px; background: linear-gradient(90deg, var(--primary), #5DCAA5); border-radius: 3px; }
.hcard-meta { font-size: 11px; color: var(--text3); margin-top: 5px; }
.empty { text-align: center; padding: 36px 20px; }
.empty-icon { font-size: 44px; margin-bottom: 10px; }
.empty p { font-size: 13px; color: var(--text2); }
.tip { font-size: 11px; color: var(--text3); text-align: center; }
</style>
</head>
<body>
<div class="app">
<div class="header">
  <div class="header-row">
    <div class="logo">🎙️</div>
    <div>
      <div class="htitle">AI Speaking Coach</div>
      <div class="hsub">ЖИ негізіндегі ағылшын тілі жаттықтырушысы</div>
    </div>
  </div>
</div>
<div class="screens">
  <div class="screen active" id="s-home">
    <div class="slabel">Тақырып таңдаңыз</div>
    <div class="topic-grid" id="topicGrid"></div>
    <button class="start-btn" id="startBtn" disabled onclick="startChat()">
      <svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:white;stroke:none"><path d="M5 3l14 9-14 9V3z"/></svg>
      Сабақты бастау
    </button>
    <p class="tip" style="margin-top:12px">AI сіздің жауабыңызды бағалайды және кері байланыс береді</p>
  </div>
  <div class="screen-chat" id="s-chat">
    <div class="chat-topbar">
      <span class="ct-name" id="ctName">—</span>
      <span class="ct-count" id="ctCount">0 хабарлама</span>
    </div>
    <div class="chat-msgs" id="chatMsgs"></div>
    <div class="input-area">
      <div class="input-bar">
        <textarea id="userInput" rows="1" placeholder="Ағылшынша жазыңыз..." oninput="autoH(this)" onkeydown="onKey(event)"></textarea>
        <button class="send-btn" id="sendBtn" onclick="doSend()" disabled>
          <svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
        </button>
      </div>
      <div class="mic-bar">
        <button class="mic-btn" id="micBtn" onclick="toggleMic()">
          <svg viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0014 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>
          Дауыспен жазу
        </button>
      </div>
    </div>
  </div>
  <div class="screen" id="s-stats">
    <div class="slabel">Нәтижелер</div>
    <div class="stats-grid">
      <div class="scard"><div class="snum" id="stTotal">0</div><div class="slab">Сессия</div></div>
      <div class="scard"><div class="snum" id="stAvg">—</div><div class="slab">Орташа балл</div></div>
      <div class="scard"><div class="snum" id="stMsgs">0</div><div class="slab">Хабарлама</div></div>
      <div class="scard"><div class="snum" id="stBest">—</div><div class="slab">Үздік тақырып</div></div>
    </div>
    <div class="slabel">Тарих</div>
    <div id="histList"></div>
  </div>
</div>
<nav class="nav">
  <button class="nav-btn active" onclick="goTab('home',0)">
    <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    Тақырып
  </button>
  <button class="nav-btn" onclick="goTab('chat',1)">
    <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
    Диалог
  </button>
  <button class="nav-btn" onclick="goTab('stats',2)">
    <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
    Статистика
  </button>
</nav>
</div>
<script>
const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const TOPICS = [
  { id:'places', e:'🗺️', name:'Amazing Places', lv:'B1 · Descriptive',
    sys:'You are a warm English speaking coach for Kazakh college students at Pre-Intermediate level. Topic: Amazing Places. After each student message: 1. Reply naturally and encouragingly (1-2 sentences) 2. Then add feedback in EXACTLY this format: [FB]F:X|V:X|G:X|GOOD:text|TIP:text[/FB] Where X is score 1-5. Start with: "Hello! I am your AI speaking coach. Let us talk about amazing places! If you could visit any place in the world, where would you go and why?"' },
  { id:'culture', e:'🌍', name:'Culture Shock', lv:'B1 · Argumentative',
    sys:'You are a warm English speaking coach for Kazakh college students at Pre-Intermediate level. Topic: Culture Shock. After each student message: 1. Reply naturally and encouragingly (1-2 sentences) 2. Then add feedback in EXACTLY this format: [FB]F:X|V:X|G:X|GOOD:text|TIP:text[/FB] Where X is score 1-5. Start with: "Hello! Great to see you. Today we talk about culture. Have you ever experienced something from another culture that really surprised you?"' },
  { id:'cities', e:'🏙️', name:'Cities & Countries', lv:'B1 · Comparative',
    sys:'You are a warm English speaking coach for Kazakh college students at Pre-Intermediate level. Topic: Cities and Countries. After each student message: 1. Reply naturally and encouragingly (1-2 sentences) 2. Then add feedback in EXACTLY this format: [FB]F:X|V:X|G:X|GOOD:text|TIP:text[/FB] Where X is score 1-5. Start with: "Hi there! Ready to practice English? Let us compare cities. Which city would you most love to live in and why?"' },
  { id:'animals', e:'🦁', name:'Animal World', lv:'B1 · Discussion',
    sys:'You are a warm English speaking coach for Kazakh college students at Pre-Intermediate level. Topic: Animal World. After each student message: 1. Reply naturally and encouragingly (1-2 sentences) 2. Then add feedback in EXACTLY this format: [FB]F:X|V:X|G:X|GOOD:text|TIP:text[/FB] Where X is score 1-5. Start with: "Hello! Welcome to speaking practice. Today topic is animals! What is your favourite animal and what makes it special?"' },
];

let sel=null, hist=[], msgN=0, busy=false;
let sessions=JSON.parse(localStorage.getItem('asc3')||'[]');
let curSess=null, recognition=null, recording=false;

function renderTopics(){
  document.getElementById('topicGrid').innerHTML=TOPICS.map(t=>`
    <div class="topic-card" id="tc${t.id}" onclick="pick('${t.id}')">
      <div class="tc-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>
      <span class="tc-emoji">${t.e}</span>
      <div class="tc-name">${t.name}</div>
      <div class="tc-level">${t.lv}</div>
    </div>`).join('');
}

function pick(id){
  sel=TOPICS.find(t=>t.id===id);
  document.querySelectorAll('.topic-card').forEach(c=>c.classList.remove('sel'));
  document.getElementById('tc'+id).classList.add('sel');
  document.getElementById('startBtn').disabled=false;
}

function goTab(name,idx){
  document.querySelectorAll('.screen,.screen-chat').forEach(s=>{s.classList.remove('active');s.style.display='none';});
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  const el=document.getElementById('s-'+name);
  el.style.display=name==='chat'?'flex':'block';
  el.classList.add('active');
  document.querySelectorAll('.nav-btn')[idx].classList.add('active');
  if(name==='stats')renderStats();
}

function scrollBottom(){
  const wrap=document.getElementById('chatMsgs');
  setTimeout(()=>{ wrap.scrollTop=wrap.scrollHeight; },100);
  setTimeout(()=>{ wrap.scrollTop=wrap.scrollHeight; },300);
  setTimeout(()=>{ wrap.scrollTop=wrap.scrollHeight; },600);
}

function startChat(){
  if(!sel)return;
  hist=[]; msgN=0;
  document.getElementById('chatMsgs').innerHTML='';
  document.getElementById('ctName').textContent=sel.e+' '+sel.name;
  document.getElementById('ctCount').textContent='0 хабарлама';
  document.getElementById('userInput').value='';
  document.getElementById('sendBtn').disabled=true;
  curSess={topic:sel.name,e:sel.e,scores:[],msgs:0,date:new Date().toLocaleDateString('kk-KZ')};
  goTab('chat',1);
  callAI([{role:'user',content:'Hello, please start our speaking session.'}]);
}

async function callAI(msgs){
  busy=true;
  document.getElementById('sendBtn').disabled=true;
  showDots();
  try{
    const res=await fetch('/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({system:sel.sys,messages:msgs})});
    const d=await res.json();
    const txt=d.content?.map(b=>b.text||'').join('')||'Great answer! Keep going!';
    hideDots();
    const p=parseFB(txt);
    addBubble('ai',p.text,p.fb);
    hist.push({role:'assistant',content:txt});
    if(p.fb&&curSess)curSess.scores.push((p.fb.f+p.fb.v+p.fb.g)/3);
  }catch(e){
    hideDots();
    addBubble('ai',"Let's start! Tell me something in English.");
  }
  busy=false;
  document.getElementById('sendBtn').disabled=document.getElementById('userInput').value.trim().length===0;
}

function parseFB(txt){
  const m=txt.match(/\[FB\](.*?)\[\/FB\]/s);
  if(!m)return{text:txt,fb:null};
  const clean=txt.replace(/\[FB\].*?\[\/FB\]/s,'').trim();
  const b=m[1];
  const g=re=>{const x=b.match(re);return x?x[1].trim():'';};
  return{text:clean,fb:{f:parseInt(g(/F:(\d)/))||3,v:parseInt(g(/V:(\d)/))||3,g:parseInt(g(/G:(\d)/))||3,good:g(/GOOD:([^|]+)/),tip:g(/TIP:([^|]+)/)}};
}

function addBubble(role,text,fb){
  const wrap=document.getElementById('chatMsgs');
  const d=document.createElement('div');
  d.className='msg msg-'+(role==='ai'?'ai':'user');
  const av=role==='ai'?'<div class="av av-ai">AI</div>':'<div class="av av-me">СЕН</div>';
  const bc=role==='ai'?'b-ai':'b-me';
  let fbH='';
  if(fb){
    fbH=`<div class="fb-card">
      <div class="fb-head">📊 Бағалау</div>
      <div class="fb-pills">
        <span class="fb-pill">Fluency ${fb.f}/5</span>
        <span class="fb-pill">Vocab ${fb.v}/5</span>
        <span class="fb-pill">Grammar ${fb.g}/5</span>
      </div>
      ${fb.good?`<div class="fb-row">✅ <strong>Жақсы:</strong> ${fb.good}</div>`:''}
      ${fb.tip?`<div class="fb-row">💡 <strong>Кеңес:</strong> ${fb.tip}</div>`:''}
    </div>`;
  }
  d.innerHTML=role==='ai'
    ?`${av}<div><div class="bubble ${bc}">${text.replace(/\n/g,'<br>')}</div>${fbH}</div>`
    :`${av}<div><div class="bubble ${bc}">${text.replace(/\n/g,'<br>')}</div></div>`;
  wrap.appendChild(d);
  scrollBottom();
}

let dotEl=null;
function showDots(){
  const w=document.getElementById('chatMsgs');
  dotEl=document.createElement('div');
  dotEl.className='msg msg-ai';
  dotEl.innerHTML='<div class="av av-ai">AI</div><div class="bubble b-ai"><div class="dots-wrap"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div>';
  w.appendChild(dotEl);
  scrollBottom();
}
function hideDots(){if(dotEl){dotEl.remove();dotEl=null;}}

function doSend(){
  const inp=document.getElementById('userInput');
  const t=inp.value.trim();
  if(!t||busy)return;
  inp.value=''; inp.style.height='';
  document.getElementById('sendBtn').disabled=true;
  addBubble('user',t);
  msgN++; hist.push({role:'user',content:t});
  document.getElementById('ctCount').textContent=msgN+' хабарлама';
  if(curSess){curSess.msgs=msgN;saveSess();}
  callAI(hist);
}

function saveSess(){
  if(!curSess||curSess.msgs===0)return;
  if(!sessions.includes(curSess))sessions.unshift(curSess);
  if(sessions.length>20)sessions.pop();
  localStorage.setItem('asc3',JSON.stringify(sessions));
}

function onKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();doSend();}}
function autoH(el){
  el.style.height='';
  el.style.height=Math.min(el.scrollHeight,90)+'px';
  document.getElementById('sendBtn').disabled=el.value.trim().length===0||busy;
}

function toggleMic(){
  if(!('webkitSpeechRecognition' in window||'SpeechRecognition' in window)){
    alert('Chrome браузерін қолданыңыз.');
    return;
  }
  if(recording){recognition.stop();return;}
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  recognition=new SR();
  recognition.lang='en-US';
  recognition.interimResults=false;
  const btn=document.getElementById('micBtn');
  recording=true;
  btn.classList.add('recording');
  btn.innerHTML='<svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0014 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg> Тыңдап жатыр...';
  recognition.onresult=e=>{
    const t=e.results[0][0].transcript;
    document.getElementById('userInput').value=t;
    autoH(document.getElementById('userInput'));
  };
  const resetMic=()=>{
    recording=false;
    btn.classList.remove('recording');
    btn.innerHTML='<svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0014 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg> Дауыспен жазу';
  };
  recognition.onend=()=>{resetMic();const t=document.getElementById('userInput').value.trim();if(t)doSend();};
  recognition.onerror=()=>{resetMic();};
  recognition.start();
}

function renderStats(){
  document.getElementById('stTotal').textContent=sessions.length;
  const all=sessions.flatMap(s=>s.scores);
  document.getElementById('stAvg').textContent=all.length?(all.reduce((a,b)=>a+b,0)/all.length).toFixed(1):'—';
  document.getElementById('stMsgs').textContent=sessions.reduce((a,s)=>a+(s.msgs||0),0);
  const ts={};
  sessions.forEach(s=>{if(!ts[s.topic])ts[s.topic]=[];ts[s.topic].push(...s.scores);});
  let best='—',ba=0;
  Object.entries(ts).forEach(([t,sc])=>{if(!sc.length)return;const a=sc.reduce((x,y)=>x+y,0)/sc.length;if(a>ba){ba=a;best=t.split(' ')[0];}});
  document.getElementById('stBest').textContent=best;
  const list=document.getElementById('histList');
  if(!sessions.length){list.innerHTML='<div class="empty"><div class="empty-icon">📭</div><p>Әлі сессия жоқ.</p></div>';return;}
  list.innerHTML=sessions.slice(0,10).map(s=>{
    const avg=s.scores.length?(s.scores.reduce((a,b)=>a+b,0)/s.scores.length).toFixed(1):'—';
    const pct=avg!=='—'?(avg/5*100).toFixed(0):0;
    return`<div class="hcard">
      <div class="hcard-top"><span class="hcard-name">${s.e||''} ${s.topic}</span><span class="hcard-score">${avg}/5</span></div>
      <div class="prog-bg"><div class="prog-fill" style="width:${pct}%"></div></div>
      <div class="hcard-meta">${s.date||''} · ${s.msgs||0} хабарлама</div>
    </div>`;
  }).join('');
}

renderTopics();
</script>
</body>
</html>`;

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(HTML);
});

app.post("/chat", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const { messages, system } = req.body;
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 800,
      system: system || "You are a helpful English speaking coach.",
      messages: messages,
    });
    res.json({ content: [{ text: msg.content[0].text }] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
 
