const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 300;

let gameRunning = false;
let mode = 1;
let player1, player2;
let obstacles = [];
let bgm = document.getElementById('bgm');

// Tạo người chơi
function createPlayer(x, color) {
  return {
    x: x,
    y: canvas.height - 50,
    width: 40,
    height: 40,
    vy: 0,
    jumpPower: -12,
    gravity: 0.5,
    img: null,
    color: color
  };
}

// Tạo vật cản
function createObstacle() {
  const types = ['stone', 'tree', 'hole'];
  const type = types[Math.floor(Math.random() * types.length)];
  let w = 30, h = 30;
  if (type === 'tree') {
    w = 20; h = 50;
  } else if (type === 'hole') {
    w = 50; h = 10;
  }
  return {
    x: canvas.width,
    y: canvas.height - h,
    width: w,
    height: h,
    type: type
  };
}

// Vẽ người chơi
function drawPlayer(p) {
  if (p.img) {
    ctx.drawImage(p.img, p.x, p.y, p.width, p.height);
  } else {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.width, p.height);
  }
}

// Vẽ vật cản
function drawObstacle(o) {
  ctx.fillStyle = o.type === 'stone' ? 'gray' :
                  o.type === 'tree' ? 'green' : 'blue';
  ctx.fillRect(o.x, o.y, o.width, o.height);
}

// Cập nhật game
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawPlayer(player1);
  if (mode === 2) drawPlayer(player2);

  obstacles.forEach(o => {
    o.x -= 5;
    drawObstacle(o);
  });

  player1.vy += player1.gravity;
  player1.y += player1.vy;
  if (player1.y > canvas.height - player1.height) {
    player1.y = canvas.height - player1.height;
    player1.vy = 0;
  }

  if (mode === 2) {
    player2.vy += player2.gravity;
    player2.y += player2.vy;
    if (player2.y > canvas.height - player2.height) {
      player2.y = canvas.height - player2.height;
      player2.vy = 0;
    }
  }

  obstacles = obstacles.filter(o => {
    if (checkCollision(player1, o) || (mode === 2 && checkCollision(player2, o))) {
      alert('Game Over!');
      gameRunning = false;
      bgm.pause();
      return false;
    }
    return o.x + o.width > 0;
  });

  if (gameRunning) {
    requestAnimationFrame(update);
  }
}

// Va chạm
function checkCollision(p, o) {
  return p.x < o.x + o.width &&
         p.x + p.width > o.x &&
         p.y < o.y + o.height &&
         p.y + p.height > o.y;
}

// Bắt đầu game
function startGame() {
  player1 = createPlayer(100, 'red');
  player2 = createPlayer(200, 'blue');
  obstacles = [];
  gameRunning = true;
  bgm.play().catch(() => {});
  update();
  spawnObstacles();
}

// Sinh vật cản
function spawnObstacles() {
  const interval = setInterval(() => {
    if (!gameRunning) {
      clearInterval(interval);
    } else {
      obstacles.push(createObstacle());
    }
  }, 1500);
}

// Nhảy
function jump(p) {
  if (p.y >= canvas.height - p.height) {
    p.vy = p.jumpPower;
  }
}

// Sự kiện
document.getElementById('start1p').onclick = () => {
  mode = 1;
  startGame();
};
document.getElementById('start2p').onclick = () => {
  mode = 2;
  startGame();
};

document.addEventListener('keydown', e => {
  if (e.code === 'Space') jump(player1);
  if (e.code === 'ArrowUp' && mode === 2) jump(player2);
});
canvas.addEventListener('click', () => jump(player1));
canvas.addEventListener('touchstart', e => {
  const x = e.touches[0].clientX;
  if (mode === 1 || x < canvas.width / 2) {
    jump(player1);
  } else {
    jump(player2);
  }
});

// Upload ảnh
document.getElementById('uploadImg').onchange = e => {
  const file = e.target.files[0];
  if (file) {
    const img = new Image();
    img.onload = () => {
      const aspect = img.width / img.height;
      img.width = 40;
      img.height = 40 / aspect;
      player1.img = img;
      if (mode === 2) player2.img = img;
    };
    img.src = URL.createObjectURL(file);
  }
};
