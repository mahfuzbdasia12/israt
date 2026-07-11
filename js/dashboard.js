// Midnight Kinetic - Dashboard Interactions

document.addEventListener('DOMContentLoaded', () => {
    // 1. Live Active Users Ticker Update (Random Walk)
    const userCounter = document.getElementById('activeUserCounter');
    if (userCounter) {
        setInterval(() => {
            let current = parseInt(userCounter.textContent.replace(/,/g, ''));
            if (!isNaN(current)) {
                // Random walk between -5 and +8
                let change = Math.floor(Math.random() * 14) - 5;
                userCounter.textContent = (current + change).toLocaleString();
            }
        }, 3000);
    }

    // 2. Token Generator Script
    const generateBtn = document.getElementById('generateTokenBtn');
    const tokenDisplay = document.getElementById('tokenDisplay');
    
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            // Generate a fake hash/token
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let token = 'MBD-';
            for (let i = 0; i < 16; i++) {
                token += characters.charAt(Math.floor(Math.random() * characters.length));
                if (i === 3 || i === 7 || i === 11) {
                    token += '-';
                }
            }
            
            // Set text and show alert style
            if (tokenDisplay) {
                tokenDisplay.innerText = token;
                tokenDisplay.style.opacity = '1';
                tokenDisplay.style.color = '#6adab4';
            }
            
            // Temporary button label change
            const originalText = generateBtn.innerText;
            generateBtn.innerText = 'TOKEN ACTIVE';
            generateBtn.style.backgroundColor = '#6adab4';
            generateBtn.style.color = '#003829';
            
            setTimeout(() => {
                generateBtn.innerText = originalText;
                generateBtn.style.backgroundColor = '';
                generateBtn.style.color = '';
            }, 3000);
        });
    }

    // 3. Mini Audit Deep Scan Activation
    const deepAuditLink = document.getElementById('deepAuditLink');
    if (deepAuditLink) {
        deepAuditLink.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Show scanning alerts
            const notificationCard = deepAuditLink.closest('.glass-card') || deepAuditLink.parentElement;
            const notificationText = notificationCard.querySelector('p:not(.font-bold)');
            
            if (notificationText) {
                const originalMsg = notificationText.innerText;
                notificationText.innerHTML = '<span style="color:#ff516a;">SCANNING INDEX DIRECTORY...</span>';
                
                setTimeout(() => {
                    notificationText.innerHTML = '<span style="color:#6adab4;">RESOLVING TOPICAL DECAY ENTITIES...</span>';
                    setTimeout(() => {
                        notificationText.innerHTML = '<span style="color:#6adab4;">SCAN COMPLETED. ALL ENGINES SECURED.</span>';
                        setTimeout(() => {
                            notificationText.innerText = originalMsg;
                        }, 3000);
                    }, 2000);
                }, 2000);
            }
        });
    }

    // 4. Interactive Analytics Chart Bar Tooltips
    const chartBars = document.querySelectorAll('.chart-bar');
    chartBars.forEach(bar => {
        bar.addEventListener('mouseenter', () => {
            // Highlighting behavior is already handled by CSS hover, 
            // but we can log details or perform JS tweaks if needed.
        });
    });
});
