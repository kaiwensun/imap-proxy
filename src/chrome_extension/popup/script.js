let changeColor = document.getElementById("changeColor");

chrome.storage.local.get(["checkResult"], ({ checkResult }) => {
    if (checkResult !== undefined) {
        document.querySelector("#emails").innerHTML = JSON.stringify(checkResult);
    }
});
