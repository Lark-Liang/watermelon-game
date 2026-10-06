import './style.css';
import { CONFIG as C, STAGES } from './config.js';
import { Game } from './game.js';
import { prepareSprite, spriteScale } from './sprite.js';
const $ = s => document.querySelector(s);
const stageMedia = STAGES.map(stage => stage.assets.map(src => { const img = new Image(); img.src = src; return img; }));
const loaded = stageMedia.flat().map(img => img.decode());
const canvas = $('#game'), ctx = canvas.getContext('2d'), overDialog = $('#over'), stageDialog = $('#stage-complete');
let game, pointer = null, stageSprites;

function resize() {
  const box = $('.arena').getBoundingClientRect(), scale = Math.min(box.width/C.width,box.height/C.height);
  const w = C.width*scale, h = C.height*scale, dpr = Math.min(devicePixelRatio||1,3);
  canvas.style.width = `${w}px`; canvas.style.height = `${h}px`; canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr);
  ctx.setTransform(canvas.width/C.width,0,0,canvas.height/C.height,0,0);
}
new ResizeObserver(resize).observe($('.arena'));
function renderStage(stage) {
  document.title = stage.title; $('#title').textContent = stage.displayTitle;
  const progress = $('#progress'); progress.hidden = !stage.clearTarget;
  const levels = $('#levels'); levels.replaceChildren(); levels.setAttribute('aria-label', `${stage.diameterRatios.length}级合成顺序`);
  stage.assets.forEach((src,i) => { const img=document.createElement('img');img.src=src;img.alt=`${i+1}级`;levels.append(img);if(i<stage.assets.length-1){const arrow=document.createElement('span');arrow.textContent='›';levels.append(arrow);} });
}
function circle(level,x,y,r,alpha=1) {
  ctx.save();ctx.globalAlpha=alpha;ctx.shadowColor='#50654220';ctx.shadowBlur=5;ctx.shadowOffsetY=2;
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.shadowColor='transparent';ctx.strokeStyle='#dbe2d2';ctx.lineWidth=1;ctx.stroke();
  const img=stageMedia[game.stageIndex][level-1], bounds=stageSprites[game.stageIndex][level-1], scale=spriteScale(bounds,r,C.imageFill);
  ctx.drawImage(img,bounds.left,bounds.top,bounds.width,bounds.height,x-bounds.width*scale/2,y-bounds.height*scale/2,bounds.width*scale,bounds.height*scale);ctx.restore();
}
function draw(){
  ctx.clearRect(0,0,C.width,C.height);
  let warning=false;for(const b of game.bodies.values())if(b.plugin.dangerSince!==null)warning=true;
  ctx.save();ctx.strokeStyle=warning?'#ce7c62':'#cad2be';ctx.setLineDash([4,7]);ctx.beginPath();ctx.moveTo(16,C.dangerY);ctx.lineTo(C.width-16,C.dangerY);ctx.stroke();ctx.restore();
  ctx.fillStyle=warning?'#b97259':'#adb89e';ctx.font='10px system-ui';ctx.fillText(warning?'留意上方空间':'堆叠请留在线下',18,C.dangerY-10);
  if(!game.over&&!game.paused&&game.time>=game.readyAt){ctx.save();ctx.setLineDash([3,8]);ctx.strokeStyle='#d8decc';ctx.beginPath();ctx.moveTo(game.x,C.dropY+game.radius(game.current)+8);ctx.lineTo(game.x,C.height-12);ctx.stroke();ctx.restore();circle(game.current,game.x,C.dropY,game.radius(game.current),0.94);}
  for(const b of game.bodies.values())circle(b.plugin.level,b.position.x,b.position.y,game.radius(b.plugin.level));
  for(const e of game.effects){const t=(game.time-e.at)/650;ctx.save();ctx.globalAlpha=1-t;ctx.strokeStyle='#a9bf89';ctx.lineWidth=3*(1-t);ctx.beginPath();ctx.arc(e.x,e.y,e.r+18*t,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#56713c';ctx.textAlign='center';ctx.font='bold 19px system-ui';ctx.fillText(`+${e.points}`,e.x,e.y-e.r-20*t);ctx.restore();}
}
function aim(event){const rect=canvas.getBoundingClientRect();game.move((event.clientX-rect.left)*C.width/rect.width);}
function restart(){pointer=null;if(overDialog.open)overDialog.close();if(stageDialog.open)stageDialog.close();game.reset();canvas.focus({preventScroll:true});}
async function boot() {
  try {
    await Promise.all(loaded); stageSprites = stageMedia.map(images => images.map(prepareSprite));
    game = new Game({
      onScore(score){$('#score').textContent=score;},
      onEnd(score){pointer=null;$('#final-score').textContent=score;overDialog.showModal();},
      onStageChange(stage){renderStage(stage);},
      onProgress(value,target){if(target)$('#progress').innerHTML=`最高级消除 <strong>${value}</strong>/${target}`;},
      onStageComplete(){pointer=null;stageDialog.showModal();},
    });
    $('#loading').hidden=true;resize();
    canvas.addEventListener('pointerdown',e=>{if(pointer!==null||game.over||game.paused||e.button!==0)return;pointer=e.pointerId;canvas.setPointerCapture(e.pointerId);aim(e);});
    canvas.addEventListener('pointermove',e=>{if(!game.paused&&(e.pointerId===pointer||(e.pointerType==='mouse'&&pointer===null)))aim(e);});
    canvas.addEventListener('pointerup',e=>{if(e.pointerId!==pointer)return;aim(e);pointer=null;game.drop();});
    canvas.addEventListener('pointercancel',()=>pointer=null);canvas.addEventListener('lostpointercapture',()=>pointer=null);
    canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight',' '].includes(e.key)){e.preventDefault();if(e.key===' '){if(!e.repeat)game.drop();}else if(!game.paused)game.move(game.x+(e.key==='ArrowLeft'?-12:12));}});
    $('#restart').onclick=restart;$('#again').onclick=restart;$('#next-stage').onclick=()=>{if(game.continueToNextStage())stageDialog.close();canvas.focus({preventScroll:true});};
    overDialog.addEventListener('cancel',e=>e.preventDefault());stageDialog.addEventListener('cancel',e=>e.preventDefault());
    let last=performance.now(),accumulator=0;
    document.addEventListener('visibilitychange',()=>{last=performance.now();accumulator=0;pointer=null;});
    function frame(now){if(!document.hidden){accumulator+=Math.min(now-last,80);while(accumulator>=C.fixedStep){game.step();accumulator-=C.fixedStep;}draw();}last=now;requestAnimationFrame(frame);}requestAnimationFrame(frame);
  } catch(error) { $('#loading').textContent='素材加载失败，请刷新页面重试。'; console.error(error); }
}
boot();
