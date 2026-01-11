import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    // Set CORS headers for all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check if API key is configured
    if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY is not configured');
        return res.status(500).json({ error: 'Email service not configured' });
    }

    const { email, name } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Sketzo <onboarding@resend.dev>',
            to: email,
            subject: '🎮 Welcome to Sketzo Early Access!',
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
        <h1>Welcome to Sketzo!</h1>
        
        <p>Hey ${name || 'Pixel Friend'}! 👋</p>
        
        <div class="pixel-border">
            <p>You're now part of our <strong>Early Access</strong> community!</p>
            <p>As an early member, you'll be among the first to:</p>
            <ul>
                <li>✨ Experience new CAD features</li>
                <li>🎨 Turn your ideas into CAD drawings</li>
                <li>🎮 Shape our product with your feedback</li>
                <li>💫 Get exclusive early access perks</li>
            </ul>
        </div>
        
        <p>Stay tuned — exciting things are coming your way!</p>
        
        <p>With pixels and love,<br>
        <strong>The Sketzo Team</strong> 🎮</p>
        
        <div class="footer">
            <p>© 2026 Sketzo. Made with ♥ and pixels.</p>
        </div>
    </div>
</body>
</html>
            `,
        });

        if (error) {
            console.error('Resend error:', error);
            return res.status(500).json({ error: error.message });
        }

        console.log('Email sent successfully:', data);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Failed to send email:', error);
        return res.status(500).json({ error: error.message });
    }
}
