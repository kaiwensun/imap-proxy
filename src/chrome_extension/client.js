class Client {
    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    async getUnreadEmailIds(onSuccess, onError) {
        try {
            const response = await fetch(`${this.endpoint}/imap/unread_email_ids`);
            const json = await response.json();
            return onSuccess(json);
        } catch (err) {
            return onError(err);
        }
    }
}

client = new Client("http://localhost:8888");
