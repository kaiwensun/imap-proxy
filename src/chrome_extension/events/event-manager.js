class EventManager {

    static onreceive(eventType, callback) {
        globalThis.addEventListener("message", event => {
            if (event.isTrusted && event.data.eventType === eventType) {
                callback(event.data.payload);
            }
        })
    }

    static async onreceiveAsync(eventType, callback) {
        globalThis.addEventListener("message", async event => {
            if (event.isTrusted && event.data.eventType === eventType) {
                await callback(event.data.payload);
            }
        })
    }

    static send(eventType, payload) {
        globalThis.serviceWorker.postMessage({ eventType, payload });
    }

    static setSyncEmailTimer(delayInMinutes) {
        delayInMinutes = delayInMinutes === undefined ? 0 : delayInMinutes;
        this.resetTimer(EventManager.SYNC_EMAIL_TIMER_FIRED, delayInMinutes, EventManager.SYNC_EMAIL_PERIOD_IN_MINUTES);
    }

    static addSyncEmailHandler(handler) {
        chrome.alarms.onAlarm.addListener(async alarm => {
            if (alarm.name === EventManager.SYNC_EMAIL_TIMER_FIRED) {
                await handler(alarm);
            }
        });
    }

    static resetTimer(alarmName, delayInMinutes, periodInMinutes) {
        delayInMinutes = delayInMinutes === undefined ? 0 : delayInMinutes;
        periodInMinutes = periodInMinutes === undefined ? EventManager.DEFAULT_SYNC_PERIOD_IN_MINUTES : periodInMinutes;
        chrome.alarms.create(alarmName, { delayInMinutes, periodInMinutes })
    }
}

EventManager.SYNC_EMAIL = "SYNC_EMAIL";
EventManager.SYNC_EMAIL_TIMER_FIRED = "SYNC_EMAIL_TIMER_FIRED";
EventManager.EMAIL_SYNC_SUCCESS = "EMAIL_SYNC_SUCCESS"
EventManager.EMAIL_SYNC_FAILURE = "EMAIL_SYNC_FAILURE"
EventManager.SYNC_EMAIL_PERIOD_IN_MINUTES = 10;


globalThis.addEventListener("message", event => {
    console.log("seeing event:");
    console.log(event);
})

chrome.alarms.onAlarm.addListener(async alarm => {
    console.log("seeing alarm:");
    console.log(alarm);
});