import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { url } from '../url';


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(null);
    const savedToken = localStorage.getItem('token');
    const [user, setUser] = useState()

    const checkToken = () => {
        if (savedToken) {
            setIsAuthenticated(true);
            setToken(savedToken);
        } else {
            setIsAuthenticated(false);
            setToken(null);
        }
    };

    const getUser = async () => {
        if(savedToken) {
        const jwt = jwtDecode(savedToken)
        try {
            const response = await fetch(`${url}/api/usuario/${jwt.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${savedToken}`
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setUser(data[0])
        } catch (error) {
          console.log(error)
        }
    }
    }

    useEffect(() => {
        checkToken();
        getUser();
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setIsAuthenticated(false);
        setUser([])
        getUser()
    };

    const login = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setIsAuthenticated(true);
        getUser()
    };

    
    return (
        <AuthContext.Provider value={{ isAuthenticated, token, logout, login, getUser, user }}>
            {children}
        </AuthContext.Provider>
    );
};
