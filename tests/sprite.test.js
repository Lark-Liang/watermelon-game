import { test } from 'node:test';
import assert from 'node:assert/strict';
import { measureAlpha, spriteScale } from '../src/sprite.js';
test('透明留白被忽略，半透明像素仍完整保留在安全圆内',()=>{
 const w=100,h=80,data=new Uint8ClampedArray(w*h*4);
 const pixels=[[20,10,255],[60,50,1],[40,30,128]];
 for(const [x,y,a] of pixels)data[(y*w+x)*4+3]=a;
 const bounds=measureAlpha(data,w,h),scale=spriteScale(bounds,50,.95);
 assert.deepEqual([bounds.left,bounds.top,bounds.width,bounds.height],[20,10,41,41]);
 for(const [x,y] of pixels)for(const dx of [0,1])for(const dy of [0,1]) {
   const distance=Math.hypot(x+dx-(bounds.left+bounds.width/2),y+dy-(bounds.top+bounds.height/2))*scale;
   assert.ok(distance<=47.5+1e-9);
 }
});
