class Logger {
    KEY = "logs";
    LIMIT = 100;
    log(msg) {
        chrome.storage.local.get([this.KEY], ({ logs }) => {
            if (logs === undefined) {
                logs = []
            }
            logs.push({
                "time": new Date().toString(),
                "msg": msg
            });
            while (logs.length > this.LIMIT) {
                logs.shift();
            }
            let item = {}
            item[this.KEY] = logs;
            chrome.storage.local.set(item, () => {
                console.log(`set log of size ${logs.length}`);
            })
        });
    }

    show(callback, option) {
        chrome.storage.local.get(this.KEY, ({ logs }) => {
            console.log(logs);
            if (callback !== undefined) {
                callback(logs);
            }
            if (option !== undefined) {
                option.logs = logs;
            }
        });
    }
}

logger = new Logger();