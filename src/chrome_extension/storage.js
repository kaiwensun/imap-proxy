class Storage {
    static async save(key, value) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({ [key]: value }, resolve);
        });
    }

    static async get(key, fallback) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(key, result => {
                let value = result[key] === undefined ? fallback : result[key];
                resolve(value);
            });
        });
    }

    static getSync(key, fallback, callback) {
        chrome.storage.local.get(key, result => {
            let value = result[key] === undefined ? fallback : result[key];
            callback(value);
        });
    }

    static async clear() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.clear();
            resolve();
        });
    }

    static async getAll() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(undefined, result => {
                resolve(result);
            });
        });
    }

    static async remove(key) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.remove(key, resolve);
        });
    }
}

Storage.LAST_SYNC_SUCCESS_TIME = "LAST_SYNC_SUCCESS_TIME";
Storage.LAST_ATTEMPT_SYNC_START_TIME = "LAST_ATTEMPT_SYNC_START_TIME";
Storage.LAST_ATTEMPT_SYNC_END_TIME = "LAST_ATTEMPT_SYNC_END_TIME";
Storage.SYNC_RESULT = "SYNC_RESULT";
