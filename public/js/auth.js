// Authentication utility functions
class AuthManager {
    constructor() {
        this.checkAuthStatus();
    }

    // Check if user is authenticated
    checkAuthStatus() {
        return sessionStorage.getItem('isLoggedIn') === 'true';
    }

    // Get current username
    getCurrentUser() {
        return sessionStorage.getItem('username');
    }

    // Logout function
    async logout() {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                sessionStorage.removeItem('isLoggedIn');
                sessionStorage.removeItem('username');
                window.location.href = '/login.html';
            } else {
                console.error('Logout failed');
                // Force logout on client side anyway
                sessionStorage.removeItem('isLoggedIn');
                sessionStorage.removeItem('username');
                window.location.href = '/login.html';
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Force logout on client side anyway
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('username');
            window.location.href = '/login.html';
        }
    }

    // Check authentication before making API calls
    async makeAuthenticatedRequest(url, options = {}) {
        if (!this.checkAuthStatus()) {
            window.location.href = '/login.html';
            return null;
        }

        try {
            const response = await fetch(url, {
                ...options,
                credentials: 'include' // Include session cookies
            });

            if (response.status === 401) {
                // Session expired or invalid
                sessionStorage.removeItem('isLoggedIn');
                sessionStorage.removeItem('username');
                window.location.href = '/login.html';
                return null;
            }

            return response;
        } catch (error) {
            console.error('Request error:', error);
            return null;
        }
    }

    // Show authentication status in navbar
    updateNavbar() {
        const username = this.getCurrentUser();
        if (username) {
            // Update navbar to show username and logout button
            const navbarNav = document.querySelector('.navbar-nav');
            if (navbarNav) {
                // Remove existing user info if any
                const existingUserInfo = navbarNav.querySelector('.user-info');
                if (existingUserInfo) {
                    existingUserInfo.remove();
                }

                // Add user info
                const userInfo = document.createElement('li');
                userInfo.className = 'nav-item dropdown user-info';
                userInfo.innerHTML = `
                    <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user"></i> ${username}
                    </a>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" onclick="authManager.logout()">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </a></li>
                    </ul>
                `;
                navbarNav.appendChild(userInfo);
            }
        }
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    // Redirect to login if not authenticated (except on login page)
    if (!authManager.checkAuthStatus() && !window.location.pathname.includes('login')) {
        window.location.href = '/login.html';
        return;
    }

    // Update navbar if authenticated
    if (authManager.checkAuthStatus()) {
        authManager.updateNavbar();
    }
});

// Override fetch to automatically handle authentication
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
    // Only apply auth check for API routes
    if (url.startsWith('/api/') && !url.includes('/login') && !url.includes('/auth/status')) {
        return authManager.makeAuthenticatedRequest(url, options);
    }
    return originalFetch(url, options);
};
