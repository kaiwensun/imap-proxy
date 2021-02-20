'use strict';

const PERIOD_IN_MINUTES = 5;

let alarmHandlers = {
    "sync-count": () => {
        client.getUnreadEmailIds(
            res => {
                console.log(res);
                chrome.action.setBadgeText({ text: res.count == 0 ? "" : res.count.toString() });
            },
            err => {
                console.error(err);
                chrome.action.setBadgeText({ text: "x" });
                chrome.alarms.create(
                    "sync-count",
                    {
                        delayInMinutes: 0.1,
                        periodInMinutes: PERIOD_IN_MINUTES
                    }
                );
            }
        );
    }
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({ text: "?" });
    chrome.alarms.create(
        "sync-count",
        {
            delayInMinutes: 0,
            periodInMinutes: PERIOD_IN_MINUTES
        }
    );
    chrome.alarms.onAlarm.addListener(alarm => {
        console.log(alarm);
        alarmHandlers[alarm.name](alarm);
    });
});

importScripts('client.js');

