'use strict'

var gBoard = [];
const MINE = '💣';
const FLAG = '🚩'
const LIFE = '🔋'
const TIME = '⏱';
const NOLIFE = '❌';
const LOST = '😖';
const REGULAR = '🙂'
const WON = '🥳';

var gLevel;
var gStartTime = 0;
var gElTimer = document.querySelector('span.timer');
var gSec = 0;
var gClockTimeout = 0;
var gGame;

function initGame() {
    buildBoard(4);
}

function createLevel(num) {
    var level = {
        SIZE: num,
        MINES: ((num === 4) ? 2 : ((num === 8) ? 12 : 30))
    }
    return level;
}

function resetGame() {
    gGame = createGame();
    renderLife()
    resetTime()
    gameOver();

}

function buildBoard(num) {
    resetGame();
    gLevel = createLevel(num);
    gBoard = createMat(num);

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            // Add created cell to The game board
            gBoard[i][j] = createCell();
            gBoard[i][j].i = i
            gBoard[i][j].j = j
        }
    }

    renderEmoji(REGULAR)
    renderBoard(gBoard, '.board-container')
    displayRecord()

}

function placeMine(board, i, j) {
    var emptyCells = getEmptyCells(board);
    var obj = emptyCells.find(o => o.i === i && o.j === j);
    emptyCells.splice(emptyCells.indexOf(obj), 1);
    var randIdx = getRandomIntInclusive(0, emptyCells.length - 1);
    var cell = emptyCells[randIdx];
    board[cell.i][cell.j].isMine = true;
    board[cell.i][cell.j].isShown = false;

    return cell;
}

function getEmptyCells(board) {
    var emptyCells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isMine && !board[i][j].isShown) emptyCells.push(board[i][j])
        }
    }
    return emptyCells;
}

function createCell() {
    var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
        i: -1,
        j: -1
    }
    return cell
}

//count the neighbors of each cell
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            if (cell.isMine) continue;
            cell.isShown = true;
        }
    }
    return board;
}

function getCellMinesNegs(cell, board) {
    var negsCount = 0;
    for (var i = cell.i - 1; i <= cell.i + 1; i++) {
        for (var j = cell.j - 1; j <= cell.j + 1; j++) {
            if (i < 0 || i > board.length - 1 || j < 0 || j > board[0].length - 1) continue
            if (cell.i === i && cell.j === j) continue
            var neg = board[i][j];
            if (neg.isMine) negsCount++
        }
    }
    cell.minesAroundCount = negsCount;
    return negsCount;
}


function cellClicked(elCell, i, j) {
    if (gGame.numOfLife <= 0) {
        gameOver()
        return
    }
    //
    if (!gGame.isOn && gSec > 0) return;
    // place mines with first click and start game/time
    if (gStartTime === 0) {
        for (var x = 0; x < gLevel.MINES; x++) {
            placeMine(gBoard, i, j);
        }
    }
    startGame()
    if (gBoard[i][j].isMarked || gBoard[i][j].isShown) return;


    gBoard[i][j].isShown = true;
    var negsCount = getCellMinesNegs(gBoard[i][j], gBoard)
    elCell.innerText = negsCount;
    elCell.classList.remove('unrevealed')

    expandShown(gBoard,elCell,i,j);
    checkGameOver()


    // cases:
    if (gBoard[i][j].isMine) {
        renderCell(gBoard[i][j], MINE)
        if (gGame.numOfLife > 0 && !checkGameOver()) {
            gGame.numOfLife--
            renderLife();
            if (gGame.numOfLife === 0) {
                //blow all mines when game is over
                for (var i = 0; i < gBoard.length; i++) {
                    for (var j = 0; j < gBoard[0].length; j++) {
                        var cell = gBoard[i][j];
                        if(cell.isMine) {
                            cell.isShown = true;
                            renderCell(cell,MINE);
                            var elCurCell = document.querySelector(`.cell-${i}-${j}`);
                            elCurCell.classList.remove('unrevealed')
                        }
                    }
                }
                gameOver();
                // lost
                var emoji = LOST
                renderEmoji(emoji)
            }
            return;
        }
        gameOver();
    }

}

function renderLife() {
    var elLife = document.querySelector('span.life')
    elLife.innerText = ''
    for (var i = 0; i < gGame.numOfLife; i++) {
        elLife.innerText += LIFE;
    }
    if (gGame.numOfLife === 0) {
        elLife.innerText += NOLIFE
    }
}

function cellMarked(elCell, i, j) {
    if (gGame.numOfLife <= 0) {
        gameOver()
        return
    }

    if(!elCell.classList.contains('unrevealed') && !elCell.classList.contains('flag')) return;

    elCell.classList.toggle('flag')
    elCell.classList.toggle('unrevealed')


    if (gStartTime === 0)
        for (var x = 0; x < gLevel.MINES; x++) {
            placeMine(gBoard, i, j);
        }
    startGame()
    window.event.preventDefault();
    if (gBoard[i][j].isShown) return;
    elCell.innerText = (gBoard[i][j].isMarked) ? '' : FLAG;
    gBoard[i][j].isMarked = !gBoard[i][j].isMarked
    checkGameOver()
}

function checkGameOver() {
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    var wrongMark = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (cell.isShown && !cell.Mine) gGame.shownCount++
            if (!cell.isMine && cell.isMarked) wrongMark++;
            if (cell.isMarked) gGame.markedCount++
        }
    }
    if ((gGame.markedCount + gGame.shownCount) === (gLevel.SIZE ** 2) && wrongMark === 0) { 
        // won
        gameOver();
        checkBestTime()
        var emoji = WON
        renderEmoji(emoji)
        return true;
    }
    return false;

}

function renderEmoji(value) {
    var elEmoBtn = document.querySelector('.emoji');
    elEmoBtn.innerText = value;
}

function gameOver() {
    stopTime();
}

function expandShown(board, elCell, i, j) {
    if (board[i][j].minesAroundCount !== 0) {
        board[i][j].isShown;
        renderCell(board[i][j],board[i][j].minesAroundCount)
        elCell.classList.remove('unrevealed')
        // return;
    } else {
        for (var cellI = i - 1; cellI <= i + 1; cellI++) {
            for (var cellJ = j - 1; cellJ <= j + 1; cellJ++) {
                if (cellI < 0 || cellI > board.length - 1 || cellJ < 0 || cellJ > board[0].length - 1) continue
                var currCell = board[cellI][cellJ];
                if(currCell.isMarked)continue
                // console.log(currCell);
                getCellMinesNegs(currCell,board);
                currCell.isShown = true;
                renderCell(currCell,currCell.minesAroundCount)
                // var elCurCell = document.querySelector(`.cell-${cellI}-${cellJ}`);
                // expandShown(board,elCurCell,cellI,cellJ);
            }

        }
    }
}

/*** best time bonus ***/
function checkBestTime() {
    var bestTime = localStorage.getItem(gLevel.SIZE);
    if (bestTime === 0 || bestTime === null) {
        bestTime = gGame.secsPassed;
    } else if (gGame.secsPassed < bestTime) {
        bestTime = gGame.secsPassed;
        localStorage.removeItem(gLevel.SIZE);
    }
    localStorage.setItem(gLevel.SIZE, bestTime);
    displayRecord();
}

function displayRecord() {
    var bestTime = localStorage.getItem(gLevel.SIZE);
    var record = document.querySelector('.record');
    if (bestTime === null || bestTime === 0) {
        record.style.display = 'none';
    }
    else {
        record.style.display = 'block';
        record.innerText = 'The best time record for this level is: ' + bestTime + " seconds";
    }
}

function createGame() {
    var game = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        numOfLife: 3
    }
    return game;
}

function startGame() {
    if (gStartTime === 0) {
        gStartTime = Date.now();
        startTime()
    }
}

function startTime() {
    if (!gGame.isOn) {
        gGame.isOn = true;
    }
    displayTime();
}

function resetTimeout() {
    clearTimeout(gClockTimeout);
    gClockTimeout = 0;
}

function stopTime() {
    gGame.isOn = false;
    gStartTime = 0;
    resetTimeout();
    gGame.secsPassed = gSec;
}

function resetTime() {
    gElTimer.innerText = TIME + ' 000';
    gSec = 0;
    resetTimeout()
}

function displayTime() {
    gSec += 1;
    var zeroSec = '00';
    if (gSec > 9 && gSec < 100) {
        zeroSec = '0';
    }
    if (gSec < 9) {
        zeroSec = '00';
    }
    if (gSec > 99) {
        zeroSec = '';
    }
    gElTimer.innerText = TIME + zeroSec + gSec;
    gClockTimeout = setTimeout("displayTime()", 1000);
}
