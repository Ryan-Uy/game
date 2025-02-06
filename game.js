const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restart");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");

const groundY = 180;
let square = { x: 50, y: groundY - 20, size: 20, dy: 0 };
let obstacles = [];
let gravity = 0.5;
let isJumping = false;
let score = 0;
let gameOver = false;
let highScore = 0;

function saveHighScore(score){
    localStorage.setItem("highScore", score);
}

function getHighScore(){
    highScore = localStorage.getItem("highScore");
    console.log("Retrieved value:", highScore);
}

// Jump function
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !isJumping) {
        square.dy = -7;
        isJumping = true;
    }
});

// Restart function
restartBtn.addEventListener("click", () => {
    if(score > highScore){
    saveHighScore(score);
    }
    getHighScore();
    score = 0;
    obstacles = [];
    square.y = groundY - square.size;
    square.dy = 0;
    gameOver = false;
    restartBtn.style.display = "none";
    scoreDisplay.textContent = score;
    highScoreDisplay.textContent = highScore;
    loop();
});

// Check if a point is inside a triangle
function pointInTriangle(px, py, ax, ay, bx, by, cx, cy) {
    let areaOrig = Math.abs((ax * (by - cy) + bx * (cy - ay) + cx * (ay - by)) / 2);
    let area1 = Math.abs((px * (by - cy) + bx * (cy - py) + cx * (py - by)) / 2);
    let area2 = Math.abs((ax * (py - cy) + px * (cy - ay) + cx * (ay - py)) / 2);
    let area3 = Math.abs((ax * (by - py) + bx * (py - ay) + px * (ay - by)) / 2);
    return areaOrig === (area1 + area2 + area3);
}

// Game loop
function loop() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = "green";
    ctx.fillRect(0, groundY, canvas.width, 20);

    // Draw square
    ctx.fillStyle = "red";
    ctx.strokeStyle = "black";
    ctx.fillRect(square.x, square.y, square.size, square.size);
    ctx.strokeRect(square.x, square.y, square.size, square.size);

    // Apply gravity
    square.y += square.dy;
    square.dy += gravity;

    // Stop falling when on the ground
    if (square.y >= groundY - square.size) {
        square.y = groundY - square.size;
        isJumping = false;
    }

    let lastObstacleX = canvas.width; // Start off-screen
    const minGap = 150;  // Minimum gap between obstacles
    const maxGap = 300;  // Maximum gap between obstacles
    
// Spawn multiple obstacles at controlled intervals
function spawnObstacle() {
    let lastX = obstacles.length > 0 ? obstacles[obstacles.length - 1].x : canvas.width;
    
    // Ensure a new obstacle spawns at least 'minGap' after the last one
    while (lastX < canvas.width + maxGap) {
        lastX += Math.floor(Math.random() * (maxGap - minGap) + minGap);
        obstacles.push({ x: lastX, y: groundY - 20, size: 20 });
    }
}

// Modify obstacle spawning inside the game loop
if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - minGap) {
    spawnObstacle();
}

    // Move obstacles and check collisions
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].x -= 3;

        let triX = obstacles[i].x;
        let triY = obstacles[i].y;
        let triSize = obstacles[i].size;

        // Define triangle points
        let ax = triX, ay = triY;
        let bx = triX - triSize, by = triY + triSize;
        let cx = triX + triSize, cy = triY + triSize;

        // Draw triangle
        ctx.fillStyle = "black";
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.lineTo(cx, cy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Collision detection (check if any corner of the square is inside the triangle)
        if (
            pointInTriangle(square.x, square.y, ax, ay, bx, by, cx, cy) ||  // Top-left corner
            pointInTriangle(square.x + square.size, square.y, ax, ay, bx, by, cx, cy) ||  // Top-right
            pointInTriangle(square.x, square.y + square.size, ax, ay, bx, by, cx, cy) ||  // Bottom-left
            pointInTriangle(square.x + square.size, square.y + square.size, ax, ay, bx, by, cx, cy)  // Bottom-right
        ) {
            gameOver = true;
            restartBtn.style.display = "block";
            return;
        }

        // Remove obstacles and increase score
        if (obstacles[i].x < -20) {
            obstacles.shift();
            score++;
            scoreDisplay.textContent = score;
            highScoreDisplay.textContent = highScore;
        }
    }

    requestAnimationFrame(loop);
}

loop();
