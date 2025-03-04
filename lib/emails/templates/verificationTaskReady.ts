export function verificationTaskEmailTemplate(verificationUrl: string) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Verification Task is Ready</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 40px auto;
                background: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                text-align: center;
            }
            .logo {
                max-width: 180px;
                margin-bottom: 20px;
            }
            .heading {
                font-size: 24px;
                color: #333;
                margin-bottom: 10px;
            }
            .message {
                font-size: 16px;
                color: #555;
                margin-bottom: 20px;
                line-height: 1.6;
            }
            .footer {
                font-size: 14px;
                color: #888;
                margin-top: 20px;
            }
            .footer a {
                color: #007bff;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <img src="https://employ-net.com/employ-net-logo.png" alt="Employ-Net Logo" class="logo">
            <h1 class="heading">Your Verification Task is Ready!</h1>
            <p class="message">
                Your verification process has been set up, and you are now ready to complete your task.  
                Click the button below to get started.
            </p>
  
            <!-- ✅ Email-Safe Button -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                    <td align="center" bgcolor="#007bff" style="border-radius: 6px;">
                        <a href="${verificationUrl}" target="_blank" 
                           style="
                                display: inline-block;
                                font-size: 16px;
                                font-weight: bold;
                                color: #ffffff;
                                text-decoration: none;
                                padding: 12px 24px;
                                border-radius: 6px;
                                background-color: #007bff;
                                border: 1px solid #007bff;">
                            Start Verification
                        </a>
                    </td>
                </tr>
            </table>
  
            <p class="message">
                If the button above doesn’t work, you can also access your verification task by clicking this link:
                <br>
                <a href="${verificationUrl}" style="color: #007bff;">Link</a>
            </p>
  
            <p class="footer">
                Need assistance? Contact our support team at 
                <a href="mailto:support@employ-net.com">support@employ-net.com</a>
            </p>
        </div>
    </body>
    </html>
    `;
  }
  