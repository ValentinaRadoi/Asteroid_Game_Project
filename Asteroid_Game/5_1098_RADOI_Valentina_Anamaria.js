

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

let ship = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  angle: 0,
  speed: 0,
  rotation: 0
};

//variabilele folosite
let bullets = [];
let asteroids = [];
let keys = {};
let lives = 3; 
let score = 0; 
let gameOver = false; 

//nr de puncte necesare pt a castiga o viata
const pointsThreshold = 100;

function createAsteroid() {
  const baseSize = 30;
  const value = Math.floor(Math.random() * 4) + 1;  

  let color = "white";
  if (value === 1) color = "green";
  else if (value === 2) color = "yellow";
  else if (value === 3) color = "orange";
  else if (value === 4) color = "red";

  const size = baseSize + value * 10; 

  asteroids.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: size,             
    value: value,           
    color: color,           
    dx: Math.random() * 2 - 1,  
    dy: Math.random() * 2 - 1   
  });
}


for (let i = 0; i < 6; i++) {
  createAsteroid();
}


document.addEventListener("keydown", (e) => (keys[e.code] = true));
document.addEventListener("keyup", (e) => (keys[e.code] = false));


function launchRocket() {
  if (bullets.length < 1) { 
    bullets.push({
      x: ship.x,
      y: ship.y,
      angle: ship.angle,
      speed: 5
    });
  }
}


function update() {
  if (gameOver) return; 

  
  if (keys["ArrowUp"]) ship.y -= 5;  
  if (keys["ArrowDown"]) ship.y += 5; 
  if (keys["ArrowLeft"]) ship.x -= 5;  
  if (keys["ArrowRight"]) ship.x += 5;  
  
  if (keys["KeyZ"]) ship.rotation = -0.05;  
  else if (keys["KeyC"]) ship.rotation = 0.05;  
  else ship.rotation = 0;  

  ship.angle += ship.rotation;

  if (keys["KeyX"]) {
    launchRocket();
  }

  bullets = bullets.filter(
    (b) =>
      b.x > 0 && b.x < canvas.width && b.y > 0 && b.y < canvas.height
  );
  bullets.forEach((bullet) => {
    bullet.x += Math.cos(bullet.angle) * bullet.speed;
    bullet.y += Math.sin(bullet.angle) * bullet.speed;
  });

  bullets.forEach((bullet, bulletIndex) => {
    asteroids.forEach((asteroid, asteroidIndex) => {
      const dx = bullet.x - asteroid.x;
      const dy = bullet.y - asteroid.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < asteroid.size) {
        asteroid.value--;  
        score += 10; 
        if (asteroid.value <= 0) {
          
          asteroids.splice(asteroidIndex, 1);
        }
        
        bullets.splice(bulletIndex, 1);
      }
    });
  });

 
  for (let i = 0; i < asteroids.length; i++) {
    for (let j = i + 1; j < asteroids.length; j++) {
      const asteroid1 = asteroids[i];
      const asteroid2 = asteroids[j];
      const dx = asteroid1.x - asteroid2.x;
      const dy = asteroid1.y - asteroid2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < asteroid1.size + asteroid2.size) {
        
        const angle = Math.atan2(dy, dx);

        const speed1 = Math.sqrt(asteroid1.dx * asteroid1.dx + asteroid1.dy * asteroid1.dy);
        const speed2 = Math.sqrt(asteroid2.dx * asteroid2.dx + asteroid2.dy * asteroid2.dy);

        asteroid1.dx = speed1 * Math.cos(angle);
        asteroid1.dy = speed1 * Math.sin(angle);

        asteroid2.dx = speed2 * Math.cos(angle + Math.PI);
        asteroid2.dy = speed2 * Math.sin(angle + Math.PI);
      }
    }
  }

  asteroids.forEach((asteroid) => {
    const dx = ship.x - asteroid.x;
    const dy = ship.y - asteroid.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < asteroid.size) {
      lives--;
      if (lives <= 0) {
        gameOver = true;  
      } else {
        ship.x = canvas.width / 2;
        ship.y = canvas.height / 2;
        ship.angle = 0;
      }
    }
  });

  if (score >= pointsThreshold) {
    lives++;  
    score = 0;  
  }

  asteroids.forEach((asteroid) => {
    asteroid.x += asteroid.dx;
    asteroid.y += asteroid.dy;

    if (asteroid.x < 0) asteroid.x = canvas.width;
    if (asteroid.x > canvas.width) asteroid.x = 0;
    if (asteroid.y < 0) asteroid.y = canvas.height;
    if (asteroid.y > canvas.height) asteroid.y = 0;
  });
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle);
  ctx.beginPath();
  ctx.moveTo(15, 0);
  ctx.lineTo(-10, 10);
  ctx.lineTo(-10, -10);
  ctx.closePath();
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "red";
  bullets.forEach((bullet) => {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  asteroids.forEach((asteroid) => {
    ctx.beginPath();
    ctx.arc(asteroid.x, asteroid.y, asteroid.size, 0, Math.PI * 2);
    ctx.fillStyle = asteroid.color;
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(asteroid.value, asteroid.x, asteroid.y);
  });

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Vieți: " + lives, 10, 10);

  ctx.fillText("Puncte: " + score, 10, 40);

  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
  }
}

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

gameLoop();