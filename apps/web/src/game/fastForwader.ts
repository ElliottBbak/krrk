import type { RenderParameters } from './rouletteRenderer';
import type { Rect } from './types/rect.type';
import type { MouseEventArgs, UIObject } from './UIObject';

export class FastForwader implements UIObject {
  private bound: Rect = { x: 0, y: 0, w: 0, h: 0 };
  private isEnabled: boolean = false;

  public get speed(): number {
    return this.isEnabled ? 2 : 1;
  }

  update(_deltaTime: number): void {}

  render(ctx: CanvasRenderingContext2D, _params: RenderParameters, width: number, height: number): void {
    this.bound.w = width / 2;
    this.bound.h = height / 2;
    this.bound.x = this.bound.w / 2;
    this.bound.y = this.bound.h / 2;

    if (this.isEnabled) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = 'white';
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('▶▶', width / 2, height / 2);
      ctx.restore();
    }
  }

  getBoundingBox(): Rect | null {
    return this.bound;
  }

  onMouseDown?(_e?: MouseEventArgs): void {
    this.isEnabled = true;
  }

  onMouseUp?(_e?: MouseEventArgs): void {
    this.isEnabled = false;
  }
}
