import { Sprite, Texture } from 'pixi.js';

export type Bullet = {
  bullet: Sprite;
  multiplied: boolean;
}

export function createBulletAt(bulletTexture: Texture, x: number, y: number): Bullet {
  const bullet = new Sprite(bulletTexture);
  bullet.anchor.set(0, 0); // Keep top-left origin
  bullet.scale.set(0.1);
  bullet.x = x;
  bullet.y = y;
  return { bullet, multiplied: false };
}
