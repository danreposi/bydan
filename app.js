let DATA=null,currentSection='inicio',activeTag=null,searchQuery='',readerMode=false,currentPostId=null,activeProjTag=null,twDone=false;

async function loadData(){
  const local=localStorage.getItem('bydan_content');
  if(local){try{DATA=JSON.parse(local);}catch(e){}}
  if(!DATA){try{const r=await fetch('data/content.json?v='+Date.now());DATA=await r.json();}catch(e){DATA={};}}
  render();
}

function render(){
  const m=DATA.meta||{};
  setText('d-siteTitle',m.siteTitle||'bydan');
  setText('d-siteSub',m.siteSub||'');
  setText('d-siteSym',m.siteSym||'✦');
  setText('d-marquee',m.marquee||'');
  setText('d-footerSym',m.footerSym||'✦');
  setText('d-footerInfo',m.footerInfo||'');
  document.getElementById('wander').textContent=m.wanderText||'';
  document.title=(m.siteTitle||'bydan')+' — arquivo pessoal';
  setMeta('og:title',(m.siteTitle||'bydan')+' — arquivo pessoal');
  setMeta('og:description',m.siteSub||'');
  document.getElementById('d-badges').innerHTML=(m.badges||[]).map(b=>'<span class="px-badge">'+esc(b)+'</span>').join('');
  if(!twDone)startTypewriter(m.typewriterMsg||'');
  document.getElementById('d-novidades').innerHTML=(DATA.novidades||[]).map(n=>'<div class="i-box"><div class="i-box-title">'+esc(n.title)+'</div>'+(n.lines||[]).map(l=>'<p>'+esc(l)+'</p>').join('')+'</div>').join('');
  const pub=(DATA.posts||[]).filter(p=>p.status==='published');
  document.getElementById('d-recent-posts').innerHTML=pub.slice(0,2).map(renderPostCard).join('')||'<div class="empty-state">// nenhuma transmissão ainda</div>';
  renderBlog();
  renderProjetos();
  const s=DATA.sobre||{};
  setText('d-avatar',s.avatar||'D');
  document.getElementById('d-sobre-text').innerHTML=(s.paragraphs||[]).map(p=>'<p>'+esc(p)+'</p>').join('')+(s.handnote?'<span class="handnote">'+esc(s.handnote)+'</span>':'');
  const f=DATA.filosofia||{};
  setText('d-filo-quote',f.quote||'');
  document.getElementById('d-filo-paras').innerHTML=(f.paragraphs||[]).map(p=>'<p>'+esc(p)+'</p>').join('');
  document.getElementById('d-stack').innerHTML=(DATA.stack||[]).map(s=>'<div class="st-row"><span class="st-name">'+esc(s.name)+'</span><div class="st-bar"><div class="st-fill" style="width:0%" data-pct="'+s.pct+'"></div></div><span class="st-level">'+esc(s.level)+'</span></div>').join('');
  setTimeout(()=>document.querySelectorAll('.st-fill').forEach(el=>el.style.width=el.dataset.pct+'%'),100);
  const c=DATA.contato||{};
  setText('d-contato-note',c.note||'');
  document.getElementById('d-contato-links').innerHTML=(c.links||[]).map(l=>'<div class="c-row"><span class="c-key">'+esc(l.key)+'</span><a class="c-val" href="'+esc(l.href)+'" target="_blank" rel="noopener">'+esc(l.val)+'</a></div>').join('');
}

function renderBlog(){
  const posts=(DATA.posts||[]).filter(p=>p.status==='published');
  const tags=[...new Set(posts.flatMap(p=>p.tags||[]))];
  const el=document.getElementById('blog-tag-filter');
  el.innerHTML=tags.length?['<button class="tag-filter-btn on" onclick="filterTag(null,\'blog\',this)">todos</button>',...tags.map(t=>'<button class="tag-filter-btn" onclick="filterTag(\''+esc(t)+'\',\'blog\',this)">'+esc(t)+'</button>')].join(''):'';
  renderBlogPosts(posts);
}

function renderBlogPosts(posts){
  let f=posts;
  if(activeTag)f=f.filter(p=>(p.tags||[]).includes(activeTag));
  if(searchQuery){const q=searchQuery.toLowerCase();f=f.filter(p=>(p.title||'').toLowerCase().includes(q)||(p.excerpt||'').toLowerCase().includes(q)||(p.tags||[]).some(t=>t.toLowerCase().includes(q)));}
  const cnt=document.getElementById('search-results-count');
  if(searchQuery||activeTag){cnt.style.display='block';cnt.textContent='// '+f.length+' resultado'+(f.length!==1?'s':'')+' encontrado'+(f.length!==1?'s':'');}
  else cnt.style.display='none';
  document.getElementById('d-blog-posts').innerHTML=f.length?f.map(renderPostCard).join(''):'<div class="empty-state">// nenhum resultado encontrado</div>';
}

function renderProjetos(){
  const projs=(DATA.projetos||[]).filter(p=>p.status==='published');
  const tags=[...new Set(projs.flatMap(p=>p.tags||[]))];
  const el=document.getElementById('proj-tag-filter');
  el.innerHTML=tags.length?['<button class="tag-filter-btn on" onclick="filterTag(null,\'proj\',this)">todos</button>',...tags.map(t=>'<button class="tag-filter-btn" onclick="filterTag(\''+esc(t)+'\',\'proj\',this)">'+esc(t)+'</button>')].join(''):'';
  renderProjCards(projs);
}

function renderProjCards(projs){
  let f=projs;
  if(activeProjTag)f=f.filter(p=>(p.tags||[]).includes(activeProjTag));
  document.getElementById('d-proj-grid').innerHTML=f.length?f.map(p=>{
    const thumb=p.coverImage?'<img src="'+esc(p.coverImage)+'" alt="'+esc(p.title)+'">'  :'[ capa ]';
    const tags=(p.tags||[]).map(t=>'<span class="proj-tag" onclick="filterTag(\''+esc(t)+'\',\'proj\',null)">'+esc(t)+'</span>').join('');
    return '<div class="proj-card"><div class="proj-thumb">'+thumb+'</div><div class="proj-body"><div class="proj-title">'+esc(p.title)+'</div><div class="proj-desc">'+esc(p.desc)+'</div><div class="proj-tags">'+tags+'</div>'+renderProjLinks(p)+'</div></div>';
  }).join(''):'<div class="empty-state" style="grid-column:1/-1">// nenhum projeto encontrado</div>';
}

function filterTag(tag,ns,btn){
  if(ns==='blog'){activeTag=tag;document.querySelectorAll('#blog-tag-filter .tag-filter-btn').forEach(b=>b.classList.remove('on'));if(btn)btn.classList.add('on');renderBlogPosts((DATA.posts||[]).filter(p=>p.status==='published'));}
  else{activeProjTag=tag;document.querySelectorAll('#proj-tag-filter .tag-filter-btn').forEach(b=>b.classList.remove('on'));if(btn)btn.classList.add('on');renderProjCards((DATA.projetos||[]).filter(p=>p.status==='published'));}
}

function onSearch(val){
  searchQuery=val.trim();
  document.getElementById('search-clear').style.display=val?'block':'none';
  renderBlogPosts((DATA.posts||[]).filter(p=>p.status==='published'));
}

function clearSearch(){
  document.getElementById('search-input').value='';
  searchQuery='';
  document.getElementById('search-clear').style.display='none';
  renderBlogPosts((DATA.posts||[]).filter(p=>p.status==='published'));
}

function renderPostCard(p){
  const rt=readTime(p.content||'');
  const tags=p.tags&&p.tags.length?'<div class="post-tags">'+p.tags.map(t=>'<span class="post-tag" onclick="filterTag(\''+esc(t)+'\',\'blog\',null);go(\'blog\');">'+esc(t)+'</span>').join('')+'</div>':'';
  const cover=p.coverImage?'<img class="post-cover" src="'+esc(p.coverImage)+'" alt="'+esc(p.coverAlt||p.title)+'" loading="lazy">':'';
  return '<div class="post"><div class="post-date">'+esc(p.date)+'<span class="read-time">~'+rt+' min de leitura</span></div><div class="post-title">'+esc(p.title)+'</div><div class="post-excerpt">'+esc(p.excerpt)+'</div>'+tags+'<div style="margin-top:10px;"><a class="read-more" onclick="openPost(\''+p.id+'\');return false;" href="#">[ seguir lendo &rarr; ]</a></div>'+cover+'</div>';
}

function renderProjLinks(p){
  const links=[];
  if(p.links&&p.links.itch)links.push('<a class="proj-link" href="'+esc(p.links.itch)+'" target="_blank" rel="noopener">[ itch ]</a>');
  if(p.links&&p.links.github)links.push('<a class="proj-link" href="'+esc(p.links.github)+'" target="_blank" rel="noopener">[ github ]</a>');
  if(p.links&&p.links.demo)links.push('<a class="proj-link" href="'+esc(p.links.demo)+'" target="_blank" rel="noopener">[ demo ]</a>');
  return links.length?'<div class="proj-links">'+links.join('')+'</div>':'';
}

function readTime(html){
  return Math.max(1,Math.round(html.replace(/<[^>]+>/g,'').split(/\s+/).filter(Boolean).length/200));
}

function openPost(id){
  const posts=(DATA.posts||[]).filter(p=>p.status==='published');
  const post=posts.find(p=>p.id===id);
  if(!post)return;
  currentPostId=id;
  document.querySelectorAll('.sec').forEach(s=>s.classList.remove('on'));
  document.querySelectorAll('.nlink').forEach(b=>b.classList.remove('on'));
  const rt=readTime(post.content||'');
  const attach=post.attachments&&post.attachments.length?'<div class="post-attachments"><div class="attach-title">// anexos</div>'+post.attachments.map(a=>'<div class="attach-item"><span class="attach-type">'+esc(a.type)+'</span><a href="'+esc(a.url)+'" target="_blank">'+esc(a.name)+'</a></div>').join('')+'</div>':'';
  const tags=post.tags&&post.tags.length?'<div class="post-tags" style="margin-bottom:16px;">'+post.tags.map(t=>'<span class="post-tag">'+esc(t)+'</span>').join('')+'</div>':'';
  const cover=post.coverImage?'<img src="'+esc(post.coverImage)+'" alt="'+esc(post.coverAlt||post.title)+'" style="width:100%;max-height:280px;object-fit:cover;border:1px solid var(--lavender);margin-bottom:16px;" loading="lazy">':'';
  document.getElementById('post-view-content').innerHTML='<div style="font-family:var(--vt);font-size:0.8rem;color:var(--dim);letter-spacing:0.15em;margin-bottom:4px;display:flex;gap:12px;"><span>'+esc(post.date)+'</span><span>~'+rt+' min de leitura</span></div><div style="font-family:var(--hand);font-size:2.2rem;color:var(--text);line-height:1.2;margin-bottom:12px;">'+esc(post.title)+'</div>'+tags+cover+(post.content||'')+attach;
  const idx=posts.indexOf(post);
  const prev=posts[idx+1];
  const next=posts[idx-1];
  document.getElementById('post-nav').innerHTML=(prev?'<a onclick="openPost(\''+prev.id+'\');return false;" href="#">[ &larr; '+esc(prev.title.slice(0,30))+(prev.title.length>30?'…':'')+' ]</a>':'<span></span>')+(next?'<a onclick="openPost(\''+next.id+'\');return false;" href="#" style="text-align:right;">[ '+esc(next.title.slice(0,30))+(next.title.length>30?'…':'')+' &rarr; ]</a>':'<span></span>');
  document.querySelector('[data-t="blog"]').classList.add('on');
  const pv=document.getElementById('post-view');
  pv.style.display='block';pv.classList.add('on');
  window.scrollTo(0,0);
}

function closePost(){
  if(readerMode)toggleReader();
  document.getElementById('post-view').style.display='none';
  document.getElementById('post-view').classList.remove('on');
  currentPostId=null;go('blog');
}

function toggleReader(){
  readerMode=!readerMode;
  document.body.classList.toggle('reader-mode',readerMode);
  document.getElementById('reader-btn').classList.toggle('on',readerMode);
  document.getElementById('reader-btn').textContent=readerMode?'[ normal ]':'[ leitura ]';
}

function go(id){
  document.querySelectorAll('.nlink').forEach(b=>b.classList.remove('on'));
  document.querySelectorAll('.sec').forEach(s=>s.classList.remove('on'));
  document.getElementById('post-view').style.display='none';
  const btn=document.querySelector('[data-t="'+id+'"]');
  const sec=document.getElementById(id);
  if(btn)btn.classList.add('on');
  if(sec)sec.classList.add('on');
  currentSection=id;
  window.scrollTo(0,0);
  if(id==='stack')setTimeout(()=>document.querySelectorAll('.st-fill').forEach(el=>el.style.width=el.dataset.pct+'%'),100);
}

document.querySelectorAll('.nlink').forEach(b=>b.addEventListener('click',()=>go(b.dataset.t)));

const backTop=document.getElementById('back-top');
window.addEventListener('scroll',()=>backTop.classList.toggle('show',window.scrollY>400),{passive:true});

const cur=document.getElementById('cur'),ring=document.getElementById('cur-ring');
let mx=300,my=300;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx+'px';cur.style.top=my+'px';});
(function t(){ring.style.left=mx+'px';ring.style.top=my+'px';requestAnimationFrame(t);})();

function startTypewriter(msg){
  twDone=true;
  const tw=document.getElementById('tw-text');
  tw.innerHTML='';
  let ti=0;
  function type(){
    if(ti<msg.length){tw.innerHTML+=msg[ti]==='\n'?'<br>':msg[ti];ti++;setTimeout(type,Math.random()*80+20);}
  }
  setTimeout(type,600);
}

const wnd=document.getElementById('wander');
let wx=-500,wy=Math.random()*window.innerHeight*0.7+80;
(function mw(){
  wx+=0.28;
  if(wx>window.innerWidth+600){wx=-600;wy=Math.random()*window.innerHeight*0.7+80;}
  wnd.style.left=wx+'px';wnd.style.top=wy+'px';
  requestAnimationFrame(mw);
})();

const dbtn=document.getElementById('dbtn');
let dark=localStorage.getItem('bydan_dark')==='1';
if(dark){document.body.classList.add('dark');dbtn.textContent='[ modo : escuro ]';}
dbtn.addEventListener('click',()=>{
  dark=!dark;
  document.body.classList.toggle('dark',dark);
  dbtn.textContent=dark?'[ modo : escuro ]':'[ modo : claro ]';
  localStorage.setItem('bydan_dark',dark?'1':'0');
});

let actx,nnode,fnode,gnode,playing=false;
const abtn=document.getElementById('abtn');
function initAudio(){
  actx=new(window.AudioContext||window.webkitAudioContext)();
  const buf=actx.createBuffer(1,actx.sampleRate*2,actx.sampleRate);
  const d=buf.getChannelData(0);let last=0;
  for(let i=0;i<d.length;i++){let w=Math.random()*2-1;d[i]=(last+0.02*w)/1.02;last=d[i];d[i]*=3.5;}
  nnode=actx.createBufferSource();nnode.buffer=buf;nnode.loop=true;
  fnode=actx.createBiquadFilter();fnode.type='lowpass';fnode.frequency.value=350;
  gnode=actx.createGain();gnode.gain.value=0.35;
  nnode.connect(fnode);fnode.connect(gnode);gnode.connect(actx.destination);nnode.start();
}
abtn.addEventListener('click',()=>{
  if(!actx){initAudio();playing=true;abtn.textContent='[ som : on ]';return;}
  playing?(actx.suspend(),abtn.textContent='[ som : off ]'):(actx.resume(),abtn.textContent='[ som : on ]');
  playing=!playing;
});

function setText(id,val){const el=document.getElementById(id);if(el)el.textContent=val;}
function setMeta(prop,val){const el=document.querySelector('meta[property="'+prop+'"]');if(el)el.setAttribute('content',val);}
function esc(str){if(!str)return '';return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

window.addEventListener('storage',e=>{
  if(e.key==='bydan_content'){try{DATA=JSON.parse(e.newValue);render();}catch(err){}}
});

loadData();
