const canvas = document.getElementById('canvas');
let rocket = {},
bullet = {},
planets = stars = [],

barCount = 3,
barWidth = 50,
barHeight = 15,
bulletSpeed = 15,
swingSpeed = 30,
ropeThickness = 2,
canReset = false,
scorePosX = 5,
scorePosY = 15,
firedPointX = 0,
firedPointY = 0,
barHitPointX = 0,
barHitPointY = 0,
barHit = false,
moveBars = false,
firedPointDist = 0,
swingX = 0,
swingY = 0,
currScore = 0,
topScore = 0,
isActive = false,
bulletFired = false,
swingRocket = false,
relAngleX, relAngleY, relFiredPointX, relFiredPointY;

canvas.width = 3 * window.innerHeight / 4;
canvas.height = window.innerHeight;

ctx = canvas.getContext('2d');
ctx.lineWidth = ropeThickness;
ctx.canvas.height = window.innerHeight;
ctx.canvas.width = 3 * window.innerHeight / 4;
ctx.fillStyle = "white";


const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const colorrange = [0, 60, 240];

for (let i = 0; i < 50; i++) {
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    let radius = Math.random() * 1.2;
    let hue = colorrange[getRandom(0, colorrange.length - 1)];
    let sat = getRandom(50, 100);
    stars.push({ x, y, radius, hue, sat });
}

function setBullet() {
    bullet.posX = 0;
    bullet.posY = 0;
    bullet.height = 4;
    bullet.width = 4;
}

function setRocket() {
    rocket.width = 24;
    rocket.height = 37;
    rocket.posX = canvas.width / 2;
    rocket.posY = canvas.height - rocket.height - 50;
}

function setBars() {
    planets = [];

    for (let i = 0; i < barCount; i++) {
        planets.push({
            posX: Math.random() * (canvas.width),
            posY: ((canvas.height / barCount) * i) + 20
        });
    };
}

function fireBullet(posX, posY) {
    barHit = false;
    isActive = true;

    firedPointX = posX;
    firedPointY = posY;

    relFiredPointX = firedPointX - rocket.posX;
    relFiredPointY = firedPointY - rocket.posY;

    relAngleX = relAngleY = Math.atan2(relFiredPointY, relFiredPointX) * 57.32;

    bulletFired = true;

    canReset = true;
}

function populateScore() {
    ctx.fillText(currScore + '/' + topScore, scorePosX, scorePosY);
}

function drawStars() {
    stars.forEach(({ x, y, radius, hue, sat }) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 360);
        ctx.fillStyle = "hsl(" + hue + ", " + sat + "%, 88%)";
        ctx.fill();
    })
}

function drawPlanets() {
    for (let i = 0; i < barCount; i++) {
        if (planets[i].posY > canvas.height) {
            planets[i].posX = Math.random() * (canvas.width / 2);
            planets[i].posY = 0
        }

        if (moveBars) planets[i].posY = planets[i].posY - swingY * 4;

        ctx.beginPath();
        ctx.arc(planets[i].posX + (barWidth / 2), planets[i].posY + barHeight / 2, barWidth / 2, 0, Math.PI * 2);
        ctx.fill();
    };
}

function drawPlayer() {
    ctx.beginPath();
    ctx.moveTo(rocket.posX + rocket.width / 2, rocket.posY);
    ctx.lineTo(rocket.posX, rocket.posY + rocket.height);
    ctx.lineTo(rocket.posX + rocket.width / 2, rocket.posY + rocket.height / 1.2);
    ctx.lineTo(rocket.posX + rocket.width, rocket.posY + rocket.height);
    ctx.fill();
}

function isGameOver() {
    return !isActive;
}

function isNthBarHit(barNum) {
    return (
        bullet.posX >= planets[barNum].posX &&
        bullet.posX <= (planets[barNum].posX + barWidth)
    ) && (
            bullet.posY >= planets[barNum].posY &&
            bullet.posY <= (planets[barNum].posY + barHeight)
        );
}

function handleBulletFire() {
    if (!bullet.posX && !bullet.posY) {
        bullet.posX = rocket.posX;
        bullet.posY = rocket.posY;
    };

    bullet.posX += Math.cos(relAngleX * 0.017) * bulletSpeed;
    bullet.posY -= Math.sin(relAngleY * -0.017) * bulletSpeed;

    if ((bullet.posX > canvas.width) || (bullet.posX < 0)) relAngleX = relAngleX - relAngleY;

    for (let i = 0; i < barCount; i++) {
        if (isNthBarHit(i)) {
            bulletFired = false;
            barHit = true;

            swingRocket = true;

            firedPointX = bullet.posX;
            firedPointY = bullet.posY;

            bullet.posX = bullet.posY = 0;

            return;
        };

        barHit = false;
    };

    ctx.fillRect(bullet.posX, bullet.posY, bullet.width, bullet.height);

    if (bullet.posY < 0) {
        bullet.posX = bullet.posY = 0;
        bulletFired = false
    };
}

function resetGame() {
    setBars();
    setBullet();
    setRocket();

    swingX = swingY = firedPointX = firedPointY = firedPointDist = 0;
    relAngleX = relAngleY = 0;
    moveBars = barHit = swingRocket = false;

    if (currScore > parseInt(topScore)) {
        topScore = currScore;
        localStorage.setItem("SpaceScapeHighScore", topScore);
    }

    currScore = 0;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    populateScore();
    drawPlayer();
    drawStars();
    drawPlanets();

    if (!isGameOver()) {
        if (bulletFired) handleBulletFire();

        if (moveBars) {
            firedPointY = firedPointY - swingY * 4;
            currScore++;
        }

        if (barHit && rocket.posY > (firedPointY + 20)) {
            ctx.strokeStyle = "white";
            ctx.beginPath();
            ctx.moveTo((rocket.posX + rocket.width / 2), rocket.posY);
            ctx.lineTo(firedPointX, firedPointY);
            ctx.stroke();

            firedPointDist = Math.sqrt(Math.pow((rocket.posX - firedPointX), 2) + Math.pow((rocket.posY - firedPointY), 2));

            swingX += (firedPointX - rocket.posX) / (firedPointDist * swingSpeed);
            swingY += (firedPointY - rocket.posY) / (firedPointDist * swingSpeed);

        } else barHit = false;
        
        if (swingY > 0) moveBars = false;

        swingY += 0.01;

        moveBars || (rocket.posY += swingY * 4);
        rocket.posX += swingX;
        
        if (rocket.posY < (canvas.width / 2)) moveBars = true;

        if (rocket.posX < 0 || (rocket.posX + rocket.width) > canvas.width) swingX = -swingX;

        if (rocket.posY > canvas.height) isActive = false;
    } else {
        if (canReset) {
            resetGame();
            canReset = false;
        }
    }
}

const startGame = () => window.setInterval(gameLoop, 10);

const bindUI = () => canvas.onclick = e => fireBullet(e.offsetX, e.offsetY);

function init() {
    topScore = localStorage.getItem("SpaceScapeHighScore") || 0;
    setBars();
    setBullet();
    setRocket();

    bindUI();
    startGame();
};

init();