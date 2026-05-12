document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM Elements
    const authSection = document.getElementById('auth-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const navUserInfo = document.getElementById('nav-user-info');
    const userEmailDisplay = document.getElementById('user-email-display');
    const authForm = document.getElementById('auth-form');
    const authTitle = document.getElementById('auth-title');
    const authSubmit = document.getElementById('auth-submit');
    const toggleAuthBtn = document.getElementById('toggle-auth');
    
    // NEW: Target the entire group (input + disclaimer)
    const appPasswordGroup = document.getElementById('app-password-group'); 
    const linkedinInput = document.getElementById('linkedin');
    
    const authError = document.getElementById('auth-error');
    const autoForm = document.getElementById('automation-form');
    const logoutBtn = document.getElementById('logout-btn');
    
    let isLoginMode = true;

    // 2. Check Session on Load
    checkSession();

    // 3. Toggle Login/Register
    toggleAuthBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        
        // Update Text
        authTitle.innerText = isLoginMode ? 'Login' : 'Register';
        authSubmit.innerText = isLoginMode ? 'Login' : 'Sign Up';
        toggleAuthBtn.innerText = isLoginMode ? 'Need an account? Register' : 'Already have an account? Login';
        
        // Toggle Visibility of the Registration-only fields
        if (isLoginMode) {
            appPasswordGroup.classList.add('hidden'); // Hides input AND disclaimer
            linkedinInput.classList.add('hidden');
        } else {
            appPasswordGroup.classList.remove('hidden'); // Shows input AND disclaimer
            linkedinInput.classList.remove('hidden');
        }
    });

    // 4. Handle Auth Submit (Login / Register)
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const appPassword = document.getElementById('appPassword').value;
        const linkedin = document.getElementById('linkedin').value;

        const endpoint = isLoginMode ? '/api/login' : '/api/register';
        const body = isLoginMode 
            ? { email, password } 
            : { email, password, appPassword, linkedin };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (res.ok) {
                if (!isLoginMode) {
                    alert('Registration successful! Please login.');
                    toggleAuthBtn.click(); 
                } else {
                    checkSession(); 
                }
            } else {
                authError.innerText = data.error || 'An error occurred';
                authError.classList.remove('hidden');
            }
        } catch (error) {
            console.error("Auth Error:", error);
            authError.innerText = "Failed to connect to the server.";
            authError.classList.remove('hidden');
        }
    });

    // 5. Handle Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await fetch('/api/logout', { method: 'POST' });
            window.location.reload();
        });
    }

    // 6. Handle Automation Submit
    if (autoForm) {
        autoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const consoleBox = document.getElementById('status-console');
            const log = (msg) => {
                consoleBox.innerHTML += `<div>> ${msg}</div>`;
                consoleBox.scrollTop = consoleBox.scrollHeight;
            };

            log("Starting Automation for " + document.getElementById('keyword').value);
            
            const formData = new FormData();
            formData.append('keyword', document.getElementById('keyword').value);
            formData.append('jobType', document.getElementById('job-type').value);
            formData.append('datePosted', document.getElementById('date-posted').value);
            formData.append('customMessage', document.getElementById('cover-letter').value);
            formData.append('resume', document.getElementById('resume').files[0]);

            try {
                log("Connecting to LinkedIn Scraper...");
                const res = await fetch('/api/automate', { method: 'POST', body: formData });
                const data = await res.json();

                if (res.ok) {
                    log(`SUCCESS: Found ${data.jobs.length} jobs. Emails sent.`);
                    alert(`Automation Complete! Sent ${data.emailResults.successCount} emails.`);
                    loadHistory();
                } else {
                    log("ERROR: " + data.error);
                }
            } catch (error) {
                log("CRITICAL ERROR: Server unreachable.");
            }
        });
    }

    // 7. Check Session Function
    async function checkSession() {
        try {
            const res = await fetch('/api/me');
            const data = await res.json();

            if (data.loggedIn) {
                authSection.classList.add('hidden');
                dashboardSection.classList.remove('hidden');
                navUserInfo.classList.remove('hidden');
                userEmailDisplay.innerText = data.email;
                loadHistory();
            } else {
                authSection.classList.remove('hidden');
                dashboardSection.classList.add('hidden');
                navUserInfo.classList.add('hidden');
            }
        } catch (error) {
            console.error("Session check failed", error);
        }
    }

    // 8. Load Application History
    async function loadHistory() {
        try {
            const res = await fetch('/api/history');
            const history = await res.json();
            
            document.getElementById('total-apps').innerText = history.length;
            const list = document.getElementById('history-list');
            list.innerHTML = '';

            if (history.length === 0) {
                list.innerHTML = '<p class="text-muted">No applications sent yet.</p>';
                return;
            }

            history.reverse().forEach(job => {
                const date = new Date(job.date).toLocaleDateString();
                list.innerHTML += `
                    <div class="list-group-item list-group-item-action flex-column align-items-start shadow-sm mb-2 border-0 rounded">
                        <div class="d-flex w-100 justify-content-between">
                            <h5 class="mb-1 text-primary">${job.title}</h5>
                            <small class="text-muted">${date}</small>
                        </div>
                        <p class="mb-1"><strong>🏢 Company:</strong> ${job.company}</p>
                        <small class="text-secondary">✉️ Email sent to: ${job.email}</small>
                    </div>
                `;
            });
        } catch (error) {
            console.error("Failed to load history", error);
        }
    }
});