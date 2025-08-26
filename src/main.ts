import { Application, Assets, Sprite } from 'pixi.js';

// Asynchronous IIFE
(async () => {
  // Create a PixiJS application.
  const app = new Application();

  // Intialize the application.
  await app.init({ background: '#1099bb', resizeTo: window });

  const texture = await Assets.load('/raw-assets/bunny.png');
  const bunny = new Sprite(texture);

  bunny.anchor.set(0.5);
  bunny.scale.set(0.2);


  bunny.x = app.screen.width / 2;
  bunny.y = app.screen.height / 2;

  app.stage.interactive = true;
  app.stage.on('pointermove', (event) => {
    const pos = event.global;
    bunny.x = pos.x;
    bunny.y = pos.y;

  });

  app.stage.addChild(bunny);

  document.body.appendChild(app.canvas);
})();
