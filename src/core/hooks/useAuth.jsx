import { useState, useEffect, createContext, useContext } from 'react';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged, 
    GoogleAuthProvider, 
    signInWithPopup,
    sendEmailVerification,
    updateProfile 
} from "firebase/auth";
import { auth } from '../services/firebase';
import { db } from '../services/db';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setIsVerified(firebaseUser.emailVerified);
                try {
                    // Sync Firestore User
                    // We pass displayName as fallback name, but if doc exists, it's ignored.
                    const profile = await db.initUserAfterAuth(
                        firebaseUser.uid, 
                        firebaseUser.email, 
                        firebaseUser.displayName || 'User'
                    );
                    setUser(profile);
                } catch (e) {
                    console.error("Error fetching user profile", e);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
             return true;
        } catch (e) {
            console.error(e);
            throw e; // Throw to let UI handle error message
        }
    };

    const register = async (email, password, name) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            
            try {
                await sendEmailVerification(userCredential.user);
                console.log("✅ Verification email sent to:", email);
            } catch (verifyErr) {
                console.error("❌ Failed to send verification email:", verifyErr);
                // We don't throw here to allow the user to be created, but we should probably inform UI?
                // For now, logging is enough to debug.
            }
            
            // Explicitly create doc immediately so UI works instantly
            await db.initUserAfterAuth(userCredential.user.uid, email, name);
            
            return true;
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const googleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            return true;
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
    };

    const resendVerification = async () => {
        if (auth.currentUser) {
            await sendEmailVerification(auth.currentUser);
            return true;
        }
        return false;
    };

    return (
        <AuthContext.Provider value={{ user, login, register, googleLogin, logout, resendVerification, loading, isVerified }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
