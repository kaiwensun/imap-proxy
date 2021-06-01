"use strict";

function genSubjectPrefixRegExp() {
    let prefixes1 = ["re", "fw", "回复", "转发"];
    let prefixes2 = [":", "："];
    let combined = []
    for (let prefix1 of prefixes1) {
        for (let prefix2 of prefixes2) {
            combined.push(prefix1 + prefix2 + "\\s*");
        }
    }
    let pattern = `^(${combined.join("|")})*`
    return new RegExp(pattern, "i");
}

const subjectPrefixes = genSubjectPrefixRegExp();

function renderFolder([folder, emails]) {
    return `
    <div class="folder">
        <h3 class="folder-name">
            ${folder.toUpperCase() === "INBOX" ? "收件箱" : folder} (${emails.length})
        </h3>
        <div class="folder-emails">
            ${emails.map(renderEmail).join("")}
        </div>
    </div>
    `;
}

function renderEmail(email) {
    console.log(email.is_new)
    return `
        <div class="email-row ${email.is_new ? 'new-email' : ''} ${email.is_new} j">
            <div class="thread-size cell">
                ${email.count}
            </div>
            <div class="senders ellipsis cell ${email.is_missing_receiver_addr ? "suspicious_spam" : ""}">
                ${email.sender_names.join(", ")}
            </div>
            <div class="subject ellipsis cell">
                ${email.subject}
            </div>
            <div class="last-active-time cell">
                ${timetampToString(email.last_active_time)}
            </div>
        </div>
    `;
}

function timetampToString(timestamp) {
    const oneDayLong = 24 * 60 * 60 * 1000;
    let now = new Date();
    let then = new Date(timestamp * 1000);
    let offset = new Date().setHours(0, 0, 0, 0) % oneDayLong;

    if (Math.floor((now - offset) / oneDayLong) != Math.floor((then - offset) / oneDayLong)) {
        return [then.getFullYear(), then.getMonth() + 1, then.getDate()].
            map(n => n.toString().padStart(2, "0")).
            join("-");
    } else {
        return [then.getHours(), then.getMinutes()].
            map(n => n.toString().padStart(2, "0")).
            join(":");
    }
}

function groupEmailsWithinFolder(emails) {
    let threads = {}
    emails.sort((e1, e2) => e2.timestamp - e1.timestamp);
    for (let email of emails) {
        let subject = email.subject.replace(subjectPrefixes, "");
        threads[subject] ||= {
            count: 0,
            subject: subject,
            sender_names: [],
            last_active_time: email.timestamp,
            is_new: false,
            is_missing_receiver_addr: true
        }
        threads[subject].count++;
        threads[subject].is_new ||= email.is_new;
        // is_missing_reciver_addr is true only when all receiver_addr in the thread is missing
        threads[subject].is_missing_receiver_addr &&= email.receiver_addr === ""
        let sender_name = email.sender_name || email.sender_addr.split("@")[0];
        if (!threads[subject].sender_names.includes(sender_name)) {
            threads[subject].sender_names.push(sender_name);
        }
    }
    let res = Object.values(threads);
    res.sort((e1, e2) => e2.last_active_time - e1.last_active_time);
    return res;
}

function groupEmailsByFolder(emails) {
    let groups = {};
    for (let email of emails) {
        groups[email.folder] ||= [];
        groups[email.folder].push(email);
    }
    return Object.keys(groups).
        map(folder => [folder, groupEmailsWithinFolder(groups[folder])]).
        sort(([folder1, emails1], [folder2, emails2]) => {
            if (folder1.toUpperCase() === "INBOX") {
                return Number.NEGATIVE_INFINITY;
            } else if (folder2.toUpperCase() === "INBOX") {
                return Number.POSITIVE_INFINITY;
            } else {
                return emails2[0].last_active_time - emails1[0].last_active_time;
            }
        });
}

async function renderLastUpdateTime() {
    let lastCheckTime = await Storage.get(Storage.LAST_SYNC_SUCCESS_TIME);
    if (lastCheckTime === null) {
        lastCheckTime = "never";
    } else {
        lastCheckTime = timetampToString(lastCheckTime / 1000);
    }
    document.querySelector("#last-update-time").textContent = lastCheckTime;
}

async function renderAllEmails() {
    let result = await Storage.get(Storage.SYNC_RESULT);
    if (result !== undefined) {
        let html = groupEmailsByFolder(result.emails).map(renderFolder).join("");
        document.querySelector("#emails").innerHTML = html;
    }

}

async function main() {
    await renderLastUpdateTime();
    await renderAllEmails();
    let lastSyncStartTime = await Storage.get(Storage.LAST_ATTEMPT_SYNC_START_TIME, 0);
    let lastSyncEndTime = await Storage.get(Storage.LAST_ATTEMPT_SYNC_END_TIME, lastSyncStartTime - 1);
    if (lastSyncEndTime > lastSyncStartTime) {
        await Storage.markEmailsAsOld();
    }
}

main();