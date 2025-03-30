const _x9Kl = "Gx8dLpM0eJ5cN6bR7t";
const _a4Sd = "FgYhJkLmNpQrStU";

function _encryptData(data) {
  const encrypted = CryptoJS.AES.encrypt(data, _x9Kl, {
    iv: _a4Sd,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
}

function _decryptData(encryptedData) {
  const decrypted = CryptoJS.AES.decrypt(encryptedData, _x9Kl, {
    iv: _a4Sd,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

window.fakeStorage = {
  _data: {},

  setItem: function (id, val) {
    const encryptedValue = _encryptData(val);
    this._data[id] = encryptedValue;
    return encryptedValue;
  },

  getItem: function (id) {
    return this._data[id] ? _decryptData(this._data[id]) : null;
  },

  removeItem: function (id) {
    delete this._data[id];
  },

  clear: function () {
    this._data = {};
  },
};

function LocalStorageManager() {
  this._gameStateKey = "gameState";
  this.storage = this._initStorage();
}

LocalStorageManager.prototype._initStorage = function () {
  try {
    window.localStorage.setItem("test", "test");
    window.localStorage.removeItem("test");
    return window.localStorage;
  } catch (e) {
    return window.fakeStorage;
  }
};

// Game state handlers
LocalStorageManager.prototype.getGameState = function () {
  const encrypted = this.storage.getItem(this._gameStateKey);
  if (!encrypted) return null;

  try {
    return JSON.parse(_decryptData(encrypted));
  } catch (e) {
    console.error("Failed to parse game state:", e);
    return null;
  }
};

LocalStorageManager.prototype.setGameState = function (state) {
  this.storage.setItem(this._gameStateKey, _encryptData(JSON.stringify(state)));
};

LocalStorageManager.prototype.clearGameState = function () {
  this.storage.removeItem(this._gameStateKey);
};
