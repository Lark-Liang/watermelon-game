import Matter from 'matter-js';
import { CONFIG as C } from './config.js';
const { Engine, Bodies, Body, Composite, Events } = Matter;
export class Game {
  constructor({ onScore = () => {}, onEnd = () => {}, random = Math.random } = {}) {
    this.onScore = onScore; this.onEnd = onEnd; this.random = random;
    this.engine = Engine.create({ positionIterations: 8, velocityIterations: 8 });
    this.engine.gravity.y = C.gravity;
    // 事件中只预定合并，等物理步结束再增删刚体，避免失效引用和重复合并。
    const collisions = ({ pairs }) => this.queuePairs(pairs);
    Events.on(this.engine, 'collisionStart', collisions);
    Events.on(this.engine, 'collisionActive', collisions);
    this.reset();
  }
  radius(level) { return C.width * C.diameterRatios[level - 1] / 2; }
  choose() { let x = this.random(); for (let i = 0; i < C.weights.length; i++) { x -= C.weights[i]; if (x < 0) return i + 1; } return 3; }
  reset() {
    Composite.clear(this.engine.world, false); Engine.clear(this.engine);
    this.bodies = new Map(); this.pending = []; this.claimed = new Set();
    this.time = 0; this.readyAt = 0; this.score = 0; this.over = false; this.effects = [];
    this.current = this.choose(); this.x = C.width / 2;
    Composite.add(this.engine.world, [Bodies.rectangle(-25,C.height/2,50,C.height*4,{isStatic:true}),Bodies.rectangle(C.width+25,C.height/2,50,C.height*4,{isStatic:true}),Bodies.rectangle(C.width/2,C.height+25,C.width+100,50,{isStatic:true})]);
    this.onScore(0);
  }
  move(x) { const r = this.radius(this.current); this.x = Math.max(r + 1, Math.min(C.width - r - 1, x)); }
  add(level, x, y, grace = C.spawnGrace) {
    const body = Bodies.circle(x,y,this.radius(level),{restitution:C.restitution,friction:C.friction,frictionStatic:C.frictionStatic,frictionAir:C.frictionAir,density:C.density},48);
    body.plugin = { level, eligibleAt: this.time + grace, dangerSince: null };
    this.bodies.set(body.id,body); Composite.add(this.engine.world,body); return body;
  }
  drop() {
    if (this.over || this.time < this.readyAt) return false;
    this.move(this.x); this.add(this.current,this.x,C.dropY);
    this.current = this.choose(); this.readyAt = this.time + C.dropDelay; this.move(this.x); return true;
  }
  queuePairs(pairs) {
    for (const { bodyA:a, bodyB:b } of pairs) {
      if (!this.bodies.has(a.id) || !this.bodies.has(b.id) || this.claimed.has(a.id) || this.claimed.has(b.id)) continue;
      if (a.plugin.level !== b.plugin.level) continue;
      this.claimed.add(a.id); this.claimed.add(b.id); this.pending.push([a,b]);
    }
  }
  mergePending() {
    for (const [a,b] of this.pending) {
      if (!this.bodies.has(a.id) || !this.bodies.has(b.id)) continue;
      const clear = a.plugin.level === C.diameterRatios.length;
      const level = clear ? a.plugin.level : a.plugin.level + 1, r = this.radius(level);
      const x = Math.max(r,Math.min(C.width-r,(a.position.x+b.position.x)/2));
      const y = Math.min(C.height-r,(a.position.y+b.position.y)/2);
      Composite.remove(this.engine.world,[a,b]); this.bodies.delete(a.id); this.bodies.delete(b.id);
      // 最高级仍走同一锁定队列，只消除和计分，不创建第七级。
      if (!clear) {
        const merged = this.add(level,x,y,400);
        Body.setVelocity(merged,{x:Math.max(-2,Math.min(2,(a.velocity.x+b.velocity.x)/2)),y:Math.max(-2,Math.min(2,(a.velocity.y+b.velocity.y)/2))});
      }
      const points = clear ? C.maxLevelClearPoints : C.points[level-1];
      this.score += points; this.onScore(this.score);
      this.effects.push({x,y,r,at:this.time,points});
    }
    this.pending = []; this.claimed.clear();
  }
  step(dt = C.fixedStep) {
    if (this.over) return;
    this.time += dt; Engine.update(this.engine,dt); this.mergePending();
    for (const body of this.bodies.values()) {
      const p = body.plugin;
      if (this.time < p.eligibleAt) continue;
      if (body.position.y - this.radius(p.level) < C.dangerY) {
        p.dangerSince ??= this.time;
        if (this.time - p.dangerSince >= C.dangerDelay) { this.over = true; this.onEnd(this.score); break; }
      } else p.dangerSince = null;
    }
    this.effects = this.effects.filter(e => this.time - e.at < 650);
  }
}
