<template>
  <div>
    <div id="game-canvas" ref="gameCanvas"></div>
    <score-display :score="score" :altitude="currentAltitude"></score-display>
    <game-controls @land="landBalloon"></game-controls>
  </div>
</template>

<script>
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { ref, onMounted, onBeforeUnmount } from 'vue';

export default {
  name: 'BalloonGame',
  components: {
    ScoreDisplay: () => import('./ScoreDisplay.vue'),
    GameControls: () => import('./GameControls.vue'),
  },
  setup() {
    const app = ref(null);
    const balloon = ref(null);
    const clouds = ref([]);
    const score = ref(0);
    const isPlaying = ref(false);
    const isLanding = ref(false);
    const popThreshold = ref(0);
    const currentAltitude = ref(0);
    const riskLevel = ref(0);

    const init = () => {
      app.value = new PIXI.Application({
        view: document.getElementById('game-canvas'),
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x87CEEB,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
      });

      createBackground();
      createBalloon();
      createClouds();
      window.addEventListener('resize', onResize);
    };

    const createBackground = () => {
      const graphics = new PIXI.Graphics();
      const gradient = graphics.beginTextureFill({
        texture: createGradientTexture()
      });
      graphics.drawRect(0, 0, app.value.screen.width, app.value.screen.height);
      graphics.endFill();
      app.value.stage.addChild(graphics);
    };

    const createGradientTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 256);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(0.5, '#98D8E8');
      gradient.addColorStop(1, '#E0F6FF');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 256);
      return PIXI.Texture.from(canvas);
    };

    const createBalloon = () => {
      const balloonContainer = new PIXI.Container();
      const balloonGraphics = new PIXI.Graphics();
      balloonGraphics.beginFill(0xFF6B6B);
      balloonGraphics.drawCircle(0, 0, 40);
      balloonGraphics.endFill();
      balloonContainer.addChild(balloonGraphics);
      balloonContainer.x = app.value.screen.width / 2;
      balloonContainer.y = app.value.screen.height - 100;
      balloon.value = balloonContainer;
      app.value.stage.addChild(balloonContainer);
    };

    const createClouds = () => {
      for (let i = 0; i < 8; i++) {
        const cloud = createCloud();
        cloud.x = Math.random() * app.value.screen.width;
        cloud.y = Math.random() * app.value.screen.height;
        clouds.value.push(cloud);
        app.value.stage.addChild(cloud);
      }
    };

    const createCloud = () => {
      const cloud = new PIXI.Container();
      for (let i = 0; i < 5; i++) {
        const circle = new PIXI.Graphics();
        circle.beginFill(0xFFFFFF);
        circle.drawCircle(
          (i - 2) * 20 + Math.random() * 10,
          Math.random() * 10 - 5,
          25 + Math.random() * 15
        );
        circle.endFill();
        cloud.addChild(circle);
      }
      return cloud;
    };

    const startGame = () => {
      isPlaying.value = true;
      isLanding.value = false;
      score.value = 0;
      currentAltitude.value = 0;
      popThreshold.value = 100 + Math.random() * 100;
      gameLoop();
    };

    const gameLoop = () => {
      if (!isPlaying.value) return;
      if (!isLanding.value) {
        currentAltitude.value += 0.5;
        score.value = Math.floor(currentAltitude.value);
        riskLevel.value = currentAltitude.value / popThreshold.value;
        if (Math.random() < riskLevel.value * 0.01) {
          popBalloon();
          return;
        }
        gsap.to(balloon.value, {
          y: app.value.screen.height - 100 - currentAltitude.value * 2,
          duration: 0.1,
          ease: "none"
        });
      }
      clouds.value.forEach((cloud, index) => {
        cloud.y += 0.5 + index * 0.1;
        if (cloud.y > app.value.screen.height + 100) {
          cloud.y = -100;
          cloud.x = Math.random() * app.value.screen.width;
        }
      });
      requestAnimationFrame(gameLoop);
    };

    const landBalloon1 = () => {
      if (!isPlaying.value || isLanding.value) return;
      isLanding.value = true;
      isPlaying.value = false;
      gsap.to(balloon.value, {
        y: app.value.screen.height - 100,
        duration: 2,
        ease: "power2.inOut",
        onComplete: () => {
          endGame(true);
        }
      });
    const landBalloon2 = () => {
      if (!isPlaying.value || isLanding.value) return;
      isLanding.value = true;
      isPlaying.value = false;
      gsap.to(balloon.value, {
        y: app.value.screen.height - 100,
        duration: 2,
        ease: "power2.inOut",
        onComplete: () => {
          endGame(true);
        }
      });
    };

    const popBalloon = () => {
      isPlaying.value = false;
      balloon.value.visible = false;
      setTimeout(() => {
        endGame(false);
      }, 1000);
    };

    const endGame = (success) => {
      // Handle end game logic
    };

    const onResize = () => {
      app.value.renderer.resize(window.innerWidth, window.innerHeight);
    };

    onMounted(() => {
      init();
      startGame();
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', onResize);
      app.value.destroy(true, { children: true });
    });

    return {
      score,
      currentAltitude,
      landBalloon
    };
  }
};
</script>

<style scoped>
#game-canvas {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>