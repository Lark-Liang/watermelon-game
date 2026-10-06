import './style.css';
import { CONFIG as C, ASSETS } from './config.js';
import { Game } from './game.js';
import { prepareSprite, spriteScale } from './sprite.js';
const $ = s => document.querySelector(s);
document.title = $('#title').textContent = C.title;
const images = ASSETS.map(src => { const img = new Image(); img.src = src; return img; });
const loaded = images.map(img => img.decode());
for (let i=0;i<6;i++) { const img = document.createElement('img'); img.src = ASSETS[i]; img.alt = `${i+1}级`; $('#levels').append(img); if(i<5){const arrow=document.createElement('span');arrow.textContent='›';$('#levels').append(arrow);} }
const canvas = $('#game'), ctx = canvas.getContext('2d');
const dialog = $('#over');
let game, pointer = null;
let sprites;
function resize() {
  const box = $('.arena').getBoundingClientRect(), scale = Math.min(box.width/C.width,box.height/C.height);
  const w = C.width*scale, h = C.height*scale, dpr = Math.min(devicePixelRatio||1,3);
  canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
  canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr);
  // 固定逻辑坐标，画布与输入共用比例，旋转和缩放不改变物理世界。
  ctx.setTransform(canvas.width/C.width,0,0,canvas.height/C.height,0,0);
}
new ResizeObserver(resize).observe($('.arena'));
function circle(level,x,y,r,alpha=1) {
  ctx.save();ctx.globalAlpha=alpha;ctx.shadowColor='#50654220';ctx.shadowBlur=5;ctx.shadowOffsetY=2;
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.shadowColor='transparent';ctx.strokeStyle='#dbe2d2';ctx.lineWidth=1;ctx.stroke();
  const img=images[level-1];
  const bounds=sprites[level-1], scale=spriteScale(bounds,r,C.imageFill);
  // 只去掉透明留白，不裁剪任何可见图案，按真实内容中心绘制。
  ctx.drawImage(img,bounds.left,bounds.top,bounds.width,bounds.height,x-bounds.width*scale/2,y-bounds.height*scale/2,bounds.width*scale,bounds.height*scale);ctx.restore();
}
function draw(){
  ctx.clearRect(0,0,C.width,C.height);
  let warning=false;for(const b of game.bodies.values())if(b.plugin.dangerSince!==null)warning=true;
  ctx.save();ctx.strokeStyle=warning?'#ce7c62':'#cad2be';ctx.setLineDash([4,7]);ctx.beginPath();ctx.moveTo(16,C.dangerY);ctx.lineTo(C.width-16,C.dangerY);ctx.stroke();ctx.restore();
  ctx.fillStyle=warning?'#b97259':'#adb89e';ctx.font='10px system-ui';ctx.fillText(warning?'留意上方空间':'堆叠请留在线下',18,C.dangerY-10);
  if(!game.over && game.time>=game.readyAt){ctx.save();ctx.setLineDash([3,8]);ctx.strokeStyle='#d8decc';ctx.beginPath();ctx.moveTo(game.x,C.dropY+game.radius(game.current)+8);ctx.lineTo(game.x,C.height-12);ctx.stroke();ctx.restore();circle(game.current,game.x,C.dropY,game.radius(game.current),0.94);}
  for(const b of game.bodies.values())circle(b.plugin.level,b.position.x,b.position.y,game.radius(b.plugin.level));
  for(const e of game.effects){const t=(game.time-e.at)/650;ctx.save();ctx.globalAlpha=1-t;ctx.strokeStyle='#a9bf89';ctx.lineWidth=3*(1-t);ctx.beginPath();ctx.arc(e.x,e.y,e.r+18*t,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#56713c';ctx.textAlign='center';ctx.font='bold 19px system-ui';ctx.fillText(`+${e.points}`,e.x,e.y-e.r-20*t);ctx.restore();}
}
function aim(event){const rect=canvas.getBoundingClientRect();game.move((event.clientX-rect.left)*C.width/rect.width);}
function restart(){pointer=null;dialog.close();game.reset();canvas.focus({preventScroll:true});}
async function boot() {
try {
  await Promise.all(loaded);
  sprites = images.map(prepareSprite);
  game = new Game({onScore(score){$('#score').textContent=score;},onEnd(score){pointer=null;$('#final-score').textContent=score;dialog.showModal();}});
  $('#loading').hidden=true;resize();
  canvas.addEventListener('pointerdown',e=>{if(pointer!==null||game.over||e.button!==0)return;pointer=e.pointerId;canvas.setPointerCapture(e.pointerId);aim(e);});
  canvas.addEventListener('pointermove',e=>{if(e.pointerId===pointer||(e.pointerType==='mouse'&&pointer===null))aim(e);});
  canvas.addEventListener('pointerup',e=>{if(e.pointerId!==pointer)return;aim(e);pointer=null;game.drop();});
  canvas.addEventListener('pointercancel',()=>pointer=null);
  canvas.addEventListener('lostpointercapture',()=>pointer=null);
  canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight',' '].includes(e.key)){e.preventDefault();if(e.key===' ') {if(!e.repeat)game.drop();}else game.move(game.x+(e.key==='ArrowLeft'?-12:12));}});
  $('#restart').onclick=restart;$('#again').onclick=restart;dialog.addEventListener('cancel',e=>e.preventDefault());
  let last=performance.now(),accumulator=0;
  document.addEventListener('visibilitychange',()=>{last=performance.now();accumulator=0;pointer=null;});
  function frame(now){if(!document.hidden){accumulator+=Math.min(now-last,80);while(accumulator>=C.fixedStep){game.step();accumulator-=C.fixedStep;}draw();}last=now;requestAnimationFrame(frame);}requestAnimationFrame(frame);
} catch(error) { $('#loading').textContent='素材加载失败，请刷新页面重试。'; console.error(error); }

}
boot();
