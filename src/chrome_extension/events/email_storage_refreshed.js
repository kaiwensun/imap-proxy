importScripts("storage.js");
importScripts("events/event-manager.js");

const C_S_LAST_SUCCESS_TIME = "lastSuccessTime";
const C_E_EMAIL_SUMMARY_FETCHED = "emailSummaryFetched";

EventManager.onreceive(C_E_EMAIL_SUMMARY_FETCHED, (payload) => {
    console.log("hay!");
    console.log(payload);
});

EventManager.onreceive(C_E_EMAIL_SUMMARY_FETCHED, (payload) => {
    Storage.save(C_S_LAST_SUCCESS_TIME, new Date().getTime());
});
