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
    const chatWindow = document.getElementById("chat-window");
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender);
    messageDiv.textContent = content;
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}
