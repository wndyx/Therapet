document.addEventListener("DOMContentLoaded", function() {
    // Event listener for the send button
    document.getElementById("send-button").addEventListener("click", sendMessage);

    // Event listener for pressing "Enter" key
    document.getElementById("user-input").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });
});

// Include 'credentials: "include"' in your fetch options
async function sendMessage() {
    const message = document.getElementById("user-input").value.trim();
    if (!message) return;

    appendMessage(message, "user");
    document.getElementById("user-input").value = "";

    try {
        const response = await fetch("/api/message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
            credentials: "include" // Add this line
        });
        const data = await response.json();
        appendMessage(data.botResponse || "Error: " + data.error, "bot");
    } catch (error) {
        console.error("Error sending message:", error);
        appendMessage("An error occurred while sending your message.", "bot");
    }
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
