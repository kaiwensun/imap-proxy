'use strict';

importScripts('imports.js');
importScripts('events/sync_emails.js');
importScripts("events/event-manager.js");
importScripts("storage.js");
importScripts("badge.js")

chrome.runtime.onInstalled.addListener(async details => {
    if (details.reason == "update") {
        let result = await Storage.get(Storage.SYNC_RESULT);
        let text = "?";
        let color = Badge.COLOR_BLUE;
        if (result !== undefined) {
            text = result.count;
        }
        await Badge.setBackgroundColor(color);
        await Badge.setText(text);
    }
});

EventManager.setSyncEmailTimer(0);

