async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (data.success) {
        localStorage.setItem("userId", data.userId); // Store userId locally
        window.location.href = 'chat.html'; // Redirect to chat page
    } else {
        document.getElementById("message").textContent = data.message;
    }
}

async function signup() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    document.getElementById("message").textContent = data.message;
}
