class Storage {
    static async save(key, value) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({ [key]: value }, resolve);
        });
    }

    static async get(key) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get([key], result => {
                resolve(result[key]);
            });
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
}
