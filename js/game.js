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
    resetGame(4);
}

function createLevel(num) {
    var level = {
        SIZE: num,
        MINES: ((num === 4) ? 2 : ((num === 8) ? 12 : 30))
    }
    return level;
}

function resetGame(num) {
    resetTime()
    buildBoard(num);
    gLevel = createLevel(num);
    gGame = createGame();
    renderLife()
    renderEmoji(REGULAR)
    displayRecord()
}

function buildBoard(num) {
    gBoard = createMat(num);
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
    return cell;
}

//count the neighbors of each cell
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            if (cell.isMine) continue;
            getCellMinesNegs(cell, board);
        }
    }
    return board;
}

function getCellMinesNegs(cell, board) {
    var negsCount = 0;
    for (var i = cell.i - 1; i <= cell.i + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (var j = cell.j - 1; j <= cell.j + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue
            if (cell.i === i && cell.j === j) continue
            var neg = board[i][j];
            if (neg.isMine) negsCount++
        }
    }
    cell.minesAroundCount = negsCount;
}

//left click
function cellClicked(elCell, i, j) {
    //when there are no more lives
    if (checkNoLife()) return
    //check that game is not over by losing
    if (!gGame.isOn && gSec > 0) return;
    // place mines with first click and start game/time
    placeMines(i, j);

    startGame();
    //do not allow click if cell is already shown or flagged
    if (gBoard[i][j].isMarked || gBoard[i][j].isShown) return;

    gBoard[i][j].isShown = true;
    var negsCount = gBoard[i][j].minesAroundCount;
    elCell.innerText = negsCount;
    elCell.classList.remove('unrevealed')

    expandShown(gBoard, i, j);
    checkGameOver()


    // when cell is a MINE, check life:
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
                        if (cell.isMine) {
                            cell.isShown = true;
                            renderCell(cell, MINE);
                            var elCurCell = document.querySelector(`.cell-${i}-${j}`);
                            elCurCell.classList.remove('unrevealed')
                        }
                    }
                }
                stopTime();
                // lost
                var emoji = LOST
                renderEmoji(emoji)
            }
            return;
        }
        stopTime();
    }

}

//right click
function cellMarked(elCell, i, j) {
    //when there are no more lives
    if (checkNoLife()) return

    //if not a flagged field or not a hidden cell, do not allow click
    if (!elCell.classList.contains('unrevealed') && !elCell.classList.contains('flag')) return;
    //if open cell, do not allow click 
    if (gBoard[i][j].isShown) return;

    //first click on the cell put class flag, second click remove
    elCell.classList.toggle('flag')
    elCell.classList.toggle('unrevealed')

    //start game on first click and put mines afterward, not in the clicked cell
    placeMines(i, j);

    startGame()
    //prevent from opening regular left click menu
    window.event.preventDefault();

    if (!gBoard[i][j].isMarked) {
        elCell.innerText = FLAG;
        gBoard[i][j].isMarked = true;
        gGame.isMarked++;
    }
    else {
        elCell.innerText = '';
        gBoard[i][j].isMarked = false;
        gGame.isMarked--;
    }

    checkGameOver()
}

function checkNoLife() {
    if (gGame.numOfLife <= 0) {
        stopTime()
        return true
    }
    return false;
}

function placeMines(i, j) {
    if (gStartTime === 0) {
        for (var x = 0; x < gLevel.MINES; x++) {
            placeMine(gBoard, i, j);
        }
    }
    setMinesNegsCount(gBoard);
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
        stopTime();
        checkBestTime()
        var emoji = WON
        renderEmoji(emoji)
        return true;
    }
    return false;
}

function expandShown(board, i, j) {
    if (board[i][j].minesAroundCount !== 0) return
    if (board[i][j].isMine) return;
    for (var cellI = i - 1; cellI <= i + 1; cellI++) {
        if (cellI < 0 || cellI > board.length - 1) continue
        for (var cellJ = j - 1; cellJ <= j + 1; cellJ++) {
            if (cellJ < 0 || cellJ > board[0].length - 1) continue
            if (cellI === i && cellJ === j) continue
            var currCell = board[cellI][cellJ];
            if (currCell.isMine) return;
            if (currCell.isMarked || currCell.isShown || currCell.isMine) continue
            currCell.isShown = true;
            renderCell(currCell, currCell.minesAroundCount)
            expandShown(board, cellI, cellJ);
        }
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

function renderEmoji(value) {
    var elEmoBtn = document.querySelector('.emoji');
    elEmoBtn.innerText = value;
}

function resetLevel(level = gLevel.SIZE) {
    stopTime();
    resetGame(level);
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
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        numOfLife: 3
    }
    return game;
}

//when game ends
function stopTime() {
    gGame.isOn = false;
    gStartTime = 0;
    resetTimeout();
    gGame.secsPassed = gSec;
}

//clear the timeout when game ends
function resetTimeout() {
    clearTimeout(gClockTimeout);
    gClockTimeout = 0;
}

//only at reset game
function resetTime() {
    gElTimer.innerText = TIME + ' 000';
    gSec = 0;
    resetTimeout()
}

function startGame() {
    if (gStartTime === 0) {
        gStartTime = Date.now();
        gGame.isOn = true;
        displayTime(); //start clock
    }
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

