import { Application, Assets, Sprite } from 'pixi.js';
import { Controller } from './controller';

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

  bunny.x = 0;
  bunny.y = app.screen.height / 2;

  function moveBunnyBy(bunny: Sprite, x: number, y: number) {
    bunny.x = Math.min(Math.max(bunny.x + x, 0), app.screen.width - bunny.width);
    bunny.y = Math.min(Math.max(bunny.y + y, 0), app.screen.height - bunny.height);
  }

  // Bullets
  const bullets: Sprite[] = [];
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
      const bullet = new Sprite(bulletTexture);
      bullet.anchor.set(0, 0); // Keep top-left origin
      bullet.scale.set(0.1);
      // Spawn at bunny's right side
      bullet.x = bunny.x + bunny.width;                         
      bullet.y = bunny.y + (bunny.height - bullet.height) / 2;  
      app.stage.addChild(bullet);
      bullets.push(bullet);
    }
    wasSpaceDown = isSpaceDown;

    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += bulletSpeed;
      if (b.x > app.screen.width) {
        b.destroy();          
        bullets.splice(i, 1); 
      }
    }
    // ------
  })

  app.stage.addChild(bunny);

  document.body.appendChild(app.canvas);
})();
