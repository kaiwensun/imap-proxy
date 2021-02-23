'use strict';

importScripts('client.js');
importScripts('logger.js');

const PERIOD_IN_MINUTES = 5;

let alarmHandlers = {
    "sync-count": () => {
        client.getUnreadEmailIds(
            res => {
                console.log(res);
                logger.log(res);
                chrome.action.setBadgeText({ text: res.count == 0 ? "" : res.count.toString() });
            },
            err => {
                console.error(err);
                logger.log(err);
                chrome.action.setBadgeText({ text: "X" });
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

function alarmListener(alarm) {
    console.log(alarm);
    logger.log([`alarm ${alarm.name} triggered`, alarm]);
    alarmHandlers[alarm.name](alarm);
};

function initializeAlarm() {
    logger.log("initializeAlarm");
    chrome.alarms.create(
        "sync-count",
        {
            delayInMinutes: 0,
            periodInMinutes: PERIOD_IN_MINUTES
        }
    );
}

initializeAlarm();

chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({ text: "?" });
});

/**
 * https://developer.chrome.com/docs/extensions/mv3/migrating_to_service_workers/#event_listeners
 * While this approach works in a persistent background page, it is not guaranteed
 * to work in a service worker due to the asynchronous nature of the Storage APIs.
 * When a service worker is terminated, so are the event listeners associated with it.
 */
if (!chrome.alarms.onAlarm.hasListener(alarmListener)) {
    logger.log("addListener(alarmListener)");
    chrome.alarms.onAlarm.addListener(alarmListener);
} else {
    logger.log("alarmListener already registered");
}
