'use strict'

var gBoard = [];
const BOMB = '💣';
const EMPTY = '.';
var gLevel;

function initGame() {
    buildBoard(4);
}

function buildBoard(num) {
    // Put FLOOR everywhere and WALL at edges

    gBoard = createMat(num);
    
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            // Add created cell to The game board
            gBoard[i][j] = createCell();
        }
    }
    gBoard[2][1].isMine = true;
    gBoard[1][3].isMine = true; // TODO: to delete
    // console.log(gBoard[2][1]) //.isMine = true; 
    // console.log(gBoard[2][0]) //.isMine = true; 

    // Place the bombs
    // for (var i = 0; i < gLevel.MINES; i++) {
    //     var iPos = getRandomIntInclusive(0, gBoard.length - 1)
    //     var jPos = getRandomIntInclusive(0, gBoard.length - 1)
    //     // TODO: after check, update to this line: gBoard[iPos][jPos].isMine = true;
    // }

    //TODO: countNegs(cell with isMine:true) and update cell object with mindesAroundCount 


    console.table(gBoard);
    renderBoard(gBoard, '.board-container')
    // return gBoard;
}

function createCell(){
    var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
    }
    return cell
}

function setMinesNegsCount(board) {

}

function cellClicked(elCell, i, j) {

}

function cellMarked(elCell) {

}

function checkGameOver() {

}

function expandShown(board, elCell, i, j) {

}