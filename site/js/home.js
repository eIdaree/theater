const userStatusElement = document.getElementById('user-status');
const logoutElement = document.getElementById('logout')
document.addEventListener('DOMContentLoaded', function() {
    const username = sessionStorage.getItem('username');
    if (username) {
        userStatusElement.innerHTML = `<a href="./profile.html">${username}</a>`;
        logoutElement.style.display = 'inline'; 
    } else {
        userStatusElement.innerHTML = `
        <div style = "display:flex;justify-content:space-between;width:175px">
            <a href="./signin.html">Sign In</a>
            <a href="./signup.html" style = 'margin-right:1em'>Sign Up</a>
        </div>
        `;
        logoutElement.style.display = 'none';
    }
})

logoutElement.addEventListener('click', function(event) {
    event.preventDefault();
    sessionStorage.removeItem('username')
    window.location.href = './home.html';
});

