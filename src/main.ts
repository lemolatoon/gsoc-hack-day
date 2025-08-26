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
  const bunny = new Sprite(texture);

  bunny.scale.set(0.2);
  bunny.anchor.set(0, 0);

  bunny.x = 0;
  bunny.y = app.screen.height / 2;

  function moveBunnyBy(bunny: Sprite, x: number, y: number) {
    bunny.x = Math.min(Math.max(bunny.x + x, 0), app.screen.width - bunny.width);
    bunny.y = Math.min(Math.max(bunny.y + y, 0), app.screen.height - bunny.height);
  }

  // Game loop


  app.ticker.add(() => {
    const walk = controller.keys.left.pressed || controller.keys.right.pressed;
    const shot = controller.keys.down.pressed;

    let direction = -1;
    if (controller.keys.left.pressed) direction = -1;
    else if (controller.keys.right.pressed) direction = 1;
    else if (controller.keys.up.pressed) moveBunnyBy(bunny, 0, -10);
    else if (controller.keys.down.pressed) moveBunnyBy(bunny, 0, 10);

        // Determine the scene's horizontal scrolling speed based on the character's state.
    let speed = 5;


    // Shift the scene's position based on the character's facing direction, if in a movement state.
    if (walk) moveBunnyBy(bunny, speed * direction, 0);
  })

  app.stage.addChild(bunny);

  document.body.appendChild(app.canvas);
})();
