/*
1. Choose a starting location.
2. Perform a random walk, carving passages to unvisited neighbors, until the current cell has no unvisited neighbors.
3. Enter "hunt" mode, where you scan the grid looking for an unvisited cell that is adjacent to a visited cell. If found, carve a passage between the two and let the formerly unvisited cell be the new starting location.
4. Repeat steps 2 and 3 until the hunt mode scans the entire grid and finds no unvisited cells.
*/
const h = 60;
const w = 60;

const createPlayer = (x, y) => {
  const player = {
    pos: { x, y },
    colour: "#000",
    canMove: function(dir) {
      if(timerFinished) return false;
      if(dir == "N") return !(getCell(this.pos.x, this.pos.y).hasWall("N"));
      if(dir == "E") return !(getCell(this.pos.x, this.pos.y).hasWall("E"));
      if(dir == "S") return !(getCell(this.pos.x,this.pos.y).hasWall("S"));
      if(dir == "W") return !(getCell(this.pos.x,this.pos.y).hasWall("W"))
    },
    move: function(dir) {
      if(this.canMove(dir)) {
        if(dir == "N") return this.pos.y--;
        if(dir == "E") return this.pos.x++;
        if(dir == "S") return this.pos.y++;
        if(dir == "W") return this.pos.x--;
      }
    }
  }
  return player;
}

const oppositeDir = (dir) => {
  return { N: "S", E: "W", S: "N", W: "E" }[dir];
};

const createCell = (x, y) => {
  const walls = ["N", "E", "S", "W"];
  const cell = {
    pos: { x, y },
    walls,
    visited: false,
    colour: "#fff",
    entry: false,
    exit: false,
    hasWall: (dir) => walls.includes(dir),
    removeWall: (dir) => {
      const i = walls.indexOf(dir);
      if (i >= 0) {
        walls.splice(i, 1);
      }
    },
    possibleDirections: function () {
      const out = [];
      if (this.pos.y != 0) out.push("N");
      if (this.pos.x != w - 1) out.push("E");
      if (this.pos.y != h - 1) out.push("S");
      if (this.pos.x != 0) out.push("W");
      return out;
    },
    canCarve: function () {
      const out = [];
      if (this.pos.y != 0 && !getCell(this.pos.x, this.pos.y - 1).visited)
        out.push("N");
      if (this.pos.x != w - 1 && !getCell(this.pos.x + 1, this.pos.y).visited)
        out.push("E");
      if (this.pos.y != h - 1 && !getCell(this.pos.x, this.pos.y + 1).visited)
        out.push("S");
      if (this.pos.x != 0 && !getCell(this.pos.x - 1, this.pos.y).visited)
        out.push("W");
      return out;
    },
  };
  return cell;
};

const cells = [];
for (let row = 0; row < h; row++) {
  for (let col = 0; col < w; col++) {
    const cell = createCell(col, row);
    cells.push(cell);
  }
}

const getCell = (x, y) => {
  return cells[y * w + x];
};

const randomCell = (row) => {
  const cell = getCell(
    Math.floor(Math.random() * w),
    row
  );
  return cell;
};

const randomDirection = (possible) => {
  return possible[Math.floor(Math.random() * possible.length)];
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let lastRowCompletelyVisited = 0;
const hunt = async (x, y) => {
  console.log(`hunting at ${x}, ${y}`)
  const cell = getCell(x, y);
  if(y > 1 && y % 2 === 0 && x == 0) await sleep(5);

  if(x === w-1 && cell.visited) lastRowCompletelyVisited = y

  if(x === w-1 && y === h-1 && cell.visited) return console.log(`stopping`);

  let nextHuntX = x + 1;
  let nextHuntY = y;
  if(x + 1 === w) {
    nextHuntX = 0;
    nextHuntY = y + 1;
    console.log(`reached end of row ${y}, moving onto next row ${nextHuntY}`)
  }
  if(cell.visited) return hunt(nextHuntX, nextHuntY);
 //if(cell.visited) hunt(nextX, nextY);

  const possibleNeighbours = cell.possibleDirections();
  const possibleNeighbourCells = [];

  for (let i = 0; i < possibleNeighbours.length; i++) {
    const possible = possibleNeighbours[i];
    let nextX = x;
    let nextY = y;

    if (possible === "N") {
      nextY -= 1;
    } else if (possible === "E") {
      nextX += 1;
    } else if (possible === "S") {
      nextY += 1;
    } else if (possible === "W") {
      nextX -= 1;
    }

    const possibleNeighbourCell = getCell(nextX, nextY);
    possibleNeighbourCells.push({
      direction: possible,
      cell: possibleNeighbourCell,
    });
  }

  const possibleNeighbourCellsVisited = possibleNeighbourCells.filter(
    (neighbor) => neighbor.cell.visited
  );
  if (possibleNeighbourCellsVisited.length > 0) { // if there is a visited neighbour of an unvisited cell
    const nextNeighbour = possibleNeighbourCellsVisited[0];
    const nextDirection = nextNeighbour.direction;
    // nextCell = getCell(nextX, nextY);
    // nextCell.visited = true;
    // nextCell.removeWall(oppositeDir(dir));
    console.log(nextNeighbour, nextDirection);
    nextNeighbour.cell.visited = true;
    cell.removeWall(nextDirection);
    nextNeighbour.cell.removeWall(oppositeDir(nextDirection));
    carve(nextNeighbour.cell);
  } else { // if there is no visited neighbour of an unvisited cell

    return hunt(nextHuntX, nextHuntY);
  }
};

carved = 1;
const carve = (cell) => {
  const dir = randomDirection(cell.canCarve());
  if (dir.length) {
    cell.removeWall(dir);
    cell.visited = true;
    let nextX = cell.pos.x;
    let nextY = cell.pos.y;
    if (dir == "N") {
      nextY -= 1;
    }
    if (dir == "E") {
      nextX += 1;
    }
    if (dir == "S") {
      nextY += 1;
    }
    if (dir == "W") {
      nextX -= 1;
    }
    nextCell = getCell(nextX, nextY);
    nextCell.visited = true;
    nextCell.removeWall(oppositeDir(dir));
  }
  if (nextCell.canCarve().length) {
    carve(nextCell);
  } else {
    hunt(0, lastRowCompletelyVisited);
  }
};
let entry = randomCell(0);
entry.colour = "#a1c2ff";
entry.entry = true;
carve(entry);
let exit = randomCell(h-1)
exit.colour = "#82e882"
exit.exit = true;

const player = createPlayer(entry.pos.x, entry.pos.y)
console.log(player)
let firstMove = false;
let timerStarted = false;
let timerFinished = false;
let startTime;
let endTime;
let totalTime;

setup = () => {
  createCanvas(800, 800);
};

draw = () => {
  background("white");

  const cellSize = width / w;

  if(firstMove && !timerStarted) {
    startTime = new Date();
    timerStarted = true;
  }
  
  if(player.pos.x == exit.pos.x && player.pos.y == exit.pos.y && !timerFinished) {
    console.log("finished");
    timerFinished = true;
    endTime = new Date();
  }
  if(startTime && endTime) {
    totalTime = (endTime - startTime) / 1000
    console.log(`Total time: ${totalTime}`)
  }

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const x = cell.pos.x * cellSize;
    const y = cell.pos.y * cellSize;
    const playerX = player.pos.x * cellSize;
    const playerY = player.pos.y * cellSize;
    const playerSizeDiff = cellSize/4

    stroke(0); // Black stroke for walls
    strokeWeight(1);
    // if (cell.visited) {
    //   fill("blue"); // Blue fill for visited cells
    //   noStroke();
    //   rect(x + 0.5, y + 0.5, cellSize, cellSize);
    // }
    if(cell.entry || cell.exit) {
      fill(cell.colour);
      noStroke();
      rect(x, y, cellSize, cellSize)
    }
    fill("black");
    rect(playerX+playerSizeDiff/2, playerY+playerSizeDiff/2, cellSize-playerSizeDiff, cellSize-playerSizeDiff);
    if (cell.hasWall("N")) line(x, y, x + cellSize, y);
    if (cell.hasWall("E")) line(x + cellSize, y, x + cellSize, y + cellSize);
    if (cell.hasWall("S")) line(x, y + cellSize, x + cellSize, y + cellSize);
    if (cell.hasWall("W")) line(x, y, x, y + cellSize);
  }

  if(timerFinished) {
    fill(255, 255, 255, 220);
    rect(0, 0, width, height);
    textAlign(CENTER);
    textSize(40);
    fill("black");
    text(totalTime, width/2, height/2);
  }
};

keyPressed = () => { // p5
  if(!firstMove) {
    firstMove = true;
  }
  if (keyCode == UP_ARROW) player.move("N");
  if (keyCode == DOWN_ARROW) player.move("S");
  if (keyCode == LEFT_ARROW) player.move("W");
  if (keyCode == RIGHT_ARROW) player.move("E");
}
