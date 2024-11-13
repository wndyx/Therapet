<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <style>
        /* Reset some default styles */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .login-container {
            background-color: #ffffff;
            padding: 40px 30px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
        }

        .login-container h2 {
            text-align: center;
            margin-bottom: 20px;
            color: #333333;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #555555;
            font-weight: bold;
        }

        .form-group input {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid #cccccc;
            border-radius: 4px;
            font-size: 16px;
            transition: border-color 0.3s;
        }

        .form-group input:focus {
            border-color: #66afe9;
            outline: none;
        }

        button {
            width: 100%;
            padding: 12px;
            background-color: #28a745;
            border: none;
            border-radius: 4px;
            color: #ffffff;
            font-size: 18px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        button:hover {
            background-color: #218838;
        }

        .signup-link {
            text-align: center;
            margin-top: 15px;
            color: #555555;
        }

        .signup-link a {
            color: #007bff;
            text-decoration: none;
            transition: color 0.3s;
        }

        .signup-link a:hover {
            color: #0056b3;
        }

        #message {
            margin-bottom: 20px;
            text-align: center;
            color: #ff0000; /* You can change this color based on message type */
        }

        @media (max-width: 480px) {
            .login-container {
                padding: 30px 20px;
            }

            button {
                font-size: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="login-container">
        <h2>Login</h2>
        <div id="message"></div>
        <form onsubmit="event.preventDefault(); login();">
            <div class="form-group">
                <label for="username">Username:</label>
                <input type="text" id="username" required>
            </div>

            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" required>
            </div>

            <button type="submit">Login</button>
        </form>

        <!-- Link to signup page -->
        <p class="signup-link">Don't have an account? <a href="signup.html">Sign up</a></p>
    </div>

    <script src="login.js"></script>
</body>
</html>
