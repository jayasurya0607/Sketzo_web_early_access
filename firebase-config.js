// ============================================
// Firebase Configuration
// ============================================

const firebaseConfig = {
    apiKey: "AIzaSyAUI-9gMI1-o08rEyLoLYrLYv68fcLe_RU",
    authDomain: "pixel-art-ui.firebaseapp.com",
    projectId: "pixel-art-ui",
    storageBucket: "pixel-art-ui.firebasestorage.app",
    messagingSenderId: "320770972104",
    appId: "1:320770972104:web:e2891e7134d31d3bb508fd"
};

// ============================================
// Email API Configuration (Vercel + Resend)
// ============================================
const EMAIL_API_URL = "https://sketzomail.vercel.app/api/send-welcome-email";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Auth instance
const auth = firebase.auth();

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();

// ============================================
// Authentication Functions
// ============================================

// Send welcome email via Vercel API
async function sendWelcomeEmail(user) {
    console.log('📧 Sending welcome email to:', user.email);

    // Skip if API URL not configured
    if (EMAIL_API_URL.includes("YOUR_VERCEL_URL")) {
        console.log('⚠️ Email API not configured yet. Deploy to Vercel first.');
        return false;
    }

    try {
        const response = await fetch(EMAIL_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: user.email,
                name: user.displayName || 'Pixel Friend'
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Welcome email sent successfully!');
            return true;
        } else {
            console.error('❌ Email API error:', data.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Failed to send email:', error);
        return false;
    }
}

// Sign in with Google
async function signInWithGoogle() {
    try {
        const result = await auth.signInWithPopup(googleProvider);
        const user = result.user;

        // Send welcome email on every sign-in (for testing)
        console.log('🎉 Sending welcome email...');
        await sendWelcomeEmail(user);

        return { success: true, user };
    } catch (error) {
        console.error('Google sign-in error:', error);
        return { success: false, error: error.message };
    }
}

// Sign in with email and password
async function signInWithEmail(email, password) {
    try {
        const result = await auth.signInWithEmailAndPassword(email, password);
        return { success: true, user: result.user };
    } catch (error) {
        console.error('Email sign-in error:', error);
        return { success: false, error: getErrorMessage(error.code) };
    }
}

// Sign up with email and password
async function signUpWithEmail(name, email, password) {
    try {
        const result = await auth.createUserWithEmailAndPassword(email, password);
        const user = result.user;

        // Update user profile with name
        await user.updateProfile({ displayName: name });

        // Send welcome email
        console.log('🎉 Account created! Sending welcome email...');
        await sendWelcomeEmail({ ...user, displayName: name });

        return { success: true, user };
    } catch (error) {
        console.error('Sign-up error:', error);
        return { success: false, error: getErrorMessage(error.code) };
    }
}

// Get user-friendly error messages
function getErrorMessage(errorCode) {
    const errors = {
        'auth/email-already-in-use': 'This email is already registered. Try signing in!',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    };
    return errors[errorCode] || 'An error occurred. Please try again.';
}

// Sign out
async function signOut() {
    try {
        await auth.signOut();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Auth state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('🔐 User signed in:', user.email);
    } else {
        console.log('🔓 User signed out');
    }
});
