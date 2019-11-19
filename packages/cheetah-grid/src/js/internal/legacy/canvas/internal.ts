export interface CanvasOperations {
  moveTo: typeof CanvasRenderingContext2D.prototype.moveTo;
  lineTo: typeof CanvasRenderingContext2D.prototype.lineTo;
  closePath: typeof CanvasRenderingContext2D.prototype.closePath;
  bezierCurveTo: typeof CanvasRenderingContext2D.prototype.bezierCurveTo;
  quadraticCurveTo: typeof CanvasRenderingContext2D.prototype.quadraticCurveTo;
  save: typeof CanvasRenderingContext2D.prototype.save;
  translate: typeof CanvasRenderingContext2D.prototype.translate;
  rotate: typeof CanvasRenderingContext2D.prototype.rotate;
  scale: typeof CanvasRenderingContext2D.prototype.scale;
  arc: typeof CanvasRenderingContext2D.prototype.arc;
  restore: typeof CanvasRenderingContext2D.prototype.restore;
  arcTo: typeof CanvasRenderingContext2D.prototype.arcTo;
  ellipse: typeof CanvasRenderingContext2D.prototype.ellipse;
  rect: typeof CanvasRenderingContext2D.prototype.rect;
}
