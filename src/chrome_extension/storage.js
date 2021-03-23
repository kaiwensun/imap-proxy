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

    static async updateEmails(newResult) {
        function include(emails, target) {
            const PROPS = ["eid", "folder", "sender_addr", "timestamp"];
            return emails.find(email => PROPS.every(prop => email[prop] == target[prop])) !== undefined;
        }
        let oldResult = await Storage.get(Storage.SYNC_RESULT);
        newResult.emails.forEach(email => email.is_new = !include(oldResult.emails, email));
        await Storage.save(Storage.SYNC_RESULT, newResult);
    }

    static async markEmailsAsOld() {
        let result = await Storage.get(Storage.SYNC_RESULT);
        result.emails.forEach(email => email.is_new = false);
        await Storage.save(Storage.SYNC_RESULT, result);
    }
}

Storage.LAST_SYNC_SUCCESS_TIME = "LAST_SYNC_SUCCESS_TIME";
Storage.LAST_ATTEMPT_SYNC_START_TIME = "LAST_ATTEMPT_SYNC_START_TIME";
Storage.LAST_ATTEMPT_SYNC_END_TIME = "LAST_ATTEMPT_SYNC_END_TIME";
Storage.SYNC_RESULT = "SYNC_RESULT";
