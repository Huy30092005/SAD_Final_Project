import React, { useState } from "react";
import '../css/Login.css';
import { authenticateUser } from '../services/api';

function Login({ setIsAuthenticated }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

   
    const isLocalStorageAvailable = () => {
        try {
            const testKey = '__test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            setError('Please enter both username and password.');
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const sessionId = await authenticateUser(username, password);
            // Validate sessionId
            if (!sessionId || typeof sessionId !== 'string') {
                throw new Error('Invalid session ID received from server');
            }

            // Check localStorage availability
            if (!isLocalStorageAvailable()) {
                throw new Error('Local storage is not available. Are you in private browsing mode?');
            }

            try {
                localStorage.setItem('sessionId', sessionId);
                setIsAuthenticated(true);
            } catch (storageError) {
                console.error('Storage error:', {
                    message: storageError.message,
                    name: storageError.name,
                    stack: storageError.stack,
                });
                throw new Error(
                    storageError.name === 'QuotaExceededError'
                        ? 'Local storage is full. Please clear some browser data and try again.'
                        : 'Failed to save session. Please check your browser settings or try a different browser.'
                );
            }
        } catch (err) {
            console.error('Login error:', {
                message: err.message,
                name: err.name,
                stack: err.stack,
            });
            setError(err.message || 'An unexpected error occurred during login.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login">
            <div className="login-card">
                <h2 className="login-title">LOGIN WITH <span className="text-gradient">TMDB</span> ACCOUNT</h2>
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                <form className="login-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="username" className="form-label">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="form-input"
                            placeholder="Enter your username"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="form-input"
                            placeholder="Enter your password"
                        />
                    </div>
                    <button
                        type="submit"
                        disables={isLoading}
                        className={isLoading ? 'submit-button loading' : 'submit-button'}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;