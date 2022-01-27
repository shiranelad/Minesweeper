'use strict'

var gBoard = [];
const MINE = '💣';
const FLAG = '🚩'
var gLevel;
var gStartTime = 0;
var gElTimer = document.querySelector('.timer');
var gSec = 0;
var gMin = 0;
var gHr = 0;
var gIsGameOn = false;
var gClockTimeout;

function initGame() {
    buildBoard(4);
    //setMinesNegsCount(gBoard)
}

function createLevel(num) {
    var level = {
        SIZE: num,
        MINES: ((num === 4) ? 2 : ((num === 8) ? 12 : 30))
    }
    return level;
}


function buildBoard(num) {
    // stopTime();
    resetTime();

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

    // Place the mines
    // countNegs(cell with isMine:true) and update cell object with mindesAroundCount 
    // for (var i = 0; i < gLevel.MINES; i++) {
    //     placeMine(gBoard);
    // }

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
    // place mines with first click and start game/time
    if (gStartTime === 0){
        for (var x = 0; x < gLevel.MINES; x++) {
            placeMine(gBoard, i, j);
        }
    }
    startGame()
    // expandShown(gBoard,elCell,i,j)
    // expandCells(gBoard,elCell,i,j)

    if (gBoard[i][j].isMarked || gBoard[i][j].isShown) return;


    gBoard[i][j].isShown = true;
    var negsCount = getCellMinesNegs(gBoard[i][j], gBoard)
    elCell.innerText = negsCount;
    elCell.classList.remove('unrevealed')

    checkGameOver()


    // cases:
    if (gBoard[i][j].isMine) {
        gameOver();
        renderCell(gBoard[i][j], MINE)
    }

}

function cellMarked(elCell, i, j) {
    if(!gIsGameOn) return;
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
    var flagCount = 0;
    var regCount = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (cell.isShown && !cell.Mine) regCount++
            if (cell.isMarked) flagCount++
        }
    }
    if ((flagCount + regCount) === (gLevel.SIZE ** 2) && flagCount === gLevel.MINES) {
        gameOver();
    }
    
}

function gameOver(){
    stopTime();
}

function expandShown(board, elCell, i, j) {
    var negsBoard = []
    for (var cellI = i - 1; cellI <= i + 1; cellI++) {
        for (var cellJ = j - 1; cellJ <= j + 1; cellJ++) {
            var currCell = board[cellI][cellJ]
            negsBoard.push(currCell);
            getCellMinesNegs(currCell, gBoard)
            var elCurrCell = document.querySelector(`.cell-${cellI}-${cellJ}`)
            // renderCell(elCurrCell,currCell.minesAroundCount)

        }
    }
    //     // console.log(setMinesNegsCount(negsBoard));
    // if(board[i][j].minesAroundCount === 0){

    // }
}

function startGame() {
    if (gStartTime === 0) {
        gStartTime = Date.now();
        startTime()
    }
}

function startTime() {
    if (!gIsGameOn) {
        gIsGameOn = true;
        displayTime();
    }
}

function stopTime() {
    gIsGameOn = false;
    gStartTime = 0;
    stopDisplayTime();
}

function stopDisplayTime() {
    clearTimeout(gClockTimeout);
}

function resetTime() {
    // gElTimer.innerText = '00:00:00';
    gElTimer.innerText = '000';
    gSec = 0;
    // gMin = 0 ;
    // gHr = 0 ;
}

function displayTime() {
    gSec += 1;
    // if (gSec === 60){
    //     gMin += 1;
    //     gSec = 0 ;
    // } 
    // if (gMin === 60){
    //     gHr += 1;
    //     gMin = 0 ;
    //     gSec = 0 ;
    // }
    // var zerohr = '0';
    // var zeromin = '0';
    // var zerosec = '0';

    // if(gHr > 9 ){
    //     zerohr = '';
    // }
    // if(gMin > 9 ){
    //     zeromin = '';
    // }
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
    // gElTimer.innerText = zerohr + gHr + ":" + zeromin + gMin + ":" + zerosec + gSec;
    gElTimer.innerText = zeroSec + gSec;
    gClockTimeout = setTimeout("displayTime()", 1000);
}
