class EventManager {
    static onreceive(eventType, callback) {
        globalThis.addEventListener("message", event => {
            if (event.isTrusted && event.data.eventType === eventType) {
                callback(event.data.payload);
            }
        })
    }

    static send(eventType, payload) {
        globalThis.serviceWorker.postMessage({ eventType, payload });
    }
}
