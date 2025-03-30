const _r45f63 = crypto.randomBytes(16);
const _hs4863 = crypto.randomBytes(16);
window.fakeStorage = {
  _data: {},

  setItem: function (id, val) {
    this._data[id] = String(val);
  },

  getItem: function (id) {
    return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
  },

  removeItem: function (id) {
    return delete this._data[id];
  },

  clear: function () {
    return (this._data = {});
  },
};

function LocalStorageManager() {
  this.bestScoreKey = "bestScore";
  this.gameStateKey = "gameState";

  var supported = this.localStorageSupported();
  this.storage = supported ? window.localStorage : window.fakeStorage;
}

LocalStorageManager.prototype.localStorageSupported = function () {
  var testKey = "test";

  try {
    var storage = window.localStorage;
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

// توابع رمزگذاری و رمزگشایی
function encryptData(data) {
  return CryptoJS.AES.encrypt(data, _r45f63, {
    iv: _hs4863,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
}

function decryptData(encryptedData) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, _r45f63, {
      iv: _hs4863,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.error("Decrypt Error:", e);
    return null;
  }
}

// Best score getters/setters
LocalStorageManager.prototype.getBestScore = function () {
  const encryptedScore = this.storage.getItem(this.bestScoreKey);
  if (!encryptedScore) return 0;

  try {
    const decryptedScore = decryptData(encryptedScore);
    if (decryptedScore === null) return 0;
    return parseInt(decryptedScore, 10);
  } catch (e) {
    console.error("Error retrieving best score:", e);
    return 0;
  }
};

LocalStorageManager.prototype.setBestScore = function (score) {
  try {
    const encryptedScore = encryptData(score.toString());
    this.storage.setItem(this.bestScoreKey, encryptedScore);
  } catch (e) {
    console.error("Error setting best score:", e);
  }
};

// Game state getters/setters and clearing
LocalStorageManager.prototype.getGameState = function () {
  const encryptedState = this.storage.getItem(this.gameStateKey);
  if (!encryptedState) return null;

  try {
    const decryptedState = decryptData(encryptedState);
    if (decryptedState === null) return null;
    return JSON.parse(decryptedState);
  } catch (e) {
    console.error("Error retrieving game state:", e);
    return null;
  }
};

LocalStorageManager.prototype.setGameState = function (gameState) {
  try {
    const stateString = JSON.stringify(gameState);
    const encryptedState = encryptData(stateString);
    this.storage.setItem(this.gameStateKey, encryptedState);
  } catch (e) {
    console.error("Error setting game state:", e);
  }
};

LocalStorageManager.prototype.clearGameState = function () {
  this.storage.removeItem(this.gameStateKey);
};
