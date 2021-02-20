class Client {
    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    getUnreadEmailIds(onSuccess, onError) {
        return fetch(`${this.endpoint}/imap/unread_email_ids`)
            .then(response => response.json())
            .then(onSuccess)
            .catch(onError);
    }
}

client = new Client("http://localhost:8888");
