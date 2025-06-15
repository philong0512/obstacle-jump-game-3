const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 300;

let gameRunning = false;
let mode = 1;
let player1, player2;
let obstacles = [];
let obstacleSpeed = 2;
let speedIncreaseInterval;
let bgm = document.getElementById('bgm');
let selectedCharacter = 'male'; // mặc định

// Ảnh vật cản
const obstacleImages = {
  stone: new Image(),
  tree: new Image(),
};
obstacleImages.stone.src = 'https://i.imgur.com/OdL0XPt.png';
obstacleImages.tree.src = 'https://i.imgur.com/z5XThZq.png';

// Ảnh nhân vật
const playerImages = {
  male: new Image(),
  female: new Image()
};
playerImages.male.src = 'https://i.imgur.com/w1URC0U.png';
playerImages.female.src = 'https://i.imgur.com/dpQ5h9f.png';

// Lấy lựa chọn nhân vật
document.getElementById('characterSelect').onchange = e => {
  selectedCharacter = e.target.value;
};

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
    w = 40; h = 60;
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

// Vẽ người chơi và bóng
function drawPlayer(p) {
  if (p.y < canvas.height - p.height) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(p.x + p.width / 2, canvas.height - 5, p.width / 2, 5, 0, 0, 2 * Math.PI);
    ctx.fill();
  }

  if (p.img) {
    ctx.drawImage(p.img, p.x, p.y, p.width, p.height);
  } else {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.width, p.height);
  }
}

// Vẽ vật cản có ảnh
function drawObstacle(o) {
  if (o.type === 'hole') {
    ctx.fillStyle = 'blue';
    ctx.fillRect(o.x, o.y, o.width, o.height);
  } else if (obstacleImages[o.type]?.complete) {
    ctx.drawImage(obstacleImages[o.type], o.x, o.y, o.width, o.height);
  } else {
    ctx.fillStyle = o.type === 'stone' ? 'gray' : 'green';
    ctx.fillRect(o.x, o.y, o.width, o.height);
  }
}

// Hiệu ứng khi va chạm
function flashScreen() {
  canvas.style.transition = 'background 0.1s';
  canvas.style.background = 'red';
  setTimeout(() => {
    canvas.style.background = 'white';
  }, 100);
}

// Cập nhật game
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawPlayer(player1);
  if (mode === 2) drawPlayer(player2);

  obstacles.forEach(o => {
    o.x -= obstacleSpeed;
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
      flashScreen();
      setTimeout(() => {
        alert('Game Over!');
        gameRunning = false;
        clearInterval(speedIncreaseInterval);
        bgm.pause();
      }, 100);
      return false;
    }
    return o.x + o.width > 0;
  });

  if (gameRunning) {
    requestAnimationFrame(update);
  }
}

// Kiểm tra va chạm
function checkCollision(p, o) {
  return p.x < o.x + o.width &&
         p.x + p.width > o.x &&
         p.y < o.y + o.height &&
         p.y + p.height > o.y;
}

// Bắt đầu game
function startGame() {
  const img = playerImages[selectedCharacter];

  player1 = createPlayer(100, 'red');
  player1.img = img;

  player2 = createPlayer(200, 'blue');
  if (mode === 2) player2.img = img;

  obstacles = [];
  obstacleSpeed = 2;
  gameRunning = true;
  bgm.play().catch(() => {});
  update();
  spawnObstacles();

  speedIncreaseInterval = setInterval(() => {
    if (obstacleSpeed < 10) {
      obstacleSpeed += 0.2;
    }
  }, 5000);
}

// Sinh vật cản
function spawnObstacles() {
  const interval = setInterval(() => {
    if (!gameRunning) {
      clearInterval(interval);
    } else {
      obstacles.push(createObstacle());
    }
  }, 2000);
}

// Nhảy
function jump(p) {
  if (p.y >= canvas.height - p.height) {
    p.vy = p.jumpPower;
  }
}

// Sự kiện nút
document.getElementById('start1p').onclick = () => {
  mode = 1;
  startGame();
};
document.getElementById('start2p').onclick = () => {
  mode = 2;
  startGame();
};

// Sự kiện bàn phím và cảm ứng
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

// Upload ảnh nhân vật riêng
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
