// ============================================
// Supabase Configuration
// ============================================

const SUPABASE_URL = 'https://jadyhtsswmivxplhrotb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_QDuRMkVhi8acX00FKyjZoQ_Maak2Bl6';

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// Authentication Functions
// ============================================

// Sign in with Google
async function signInWithGoogle() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Google sign-in error:', error);
        return { success: false, error: error.message };
    }
}

// Sign in with email and password
async function signInWithEmail(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        console.log('🔐 User signed in:', data.user.email);
        return { success: true, user: data.user };
    } catch (error) {
        console.error('Email sign-in error:', error);
        return { success: false, error: getErrorMessage(error.message) };
    }
}

// Sign up with email and password
async function signUpWithEmail(name, email, password) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: name,
                    display_name: name
                }
            }
        });

        if (error) throw error;

        console.log('🎉 Account created! Check email for confirmation.');
        return {
            success: true,
            user: data.user,
            message: 'Check your email to confirm your account!'
        };
    } catch (error) {
        console.error('Sign-up error:', error);
        return { success: false, error: getErrorMessage(error.message) };
    }
}

// Get user-friendly error messages
function getErrorMessage(errorMessage) {
    const errors = {
        'Invalid login credentials': 'Incorrect email or password. Please try again.',
        'Email not confirmed': 'Please check your email to confirm your account.',
        'User already registered': 'This email is already registered. Try signing in!',
        'Password should be at least 6 characters': 'Password should be at least 6 characters.',
        'Unable to validate email address: invalid format': 'Please enter a valid email address.',
        'Email rate limit exceeded': 'Too many attempts. Please try again later.',
    };

    // Check if any error key is contained in the message
    for (const [key, value] of Object.entries(errors)) {
        if (errorMessage.includes(key)) {
            return value;
        }
    }

    return errorMessage || 'An error occurred. Please try again.';
}

// Sign out
async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        console.log('🔓 User signed out');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Get current user
async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Auth state observer
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
        console.log('🔐 User signed in:', session.user.email);

        // Check if this is a new user (just signed up)
        if (event === 'SIGNED_IN') {
            const isNewUser = session.user.created_at === session.user.last_sign_in_at;
            if (isNewUser) {
                console.log('🎉 Welcome email will be sent by Supabase!');
            }
        }
    } else if (event === 'SIGNED_OUT') {
        console.log('🔓 User signed out');
    }
});

console.log('✅ Supabase initialized successfully!');
