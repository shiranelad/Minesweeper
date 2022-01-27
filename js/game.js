'use strict'

var gBoard = [];
const MINE = '💣';
const FLAG = '🚩'
const LIFE = '🔋'
const NOLIFE = '❌'
var gLevel;
var gStartTime = 0;
var gElTimer = document.querySelector('.timer');
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

function buildBoard(num) {
    gGame = createGame();
    renderLife()
    resetTime()
    gameOver();
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

    renderBoard(gBoard, '.board-container')
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
            // renderCell(cell, getCellMinesNegs(cell, board))
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

    // expandShown(gBoard,elCell,i,j);
    checkGameOver()


    // cases:
    if (gBoard[i][j].isMine) {
        renderCell(gBoard[i][j], MINE)
        if (gGame.numOfLife > 0 && !checkGameOver()) {
            gGame.numOfLife--
            if (gGame.numOfLife === 0) gameOver();
            renderLife();
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

    elCell.classList.toggle('flag')
    elCell.classList.toggle('unrevealed')


    /***************/
    /**********/

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
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (cell.isShown && !cell.Mine) gGame.shownCount++
            if (cell.isMarked) gGame.markedCount++
        }
    }
    if (((gGame.markedCount + gGame.shownCount) === (gLevel.SIZE ** 2) && gGame.markedCount === gLevel.MINES)
        || (gGame.shownCount === (gLevel.SIZE ** 2))) {
        gameOver();
        return true;
    }
    return false;

}

function gameOver() {
    stopTime();
}

function expandShown(board, elCell, i, j) {
    var negsBoard = []
    for (var cellI = i - 1; cellI <= i + 1; cellI++) {
        for (var cellJ = j - 1; cellJ <= j + 1; cellJ++) {
            var currCell = board[cellI][cellJ]
            if (cellI < 0 || cellI > board.length - 1 || cellJ < 0 || cellJ > board[0].length - 1) continue
            if (currCell.isShown) continue
            if (currCell.isMine) continue
            negsBoard.push(currCell);
            //getCellMinesNegs(currCell, gBoard)
            var elCurrCell = document.querySelector(`.cell-${cellI}-${cellJ}`)
            renderCell(elCurrCell, currCell.minesAroundCount)

        }
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
    // gGame = createGame();
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
}

function resetTime() {
    gElTimer.innerText = '000';
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
    gElTimer.innerText = zeroSec + gSec;
    // gGame.secsPassed = gSec;
    gClockTimeout = setTimeout("displayTime()", 1000);
}
