let opponentTurn = false;
const tictacToeTable = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
];
const winningCombinations = [
    // Rows
    [
      [0, 0],
      [0, 1],
      [0, 2],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    [
      [2, 0],
      [2, 1],
      [2, 2],
    ],
    // Columns
    [
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    [
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [0, 2],
      [1, 2],
      [2, 2],
    ],
    // Principal diagonal
    [
      [0, 0],
      [1, 1],
      [2, 2],
    ],
    // Secondary diagonal
    [
      [0, 2],
      [1, 1],
      [2, 0],
    ],
  ];
const cells = document.querySelectorAll("table > tbody > tr > td");
const score = [0, 0];
const winEmojis = ["😎", "🤗", "🤣", "😏", "😂"];
const thinkingEmojis = ["🥱", "🥱", "👀", "🤔", "🥱"];
const lostEmojis = ["🤡", "💩", "😡"];
let playerName = prompt("Ingresa tu nombre: ");
//let playerName = "Juan";

document.addEventListener("readystatechange", async function (event) {
  if (event.target.readyState === "complete") {
    await setCellData();
    await setCellOnClick();
    await setScore();
    await showEmoji(winEmojis[await getRandom(winEmojis.length)]);
  }
});

async function setCellOnClick() {
  cells.forEach(async function (td) {
    td.addEventListener("click", async (event) => onCellClick(event));
  });
}

async function setScore() {
  document.querySelector(
    "#score"
  ).innerText = `${playerName}: ${score[0]} - Ringo: ${score[1]}`;
}

async function setCellData() {
  let cell = 0;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      cells[cell].dataset.row = row;
      cells[cell].dataset.col = col;
      cell++;
    }
  }
}

async function onCellClick(event) {
  const td = event.target;

  await setMark(td);
}

async function setMark(td) {
  if (opponentTurn) {
    const opponentMove = await getBestMoveForO() ?? await getRandomMove();
    //if (await setTictacToeTablePosition(td.dataset.row, td.dataset.col)) {
    if (await setTictacToeTablePosition(opponentMove[0], opponentMove[1])) {
      await opponentMark(document.querySelector(`td[data-row='${opponentMove[0]}'][data-col='${opponentMove[1]}']`));
      evaluateWinner();
    }
  } else {
    if (await setTictacToeTablePosition(td.dataset.row, td.dataset.col)) {
      await playerMark(td);  
      evaluateWinner();
      setMark(null);      
    }
  }
}

async function evaluateWinner() {
  const winner = await getWinner();
  if (winner) {
    alert(`${winner === "X" ? playerName : "Ringo"} Gana!`);

    if (winner === "X") { 
        showEmoji(lostEmojis[await getRandom(lostEmojis.length)]);
        score[0]++; 
    }
    else { 
        showEmoji(winEmojis[await getRandom(winEmojis.length)]);
        score[1]++;
    }

    await resetGame();

    await activePageBlocker();
    await setScore();
    setTimeout(() => {
      removePageBlocker();
    }, 2000);
  } else if (await isBoardFull()) {
    alert(`Empate!`);

    showEmoji(thinkingEmojis[await getRandom(thinkingEmojis.length)]);

    await resetGame();

    await activePageBlocker();
    setTimeout(() => {
      removePageBlocker();
    }, 2000);
  }
  return winner;
}

async function getWinner() { 
  const board = tictacToeTable;

  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (
      board[a[0]][a[1]] &&
      board[a[0]][a[1]] === board[b[0]][b[1]] &&
      board[a[0]][a[1]] === board[c[0]][c[1]]
    ) {
      return board[a[0]][a[1]];
    }
  }

  return null;
}

async function setTictacToeTablePosition(row, col) {
  const dataMark = opponentTurn ? "O" : "X";

  if (!tictacToeTable[row][col]) {
    tictacToeTable[row][col] = dataMark;
    opponentTurn = !opponentTurn;
    return true;
  }

  return false;
}

async function opponentMark(td) {
  td.innerHTML = `<i class="fa-solid fa-paw"></i>`;
}

async function playerMark(td) {
  td.innerText = `X`;
}

async function resetGame() {
  //reset the variable values
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      tictacToeTable[row][col] = "";
    }
  }

  //clean the table
  cells.forEach(async (td) => {
    td.innerHTML = "&nbsp;";
  });
}

async function isBoardFull() {
  return tictacToeTable.every((row) => row.every((cell) => cell !== ""));
}

async function activePageBlocker() {
  const div = document.createElement("div");
  div.className = "page-blocker";
  document.body.appendChild(div);
}

async function removePageBlocker() {
  document.querySelector(".page-blocker").remove();
}

async function getBestMoveForO() {
  // Check if 'O' can win in the next move
  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (
      tictacToeTable[a[0]][a[1]] === "O" &&
      tictacToeTable[b[0]][b[1]] === "O" &&
      !tictacToeTable[c[0]][c[1]]
    )
      return c;
    if (
      tictacToeTable[a[0]][a[1]] === "O" &&
      !tictacToeTable[b[0]][b[1]] &&
      tictacToeTable[c[0]][c[1]] === "O"
    )
      return b;
    if (
      !tictacToeTable[a[0]][a[1]] &&
      tictacToeTable[b[0]][b[1]] === "O" &&
      tictacToeTable[c[0]][c[1]] === "O"
    )
      return a;
  }

  // Check if 'X' can win in the next move and block it
  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (
      tictacToeTable[a[0]][a[1]] === "X" &&
      tictacToeTable[b[0]][b[1]] === "X" &&
      !tictacToeTable[c[0]][c[1]]
    )
      return c;
    if (
      tictacToeTable[a[0]][a[1]] === "X" &&
      !tictacToeTable[b[0]][b[1]] &&
      tictacToeTable[c[0]][c[1]] === "X"
    )
      return b;
    if (
      !tictacToeTable[a[0]][a[1]] &&
      tictacToeTable[b[0]][b[1]] === "X" &&
      tictacToeTable[c[0]][c[1]] === "X"
    )
      return a;
  }

  // Otherwise, pick the first available cell
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (!tictacToeTable[row][col]) {
        return [row, col];
      }
    }
  }

  return null;
}

async function getRandomMove() {
    const row = await getRandom(3);
    const col = await getRandom(3);
    return [row, col];
}

async function getRandom(limit) {
    return Math.floor(Math.random() * limit);
}

async function showEmoji(emoji) {
    const emojiContainer = document.querySelector('.emoji-container');
    emojiContainer.innerText = emoji;
    emojiContainer.classList.remove('hidden');
    emojiContainer.classList.add('visible');

    // Aparece por 3 segundos (3000 ms) y luego desaparece
    setTimeout(() => {
        emojiContainer.classList.remove('visible');
        setTimeout(() => {
            emojiContainer.classList.add('hidden');
        }, 500); // El tiempo de transición debe coincidir con el CSS
    }, 1000);
}