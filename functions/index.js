const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { Resend } = require("resend");

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Resend with your API key
const resend = new Resend("re_JjXUH7tD_8UZ8XroKn3L6TKuDPSK5FPWx");

// Your verified sender email from Resend
const SENDER_EMAIL = "sketzo.tech@gmail.com";

/**
 * Cloud Function: Send welcome email when a new user signs up
 * This is triggered automatically when a new user is created in Firebase Auth
 */
exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
    const { email, displayName, uid } = user;

    if (!email) {
        console.log("No email found for user:", uid);
        return null;
    }

    console.log(`Sending welcome email to ${email}`);

    try {
        const { data, error } = await resend.emails.send({
            from: SENDER_EMAIL,
            to: email,
            subject: "🎮 Welcome to Pixel Meadows Early Access!",
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Courier New', monospace; background: #2a2a2a; color: #f0f0f0; padding: 40px; }
        .container { max-width: 600px; margin: 0 auto; background: #3a3a3a; border: 4px solid #5a8a5a; padding: 30px; }
        h1 { color: #7aba7a; font-size: 24px; text-align: center; }
        .pixel-border { border: 2px solid #5a8a5a; padding: 20px; margin: 20px 0; background: #2a4a2a; }
        .emoji { font-size: 32px; text-align: center; display: block; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <span class="emoji">🌾✨🏠</span>
        <h1>Welcome to Pixel Meadows!</h1>
        
        <p>Hey ${displayName || "Pixel Friend"}! 👋</p>
        
        <div class="pixel-border">
            <p>You're now part of our <strong>Early Access</strong> community!</p>
            <p>As an early member, you'll be among the first to:</p>
            <ul>
                <li>✨ Experience new features</li>
                <li>🎨 Get exclusive pixel art content</li>
                <li>🎮 Shape our world with your feedback</li>
                <li>💫 Receive special community perks</li>
            </ul>
        </div>
        
        <p>Stay tuned — exciting things are coming your way!</p>
        
        <p>With pixels and love,<br>
        <strong>The Pixel Meadows Team</strong> 🏠</p>
        
        <div class="footer">
            <p>© 2026 Pixel Meadows. Made with ♥ and pixels.</p>
        </div>
    </div>
</body>
</html>
            `,
        });

        if (error) {
            console.error("Resend error:", error);
            return { success: false, error };
        }

        console.log("Email sent successfully:", data);
        return { success: true, data };
    } catch (error) {
        console.error("Failed to send email:", error);
        return { success: false, error: error.message };
    }
});

/**
 * HTTP Callable function to manually trigger welcome email
 * Useful for testing or resending emails
 */
exports.resendWelcomeEmail = functions.https.onCall(async (data, context) => {
    // Verify user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "User must be authenticated to resend welcome email."
        );
    }

    const user = await admin.auth().getUser(context.auth.uid);

    try {
        const { data: emailData, error } = await resend.emails.send({
            from: SENDER_EMAIL,
            to: user.email,
            subject: "🎮 Welcome to Pixel Meadows Early Access!",
            html: `<h1>Welcome ${user.displayName || "Pixel Friend"}!</h1><p>You're part of our Early Access community!</p>`,
        });

        if (error) {
            throw new functions.https.HttpsError("internal", error.message);
        }

        return { success: true, message: "Email sent!" };
    } catch (error) {
        throw new functions.https.HttpsError("internal", error.message);
    }
});
