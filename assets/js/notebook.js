"use strict";
// Shared writing tools. Geometry and content never depend on the selected carrier.
window.Notebook = (() => {
  let loading;
  function ready() {
    if (window.rough) return Promise.resolve(window.rough);
    if (!loading) loading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'assets/vendor/rough.min.js'; script.async = true;
      script.onload = () => { document.dispatchEvent(new Event('toolsready')); resolve(window.rough); };
      script.onerror = () => { loading = null; reject(new Error('Writing tools unavailable')); };
      document.head.append(script);
    });
    return loading;
  }
  function options(stroke, width = 1) {
    const css = getComputedStyle(document.documentElement);
    return { stroke, strokeWidth: Number(css.getPropertyValue('--tool-width')) * width,
      roughness: Number(css.getPropertyValue('--tool-roughness')), bowing: Number(css.getPropertyValue('--tool-bowing')),
      seed: 1106, preserveVertices: true, disableMultiStroke: false };
  }
  function curve(canvas, points, stroke, width = 1) {
    if (window.rough) return window.rough.canvas(canvas).curve(points, options(stroke, width));
    const ctx = canvas.getContext('2d');
    ctx.beginPath(); ctx.strokeStyle = stroke; ctx.lineWidth = options(stroke, width).strokeWidth;
    points.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.stroke();
  }
  // A small, deterministic subset of writing receives irregular spacing/baselines.
  function handwriting(element) {
    const originalText = element.textContent;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes = []; while(walker.nextNode()) nodes.push(walker.currentNode);
    let count=0;
    nodes.forEach(node => {
      const fragment=document.createDocumentFragment();
      for (const char of node.textContent) {
        const span=document.createElement('span'); span.className='written-char'; span.textContent=char; span.setAttribute('aria-hidden','true');
        span.style.setProperty('--char-delay', `${Math.min(count * 34 + (count%5)*17, 600)}ms`);
        if(count%13===4) { span.classList.add('imperfect-char'); span.style.setProperty('--tilt', `${count%2 ? -1.2 : 1.1}deg`); }
        fragment.append(span); count++;
      }
      node.replaceWith(fragment);
    });
    const accessible=document.createElement('span'); accessible.className='sr-only'; accessible.textContent=originalText; element.prepend(accessible);
  }
  function write(element) {
    if (Site.motion.matches || !element) return;
    element.classList.remove('writing'); void element.offsetWidth; element.classList.add('writing');
  }
  function turn(element) {
    if (Site.motion.matches || !element) return;
    element.classList.remove('turning'); void element.offsetWidth; element.classList.add('turning');
    element.addEventListener('animationend', () => element.classList.remove('turning'), {once:true});
  }
  document.querySelectorAll('h1, .margin-note, .signature').forEach(el => { handwriting(el); write(el); });
  // Delay the small drawing library until first paint. Text remains usable without it.
  requestAnimationFrame(() => ready().catch(() => {}));
  return { ready, options, curve, write, turn };
})();

(() => {
  const { $, palette } = Site, NS='http://www.w3.org/2000/svg';
  const notes=[...document.querySelectorAll('.note-item')];
  let page=0;
  const formulas=['⟨r²⟩ ∝ N', 'f′(x) ≈ [f(x+h) − f(x−h)] / 2h', 'yₙ₊₁ = yₙ + h f(tₙ, yₙ)'];
  const remarks=['单条路径是随机的，统计量有规律。','对称地取样，让一阶误差相消。','沿当前斜率，向前迈一小步。'];
  notes.forEach((note,i)=>{
    const caption=note.querySelector('figcaption');
    note.querySelector('.note-image').setAttribute('aria-label', note.querySelector('img').alt+'，打开原始笔记');
    const formula=document.createElement('p'); formula.className='note-equation'; formula.textContent=formulas[i];
    const remark=document.createElement('p'); remark.className='note-remark'; remark.textContent=remarks[i];
    const original=document.createElement('span'); original.className='original-hint'; original.textContent='点击图示，查看原始笔记 ↗';
    caption.append(formula,remark,original);
  });
  function show(index) {
    page=Math.max(0,Math.min(notes.length-1,index));
    notes.forEach((note,i)=>{ note.hidden=i!==page; });
    $('#note-page').textContent=`${String(page+1).padStart(2,'0')} / ${String(notes.length).padStart(2,'0')}`;
    $('#note-prev').disabled=page===0; $('#note-next').disabled=page===notes.length-1;
    Notebook.turn(notes[page]);
  }
  $('.notebook-pagination').hidden=false;
  $('#notebook-pages').classList.add('paged');
  $('#note-prev').addEventListener('click',()=>show(page-1));
  $('#note-next').addEventListener('click',()=>show(page+1));
  $('#notebook-pages').addEventListener('keydown', event=>{
    if(event.key==='ArrowLeft' || event.key==='ArrowRight') { event.preventDefault(); show(page+(event.key==='ArrowRight'?1:-1)); }
  });
  show(0);
  if('IntersectionObserver' in window) {
    const writingObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){ if(!Site.motion.matches) entry.target.classList.add('write-block'); writingObserver.unobserve(entry.target); }}),{threshold:.15});
    document.querySelectorAll('.hero-subtitle,.hero-intro,.section-heading,.project-description,.about-copy > p,.contact-line').forEach(el=>writingObserver.observe(el));
  }
  function sketch(container, kind) {
    const colors=palette();
    let svg=container.querySelector('.notebook-sketch');
    if (!svg) { svg=document.createElementNS(NS,'svg'); svg.classList.add('notebook-sketch'); svg.setAttribute('viewBox','0 0 500 290'); svg.setAttribute('aria-hidden','true'); container.append(svg); }
    svg.replaceChildren();
    const rc=rough.svg(svg);
    const line=(points,color=colors.draft,width=1)=>svg.append(rc.curve(points,Notebook.options(color,width)));
    const label=(text,x,y,color=colors.draft,size=20)=>{const t=document.createElementNS(NS,'text');t.textContent=text;t.setAttribute('x',x);t.setAttribute('y',y);t.setAttribute('fill',color);t.setAttribute('font-size',size);svg.append(t);};
    if(kind===0) {
      line([[45,238],[453,238]],colors.draft,.6); line([[70,256],[70,28]],colors.draft,.6);
      let x=145,y=175,seed=1106; const points=[[x,y]];
      for(let i=0;i<90;i++) { seed=(seed*16807)%2147483647; const angle=(seed%360)*Math.PI/180; x=Math.max(80,Math.min(415,x+Math.cos(angle)*22)); y=Math.max(38,Math.min(222,y+Math.sin(angle)*22)); points.push([x,y]); }
      svg.append(rc.linearPath(points,Notebook.options(colors.draft,.9)));
      svg.append(rc.circle(x,y,17,Notebook.options(colors.coral,.9)));
      label('r(0)',120,205); label('r(N)',x+12,y-12,colors.coral);
      label('x',447,264);label('y',43,33);label('⟨r²⟩ ∝ N',300,58,colors.ink,28);
    } else if(kind===1) {
      line([[40,238],[458,238]],colors.draft,.6);line([[74,259],[74,24]],colors.draft,.6);
      line(Array.from({length:45},(_,i)=>{const x=85+i*7.8;return [x,215-.0015*(x-80)**2];}),colors.ink);
      const f=x=>215-.0015*(x-80)**2;
      const slope=(f(360)-f(170))/190; line([[120,f(170)+slope*(120-170)],[407,f(170)+slope*(407-170)]],colors.accent,.85);
      [170,265,360].forEach(x=>{svg.append(rc.circle(x,f(x),8,{...Notebook.options(colors.ink,.7),fill:colors.ink,fillStyle:'solid'})); const g=rc.line(x,f(x),x,238,{...Notebook.options(colors.draft,.5),strokeLineDash:[4,6]});svg.append(g);});
      label('x−h',144,266);label('x',263,266);label('x+h',346,266);label('f(x)',106,49,colors.ink,25);
      label('central difference',239,43,colors.accent,25);
    } else {
      line([[40,240],[458,240]],colors.draft,.6);line([[72,259],[72,28]],colors.draft,.6);
      line(Array.from({length:44},(_,i)=>{const x=85+i*8;return [x,224-150*((x-85)/344)**1.65];}),colors.ink);
      const points=[[85,224]]; for(let i=0;i<4;i++){const [x,y]=points[i];points.push([x+86,y-150*1.65/344*((x-85)/344)**.65*86]);}
      line(points,colors.draft);
      points.forEach(([x,y])=>svg.append(rc.circle(x,y,7,Notebook.options(colors.draft,.6))));
      line([points[2],points[3]],colors.coral,1.2);
      label('h',292,210,colors.coral,28);label('t',445,266);label('y',43,36);label('Euler step',192,48,colors.accent,30);
    }
    container.classList.add('has-sketch');
    svg.querySelectorAll('path').forEach((path,i)=>{ const length=path.getTotalLength(); path.style.setProperty('--path-length',length); path.style.setProperty('--path-delay',`${Math.min(i*24,180)}ms`); });
  }
  function drawSketches() {
    if(!window.rough) return;
    document.querySelectorAll('.note-image').forEach((container,i)=>sketch(container,i));
    const featured=$('.project-art'); if(featured) sketch(featured,0);
  }
  // Offscreen diagrams wait until approaching the viewport; subsequent theme changes reuse resources.
  let activated=false;
  const activate=()=>{activated=true;Notebook.ready().then(drawSketches).catch(()=>{});};
  if('IntersectionObserver' in window) {
    const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){activate();observer.disconnect();}},{rootMargin:'200px'});
    observer.observe($('#work'));
    observer.observe($('#notes'));
  } else activate();
  document.addEventListener('themechange',()=>{if(activated)drawSketches();});
  document.addEventListener('projectsrendered',()=>{if(activated)drawSketches();Notebook.turn($('#project-grid'));});
  document.querySelectorAll('#navigation a').forEach(link=>link.addEventListener('click',()=>Notebook.turn(document.querySelector(link.hash))));
  document.querySelectorAll('[data-model]').forEach(button=>button.addEventListener('click',()=>Notebook.turn($('#experiment-panel'))));
  document.addEventListener('themechange',()=>{
    if(Site.motion.matches) return;
    document.querySelectorAll('h1,.margin-note,.signature').forEach(element=>{
      const r=element.getBoundingClientRect();if(r.bottom>0 && r.top<innerHeight)Notebook.write(element);
    });
  });
  document.addEventListener('click',event=>{
    const target=event.target.closest('button,a');
    if(!target || target.disabled || target.closest('.notebook-pagination') || Site.motion.matches) return;
    const rect=target.getBoundingClientRect();
    const ring=document.createElementNS(NS,'svg');ring.classList.add('selection-ring');ring.setAttribute('viewBox','0 0 100 60');ring.setAttribute('aria-hidden','true');
    const path=document.createElementNS(NS,'path');path.setAttribute('d','M89 17C66 -1 3 3 5 32C7 60 99 64 95 29');ring.append(path);
    Object.assign(ring.style,{left:`${rect.left-8}px`,top:`${rect.top-6}px`,width:`${rect.width+16}px`,height:`${rect.height+12}px`});
    document.body.append(ring);setTimeout(()=>ring.remove(),650);
  });
})();
