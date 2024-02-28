import SocketClient from "./SocketClient.js";

let opened = true;
let textarea = document.getElementById("message-input");
let messagesDiv = document.getElementById("messages");

let socketInstance = new SocketClient();

document.getElementById("send-btn").addEventListener("click", () => {
    sendMessage();
});

textarea.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent the default behavior (adding a newline)
        sendMessage();
    }
});

function sendMessage() {
    let val = textarea.value;
    if (val) {
        socketInstance.sendMessage("message", val);
        addMessage(val, true);
        textarea.value = "";
    }
}

socketInstance.socket.on("response", (res) => {
    addMessage(res, false);
});

function addMessage(text, sent) {
    var messageDiv = document.createElement("div");
    messageDiv.textContent = text;
    messageDiv.className = "message";
    messageDiv.style.maxWidth = "70%";

    let messageWrapper = document.createElement("div");
    messageWrapper.className =
        "message-wrapper" + (sent ? " sent" : " received");
    messageWrapper.appendChild(messageDiv);
    messagesDiv.appendChild(messageWrapper);
    messagesDiv.scrollTo({
        top: messagesDiv.scrollHeight,
        behavior: "smooth",
    });
}

document.querySelector(".chat").onclick = () => {
    if (opened) {
        document.getElementById("messages").style.display = "none";
        document.getElementById("input-wrapper").style.display = "none";
        document.getElementById("bot-header").style.display = "none";
        let wrapper = document.getElementById("bot-wrapper");
        wrapper.style.height = 0;
        wrapper.style.width = 0;
    } else {
        document.getElementById("messages").style.display = "block";
        document.getElementById("input-wrapper").style.display = "flex";
        document.getElementById("bot-header").style.display = "flex";
        let wrapper = document.getElementById("bot-wrapper");
        wrapper.style.height = "600px";
        wrapper.style.width = "380px";
    }
    document.querySelector(".chat").classList.toggle("active");
    opened = !opened;
};
