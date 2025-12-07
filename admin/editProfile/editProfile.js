let admin = {
            fullName: "Admin User",
            username: "dbu_admin",
            phone: "0911000000",
            email: "admin@dbugym.com",
            role: "Administrator",
            adminId: "ADM-001",
            defaultPricing: {
                monthly: 300,
                threeMonths: 800,
                sixMonths: 1500,
                yearly: 2500
            },
            allowedDurations: ["monthly", "yearly"],
            openingHours: "Mon-Fri: 6am - 10pm, Sat-Sun: 8am - 6pm",
            announcementMessage: "Welcome back! The new sauna is now open on the 3rd floor."
        };
        
        // --- Core Functions ---

        document.addEventListener('DOMContentLoaded', initAdminPage);

        function initAdminPage() {
            setupThemeToggle();
            loadAdminData();
            setupFormInteractions();
        }

        // --- Theme Toggle Logic (Reused for consistency) ---
        function setupThemeToggle() {
            const body = document.body;
            const themeToggle = document.getElementById('theme-toggle');
            const icon = themeToggle.querySelector('i');
            const savedTheme = localStorage.getItem('admin-theme');
            
            if (savedTheme === 'dark') {
                body.classList.add('dark-mode');
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                 icon.classList.remove('fa-sun');
                 icon.classList.add('fa-moon');
            }

            themeToggle.addEventListener('click', () => {
                body.classList.toggle('dark-mode');
                
                if (body.classList.contains('dark-mode')) {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                    localStorage.setItem('admin-theme', 'dark');
                } else {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                    localStorage.setItem('admin-theme', 'light');
                }
            });
        }

        // --- Load & Display Admin Data ---
        function loadAdminData() {
            // Update Headers
            document.getElementById('adminNameHeader').textContent = admin.fullName;
            document.getElementById('adminIdHeader').textContent = `ID: ${admin.adminId}`;
            document.getElementById('profileNameDisplay').innerHTML = `<i class="fas fa-user-shield me-1"></i> ${admin.fullName.split(' ')[0]}`;


            // B. Pre-fill Admin Profile Forms
            document.getElementById('fullName').value = admin.fullName;
            document.getElementById('username').value = admin.username;
            document.getElementById('email').value = admin.email;
            document.getElementById('phone').value = admin.phone;
            document.getElementById('adminId').value = admin.adminId;
            document.getElementById('role').value = admin.role;
            
            // D. Pre-fill Admin Settings Forms
            document.getElementById('announcementMessage').value = admin.announcementMessage;
            document.getElementById('openingHours').value = admin.openingHours;
            
            // Pricing
            document.getElementById('priceMonthly').value = admin.defaultPricing.monthly;
            document.getElementById('priceThreeMonths').value = admin.defaultPricing.threeMonths;
            document.getElementById('priceSixMonths').value = admin.defaultPricing.sixMonths;
            document.getElementById('priceYearly').value = admin.defaultPricing.yearly;
            
            // Allowed Durations
            const durationCheckboxes = document.querySelectorAll('#settingsForm input[type="checkbox"]');
            durationCheckboxes.forEach(checkbox => {
                checkbox.checked = admin.allowedDurations.includes(checkbox.value);
            });
        }

        // --- Form Interactions and Validation ---
        function setupFormInteractions() {
            const profileForm = document.getElementById('profileForm');
            const passwordForm = document.getElementById('passwordForm');
            const settingsForm = document.getElementById('settingsForm');
            const saveAlert = document.getElementById('saveAlert');
            const passwordAlert = document.getElementById('passwordAlert');

            function displaySuccess(message) {
                saveAlert.innerHTML = `<i class="fas fa-check-circle me-2"></i> ${message}`;
                saveAlert.classList.remove('d-none', 'alert-danger');
                saveAlert.classList.add('alert-success');
                setTimeout(() => {
                    saveAlert.classList.add('d-none');
                }, 4000);
            }

            // F. Save Admin Profile Changes
            profileForm.addEventListener('submit', function (e) {
                e.preventDefault();
                
                // 1. Collect new data
                const updatedAdmin = {
                    fullName: document.getElementById('fullName').value,
                    username: document.getElementById('username').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                };

                // 2. Merge and (Placeholder) Save
                admin = { ...admin, ...updatedAdmin };
                console.log('Admin Profile Updated:', admin);

                // 3. Display Success Message
                displaySuccess('Admin profile updated successfully!');

                // Re-load data to ensure headers/previews are refreshed
                loadAdminData();
            });
            
            // F. Save Admin Settings Changes
            settingsForm.addEventListener('submit', function (e) {
                e.preventDefault();
                
                // 1. Collect new data
                const newPricing = {
                    monthly: parseFloat(document.getElementById('priceMonthly').value),
                    threeMonths: parseFloat(document.getElementById('priceThreeMonths').value),
                    sixMonths: parseFloat(document.getElementById('priceSixMonths').value),
                    yearly: parseFloat(document.getElementById('priceYearly').value),
                };
                
                const newDurations = Array.from(document.querySelectorAll('#settingsForm input[type="checkbox"]:checked'))
                                          .map(cb => cb.value);

                const updatedSettings = {
                    defaultPricing: newPricing,
                    openingHours: document.getElementById('openingHours').value,
                    announcementMessage: document.getElementById('announcementMessage').value,
                    allowedDurations: newDurations
                };

                // 2. Merge and (Placeholder) Save
                admin = { ...admin, ...updatedSettings };
                console.log('System Settings Updated:', updatedSettings);

                // 3. Display Success Message
                displaySuccess('System configuration applied successfully!');
            });


            // C. Change Password
            passwordForm.addEventListener('submit', function (e) {
                e.preventDefault();
                passwordAlert.classList.add('d-none');
                passwordAlert.classList.remove('alert-success', 'alert-danger');

                const currentPass = document.getElementById('currentPassword').value;
                const newPass = document.getElementById('newPassword').value;
                const confirmPass = document.getElementById('confirmNewPassword').value;

                // Simple placeholder validation (e.g., check length and mock current password)
                const MOCK_CURRENT_PASSWORD = 'adminpass'; 

                if (currentPass !== MOCK_CURRENT_PASSWORD) {
                    passwordAlert.textContent = 'Error: The current password you entered is incorrect.';
                    passwordAlert.classList.add('alert-danger');
                    passwordAlert.classList.remove('d-none');
                    return;
                }

                if (newPass.length < 8) {
                    passwordAlert.textContent = 'Error: New password must be at least 8 characters long.';
                    passwordAlert.classList.add('alert-danger');
                    passwordAlert.classList.remove('d-none');
                    return;
                }

                if (newPass !== confirmPass) {
                    passwordAlert.textContent = 'Error: New password and confirmation do not match.';
                    passwordAlert.classList.add('alert-danger');
                    passwordAlert.classList.remove('d-none');
                    return;
                }

                // If validation passes (Placeholder for actual API call)
                console.log('Admin password successfully changed.');
                passwordAlert.textContent = 'Success! Admin password has been updated.';
                passwordAlert.classList.add('alert-success');
                passwordAlert.classList.remove('d-none');

                // Clear fields
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmNewPassword').value = '';
            });

            // E. Profile Picture Upload Preview (Placeholder)
            const photoInput = document.getElementById('profilePictureInput');
            const photoPreview = document.getElementById('profilePicturePreview');
            
            photoInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        // Replace the icon with an image tag
                        photoPreview.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; border-radius:50%;" alt="Profile Preview">`;
                    }
                    reader.readAsDataURL(this.files[0]);
                }
            });
        }