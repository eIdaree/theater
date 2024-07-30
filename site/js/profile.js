document.addEventListener('DOMContentLoaded', function() {
    const username = sessionStorage.getItem('username');
    if (username) {
        document.getElementById('username').textContent = username;
        fetch('http://127.0.0.1:3000/checkAuthStatus', {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch user status');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('status').textContent = data.status;
            document.getElementById('email').textContent = data.email;
        })
        .catch(error => {
            console.error('Error fetching user status:', error);
        });
    } else {
        window.location.href = './signin.html';
    }
});