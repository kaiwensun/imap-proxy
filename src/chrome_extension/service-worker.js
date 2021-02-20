'use strict';
let alarmHandlers = {
    "sync-count": () => {
        let res = client.getUnreadEmailIds(
            res => { chrome.action.setBadgeText({ text: res.count.toString() }) },
            err => { chrome.action.setBadgeText({ text: "?" }); console.error(err) }
        );
    }
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create(
        "sync-count",
        {
            delayInMinutes: 0,
            periodInMinutes: 5
        }
    );
    chrome.alarms.onAlarm.addListener(alarm => {
        alarmHandlers[alarm.name](alarm);
    });
});

importScripts('client.js');

