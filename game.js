
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

const background = new Image();
background.src = 'images/gamefoto.jpeg';

// Player properties
const player = {
    x: 50,
    y: canvas.height - 50,
    width: 30,
    height: 30,
    speed: 5,
    jumpForce: -12,
    velY: 0,
    isJumping: false
};

// Game state
let currentLevel = 1;
const maxLevels = 100;

// Game objects
let mushrooms = [];
let enemies = [];
let bullets = [];
let platforms = [];
let door = { x: 0, y: 0, width: 40, height: 60 };

// Generate level configuration
function generateLevel(levelNum) {
    const numPlatforms = Math.min(3 + Math.floor(levelNum / 10), 8);
    const numMushrooms = Math.min(2 + Math.floor(levelNum / 20), 5);
    const numEnemies = Math.min(1 + Math.floor(levelNum / 15), 6);
    
    const platforms = [
        { x: 0, y: canvas.height - 20, width: canvas.width, height: 20 }
    ];
    
    for (let i = 0; i < numPlatforms - 1; i++) {
        platforms.push({
            x: 100 + (i * canvas.width / numPlatforms),
            y: canvas.height - (100 + Math.random() * 150),
            width: 80 + Math.random() * 50,
            height: 20
        });
    }
    
    const mushrooms = [];
    for (let i = 0; i < numMushrooms; i++) {
        const platform = platforms[1 + Math.floor(Math.random() * (platforms.length - 1))];
        mushrooms.push({
            x: platform.x + Math.random() * (platform.width - 20),
            y: platform.y - 30,
            width: 20,
            height: 20,
            collected: false
        });
    }
    
    const enemies = [];
    for (let i = 0; i < numEnemies; i++) {
        enemies.push({
            x: 200 + Math.random() * (canvas.width - 400),
            y: canvas.height - 50,
            width: 30,
            height: 30,
            direction: Math.random() < 0.5 ? 1 : -1
        });
    }
    
    return {
        platforms,
        mushrooms,
        enemies,
        door: { x: canvas.width - 60, y: canvas.height - 80, width: 40, height: 60 }
    };
}

// Level configurations
const levels = {};
for (let i = 1; i <= maxLevels; i++) {
    levels[i] = generateLevel(i);
}

// Initialize level
function loadLevel(levelNum) {
    const level = levels[levelNum];
    platforms = [...level.platforms];
    mushrooms = [...level.mushrooms];
    enemies = [...level.enemies];
    door = {...level.door};
    player.x = 50;
    player.y = canvas.height - 50;
    bullets = [];
}

// Handle keyboard input
const keys = {};
document.addEventListener('keydown', (e) => keys[e.code] = true);
document.addEventListener('keyup', (e) => keys[e.code] = false);
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        shoot();
    }
});

function shoot() {
    const bulletStartX = player.x + player.width/2;
    const bulletStartY = player.y + player.height - 10;
    bullets.push({
        x: bulletStartX,
        y: bulletStartY,
        width: 10,
        height: 5,
        speed: 8
    });
}

// Quiz questions and answers
const quizQuestions = [
    { question: "Hoe lang is de Overijsselse Vecht (in kilometers)?", answer: "167" },
    { question: "In welke plaats mondt de Vecht uit in het Zwarte Water?", answer: "zwolle" },
    { question: "Uit welk land komt de Vecht oorspronkelijk?", answer: "duitsland" },
    { question: "Welke grote plaats in het Vechtdal staat bekend om zijn kasteel?", answer: "ommen" },
    { question: "Welk natuurgebied langs de Vecht staat bekend om zijn zandverstuivingen?", answer: "beerze" }
];

let gamePaused = false;

function showQuiz() {
    gamePaused = true;
    const questionIndex = Math.floor(currentLevel / 10) - 1;
    const userAnswer = prompt(quizQuestions[questionIndex].question);
    
    if (userAnswer && userAnswer.toLowerCase() === quizQuestions[questionIndex].answer) {
        alert("Correct! Je mag door naar het volgende level!");
        gamePaused = false;
        currentLevel++;
        loadLevel(currentLevel);
    } else {
        alert("Fout antwoord! Je moet helemaal opnieuw beginnen.");
        gamePaused = false;
        currentLevel = 1;
        loadLevel(currentLevel);
    }
}

function checkDoorCollision() {
    if (player.x < door.x + door.width &&
        player.x + player.width > door.x &&
        player.y < door.y + door.height &&
        player.y + player.height > door.y) {
        if (currentLevel < maxLevels) {
            if (currentLevel % 10 === 0) {
                showQuiz();
            } else {
                currentLevel++;
                loadLevel(currentLevel);
            }
        } else {
            alert('Gefeliciteerd! Je hebt alle levels voltooid!');
            currentLevel = 1;
            loadLevel(currentLevel);
        }
    }
}

function updateGame() {
    // Player movement
    if (keys['ArrowRight']) player.x += player.speed;
    if (keys['ArrowLeft']) player.x -= player.speed;
    if (keys['ArrowUp'] && !player.isJumping) {
        player.velY = player.jumpForce;
        player.isJumping = true;
    }

    // Apply gravity
    player.velY += 0.5;
    player.y += player.velY;

    // Platform collision
    platforms.forEach(platform => {
        if (player.y + player.height > platform.y &&
            player.y < platform.y + platform.height &&
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width) {
            player.y = platform.y - player.height;
            player.velY = 0;
            player.isJumping = false;
        }
    });

    // Check door collision
    checkDoorCollision();

    // Update bullets
    bullets = bullets.filter(bullet => {
        bullet.x += bullet.speed;
        return bullet.x < canvas.width;
    });

    // Update enemies
    enemies.forEach(enemy => {
        enemy.x += enemy.direction * 2;
        if (enemy.x <= 0 || enemy.x >= canvas.width - enemy.width) {
            enemy.direction *= -1;
        }
    });

    // Player-enemy collision
    const initialPlayerHeight = 30; // Store initial player height
    enemies.forEach(enemy => {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            
            if (player.height <= initialPlayerHeight) {
                // Player dies - reset to level 1
                currentLevel = 1;
                loadLevel(currentLevel);
            } else {
                // Player shrinks gradually
                player.height = Math.max(initialPlayerHeight, player.height - 15);
            }
        }
    });

    // Mushroom collision detection
    mushrooms = mushrooms.filter(mushroom => {
        if (!mushroom.collected &&
            player.x < mushroom.x + mushroom.width &&
            player.x + player.width > mushroom.x &&
            player.y < mushroom.y + mushroom.height &&
            player.y + player.height > mushroom.y) {
            player.height *= 1.5;
            return false;
        }
        return true;
    });

    // Bullet-enemy collision
    bullets = bullets.filter(bullet => {
        let bulletHit = false;
        enemies = enemies.filter(enemy => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                bulletHit = true;
                return false;
            }
            return true;
        });
        return !bulletHit;
    });

    // Keep player in bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.velY = 0;
        player.isJumping = false;
    }
}

function drawGame() {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Draw platforms
    ctx.fillStyle = '#8B4513';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Draw door
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(door.x, door.y, door.width, door.height);
    
    // Draw door handle
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(door.x + 30, door.y + 30, 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw player
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw mushrooms
    ctx.fillStyle = '#FF8C00';
    mushrooms.forEach(mushroom => {
        ctx.fillRect(mushroom.x, mushroom.y, mushroom.width, mushroom.height);
    });

    // Draw enemies
    ctx.fillStyle = '#006400';
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });

    // Draw bullets
    ctx.fillStyle = '#FFD700';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Draw level indicator
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Level ${currentLevel}`, 10, 30);
}

function gameLoop() {
    if (!gamePaused) {
        updateGame();
        drawGame();
    }
    requestAnimationFrame(gameLoop);
}

// Start the game
loadLevel(currentLevel);
gameLoop();
