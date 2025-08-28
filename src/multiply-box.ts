import { Container, Graphics, Text, Rectangle, Texture, } from 'pixi.js';
import { Bullet, createBulletAt } from './bullet';

export class MultiplyBox extends Container {
  private readonly rect: Graphics;
  private readonly text: Text;
  public readonly multiplier: number;
  private bounds: Rectangle;

  constructor(n: number, screenHeight: number) {
    super();
    this.multiplier = n;

    this.rect = new Graphics();
    this.rect.rect(0, 0, 50, screenHeight / 3);
    this.rect.fill('#fdf042ff');
    this.rect.stroke({ color: 0xff3300, width: 5 });

    this.text = new Text({
      text: `x${n}`,
    });
    this.text.x = this.rect.x + (this.rect.width - this.text.width) / 2;
    this.text.y = this.rect.y + (this.rect.height - this.text.height) / 2;

    this.addChild(this.rect);
    this.addChild(this.text);

    this.bounds = new Rectangle(this.x, this.y, this.width, this.height);
  }

  public setBounds(x: number, y: number, width: number, height: number) {
    this.bounds.x = x;
    this.bounds.y = y;
    this.bounds.width = width;
    this.bounds.height = height;
  }

  public isOutOfBounds(screenBounds: Rectangle): boolean {
    return (
      this.bounds.x > screenBounds.width ||
      this.bounds.x + this.bounds.width < 0 ||
      this.bounds.y > screenBounds.height ||
      this.bounds.y + this.bounds.height < 0
    );
  }

  public multiplyBullet(bullet: Bullet, bulletTexture: Texture): Bullet[] {
    const newBullets: Bullet[] = [];
    for (let i = 0; i < this.multiplier; i++) {
      const newBullet = createBulletAt(bulletTexture, bullet.bullet.x, bullet.bullet.y + i * 10);
      newBullet.multiplied = true;
      newBullets.push(newBullet);
    }
    return newBullets;
  }
}
