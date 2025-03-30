// Function to get rank icon
let allPlayersData = [];
let userId = 422975454;
let bestScoreCurrentUser = 0;
function getRankIcon(rankNumber) {
  const player = allPlayersData[rankNumber];
  if (player?.userId === userId && player.rank) {
    return `${player.rank}`; // نمایش رتبه واقعی
  }

  // نمایش مدال‌های طلا، نقره و برنز برای ۳ رتبه اول
  switch (rankNumber) {
    case 0:
      return "🥇";
    case 1:
      return "🥈";
    case 2:
      return "🥉";
    default:
      return rankNumber + 1;
  }
}
if (Bale?.WebApp) {
  const initData = Bale?.WebApp?.initDataUnsafe;
  userId = 422975454 || initData?.user?.id || null;
}
// Function to render skeleton rows
function renderSkeletonRows() {
  const skeletonContainer = document.getElementById("skeleton-container");
  for (let i = 0; i < 5; i++) {
    const skeletonRow = document.createElement("div");
    skeletonRow.className = "skeleton-row";

    const skeletonAvatar = document.createElement("div");
    skeletonAvatar.className = "skeleton-avatar";

    const skeletonContent = document.createElement("div");
    skeletonContent.className = "skeleton-content";

    const skeletonLine1 = document.createElement("div");
    skeletonLine1.className = "skeleton-line";

    const skeletonLine2 = document.createElement("div");
    skeletonLine2.className = "skeleton-line short";

    skeletonContent.appendChild(skeletonLine1);
    skeletonContent.appendChild(skeletonLine2);

    skeletonRow.appendChild(skeletonAvatar);
    skeletonRow.appendChild(skeletonContent);

    skeletonContainer.appendChild(skeletonRow);
  }
}

// تابع دریافت داده‌های لیدربرد
async function fetchLeaderboard() {
  try {
    const url = new URL("https://game2048.liara.run/leaderboard");
    if (userId) url.searchParams.set("userId", userId);
    console.log(url.toString());
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    allPlayersData = await response.json();
    renderLeaderboard(allPlayersData);
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    document.getElementById("error-message").innerText =
      "مشکلی پیش آمده لطفا مجددا تلاش کنید!";
    document.getElementById("error-message").style.display = "block";
  } finally {
    document.getElementById("skeleton-container").style.display = "none";
  }
}

// Function to truncate username
function truncateUsername(username) {
  const maxLength = 15;
  if (username.length > maxLength) {
    if (username.includes(" ")) {
      return username.split(" ")[0] + username.split(" ")[1] + "...";
    } else {
      return username.substring(0, maxLength) + "...";
    }
  }
  return username;
}

// Function to render leaderboard for a specific page

function renderLeaderboard(playersData) {
  const leaderboardBody = document.getElementById("leaderboard-body");
  leaderboardBody.innerHTML = "";

  const playersToDisplay = playersData;
  let currentRank = 1;
  let previousScore = null;

  if (playersToDisplay.length === 0) {
    const emptyRow = document.createElement("tr");
    const emptyCell = document.createElement("td");
    emptyCell.colSpan = 3;
    emptyCell.className = "empty-message";
    emptyCell.innerText = "هیچ بازیکنی یافت نشد";
    emptyRow.appendChild(emptyCell);
    leaderboardBody.appendChild(emptyRow);
  } else {
    playersToDisplay.forEach((player, index) => {
      const row = document.createElement("tr");
      row.className = `player-row ${currentRank <= 3 ? "top-player" : ""}`;

      // استایل‌دهی کاربر فعلی
      if (player?.userId === userId) {
        bestScoreCurrentUser = player?.score;
        document.querySelector(".best-container").textContent =
          player?.score || 0;
        row.style.backgroundColor = "rgb(231 231 231 / 39%)";
        row.style.borderBottom = "2px solid rgb(47 176 0)";
      }

      // محاسبه رتبه با در نظر گرفتن امتیازات یکسان
      if (index > 0 && previousScore !== player.score) {
        currentRank = index + 1;
      }
      previousScore = player.score;

      // نمایش رتبه
      const rankCell = document.createElement("td");
      rankCell.className = "rank-cell";
      rankCell.textContent = getRankIcon(currentRank - 1);

      // نمایش نام و امتیاز
      const playerCell = document.createElement("td");
      playerCell.className = "player-cell";

      const playerInfo = document.createElement("div");
      playerInfo.className = "player-info";

      const playerName = document.createElement("span");
      playerName.className = "player-name";

      // نمایش "شما" برای کاربر فعلی
      if (player?.userId === userId) {
        playerName.innerText = "شما";
        playerName.style.fontWeight = "bold";
        playerName.style.color = "#4b5563";
      } else {
        const truncatedName = truncateUsername(player.username);
        playerName.innerText = truncatedName;

        if (player.username !== truncatedName) {
          playerName.style.cursor = "pointer";
          const tooltip = document.createElement("span");
          tooltip.className = "tooltip";
          tooltip.style.position = "absolute";
          tooltip.style.background = "#fff";
          tooltip.style.borderRadius = "5px";
          tooltip.style.padding = "5px";
          tooltip.style.display = "none";
          tooltip.style.zIndex = "1";
          tooltip.style.top = "50%";
          tooltip.style.right = "20px";
          tooltip.innerText = player.username;
          document.querySelector(".card-content").appendChild(tooltip);
          playerName.appendChild(tooltip);

          playerName.addEventListener("mouseover", () => {
            tooltip.style.display = "block";
          });
          playerName.addEventListener("mouseout", () => {
            tooltip.style.display = "none";
          });
        }
      }
      playerCell.appendChild(playerInfo);
      playerInfo.appendChild(playerName);

      const scoreCell = document.createElement("td");
      scoreCell.className = "score-cell";

      const scoreBadge = document.createElement("span");
      scoreBadge.className = `score-badge rank-${currentRank - 1}`;
      scoreBadge.innerText = player.score.toLocaleString();

      leaderboardBody.appendChild(row);
      row.appendChild(scoreCell);
      row.appendChild(playerCell);
      scoreCell.appendChild(scoreBadge);
      row.appendChild(rankCell);
    });
  }

  document.getElementById("table-container").style.display = "block";
}

// Initialize leaderboard
renderSkeletonRows();
fetchLeaderboard();

// Add sticky header functionality
const tableHeader = document.querySelector("#leaderboard-table thead");
tableHeader.style.position = "sticky";
tableHeader.style.top = "0";
tableHeader.style.background = "#fff";
tableHeader.style.zIndex = "1";
