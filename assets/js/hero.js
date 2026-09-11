"use strict";
(() => {
  const { $, palette, canvas2d, animate, icon } = Site;
  const canvas=$('#hero-canvas'), section=$('#top');
  let time=0;
  function draw(delta) {
    time += delta;
    const {ctx,width,height}=canvas2d(canvas), colors=palette();
    const mobile=width<=600;
    const left=mobile ? 30 : width*.61, top=mobile ? height-330 : 160;
    const w=mobile ? width-60 : Math.min(width*.32,450), h=mobile ? 140 : 190;
    const font=getComputedStyle(document.documentElement).getPropertyValue('--hand');
    ctx.save(); ctx.translate(left,top);
    ctx.fillStyle=colors.draft; ctx.font=`24px ${font}`;
    ctx.fillText('ψ = ψ₁ + ψ₂', 15,-28);
    ctx.font=`16px ${font}`; ctx.fillText('superposition',w*.46,-7);
    Notebook.curve(canvas,[[-6,h*.52],[w+5,h*.52]],colors.draft,.65);
    const points=Array.from({length:60},(_,i)=> { const x=i/59*w; return [x,h*.52-Math.sin(i/59*Math.PI*3-time*.55)*h*.27]; });
    Notebook.curve(canvas,points,colors.draft,1);
    ctx.setLineDash([5,7]);
    Notebook.curve(canvas,Array.from({length:45},(_,i)=>[i/44*w,h*.52-Math.sin(i/44*Math.PI*3+time*.55+.8)*h*.18]),colors.draft,.6);
    ctx.setLineDash([]);
    ctx.fillStyle=colors.ink; ctx.font=`19px ${font}`; ctx.fillText('x',w-4,h*.52+26);
    ctx.fillStyle=colors.accent; ctx.font=`22px ${font}`; ctx.fillText('∂²ψ/∂t² = c² ∂²ψ/∂x²',5,h+30);
    ctx.fillStyle=colors.coral; ctx.font=`18px ${font}`; ctx.fillText('从一个波，开始。',w*.28,h+68);
    Notebook.curve(canvas,[[w*.26,h+77],[w*.52,h+81],[w*.87,h+76]],colors.coral,.7);
    ctx.restore();
  }
  const clock=animate(section,draw,running=>icon($('#hero-play'),running?'pause':'play',running?'暂停波场':'播放波场'));
  $('#hero-play').addEventListener('click',()=>clock.toggle());
  document.addEventListener('toolsready',()=>clock.redraw());
  document.fonts?.ready.then(()=>clock.redraw());
})();
