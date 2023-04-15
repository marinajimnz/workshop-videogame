// VARIABLES GENERALES
const canvas = document.querySelector('#game');
const game = canvas.getContext('2d'); //funcionalidad de canvas y métodos: buscar
const btnUp = document.querySelector('#up');
const btnLeft = document.querySelector('#left');
const btnRight = document.querySelector('#right');
const btnDown = document.querySelector('#down');
const spanLives = document.querySelector('#lives');
const spanTime = document.querySelector('#time');
const spanRecord = document.querySelector('#record');
const pResult = document.querySelector('#result');

let canvasSize;
let elementSize;

let level = 0;
let lives = 3;

let timeStart;
let timeGameplay;
let timeInterval;

//VARIABLES DE LOS ELEMENTOS
const playerPosition = {
    x: undefined,
    y: undefined,
}

const giftPosition = {
    x: undefined,
    y: undefined,
}

let enemiesPosition = [];

//CREACIÓN DEL MAPA
window.addEventListener('load', setCanvasSize);
window.addEventListener('resize', setCanvasSize);

function setCanvasSize() {
    if (window.innerHeight > window.innerWidth) {
        canvasSize = window.innerWidth * 0.70;
    } else {
        canvasSize = window.innerHeight * 0.70;
    }
    
    canvas.setAttribute('width' , canvasSize);
    canvas.setAttribute('height', canvasSize);

    elementSize = canvasSize / 10;
    
    playerPosition.x = undefined;
    playerPosition.y = undefined;
    startGame();
}

function startGame() {
    game.font = elementSize + 'px Verdana';
    game.textAlign = 'end';
    
    const map = maps[level];
    if (!map) {
        gameWon();
        return;
    }

    if(!timeStart) {
        timeStart = Date.now();
        timeInterval = setInterval(showTime, 100);
        showRecord();
    }

    const mapRows = map.trim().split('\n');
    const mapClean = mapRows.map(row => row.trim().split(''));
    
    showLives();

    game.clearRect(0,0, canvasSize, canvasSize);
    enemiesPosition = [];

    mapClean.forEach((row, rowIndex) => {
        row.forEach((col, colIndex) => {
            const emoji = emojis[col];
            const posX = elementSize * (colIndex+1);
            const posY = elementSize * (rowIndex+1)
            
            if (col == 'O') {
                if (!playerPosition.x && !playerPosition.y) {
                    playerPosition.x = posX;
                    playerPosition.y = posY;
                }
            } else if (col == 'I') {
                    giftPosition.x = posX;
                    giftPosition.y = posY;
            } else if (col == 'X') {
                enemiesPosition.push({
                    x: posX,
                    y: posY,
                });
            }

            game.fillText(emoji, posX, posY);
        })
    });

    movePlayer();
}

//GAMEPLAY
function movePlayer() {
    const giftCollisionX = playerPosition.x.toFixed(3) == giftPosition.x.toFixed(3);
    const giftCollisionY = playerPosition.y.toFixed(3) == giftPosition.y.toFixed(3);
    const giftCollision = giftCollisionX && giftCollisionY;
    
    
    if (giftCollision) {
        levelUp();
    }
    
    const enemyCollision = enemiesPosition.find(enemy => {
        const enemyCollisionX = enemy.x.toFixed(3) == playerPosition.x.toFixed(3);
        const enemyCollisionY = enemy.y.toFixed(3) == playerPosition.y.toFixed(3);
        
        return enemyCollisionX && enemyCollisionY;
    });
    
    if (enemyCollision) {
        levelFailed();
    }
    
    game.fillText(emojis['PLAYER'], playerPosition.x, playerPosition.y);
}

function levelUp() {
    console.log('Level UP!');
    level++;
    startGame();
}


function levelFailed() {
    lives--;
    console.log('You crashed into an enemy!');
    console.log(emojis['BOMB_COLLISION'], playerPosition.x, playerPosition.y);
    game.fillText(emojis['BOMB_COLLISION'], playerPosition.x, playerPosition.y);
    
    if (lives == 0) {
        level = 0;
        lives = 3;
        timeStart = undefined;
    }
    
    playerPosition.x = undefined;
    playerPosition.y = undefined;

    startGame();
}

function gameWon() {
    console.log('You WON!');

    setRecord();
}

function setRecord() {
    const record = localStorage.getItem('record');
    const playerTime = Date.now() - timeStart;
    
    if(record) {
        if(record >= playerTime) {
            localStorage.setItem('record', playerTime);
            pResult.innerHTML = 'Congrats! You beat the record 🎉';
        } else {
            pResult.innerHTML = 'Sorry, you didnt beat the record 😭';
        }
    } else {
        localStorage.setItem('record', playerTime);
        pResult.innerHTML = 'That was your 1st time, now beat your record! 💪🏽';
    }
    
    clearInterval(timeInterval);
}

function showLives() {
    spanLives.innerHTML = emojis['HEART'].repeat(lives);
}

function showTime() {
    let elapsedTime = Date.now() - timeStart;
    let printTime = timeToChronometer(elapsedTime);
    spanTime.innerHTML = printTime;
}

function showRecord() {
    let bestRecord = Number(localStorage.getItem('record'));
    let printRecord = timeToChronometer(bestRecord);
    spanRecord.innerHTML = printRecord;
}

function timeToChronometer(milliseconds) {
    let currentTime = new Date(milliseconds);
    let ms = currentTime.getUTCMilliseconds().toString().slice(0,2).padStart(2, '0');
    let sec = currentTime.getUTCSeconds().toString().padStart(2, '0');
    let min = currentTime.getUTCMinutes().toString().padStart(2, '0');
    let hrs = currentTime.getUTCHours().toString().padStart(2, '0');

    return `${hrs}:${min}:${sec}:${ms}`;
  }


//FUNCIONES DE BOTONES Y TECLAS
window.addEventListener('keydown', moveWithKeys);
btnUp.addEventListener('click', moveUp);
btnLeft.addEventListener('click', moveLeft);
btnRight.addEventListener('click', moveRight);
btnDown.addEventListener('click', moveDown);

function moveWithKeys(event) {
    if (event.key == 'ArrowUp') moveUp();
    else if (event.key == 'ArrowLeft') moveLeft();
    else if (event.key == 'ArrowRight') moveRight();
    else if (event.key == 'ArrowDown') moveDown();
  }

// Se fixea el playerPosition a 3 decimales porque la 
//comparación con el canvasSize no se hacía bien (diferencia de decimales más largos)
function moveUp() {
    let playerPositionYFixed = Number((playerPosition.y - elementSize).toFixed(3));
    if (playerPositionYFixed < elementSize) {
        console.log('OUT');
        console.log((playerPosition.y - elementSize), canvasSize);
    } else {
        playerPosition.y = playerPositionYFixed;
    }
    startGame();
  }

function moveLeft() {
    let playerPositionXFixed = Number((playerPosition.x - elementSize).toFixed(3));
    if (playerPositionXFixed < elementSize ) {
        console.log('OUT');
        console.log((playerPosition.x - elementSize), canvasSize);
    } else {
        playerPosition.x = playerPositionXFixed;
    }
    startGame();
  }

function moveRight() {
    let playerPositionXFixed = Number((playerPosition.x + elementSize).toFixed(3));
    if (playerPositionXFixed > canvasSize) {
        console.log('OUT');
        console.log((playerPosition.x + elementSize), canvasSize);
    } else {
        playerPosition.x = playerPositionXFixed;
    }  
    startGame();
  }

function moveDown() {
    let playerPositionYFixed = Number((playerPosition.y + elementSize).toFixed(3));
    if (playerPositionYFixed > canvasSize) {
        console.log('OUT');
        console.log((playerPosition.y + elementSize), canvasSize);
    } else {
        playerPosition.y = playerPositionYFixed;
    }
    startGame();
  }