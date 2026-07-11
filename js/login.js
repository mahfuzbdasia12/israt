// Midnight Kinetic - Login Interactions

document.addEventListener('DOMContentLoaded', () => {
    const glassCard = document.querySelector('.glass-card');
    
    // 1. Subtle 3D tilt effect on the card based on mouse movement
    if (glassCard) {
        document.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 45;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 45;
            glassCard.style.transform = `perspective(1000px) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });

        // Reset transform when mouse leaves window
        document.addEventListener('mouseleave', () => {
            glassCard.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg)`;
        });
    }

    // 2. Mock Form Login Validation and Redirect
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginSubmitBtn');
    
    if (loginForm && loginBtn) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const usernameInput = document.getElementById('usernameInput');
            const passwordInput = document.getElementById('passwordField');
            const errorContainer = document.getElementById('loginErrorMsg');
            
            // Basic check
            if (!usernameInput.value.trim() || !passwordInput.value.trim()) {
                if (errorContainer) {
                    errorContainer.innerText = 'PLEASE ENTER BOTH USERNAME AND PASSWORD.';
                    errorContainer.style.display = 'block';
                }
                return;
            }

            // Mock check (any credentials work in this mock environment, e.g. admin@mahfuzbd.com)
            if (errorContainer) {
                errorContainer.style.display = 'none';
            }
            
            // Show loading animation on the button
            const originalText = loginBtn.innerHTML;
            loginBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> AUTHORIZING...';
            loginBtn.disabled = true;

            setTimeout(() => {
                // Redirect to dashboard page
                window.location.href = 'dashboard.html';
            }, 1500);
        });
    }
});

// Toggle password visibility
function togglePassword() {
    const pwd = document.getElementById('passwordField');
    const button = document.querySelector('.toggle-password-btn');
    if (!pwd || !button) return;

    const icon = button.querySelector('.material-symbols-outlined');
    if (pwd.type === 'password') {
        pwd.type = 'text';
        icon.innerText = 'visibility_off';
    } else {
        pwd.type = 'password';
        icon.innerText = 'visibility';
    }
}
