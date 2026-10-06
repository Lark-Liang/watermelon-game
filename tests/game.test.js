import { test } from 'node:test';
import assert from 'node:assert/strict';
import Matter from 'matter-js';
import { Game } from '../src/game.js';
import { CONFIG as C } from '../src/config.js';
function steps(g,n){for(let i=0;i<n;i++)g.step();}
for(let level=1;level<6;level++)test(`${level}+${level} 实际碰撞升级并只计分一次`,()=>{
 const g=new Game();const r=g.radius(level);g.add(level,210-r+1,400);g.add(level,210+r-1,400);steps(g,120);
 assert.equal(g.bodies.size,1);assert.equal([...g.bodies.values()][0].plugin.level,level+1);assert.equal(g.score,C.points[level]);
});
test('六级相撞消除并只加一次配置分数',()=>{const g=new Game();g.add(6,125,460);g.add(6,295,460);steps(g,120);assert.equal(g.bodies.size,0);assert.equal(g.engine.world.bodies.length,3);assert.equal(g.score,C.maxLevelClearPoints);});
test('共享物体和重复碰撞事件不能重复合并',()=>{const g=new Game();const a=g.add(1,100,400),b=g.add(1,140,400),c=g.add(1,180,400);const pairs=[{bodyA:a,bodyB:b},{bodyA:b,bodyB:c},{bodyA:a,bodyB:b}];g.queuePairs(pairs);g.queuePairs(pairs);g.mergePending();assert.equal(g.score,2);assert.equal(g.bodies.size,2);});
test('合并产生新碰撞并继续连锁',()=>{const g=new Game();const a=g.add(1,180,450),b=g.add(1,220,450);g.add(2,200,405);g.queuePairs([{bodyA:a,bodyB:b}]);g.mergePending();steps(g,120);assert.equal(g.bodies.size,1);assert.equal([...g.bodies.values()][0].plugin.level,3);assert.equal(g.score,6);});
test('连续投放有冷却，随机仅含低等级',()=>{const g=new Game();for(let i=0;i<1000;i++)assert.ok([1,2,3].includes(g.choose()));assert.ok(g.drop());for(let i=0;i<100;i++)assert.equal(g.drop(),false);assert.equal(g.bodies.size,1);steps(g,30);assert.ok(g.drop());});
test('危险线延迟、结束冻结和重开清理',()=>{let ended=0;const g=new Game({onEnd:()=>ended++});const b=g.add(1,100,100,0);Matter.Body.setStatic(b,true);steps(g,60);assert.equal(g.over,false);steps(g,55);assert.equal(g.over,true);assert.equal(ended,1);const t=g.time;steps(g,20);assert.equal(g.time,t);g.reset();assert.equal(g.bodies.size,0);assert.equal(g.engine.world.bodies.length,3);assert.equal(g.over,false);assert.equal(g.score,0);assert.equal(g.engine.events.collisionStart.length,1);});
test('短暂越线恢复不失败，待投放不计入失败',()=>{const g=new Game();steps(g,200);assert.equal(g.over,false);const b=g.add(1,100,100,0);Matter.Body.setStatic(b,true);steps(g,70);Matter.Body.setPosition(b,{x:100,y:300});steps(g,80);assert.equal(g.over,false);assert.equal(b.plugin.dangerSince,null);});
test('投放生成宽限期、边界限制及白圆半径一致',()=>{const g=new Game();g.move(-100);assert.ok(g.x>=g.radius(g.current));g.drop();steps(g,60);assert.equal(g.over,false);for(const b of g.bodies.values())assert.equal(b.circleRadius,g.radius(b.plugin.level));g.move(1000);assert.ok(g.x<=C.width-g.radius(g.current));});

test('六级共享碰撞、已删除引用和重复事件安全',()=>{const g=new Game();const a=g.add(6,100,300),b=g.add(6,200,300),c=g.add(6,300,300);const pairs=[{bodyA:a,bodyB:b},{bodyA:b,bodyB:c},{bodyA:a,bodyB:b}];g.queuePairs(pairs);g.queuePairs(pairs);g.mergePending();g.queuePairs(pairs);g.mergePending();assert.equal(g.bodies.size,1);assert.ok(g.bodies.has(c.id));assert.equal(g.score,C.maxLevelClearPoints);});
test('五级合成后与六级连续消除',()=>{const g=new Game();const a=g.add(5,155,430),b=g.add(5,265,430);g.add(6,210,300);g.queuePairs([{bodyA:a,bodyB:b}]);g.mergePending();steps(g,150);assert.equal(g.bodies.size,0);assert.equal(g.score,C.points[5]+C.maxLevelClearPoints);});
test('六级半径均使用新的直径配置',()=>{const g=new Game();for(let level=1;level<=6;level++){const b=g.add(level,210,300);assert.equal(b.circleRadius,C.width*C.diameterRatios[level-1]/2);}});
