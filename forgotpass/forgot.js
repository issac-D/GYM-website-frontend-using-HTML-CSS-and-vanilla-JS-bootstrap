// --- State Variables ---
        let currentCode = null;
        let userEmail = "";

        // --- Core Functions ---
        document.addEventListener('DOMContentLoaded', () => {
            setupThemeToggle();
            setupForms();
        });

        // 1. Theme Toggle Logic
        function setupThemeToggle() {
            const body = document.body;
            const themeToggle = document.getElementById('theme-toggle');
            const icon = themeToggle.querySelector('i');
            
            // Check localStorage for theme
            const savedTheme = localStorage.getItem('theme'); // Using general 'theme' key to match other pages
            
            if (savedTheme === 'dark') {
                body.classList.add('dark-mode');
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }

            themeToggle.addEventListener('click', () => {
                body.classList.toggle('dark-mode');
                
                if (body.classList.contains('dark-mode')) {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                    localStorage.setItem('theme', 'dark');
                } else {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                    localStorage.setItem('theme', 'light');
                }
            });
        }

        // 2. Form Logic
        function setupForms() {
            // Steps Elements
            const step1 = document.getElementById('step1');
            const step2 = document.getElementById('step2');
            const step3 = document.getElementById('step3');
            const successState = document.getElementById('successState');

            // --- STEP 1: Email Submission ---
            document.getElementById('emailForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const emailInput = document.getElementById('email');
                
                if (emailInput.checkValidity()) {
                    userEmail = emailInput.value;
                    generateAndSendCode();
                    
                    // Transition
                    document.getElementById('displayEmail').textContent = userEmail;
                    step1.classList.add('d-none');
                    step2.classList.remove('d-none');
                } else {
                    emailInput.classList.add('is-invalid');
                }
            });

            // Back to Step 1
            document.getElementById('backToStep1').addEventListener('click', (e) => {
                e.preventDefault();
                step2.classList.add('d-none');
                step1.classList.remove('d-none');
            });

            // Resend Code
            document.getElementById('resendLink').addEventListener('click', (e) => {
                e.preventDefault();
                generateAndSendCode();
                alert('A new code has been sent (check console).');
            });


            // --- STEP 2: Verify Code ---
            document.getElementById('codeForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const inputCode = document.getElementById('verificationCode').value;
                const codeAlert = document.getElementById('codeAlert');

                if (parseInt(inputCode) === currentCode) {
                    // Success Transition
                    codeAlert.classList.add('d-none');
                    step2.classList.add('d-none');
                    step3.classList.remove('d-none');
                } else {
                    // Error
                    codeAlert.classList.remove('d-none');
                    document.getElementById('verificationCode').value = '';
                }
            });


            // --- STEP 3: Reset Password ---
            document.getElementById('passwordForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const newPass = document.getElementById('newPassword').value;
                const confirmPass = document.getElementById('confirmPassword').value;
                const passAlert = document.getElementById('passwordAlert');

                passAlert.classList.add('d-none');

                if (newPass.length < 6) {
                    passAlert.textContent = "Password must be at least 6 characters.";
                    passAlert.classList.remove('d-none');
                    return;
                }

                if (newPass !== confirmPass) {
                    passAlert.textContent = "Passwords do not match.";
                    passAlert.classList.remove('d-none');
                    return;
                }

                // Success Transition
                step3.classList.add('d-none');
                successState.classList.remove('d-none');

                // Redirect Simulation
                setTimeout(() => {
                    window.location.href = './login.html';
                }, 3000);
            });
        }

        // Helper: Generate Code
        function generateAndSendCode() {
            currentCode = Math.floor(100000 + Math.random() * 900000);
            console.log(`%c[DBU Gym] Verification Code for ${userEmail}: ${currentCode}`, "color: #51CCF9; font-weight: bold; font-size: 14px;");
        }

        // Helper: Toggle Password Visibility
        window.togglePassword = (fieldId) => {
            const input = document.getElementById(fieldId);
            const icon = input.nextElementSibling.querySelector('i');
            
            if (input.type === "password") {
                input.type = "text";
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = "password";
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        };