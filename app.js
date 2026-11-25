const $=id=>document.getElementById(id);
const KEY='sydney-decathlon-v1';
function fresh(previousOrder=[]){
 let deck=shuffle(CARDS.map(c=>c.id));
 // Avoid repeating the previous game's exact starting order.
 if(previousOrder.length===deck.length && deck.every((id,i)=>id===previousOrder[i])){
   deck=shuffle(CARDS.map(c=>c.id));
   while(deck.every((id,i)=>id===previousOrder[i])) deck=shuffle(CARDS.map(c=>c.id));
 }
 return {deck,gameOrder:[...deck],hand:[],active:[],discard:[],handLimit:3,missionUrl:'',last:null};
}
function shuffle(a){for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
let state;try{state={...fresh(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(e){state=fresh()}
function save(){localStorage.setItem(KEY,JSON.stringify(state));render()}
function card(id){return CARDS.find(c=>c.id===id)}
function toast(s){$('toast').textContent=s;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2400)}
function remaining(a){return a.endsAt?Math.max(0,Math.ceil((a.endsAt-Date.now())/1000)):null}
function fmt(sec){let m=Math.floor(sec/60),s=sec%60;return `${m}:${String(s).padStart(2,'0')}`}
function timerMinutes(desc){
 let text=String(desc||'').toLowerCase();
 let m=text.match(/(?:next|for the next|within|in)\\s+(\\d+)\\s*(minutes?|mins?|hours?|hrs?)/i);
 if(m)return Number(m[1])*(/hour|hr/i.test(m[2])?60:1);
 m=text.match(/(?:next|for the next|for)\\s+(half an hour|an hour|one hour|half hour)/i);
 if(m)return /half/i.test(m[1])?30:60;
 return null;
}
function activateCurse(c){let mins=timerMinutes(c.description);let entry={id:c.id,startedAt:Date.now(),endsAt:mins?Date.now()+mins*60000:null};state.active.push(entry);state.last=c.id;toast(mins?`Curse activated — ${mins} minute timer started`:'Curse pinned until you clear it');save()}
function putInHand(c){if(state.hand.length<state.handLimit){state.hand.push(c.id);state.last=c.id;save();toast('Blessing added to your hand')}else{showOverflow(c.id)}}
function drawOne(){if(!state.deck.length){if(state.discard.length){state.deck=shuffle(state.discard.map(x=>x.id));state.discard=[];toast('Discard pile shuffled back into the deck')}else{toast('The deck is empty');return null}}let id=state.deck.shift();return card(id)}
function showReveal(c){$('revealFront').innerHTML=`<img src="${c.image}" alt="${esc(c.title)}">`;$('revealFlip').classList.remove('flipped');$('revealStatus').textContent='CARD REVEALED';$('revealActions').innerHTML='';$('revealOverlay').classList.remove('hidden');setTimeout(()=>$('revealFlip').classList.add('flipped'),80);setTimeout(()=>{if(c.type==='curse'){activateCurse(c);$('revealStatus').textContent='CURSE ACTIVATED';$('revealActions').innerHTML='<button class="small-btn" id="revealDone">CONTINUE</button>'}else{$('revealStatus').textContent='BLESSING';$('revealActions').innerHTML='<button class="small-btn" id="revealKeep">ADD TO HAND</button>';$('revealKeep').onclick=()=>{putInHand(c);$('revealOverlay').classList.add('hidden')}}$('revealDone')?.addEventListener('click',()=>$('revealOverlay').classList.add('hidden'))},850)}
function draw(){let c=drawOne();if(!c)return;state.last=c.id;save();showReveal(c)}
function showOverflow(newId){let c=card(newId);$('overflowChoices').innerHTML=state.hand.map(id=>{let x=card(id);return `<button class="choice" data-drop="${id}"><span>Discard ${esc(x.title)}</span><b>↗</b></button>`}).join('')+`<button class="choice" data-drop="new"><span>Discard the new card: ${esc(c.title)}</span><b>×</b></button>`;$('overflowOverlay').classList.remove('hidden');$('overflowChoices').querySelectorAll('[data-drop]').forEach(b=>b.onclick=()=>{if(b.dataset.drop==='new')state.discard.push({id:newId,at:Date.now()});else{let idx=state.hand.indexOf(b.dataset.drop);if(idx>=0)state.discard.push({id:state.hand.splice(idx,1)[0],at:Date.now()});state.hand.push(newId)}$('overflowOverlay').classList.add('hidden');save()})}
function useBlessing(id){let c=card(id);if(!c)return;let idx=state.hand.indexOf(id);if(idx<0)return;
 if(c.title.toLowerCase().includes('expanded hand')){state.handLimit=5;toast('Hand limit permanently increased to 5')}
 if(c.title.toLowerCase().includes('curse purge')){if(state.active.length){state.active.forEach(a=>state.discard.push({id:a.id,at:Date.now()}));state.active=[];toast('All active curses purged')}else toast('No active curses to purge')}
 state.hand.splice(idx,1);state.discard.push({id,at:Date.now()});save();
}
function clearCurse(id){let i=state.active.findIndex(a=>a.id===id);if(i<0)return;state.discard.push({id:state.active[i].id,at:Date.now()});state.active.splice(i,1);save();toast('Curse cleared and moved to discard')}
function render(){let now=Date.now();let expired=state.active.filter(a=>a.endsAt&&a.endsAt<=now);if(expired.length){expired.forEach(a=>state.discard.push({id:a.id,at:now}));state.active=state.active.filter(a=>!a.endsAt||a.endsAt>now);localStorage.setItem(KEY,JSON.stringify(state))}
 $('deckCount').textContent=state.deck.length;$('stackCount').textContent=state.deck.length;$('handCount').textContent=`${state.hand.length} / ${state.handLimit}`;$('discardCount').textContent=state.discard.length;$('curseCount').textContent=state.active.length;$('handPill').textContent=state.hand.length;$('discardPill').textContent=state.discard.length;$('handLimitLabel').textContent=`${state.handLimit} card limit`;
 $('drawBtn').disabled=!state.deck.length&&!state.discard.length;
 $('activeCurses').innerHTML=state.active.length?state.active.map(a=>{let c=card(a.id),r=remaining(a);return `<article class="curse-card"><img src="${c.image}" alt=""><div><h3>${esc(c.title)}</h3><p>${esc(c.description)}</p>${r!==null?`<div class="timer" data-timer="${a.id}">⏱ ${fmt(r)} remaining</div>`:'<div class="timer">PINNED • CLEAR WHEN COMPLETE</div>'}</div><button class="small-btn" data-clear="${a.id}">CLEAR</button></article>`}).join(''):'<div class="empty-state">No active curses. Enjoy the good run.</div>';
 $('activeCurses').querySelectorAll('[data-clear]').forEach(b=>b.onclick=()=>clearCurse(b.dataset.clear));
 $('handCards').innerHTML=state.hand.length?state.hand.map(id=>{let c=card(id);return `<article class="hand-card"><img src="${c.image}" alt=""><div><h3>${esc(c.title)}</h3><p>${esc(c.description)}</p><button class="small-btn" data-use="${id}">USE BLESSING</button></div></article>`}).join(''):'<div class="empty-state">No blessings in your hand yet.</div>';
 $('handCards').querySelectorAll('[data-use]').forEach(b=>b.onclick=()=>useBlessing(b.dataset.use));
 $('discardList').innerHTML=state.discard.slice().reverse().map(x=>`<div class="discard-item">${esc(card(x.id)?.title||'Unknown card')}</div>`).join('')||'<div class="empty-state">Nothing discarded yet.</div>';
 $('missionBtn').style.opacity=state.missionUrl?1:.75;
}
function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
$('drawBtn').onclick=draw;
$('missionBtn').onclick=()=>{if(state.missionUrl)window.open(state.missionUrl,'_blank','noopener');else{$('settingsOverlay').classList.remove('hidden');toast('Set your Mission Board URL in settings')}};
$('settingsBtn').onclick=()=>{$('missionUrl').value=state.missionUrl||'';$('settingsOverlay').classList.remove('hidden')};
$('saveSettings').onclick=()=>{let u=$('missionUrl').value.trim();if(u&&!/^https?:\/\//i.test(u)){toast('Enter a full URL starting with https://');return}state.missionUrl=u;save();$('settingsOverlay').classList.add('hidden');toast('Settings saved')};
$('closeSettings').onclick=()=>$('settingsOverlay').classList.add('hidden');
$('closeReveal').onclick=()=>$('revealOverlay').classList.add('hidden');
$('closeOverflow').onclick=()=>$('overflowOverlay').classList.add('hidden');
$('viewDiscard').onclick=()=>{$('discardList').classList.toggle('hidden');$('viewDiscard').textContent=$('discardList').classList.contains('hidden')?'View cards ↓':'Hide cards ↑'};
$('resetBtn').onclick=()=>{if(confirm('Reset the entire game? Your deck, hand, curses and discard pile will be cleared.')){let url=state.missionUrl;state=fresh(state.gameOrder||[]);state.missionUrl=url;save();toast('New game shuffled — good luck!')}};
setInterval(()=>{document.querySelectorAll('[data-timer]').forEach(el=>{let a=state.active.find(x=>x.id===el.dataset.timer);if(a){let r=remaining(a);el.textContent=r>0?'⏱ '+fmt(r)+' remaining':'⏱ Expired'}});if(state.active.some(a=>a.endsAt&&a.endsAt<=Date.now()))render()},1000);
render();
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
