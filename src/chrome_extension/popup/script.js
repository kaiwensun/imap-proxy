let changeColor = document.getElementById("changeColor");

chrome.storage.local.get("color", ({ color }) => {
    changeColor.style.backgroundColor = color;
});

chrome.action.setBadgeText({text: "123"});