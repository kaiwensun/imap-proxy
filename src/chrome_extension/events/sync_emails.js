importScripts("storage.js");
importScripts("events/event-manager.js");
importScripts('imap-client.js');
importScripts('badge.js');

EventManager.onreceiveAsync(EventManager.SYNC_EMAIL, async () => {

    let lastSyncStartTime = await Storage.get(Storage.LAST_ATTEMPT_SYNC_START_TIME, 0);
    let lastSyncEndTime = await Storage.get(Storage.LAST_ATTEMPT_SYNC_END_TIME, lastSyncStartTime - 1);
    if (lastSyncEndTime <= lastSyncStartTime && new Date().getTime() - lastSyncStartTime < EventManager.SYNC_EMAIL_PERIOD_IN_MINUTES * 60 * 1000) {
        // do not duplicate sync
        console.warn("SYNC_EMAIL event detected during syncing. Ignored.");
        return;
    }
    try {
        await Storage.save(Storage.LAST_ATTEMPT_SYNC_START_TIME, new Date().getTime());
        await Badge.setBackgroundColor(Badge.COLOR_SYNCING);
        let result = await imapClient.getUnreadEmails();
        console.log("Fetched email result");
        console.log(result);
        await Badge.setBackgroundColor(Badge.COLOR_NORMAL);
        await Badge.setText(result.count);
        await Storage.save(Storage.SYNC_RESULT, result);
        await Storage.save(Storage.LAST_SYNC_SUCCESS_TIME, new Date().getTime());
        EventManager.send(EventManager.EMAIL_SYNC_SUCCESS);
    } catch (error) {
        console.error("Failed to sync email");
        console.error(error);
        await Badge.setBackgroundColor(Badge.COLOR_ERROR);
        EventManager.send(EventManager.EMAIL_SYNC_FAILURE);
    } finally {
        await Storage.save(Storage.LAST_ATTEMPT_SYNC_END_TIME, new Date().getTime());
        EventManager.setSyncEmailTimer(EventManager.SYNC_EMAIL_PERIOD_IN_MINUTES);
    }
});

EventManager.addSyncEmailHandler(async alarm => {
    /*
    // add handler synchronously
    Storage.getSync(Storage.LAST_SYNC_SUCCESS_TIME, 0, lastSyncSuccessTime => {
        lastSyncSuccessTime = new Date(lastSyncSuccessTime);
        let nextCheckTime = new Date(lastSyncSuccessTime.getTime() + EventManager.SYNC_EMAIL_PERIOD_IN_MINUTES * 60 * 1000);
        let now = new Date();
        let remainingMinutes = (nextCheckTime.getTime() - now.getTime()) / 1000 / 60;
        if (remainingMinutes < 1 / 6) {
            EventManager.send(EventManager.SYNC_EMAIL);
        } else {
            EventManager.setSyncEmailTimer(remainingMinutes);
        }
    });
    */

    let lastSyncSuccessTime = await Storage.get(Storage.LAST_SYNC_SUCCESS_TIME, 0);
    lastSyncSuccessTime = new Date(lastSyncSuccessTime);
    let nextCheckTime = new Date(lastSyncSuccessTime.getTime() + EventManager.SYNC_EMAIL_PERIOD_IN_MINUTES * 60 * 1000);
    let now = new Date();
    let remainingMinutes = (nextCheckTime.getTime() - now.getTime()) / 1000 / 60;
    if (remainingMinutes < 1 / 6) {
        EventManager.send(EventManager.SYNC_EMAIL);
    } else {
        EventManager.setSyncEmailTimer(remainingMinutes);
    }

});

