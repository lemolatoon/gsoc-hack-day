import { Application, Assets, Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import { Controller } from './controller';

function createMultiplyBox(n: number, screenHeight: number) {
  const container = new Container();
  const rect = new Graphics();
  rect.rect(0, 0, 50, screenHeight / 3);
  rect.fill('#fdf042ff');
  rect.stroke({ color: 0xff3300, width: 5 });

  const text = new Text({
    "text": `x${n}`,
  });
  text.x = rect.x + (rect.width - text.width) / 2;
  text.y = rect.y + (rect.height - text.height) / 2;

  container.addChild(rect);
  container.addChild(text);
  return container;
}

function isXYWithinBounds(x: number, y: number, container: Container) {
  const { top, bottom, left, right } = container.getBounds();
  return y >= top && y <= bottom && x >= left && x <= right;
}

type Bullet = {
  multiplied: boolean;
  bullet: Sprite;
}

function createBulletAt(bulletTexture: Texture, x: number, y: number): Bullet {
  const bullet = new Sprite(bulletTexture);
  bullet.anchor.set(0, 0); // Keep top-left origin
  bullet.scale.set(0.1);
  bullet.x = x;
  bullet.y = y;
  return { multiplied: false, bullet };
}

// Asynchronous IIFE
(async () => {
  // Create a PixiJS application.
  const app = new Application();
  // Create a controller that handles keyboard inputs.
  const controller = new Controller();

  // Intialize the application.
  await app.init({ background: '#1099bb', resizeTo: window });

  const texture = await Assets.load('/raw-assets/bunny.png');
  const bulletTexture = await Assets.load('/raw-assets/bullet.png');
  const bunny = new Sprite(texture);

  bunny.scale.set(0.2);
  bunny.anchor.set(0, 0);

  const rect1 = createMultiplyBox(2, app.screen.height);
  const rect2 = createMultiplyBox(3, app.screen.height);

  rect1.x = 300;
  rect1.y = 10;

  rect2.x = 300;
  rect2.y = app.screen.height * 2 / 3 - 10;

  app.stage.addChild(rect1);
  app.stage.addChild(rect2);

  bunny.x = 0;
  bunny.y = app.screen.height / 2;

  function moveBunnyBy(bunny: Sprite, x: number, y: number) {
    bunny.x = Math.min(Math.max(bunny.x + x, 0), app.screen.width - bunny.width);
    bunny.y = Math.min(Math.max(bunny.y + y, 0), app.screen.height - bunny.height);
  }

  // Bullets
  const dummybullet = createBulletAt(bulletTexture, 0, 0);
  const bullets: Bullet[] = [];
  const bulletSpeed = 12;
  let wasSpaceDown = false;

  // Game loop
  app.ticker.add(() => {
    const walk = controller.keys.left.pressed || controller.keys.right.pressed;
    const shot = controller.keys.space.pressed;

    let direction = -1;
    if (controller.keys.left.pressed) direction = -1;
    else if (controller.keys.right.pressed) direction = 1;
    else if (controller.keys.up.pressed) moveBunnyBy(bunny, 0, -10);
    else if (controller.keys.down.pressed) moveBunnyBy(bunny, 0, 10);

        // Determine the scene's horizontal scrolling speed based on the character's state.
    let speed = 5;


    // Shift the scene's position based on the character's facing direction, if in a movement state.
    if (walk) moveBunnyBy(bunny, speed * direction, 0);

    // --- bullets
    const isSpaceDown = controller.keys.space.pressed;
    const justPressed = isSpaceDown && !wasSpaceDown;
    if (justPressed) {
      // Spawn at bunny's right side
      const x = bunny.x + bunny.width;
      const y = bunny.y + (bunny.height - dummybullet.bullet.height) / 2;
      const bullet = createBulletAt(bulletTexture, x, y)
      app.stage.addChild(bullet.bullet);
      bullets.push(bullet);
    }
    wasSpaceDown = isSpaceDown;

    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.bullet.x += bulletSpeed;
      if (!b.multiplied && isXYWithinBounds(b.bullet.x, b.bullet.y, rect1)) {
        for (let i = 0; i < 2; i++) {
          const bullet = createBulletAt(bulletTexture, b.bullet.x, b.bullet.y + i * 10);
          bullet.multiplied = true;
          app.stage.addChild(bullet.bullet);
          bullets.push(bullet);
        }
      }
      if (!b.multiplied && isXYWithinBounds(b.bullet.x, b.bullet.y, rect2)) {
        for (let i = 0; i < 3; i++) {
          const bullet = createBulletAt(bulletTexture, b.bullet.x, b.bullet.y + i * 10);
          bullet.multiplied = true;
          app.stage.addChild(bullet.bullet);
          bullets.push(bullet);
        }
      }
      if (b.bullet.x > app.screen.width) {
        b.bullet.destroy();
        bullets.splice(i, 1);
      }
    }
    // ------
  })

  app.stage.addChild(bunny);

  document.body.appendChild(app.canvas);
})();
