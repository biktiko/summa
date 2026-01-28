import { useState, useEffect, createContext, useContext } from 'react';
import { db } from '../services/db';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        const storedUserId = localStorage.getItem('life_os_session_uid');
        if (storedUserId) {
            db.getUserData(storedUserId).then(userData => {
                if (userData) {
                    setUser(userData);
                } else {
                    localStorage.removeItem('life_os_session_uid');
                }
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const user = await db.authenticateUser(email, password);
        if (user) {
            setUser(user);
            localStorage.setItem('life_os_session_uid', user.id);
            return true;
        }
        return false;
    };

    const register = async (email, password, name) => {
        try {
            const newUser = await db.createUser(email, password, name);
            setUser(newUser);
            localStorage.setItem('life_os_session_uid', newUser.id);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('life_os_session_uid');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
