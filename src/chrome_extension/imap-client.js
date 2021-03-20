class ImapClient {
    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    async getUnreadEmails() {
        const response = await fetch(`${this.endpoint}/imap/unread_email_ids`);
        return await response.json();
    }
}

imapClient = new ImapClient("http://localhost:8888");
