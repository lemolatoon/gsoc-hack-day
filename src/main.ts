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

type Enemy = {
  hit: boolean;
  enemy: Sprite;
}

function createBulletAt(bulletTexture: Texture, x: number, y: number): Bullet {
  const bullet = new Sprite(bulletTexture);
  bullet.anchor.set(0, 0); // Keep top-left origin
  bullet.scale.set(0.1);
  bullet.x = x;
  bullet.y = y;
  return { multiplied: false, bullet };
}

function createEnemyAt(enemyTexture: Texture, x: number, y: number, enemyScale: number): Enemy {
  const enemy = new Sprite(enemyTexture);
  enemy.anchor.set(0, 0); // Keep top-left origin
  enemy.scale.set(enemyScale);
  enemy.x = x;
  enemy.y = y;
  return { hit: false, enemy };
}

function checkCollision(sprite1: Sprite, sprite2: Sprite): boolean {
  const bounds1 = sprite1.getBounds();
  const bounds2 = sprite2.getBounds();
  return bounds1.x < bounds2.x + bounds2.width &&
         bounds1.x + bounds1.width > bounds2.x &&
         bounds1.y < bounds2.y + bounds2.height &&
         bounds1.y + bounds1.height > bounds2.y;
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
  const enemyTexture = await Assets.load('/raw-assets/angry_bunny.png');
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

  const enemies: Enemy[] = [];
  const enemySpeed = 1.5;
  let enemySpawnTimer = 0;
  const enemySpawnInterval = 120;
  const initialEnemyCount = 3;
  const maxEnemiesOnScreen = 25;

  function spawnEnemy() {
    if (enemies.length >= maxEnemiesOnScreen) return;

    const rightHalfScreen = app.screen.width / 2;
    const minDistanceFromPlayer = 200;

    const minSpawnX = Math.max(rightHalfScreen, bunny.x + minDistanceFromPlayer);
    const spawnAreaWidth = app.screen.width - minSpawnX + 200;
    const x = minSpawnX + Math.random() * spawnAreaWidth;
    const y = Math.random() * app.screen.height;
    const enemy = createEnemyAt(enemyTexture, x, y, 0.15);
    app.stage.addChild(enemy.enemy);
    enemies.push(enemy);
  }

  for (let i = 0; i < initialEnemyCount; i++) {
    spawnEnemy();
  }

  app.ticker.add(() => {
    const walk = controller.keys.left.pressed || controller.keys.right.pressed;

    let direction = -1;
    if (controller.keys.left.pressed) direction = -1;
    else if (controller.keys.right.pressed) direction = 1;
    else if (controller.keys.up.pressed) moveBunnyBy(bunny, 0, -10);
    else if (controller.keys.down.pressed) moveBunnyBy(bunny, 0, 10);

        // Determine the scene's horizontal scrolling speed based on the character's state.
    let speed = 5;


    // Shift the scene's position based on the character's facing direction, if in a movement state.
    if (walk) moveBunnyBy(bunny, speed * direction, 0);

    // Ememies come to player
    enemySpawnTimer++;
    if (enemySpawnTimer >= enemySpawnInterval) {
      spawnEnemy();
      enemySpawnTimer = 0;
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];

      if (!e.hit) {
        const dx = bunny.x - e.enemy.x;
        const dy = bunny.y - e.enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
          const normalizedDx = (dx / distance) * enemySpeed;
          const normalizedDy = (dy / distance) * enemySpeed;

          e.enemy.x += normalizedDx;
          e.enemy.y += normalizedDy;
        }
      }

      if (e.enemy.x < -200 || e.enemy.x > app.screen.width + 200 ||
          e.enemy.y < -200 || e.enemy.y > app.screen.height + 200) {
        e.enemy.destroy();
        enemies.splice(i, 1);
        continue;
      }

      if (!e.hit && checkCollision(e.enemy, bunny)) {
        e.hit = true;
        e.enemy.tint = 0xff0000;
      }
    }



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

      // Check collision with enemies first
      let hit = false;
      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        if (!enemy.hit && checkCollision(b.bullet, enemy.enemy)) {
          enemy.hit = true;
          enemy.enemy.destroy();
          enemies.splice(j, 1);
          b.bullet.destroy();
          bullets.splice(i, 1);
          hit = true;
          break;
        }
      }

      if (hit) continue;

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
