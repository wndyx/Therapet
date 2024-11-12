document.addEventListener("DOMContentLoaded", function() {
    // Event listener for the send button
    document.getElementById("send-button").addEventListener("click", sendMessage);

    // Optionally, you can also add an event listener for pressing "Enter" key
    document.getElementById("user-input").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });
});

async function sendMessage() {
    const userId = localStorage.getItem("userId"); // Retrieve stored userId
    const message = document.getElementById("user-input").value.trim();
    if (!message) return;

    appendMessage(message, "user"); // Display user message
    document.getElementById("user-input").value = "";

    const response = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message })
    });
    const data = await response.json();
    appendMessage(data.botResponse || "Error: " + data.error, "bot");
}

function appendMessage(content, sender) {
    const messagesDiv = document.getElementById("messages");

    // Create message wrapper
    const messageWrapper = document.createElement("div");
    messageWrapper.classList.add("message-wrapper", sender);

    // Create message bubble
    const messageBubble = document.createElement("div");
    messageBubble.classList.add("message-bubble");
    messageBubble.textContent = content;

    // Append bubble to wrapper
    messageWrapper.appendChild(messageBubble);

    // Append wrapper to messages
    messagesDiv.appendChild(messageWrapper);

    // Scroll to the latest message
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}