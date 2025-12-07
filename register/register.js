let registrationCounter = 1;
        
        document.addEventListener('DOMContentLoaded', () => {
            const body = document.body;
            const themeToggle = document.getElementById('theme-toggle');
            const icon = themeToggle.querySelector('i');
            const form = document.getElementById('registrationForm');
            const uniFields = document.getElementById('uniFields');
            const extFields = document.getElementById('extFields');
            const typeUniBtn = document.getElementById('type-uni-btn');
            const typeExtBtn = document.getElementById('type-ext-btn');
            const gymIdDisplay = document.getElementById('gymIdDisplay');
            
            let currentMemberType = 'university';

            // --- 1. Theme Setup (Light/Dark Mode) ---
            const savedTheme = localStorage.getItem('theme');

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

            // --- 2. Gym ID Generation ---
            function generateGymId(type) {
                const prefix = type === 'university' ? 'DBU' : 'EXT';
                const year = new Date().getFullYear();
                
                // Format counter to 4 digits (0001, 0002, etc.)
                const counter = String(registrationCounter).padStart(4, '0');
                
                return `${prefix}-${year}-${counter}`;
            }

            // --- 3. Dynamic Field Toggling ---
            function toggleMemberType(type) {
                currentMemberType = type;
                
                // Set active button style
                typeUniBtn.classList.toggle('active', type === 'university');
                typeExtBtn.classList.toggle('active', type === 'external');
                
                // Show/Hide fields
                uniFields.classList.toggle('d-none', type === 'external');
                extFields.classList.toggle('d-none', type === 'university');

                // Update Gym ID Preview
                gymIdDisplay.textContent = generateGymId(type);

                // Set required attribute based on visible fields
                document.getElementById('uniID').required = (type === 'university');
                document.getElementById('department').required = (type === 'university');
                document.getElementById('nationalID').required = (type === 'external');
                document.getElementById('address').required = (type === 'external');
                
                // Remove existing validation feedback from hidden fields
                Array.from(uniFields.querySelectorAll('.form-control')).forEach(el => el.classList.remove('is-invalid'));
                Array.from(extFields.querySelectorAll('.form-control')).forEach(el => el.classList.remove('is-invalid'));
            }

            // Initial setup
            toggleMemberType('university');

            // Event listeners for buttons
            typeUniBtn.addEventListener('click', () => toggleMemberType('university'));
            typeExtBtn.addEventListener('click', () => toggleMemberType('external'));

            // --- 4. Form Validation and Submission ---
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                e.stopPropagation();

                let isValid = true;
                
                // Manually validate all visible required fields
                const requiredInputs = form.querySelectorAll('[required]:not([disabled]):not([hidden])');
                
                requiredInputs.forEach(input => {
                    if (input.value.trim() === '') {
                        input.classList.add('is-invalid');
                        isValid = false;
                    } else {
                        input.classList.remove('is-invalid');
                    }
                });

                if (isValid) {
                    // Collect Data
                    const formData = {
                        memberId: gymIdDisplay.textContent,
                        type: currentMemberType,
                        fullName: document.getElementById('fullName').value,
                        email: document.getElementById('email').value,
                        phoneNumber: document.getElementById('phoneNumber').value,
                        membershipType: document.getElementById('membershipType').value,
                    };
                    
                    if (currentMemberType === 'university') {
                        formData.uniID = document.getElementById('uniID').value;
                        formData.department = document.getElementById('department').value;
                    } else {
                        formData.nationalID = document.getElementById('nationalID').value;
                        formData.address = document.getElementById('address').value;
                    }

                    // --- SUCCESS LOGIC ---
                    console.log('Registration Data:', formData);
                    
                    // Increment counter for next registration
                    registrationCounter++;

                    // Reset form and show success alert
                    form.reset();
                    form.classList.remove('was-validated'); // Prevent showing default browser validation
                    
                    // Show success modal/alert (using a Bootstrap alert for simplicity)
                    const successAlert = `
                        <div class="alert alert-success alert-dismissible fade show mt-4" role="alert">
                            <strong>Success!</strong> Member ${formData.fullName} registered with ID: ${formData.memberId}.
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    `;
                    document.querySelector('.card').insertAdjacentHTML('afterend', successAlert);
                    
                    // Re-generate ID display for the next member
                    gymIdDisplay.textContent = generateGymId(currentMemberType);
                }
            });
            
            // Re-validate fields on change (optional: cleans up the UI instantly)
            form.querySelectorAll('.form-control, .form-select').forEach(input => {
                input.addEventListener('input', () => {
                    if (input.value.trim() !== '') {
                        input.classList.remove('is-invalid');
                    }
                });
            });
        });