async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (data.success) {
            // If login is successful, store userId and redirect
            localStorage.setItem("userId", data.userId);
            window.location.href = 'chat.html'; // Redirect to chat or home page
        } else {
            // Display error message if login fails
            document.getElementById("message").textContent = data.message;
        }
    } catch (error) {
        console.error('Error during login:', error);
        document.getElementById("message").textContent = 'Error logging in. Please try again.';
    }
}