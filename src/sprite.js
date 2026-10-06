// 仅忽略完全透明像素，保留半透明边缘；分析只在图片加载后执行一次。
export function measureAlpha(data, width, height) {
  let left=width, top=height, right=-1, bottom=-1;
  for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
    if(data[(y*width+x)*4+3]===0) continue;
    left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
  }
  if(right<0) throw new Error('素材没有可见像素');
  const w=right-left+1,h=bottom-top+1,cx=left+w/2,cy=top+h/2;
  let radius=0;
  // 按每个可见像素的最远角计算包围圆，而不是保守地用整张 PNG 的对角线。
  for(let y=top;y<=bottom;y++) for(let x=left;x<=right;x++) {
    if(data[(y*width+x)*4+3]===0) continue;
    radius=Math.max(radius,Math.hypot(Math.abs(x+0.5-cx)+0.5,Math.abs(y+0.5-cy)+0.5));
  }
  return {left,top,width:w,height:h,radius};
}
export function prepareSprite(image) {
  const canvas=document.createElement('canvas');
  canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
  return measureAlpha(ctx.getImageData(0,0,canvas.width,canvas.height).data,canvas.width,canvas.height);
}
export function spriteScale(bounds,radius,fill) {
  return Math.min(radius*fill/bounds.radius,2*radius*fill/Math.max(bounds.width,bounds.height));
}
