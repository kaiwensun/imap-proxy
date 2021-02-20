'use strict';

importScripts('client.js');

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
    },
    "hello": (alarm) => {
        console.log("this is inside hello");
        console.log(alarm);
    }
};

function alarmListener(alarm) {
    console.log(alarm);
    alarmHandlers[alarm.name](alarm);
};

function initializeAlarm() {
    chrome.action.setBadgeText({ text: "?" });
    chrome.alarms.create(
        "sync-count",
        {
            delayInMinutes: 0,
            periodInMinutes: PERIOD_IN_MINUTES
        }
    );
    chrome.alarms.create(
        "hello",
        {
            delayInMinutes: 0,
            periodInMinutes: 0.05
        }
    );
    if (!chrome.alarms.onAlarm.hasListener(alarmListener)) {
        chrome.alarms.onAlarm.addListener(alarmListener);
    }
}

chrome.runtime.onInstalled.addListener(initializeAlarm);


chrome.runtime.onMessage.addListener((message, sender, sendresponse) => {console.log("onMessage!"); console.log(message); console.log(sender); console.log(sendresponse)});


