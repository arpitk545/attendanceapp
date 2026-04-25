const otpTemplate = (otp) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>OTP Verification - Mark Attendance App</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: linear-gradient(135deg, #4776E6 0%, #8E54E9 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.5;
            color: #1f2937;
            margin: 0;
            padding: 10px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
        }

        .container {
            max-width: 500px;
            width: 100%;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            overflow: hidden;
            padding: 30px 25px;
        }

        /* Content */
        .greeting {
            text-align: center;
            margin-bottom: 20px;
        }

        .greeting h2 {
            font-size: 24px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 8px;
        }

        .greeting p {
            color: #6b7280;
            font-size: 15px;
        }

        /* OTP Section - No card */
        .otp-section {
            text-align: center;
            margin: 25px 0 20px;
        }

        .otp-code {
            font-size: 52px;
            font-weight: 800;
            letter-spacing: 12px;
            color: #4776E6;
            background: linear-gradient(135deg, #4776E6, #8E54E9);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-family: 'Courier New', monospace;
            margin: 10px 0;
            word-break: break-all;
        }

        .validity {
            text-align: center;
            margin: 10px 0;
        }

        .validity span {
            font-size: 15px;
            font-weight: 500;
            color: #4b5563;
        }

        .validity .highlight {
            color: #4776E6;
            font-weight: 700;
        }

        /* Security Message - 2 lines without card */
        .security-message {
            text-align: center;
            margin: 25px 0 15px;
            padding: 0 5px;
        }

        .security-message p {
            color: #b91c1c;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 5px;
        }

        .security-message .highlight {
            font-weight: 700;
            color: #b91c1c;
            background: transparent;
        }

        /* Message */
        .message {
            text-align: center;
            color: #4b5563;
            font-size: 14px;
            margin: 15px 0;
            padding: 0 5px;
        }

        /* Divider */
        .divider {
            position: relative;
            text-align: center;
            margin: 20px 0 15px;
        }

        .divider::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, #d1d5db, transparent);
        }

        .divider span {
            background: #ffffff;
            padding: 0 12px;
            color: #9ca3af;
            font-size: 13px;
            position: relative;
            z-index: 1;
        }

        /* Footer */
        .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 15px;
        }

        .footer p {
            color: #64748b;
            font-size: 13px;
            margin-bottom: 4px;
        }

        .footer a {
            color: #4776E6;
            text-decoration: none;
            font-weight: 600;
            word-break: break-all;
        }

        .footer a:hover {
            text-decoration: underline;
        }

        .copyright {
            color: #94a3b8;
            font-size: 12px;
            margin-top: 10px;
        }

        /* Responsive breakpoints */
        @media screen and (max-width: 480px) {
            body { padding: 8px; }
            .container { padding: 25px 18px; }
            .greeting h2 { font-size: 22px; }
            .greeting p { font-size: 14px; }
            .otp-code { font-size: 42px; letter-spacing: 10px; }
            .validity span { font-size: 14px; }
            .security-message p { font-size: 13px; }
            .message { font-size: 13px; }
        }

        @media screen and (max-width: 380px) {
            body { padding: 5px; }
            .container { padding: 20px 12px; }
            .otp-code { font-size: 36px; letter-spacing: 8px; }
            .validity span { font-size: 13px; }
        }

        @media screen and (min-width: 768px) {
            .container { max-width: 520px; }
            .otp-code { font-size: 56px; }
        }

        @media screen and (min-width: 1024px) {
            body { padding: 20px; }
            .container { max-width: 540px; }
        }

        /* Touch-friendly */
        a, button {
            min-height: 44px;
            min-width: 44px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Greeting -->
        <div class="greeting">
            <h2>Email Verification</h2>
            <p>Enter this OTP to verify your email address</p>
        </div>

        <!-- OTP Section - No card -->
        <div class="otp-section">
            <div class="otp-code">${otp}</div>
            <div class="validity">
                <span>⏱️ Valid for <span class="highlight">1 hour</span></span>
            </div>
        </div>

        <!-- Security Message - 2 lines without card -->
        <div class="security-message">
            <p><span class="highlight">⚠️ IMPORTANT:</span> Do not share this OTP with anyone.</p>
            <p>This includes <span class="highlight">students, faculty, or staff members</span>.</p>
        </div>

        <!-- Message -->
        <div class="message">
            <p>If you didn't request this verification, please ignore this email.</p>
        </div>

        <!-- Divider -->
        <div class="divider">
            <span>Need help?</span>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>© 2026 Mark Attendance App</p>
            <p><a href="mailto:arpitk8084374@gmail.com">Email Support</a></p>
            <div class="copyright">
                This is an automated message, please do not reply directly.
            </div>
        </div>
    </div>
</body>
</html>`;
};

module.exports = otpTemplate;