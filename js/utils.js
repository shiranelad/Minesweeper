'use strict'

function createMat(num) {
  gLevel = {
    SIZE: num,
    MINES: (num === 4) ? 2 : ((num === 8) ? 12 : 30)
  }

  var mat = []
  const ROWS = num;
  const COLS = num;
  for (var i = 0; i < ROWS; i++) {
    var row = []
    for (var j = 0; j < COLS; j++) {
      row.push('')
    }
    mat.push(row)
  }
  return mat
}

function renderBoard(board, selector) {
  var strHTML = '<table border="0">\n\t<tbody>\n';
  for (var i = 0; i < board.length; i++) {
    strHTML += '\t\t<tr>\n';
    for (var j = 0; j < board[0].length; j++) {
      var cell = board[i][j];
      //TODO:delete
      console.log(cell.isMine)
      var cellClass = `cell cell-${i}-${j}`;
      strHTML += `\t\t\t<td class="${cellClass}" onclick="cellClicked(${i},${j})">${(cell.isMine) ? BOMB : EMPTY}</td>\n`;
    }

    strHTML += '\t\t</tr>\n'
  }
  strHTML += '</tbody></table>';
  // console.log('strHTML: ', strHTML);
  var elContainer = document.querySelector(selector);
  elContainer.innerHTML = strHTML;
}


// location such as: {i: 2, j: 7}
function renderCell(location, value) {
  // Select the elCell and set the value
  var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
  elCell.innerHTML = value;
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

