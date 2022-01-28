'use strict'

function createMat(num) {

  var mat = []
  const ROWS = num;
  const COLS = num;
  for (var i = 0; i < ROWS; i++) {
    var row = []
    for (var j = 0; j < COLS; j++) {
      var cellObj = createCell();
      cellObj.i = i;
      cellObj.j = j;
      row.push(cellObj)
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
      var cellClass = `cell cell-${i}-${j} `;
      cellClass += (!cell.isShown) ? 'unrevealed ' : '';
      cellClass += (cell.isMine && cell.isShown) ? 'mine ' : 'unrevealed nocontent ';
      strHTML += `\t\t\t<td class="${cellClass}" onclick="cellClicked(this,${i},${j})" oncontextmenu="cellMarked(this,${i},${j})">
          ${(cell.isMine && cell.isShown) ? MINE : ""}</td>\n`;
    }

    strHTML += '\t\t</tr>\n'
  }
  strHTML += '</tbody></table>';
  var elContainer = document.querySelector(selector);
  elContainer.innerHTML = strHTML;
}


// location such as: {i: 2, j: 7}
function renderCell(location, value) {
  // Select the elCell and set the value, and classes accordingly
  var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
  if (value === MINE) { //&& !gBoard[location.i][location.j].isShown
    elCell.classList.add('mine')
  } 
  else if (value === FLAG) {
    elCell.classList.add('flag')
  }
  else if (gBoard[location.i][location.j].isShown) {
    elCell.classList.remove('unrevealed');
    elCell.classList.remove('flag');
  }
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


