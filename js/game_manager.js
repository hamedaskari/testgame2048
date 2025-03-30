function GameManager(size, InputManager, Actuator, StorageManager) {
  this.size = size; // Size of the grid
  this.inputManager = new InputManager();
  this.storageManager = new StorageManager();
  this.actuator = new Actuator();
  this.userData = null;
  this.startTiles = 2;
  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));

  this.setup();

  this.getUserInfo();
}

// Restart the game
GameManager.prototype.restart = function () {
  this.storageManager.clearGameState();
  this.actuator.continueGame(); // Clear the game won/lost message
  this.setup();
};

// Keep playing after winning (allows going over 2048)
GameManager.prototype.keepPlaying = function () {
  this.keepPlaying = true;
  this.actuator.continueGame(); // Clear the game won/lost message
};
GameManager.prototype.showLoading = function () {
  // آرایه ای از فکت‌های جالب در مورد بازی
  const facts = [
    "آیا می‌دانستید بالاترین عددی که در بازی 2048 می‌توان ساخت 131072 است؟",
    "ایده اصلی بازی 2048 از بازی‌های Threes! و 1024! گرفته شده است.",
    "بازی 2048 در عرض یک هفته بعد از انتشار به شدت محبوب شد.",
    "گفته می‌شود برای حل بازی 2048 به صورت تصادفی به 8397228 قدم نیاز است.",
    "2048 فقط یک بازی نیست، بلکه یک چالش ذهنی است!",
    "هدف بازی 2048 ادغام کاشی‌ها برای رسیدن به عدد 2048 است.",
    "با هر حرکت، یک کاشی جدید با مقدار 2 یا 4 به صورت تصادفی به صفحه اضافه می‌شود.",
    "بازی زمانی به پایان می‌رسد که صفحه پر شود و هیچ حرکتی برای ادغام کاشی‌ها باقی نماند.",
    "برای کسب امتیاز بیشتر، سعی کنید کاشی‌های با ارزش بالاتر را در گوشه‌ها قرار دهید.",
    "برخی از استراتژی‌های بازی شامل تمرکز بر روی یک گوشه و حفظ یک ردیف یا ستون خالی است.",
    "بازی 2048 به دلیل سادگی و اعتیادآور بودن، به سرعت به یک پدیده جهانی تبدیل شد.",
    "نسخه‌های مختلفی از بازی 2048 با قوانین و ظاهر متفاوت وجود دارد.",
    "2048 یک بازی تک نفره است که برای تقویت تمرکز و تفکر استراتژیک طراحی شده.",
  ];

  let factIndex = 0; // Index to track the current fact

  // Function to update the fact
  const updateFact = () => {
    factIndex = (factIndex + 1) % facts.length; // Cycle through facts
    factElement.textContent = facts[factIndex]; // Update the fact in the element
  };

  // نمایش لودینگ
  const loadingElement = document.createElement("div");
  loadingElement.id = "loading";
  loadingElement.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgb(0 0 0 / 79%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    color: white;
    font-size: 1.2em;
    text-align: center;
    direction: rtl; /* Right-to-left direction */
  `;
  loadingElement.innerHTML = `
    <p style="font-size: 0.8em; margin-bottom: 10px;">در حال بررسی عضویت...</p>
    <div class="spinner"></div>
    <p id="fact" style="direction: rtl; text-align: center; word-wrap: break-word; padding : 1.5rem">${facts[factIndex]}</p>
  `;

  const spinnerStyle = document.createElement("style");
  spinnerStyle.innerHTML = `
    .spinner {
      border: 5px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top: 5px solid #fff;
      width: 50px;
      height: 50px;
      animation: spin 2s linear infinite;
      margin-bottom: 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  document.head.appendChild(spinnerStyle);
  document.body.appendChild(loadingElement);

  const factElement = document.getElementById("fact"); // Get the fact element

  // Set interval to change facts every 3 seconds
  this.factInterval = setInterval(updateFact, 5000); // Changed to 5 seconds
};

GameManager.prototype.hideLoading = function () {
  // پنهان کردن لودینگ
  const loadingElement = document.getElementById("loading");
  if (loadingElement) {
    loadingElement.remove();
    clearInterval(this.factInterval);
  }
};

//get user data from bale
GameManager.prototype.getUserInfo = function () {
  if (typeof Bale !== "undefined" && Bale.WebApp) {
    const initData = Bale.WebApp.initDataUnsafe;
    this.showLoading();

    fetch(
      `https://game2048.liara.run/check-user-status?userId=${initData.user?.id}`
    )
      .then((response) => {
        if (!response.ok) {
          Bale.WebApp.close();
          this.hideLoading();
          return;
        }
        return response.json();
      })
      .then((data) => {
        if (!data.isMember) {
          Bale.WebApp.close();
          this.hideLoading();
          return;
        }

        this.userData = {
          name: initData.user?.first_name || "ناشناس",
          username: initData.user?.username || initData.user?.first_name,
          userId: initData.user?.id,
        };

        this.hideLoading();
      })
      .catch((error) => {
        console.error("خطا در بررسی وضعیت کاربر:", error);
        Bale.WebApp.close();
        this.hideLoading();
      });

    Bale.WebApp.ready();
  }
};

// Return true if the game is lost, or has won and the user hasn't kept playing
GameManager.prototype.isGameTerminated = function () {
  return this.over || (this.won && !this.keepPlaying);
};

// Set up the game
GameManager.prototype.setup = function () {
  var previousState = this.storageManager.getGameState();

  // Reload the game from a previous game if present
  if (previousState) {
    this.grid = new Grid(previousState.grid.size, previousState.grid.cells); // Reload grid

    this.score = previousState.score;
    this.over = previousState.over;
    this.won = previousState.won;
    this.keepPlaying = previousState.keepPlaying;
  } else {
    this.grid = new Grid(this.size);
    this.score = 0;
    this.over = false;
    this.won = false;
    this.keepPlaying = false;

    // Add the initial tiles
    this.addStartTiles();
  }

  // Update the actuator
  this.actuate();
};

// Set up the initial tiles to start the game with
GameManager.prototype.addStartTiles = function () {
  for (var i = 0; i < this.startTiles; i++) {
    this.addRandomTile();
  }
};

// Adds a tile in a random position
GameManager.prototype.addRandomTile = function () {
  if (this.grid.cellsAvailable()) {
    var value = Math.random() < 0.9 ? 2 : 4;
    var tile = new Tile(this.grid.randomAvailableCell(), value);

    this.grid.insertTile(tile);
  }
};

// function signData(data) {
//   const _p85wq6 = "Gx#8dLpM$eJ4BnVcRtY7uI9oP0aSdFgHjKlZx!@#$%^&*()_+-={}:<>?,.";
//   return CryptoJS.SHA256(_p85wq6 + data).toString(CryptoJS.enc.Hex);
// }

// GameManager.prototype.generateToken = function (data) {
//   const timestamp = new Date().toISOString();
//   const signature = signData(data + timestamp);
//   return `${timestamp}:${signature}`;
// };

GameManager.prototype.sendToLeaderboard = function () {
  const data = {
    username: this.userData?.name || "ناشناس",
    score: this.score,
    userId: this.userData?.userId,
  };

  // const token = this.generateToken(JSON.stringify(data));

  fetch("https://game2048.liara.run/submit-score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log("نتیجه ثبت امتیاز:", result);
      fetchLeaderboard();
    })
    .catch((error) => {
      console.error("خطا در ارسال اطلاعات:", error);
    });
};

GameManager.prototype.actuate = function () {
  if (this.over && this.score > this.storageManager.getBestScore()) {
    this.storageManager.setBestScore(this.score);
  }

  if (this.over && !this.scoreSent) {
    this.sendToLeaderboard();
    this.storageManager.clearGameState();
  } else {
    this.storageManager.setGameState(this.serialize());
  }
  this.actuator.actuate(this.grid, {
    score: this.score,
    over: this.over,
    won: this.won,
    bestScore: this.storageManager.getBestScore(),
    terminated: this.isGameTerminated(),
  });
};

// Represent the current game as an object
GameManager.prototype.serialize = function () {
  return {
    grid: this.grid.serialize(),
    score: this.score,
    over: this.over,
    won: this.won,
    keepPlaying: this.keepPlaying,
  };
};

// Save all tile positions and remove merger info
GameManager.prototype.prepareTiles = function () {
  this.grid.eachCell(function (x, y, tile) {
    if (tile) {
      tile.mergedFrom = null;
      tile.savePosition();
    }
  });
};

// Move a tile and its representation
GameManager.prototype.moveTile = function (tile, cell) {
  this.grid.cells[tile.x][tile.y] = null;
  this.grid.cells[cell.x][cell.y] = tile;
  tile.updatePosition(cell);
};

// Move tiles on the grid in the specified direction
GameManager.prototype.move = function (direction) {
  var self = this;
  if (this.isGameTerminated()) return;

  var cell, tile;
  var vector = this.getVector(direction);
  var traversals = this.buildTraversals(vector);
  var moved = false;

  this.prepareTiles();

  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = self.grid.cellContent(cell);

      if (tile) {
        var positions = self.findFarthestPosition(cell, vector);
        var next = self.grid.cellContent(positions.next);

        if (next && next.value === tile.value && !next.mergedFrom) {
          var merged = new Tile(positions.next, tile.value * 2);
          merged.mergedFrom = [tile, next];

          self.grid.insertTile(merged);
          self.grid.removeTile(tile);

          tile.updatePosition(positions.next);

          self.score += merged.value;

          // بررسی برد
          if (merged.value === 2048 && !self.won) {
            self.won = true;
          }
        } else {
          self.moveTile(tile, positions.farthest);
        }

        if (!self.positionsEqual(cell, tile)) {
          moved = true;
        }
      }
    });
  });

  if (moved) {
    this.addRandomTile();

    if (!this.movesAvailable()) {
      this.over = true;
    }

    this.actuate();
  }
};
// Get the vector representing the chosen direction
GameManager.prototype.getVector = function (direction) {
  // Vectors representing tile movement
  var map = {
    0: { x: 0, y: -1 }, // Up
    1: { x: 1, y: 0 }, // Right
    2: { x: 0, y: 1 }, // Down
    3: { x: -1, y: 0 }, // Left
  };

  return map[direction];
};

// Build a list of positions to traverse in the right order
GameManager.prototype.buildTraversals = function (vector) {
  var traversals = { x: [], y: [] };

  for (var pos = 0; pos < this.size; pos++) {
    traversals.x.push(pos);
    traversals.y.push(pos);
  }

  // Always traverse from the farthest cell in the chosen direction
  if (vector.x === 1) traversals.x = traversals.x.reverse();
  if (vector.y === 1) traversals.y = traversals.y.reverse();

  return traversals;
};

GameManager.prototype.findFarthestPosition = function (cell, vector) {
  var previous;

  // Progress towards the vector direction until an obstacle is found
  do {
    previous = cell;
    cell = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));

  return {
    farthest: previous,
    next: cell, // Used to check if a merge is required
  };
};

GameManager.prototype.movesAvailable = function () {
  return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

// Check for available matches between tiles (more expensive check)
GameManager.prototype.tileMatchesAvailable = function () {
  var self = this;

  var tile;

  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      tile = this.grid.cellContent({ x: x, y: y });

      if (tile) {
        for (var direction = 0; direction < 4; direction++) {
          var vector = self.getVector(direction);
          var cell = { x: x + vector.x, y: y + vector.y };

          var other = self.grid.cellContent(cell);

          if (other && other.value === tile.value) {
            return true; // These two tiles can be merged
          }
        }
      }
    }
  }

  return false;
};

GameManager.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};
