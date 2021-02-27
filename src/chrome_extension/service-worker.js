'use strict';

importScripts('client.js');
importScripts('logger.js');

const PERIOD_IN_MINUTES = 5;  // must be integer
const LAST_CHECK_TIME_KEY = "lastCheckTime";
const CHECK_RESULT_KEY = "checkResult";

function sinceLastCheck(callback) {
    chrome.storage.local.get([LAST_CHECK_TIME_KEY], ({ lastCheckTime }) => {
        lastCheckTime = new Date(lastCheckTime);
        if (isNaN(lastCheckTime.getTime())) {
            console.warn(`lastCheckTime is invalid`);
            lastCheckTime = new Date(0);
        }
        console.log(`lastCheckTime is ${lastCheckTime}`);

        let nextCheckTime = new Date(lastCheckTime);
        nextCheckTime.setSeconds(nextCheckTime.getSeconds() + PERIOD_IN_MINUTES * 60);
        console.log(`nextCheckTime is ${nextCheckTime}`);

        let loosedNextCheckTime = new Date(nextCheckTime);
        loosedNextCheckTime.setSeconds(loosedNextCheckTime.getSeconds() - 10);
        console.log(`nextCheckTime is ${nextCheckTime}`);

        let now = new Date();
        console.log(`now is ${now}`);

        let remainingMinutes = (nextCheckTime - now) / 1000 / 60;
        // if timer is going to fire in less than 10 seconds, let's do it now.
        remainingMinutes = Math.max(remainingMinutes, 10 / 60) - 10 / 60;
        console.log(`remainingMinutes is ${remainingMinutes}`);
        callback(remainingMinutes);
    })
}

function setLastCheck(epoch, callback) {
    chrome.storage.local.set({ [LAST_CHECK_TIME_KEY]: epoch }, callback);
}


let alarmHandlers = {
    "sync-count": () => {
        sinceLastCheck((remainingMinutes) => {
            if (remainingMinutes === 0) {
                setLastCheck(new Date().getTime() /* supress other triggers during the check call */, () => {
                    chrome.action.setBadgeBackgroundColor({ color: "#FFA500" }, () => {
                        console.log("checking email");
                        logger.log("checking email");
                        client.getUnreadEmailIds(
                            checkResult => {
                                chrome.action.setBadgeBackgroundColor({ color: "#FF0000" }, () => {
                                    chrome.storage.local.set({ checkResult }, () => {
                                        console.log(checkResult);
                                        logger.log(checkResult);
                                        chrome.action.setBadgeText({ text: checkResult.count == 0 ? "" : checkResult.count.toString() });
                                    });
                                });
                            },
                            err => {
                                chrome.action.setBadgeBackgroundColor({ color: "#808080" }, () => {
                                    setLastCheck(0, () => {
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
                                    });
                                });
                            }
                        );
                    });
                });
            } else {
                chrome.alarms.create(
                    "sync-count",
                    {
                        delayInMinutes: remainingMinutes,
                        periodInMinutes: PERIOD_IN_MINUTES
                    }
                );
            }
        });
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

chrome.storage.local.get([CHECK_RESULT_KEY], ({ checkResult }) => {
    let text = "?";
    if (checkResult !== undefined) {
        text = checkResult.count == 0 ? "" : checkResult.count.toString();
    }
    chrome.action.setBadgeText({ text });
})

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
