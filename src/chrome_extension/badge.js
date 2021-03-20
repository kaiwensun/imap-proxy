class Badge {
    static async setBackgroundColor(color) {
        return new Promise((resolve, reject) => {
            chrome.action.setBadgeBackgroundColor({ color }, resolve);
        });
    }

    static async setText(text) {
        if (typeof text === "number") {
            text = text.toString();
        }
        return new Promise((resolve, reject) => {
            chrome.action.setBadgeText({ text }, resolve);
        });
    }
}

Badge.COLOR_NORMAL = "#FF0000";
Badge.COLOR_SYNCING = "#FFA500";
Badge.COLOR_ERROR = "#808080";
Badge.COLOR_BLUE = "#00BFFF";