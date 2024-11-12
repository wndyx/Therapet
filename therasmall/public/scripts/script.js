// script.js

// Append message to chat window
function appendMessage(content, sender) {
    const chatWindow = document.getElementById("chat-window");
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender);
    messageDiv.textContent = content;
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll to the latest message
}

// Send message to backend
async function sendMessage() {
    const userInput = document.getElementById("user-input");
    const message = userInput.value.trim();
    if (message === "") return;

    appendMessage(message, "user"); // Display user message
    userInput.value = ""; // Clear the input field

    try {
        const response = await fetch("/api/message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: "user123", message: message }) // Ensure this matches the created user
        });

        const data = await response.json();
        if (data.botResponse) {
            appendMessage(data.botResponse, "bot"); // Display bot's response
        } else if (data.error) {
            console.error("Error from server:", data.error);
            appendMessage("Error: " + data.error, "bot");
        }
    } catch (error) {
        console.error("Error sending message:", error);
        appendMessage("Oops! Something went wrong. Try again later.", "bot");
    }
}
