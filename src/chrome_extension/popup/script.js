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

let subjectPrefixes = genSubjectPrefixRegExp();

chrome.storage.local.get(["checkResult"], ({ checkResult }) => {
    if (checkResult !== undefined) {
        document.querySelector("#emails").innerHTML = renderAllEmails(checkResult);
    }
});

function renderAllEmails(checkResult) {
    return groupEmailsByFolder(checkResult.emails).map(renderFolder).join("");
}

function renderFolder([folder, emails]) {
    return `
    <div class="folder">
        <h3 class="folder-name">
            ${folder.toUpperCase() === "INBOX" ? "收件箱" : folder}
        </h3>
        <div class="folder-emails">
            ${emails.map(renderEmail).join("")}
        </div>
    </div>
    `;
}

function renderEmail(email) {
    return `
        <div class="email-row">
            <div class="thread-size cell">
                ${email.count}
            </div>
            <div class="senders ellipsis cell">
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
    let groups = {}
    emails.sort((e1, e2) => e2.timestamp - e1.timestamp);
    for (let email of emails) {
        let subject = email.subject.replace(subjectPrefixes, "");
        groups[subject] ||= {
            count: 0,
            subject: subject,
            sender_names: [],
            last_active_time: email.timestamp
        }
        groups[subject].count++;
        if (!groups[subject].sender_names.includes(email.sender_name)) {
            groups[subject].sender_names.push(email.sender_name);
        }
    }
    let res = Object.values(groups);
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
                emails2[0].last_active_time - emails1[0].last_active_time;
            }
        });
}
