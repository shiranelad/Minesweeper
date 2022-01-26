'use strict'

var gBoard = [];
const MINE = '💣';
const FLAG = '🚩'
var gLevel;

function initGame() {
    buildBoard(4);
    //setMinesNegsCount(gBoard)
}

function createLevel(num){
    var level = {
      SIZE: num,
      MINES: ((num === 4) ? 2 : ((num === 8) ? 12 : 30))
    }
    return level;
}
  

function buildBoard(num) {
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
    //TODO: countNegs(cell with isMine:true) and update cell object with mindesAroundCount 
    for (var i = 0; i < gLevel.MINES; i++) {
        placeMine(gBoard);
    }
    
    renderBoard(gBoard, '.board-container')
    
}

function placeMine(board,emptyCells) {
    var emptyCells = getEmptyCells(gBoard);
    var randIdx = getRandomIntInclusive(0, emptyCells.length - 1);
    console.log(randIdx)
    var cell = emptyCells[randIdx];
    board[cell.i][cell.j].isMine = true;
    board[cell.i][cell.j].isShown = true;

    return cell;
}

function getEmptyCells(board) {
    var emptyCells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isMine) emptyCells.push(board[i][j])
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
            cell.isShown = true;
            if (cell.isMine) continue;
            renderCell(cell, getCellMinesNegs(cell, board))
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
    if (gBoard[i][j].isMine || gBoard[i][j].isMarked) return;
    var negsCount = getCellMinesNegs(gBoard[i][j], gBoard)
    elCell.innerText = negsCount;
    elCell.classList.toggle('unrevealed')


}

function cellMarked(elCell, i, j) {
    window.event.preventDefault();
    elCell.innerText = FLAG;
    console.log('flagged!')
}

function checkGameOver(i, j) {
    {
        console.log('Game Over')
    }
}

function expandShown(board, elCell, i, j) {

}