// CODE CHUẨN CHẠY ĐƯỢC
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800; canvas.height = 300;

let gameRunning=false, mode=1, player1, player2, obstacles=[], obstacleSpeed=2, speedIncreaseInterval;
const bgm=document.getElementById('bgm');

const obstacleImages = {
  stone:new Image(), tree:new Image()
};
obstacleImages.stone.src='https://i.imgur.com/OdL0XPt.png';
obstacleImages.tree.src='https://i.imgur.com/z5XThZq.png';

const playerImages = {
  male:new Image(), female:new Image()
};
playerImages.male.src='https://i.imgur.com/w1URC0U.png';
playerImages.female.src='https://i.imgur.com/dpQ5h9f.png';

let selectedCharacter='male';
document.getElementById('characterSelect').onchange=e=>selectedCharacter=e.target.value;

function createPlayer(x){
  return { x, y:canvas.height-50, width:40, height:40, vy:0, jumpPower:-12, gravity:0.5, img:null };
}
function createObstacle(){
  const types=['stone','tree','hole'], type=types[Math.floor(Math.random()*types.length)];
  let w=30,h=30;
  if(type==='tree'){w=40;h=60}else if(type==='hole'){w=50;h=10;}
  return { x:canvas.width, y:canvas.height-h, width:w, height:h, type };
}

function drawPlayer(p){
  if(p.y < canvas.height - p.height){
    ctx.fillStyle='rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(p.x + p.width/2, canvas.height -5, p.width/2,5,0,0,2*Math.PI);
    ctx.fill();
  }
  p.img ? ctx.drawImage(p.img,p.x,p.y,p.width,p.height) : ctx.fillRect(p.x,p.y,p.width,p.height);
}

function drawObstacle(o){
  if(o.type==='hole'){ctx.fillStyle='blue';ctx.fillRect(o.x,o.y,o.width,o.height);}
  else if(obstacleImages[o.type]?.complete)
    ctx.drawImage(obstacleImages[o.type],o.x,o.y,o.width,o.height);
  else {ctx.fillStyle=(o.type==='stone'?'gray':'green');ctx.fillRect(o.x,o.y,o.width,o.height);}
}

function flashScreen(){
  canvas.style.transition='background 0.1s';
  canvas.style.background='red';
  setTimeout(()=>canvas.style.background='white',100);
}

function checkCollision(p,o){
  return p.x < o.x+o.width && p.x+p.width>o.x && p.y<o.y+o.height && p.y+p.height>o.y;
}

function update(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawPlayer(player1); if(mode===2) drawPlayer(player2);
  obstacles.forEach(o => { o.x -= obstacleSpeed; drawObstacle(o); });
  [player1, player2].slice(0, mode).forEach(p=>{p.vy += p.gravity; p.y += p.vy; if(p.y > canvas.height - p.height){p.y=canvas.height-p.height;p.vy=0;}});
  obstacles = obstacles.filter(o=>{
    if(checkCollision(player1,o) || (mode===2 && checkCollision(player2,o))){
      flashScreen();
      setTimeout(()=>{
        alert('Game Over!');
        gameRunning=false;
        clearInterval(speedIncreaseInterval);
        bgm.pause();
      },100);
      return false;
    }
    return o.x + o.width > 0;
  });
  if(gameRunning) requestAnimationFrame(update);
}

function jump(p){ if(p.y >= canvas.height - p.height) p.vy = p.jumpPower; }

function startGame(){
  player1 = createPlayer(100); player1.img = playerImages[selectedCharacter];
  player2 = createPlayer(200); if(mode===2) player2.img = playerImages[selectedCharacter];
  obstacles = []; obstacleSpeed = 2; gameRunning = true;
  bgm.play().catch(()=>{});
  update(); spawnObstacles();
  speedIncreaseInterval = setInterval(()=>{
    if(obstacleSpeed < 10) obstacleSpeed += 0.2;
  },5000);
}

function spawnObstacles(){
  const interval = setInterval(()=>{
    if(!gameRunning){ clearInterval(interval); } else obstacles.push(createObstacle());
  },2000);
}

document.getElementById('start1p').onclick = () => { mode = 1; startGame(); };
document.getElementById('start2p').onclick = () => { mode = 2; startGame(); };
document.addEventListener('keydown', e => { if(e.code==='Space') jump(player1); if(e.code==='ArrowUp' && mode===2) jump(player2); });
canvas.addEventListener('click', ()=>jump(player1));
canvas.addEventListener('touchstart', e => { const x=e.touches[0].clientX; if(mode===1 || x<canvas.width/2) jump(player1); else jump(player2); });
document.getElementById('uploadImg').onchange = e=>{
  const file=e.target.files[0]; if(file){ const img=new Image(); img.onload=()=>{ const aspect = img.width/img.height; img.width=40; img.height=40/aspect; player1.img = img; if(mode===2) player2.img = img; }; img.src=URL.createObjectURL(file); }
};
