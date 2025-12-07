document.addEventListener('DOMContentLoaded', async () => {
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
            let nextIdCounter = 1;

            // --- 1. Fetch Current User Count (For ID Generation) ---
            try {
                const res = await fetch('http://localhost:3000/users');
                const users = await res.json();
                nextIdCounter = users.length + 1;
                updateGymIdDisplay();
            } catch (err) {
                console.error("Failed to connect to JSON Server:", err);
                gymIdDisplay.textContent = "Error: Start JSON Server";
            }

            // --- 2. Theme Setup ---
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

            // --- 3. Gym ID Generation Logic ---
            function updateGymIdDisplay() {
                const prefix = currentMemberType === 'university' ? 'DBU' : 'EXT';
                const year = new Date().getFullYear();
                const counter = String(nextIdCounter).padStart(4, '0');
                gymIdDisplay.textContent = `${prefix}-${year}-${counter}`;
            }

            // --- 4. Dynamic Field Toggling ---
            function toggleMemberType(type) {
                currentMemberType = type;
                typeUniBtn.classList.toggle('active', type === 'university');
                typeExtBtn.classList.toggle('active', type === 'external');
                uniFields.classList.toggle('d-none', type === 'external');
                extFields.classList.toggle('d-none', type === 'university');

                updateGymIdDisplay();

                document.getElementById('uniID').required = (type === 'university');
                document.getElementById('department').required = (type === 'university');
                document.getElementById('nationalID').required = (type === 'external');
                document.getElementById('address').required = (type === 'external');
            }

            typeUniBtn.addEventListener('click', () => toggleMemberType('university'));
            typeExtBtn.addEventListener('click', () => toggleMemberType('external'));

            // --- 5. Helper: Convert Image to Base64 ---
            const convertToBase64 = (file) => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = (error) => reject(error);
                });
            };

            // --- 6. Helper: Calculate Expiry Date ---
            const calculateExpiry = (planType) => {
                const date = new Date();
                if (planType === 'Monthly') date.setMonth(date.getMonth() + 1);
                else if (planType === '3Months') date.setMonth(date.getMonth() + 3);
                else if (planType === '6Months') date.setMonth(date.getMonth() + 6);
                else if (planType === '1Year') date.setFullYear(date.getFullYear() + 1);
                return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
            };

            // --- 7. Form Submission ---
            form.addEventListener('submit', async function (e) {
                e.preventDefault();
                e.stopPropagation();

                if (!form.checkValidity()) {
                    form.classList.add('was-validated');
                    return;
                }

                // Handle Image Upload
                const fileInput = document.getElementById('profileImage');
                let base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg=="; // Default placeholder
                
                if (fileInput.files.length > 0) {
                    try {
                        base64Image = await convertToBase64(fileInput.files[0]);
                    } catch (err) {
                        console.error("Image conversion failed", err);
                        alert("Failed to upload image.");
                        return;
                    }
                }

                // Construct User Object
                const today = new Date().toISOString().split('T')[0];
                const planType = document.getElementById('membershipType').value;
                const membershipId = gymIdDisplay.textContent;

                const newUser = {
                    role: "user",
                    fullName: document.getElementById('fullName').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phoneNumber').value,
                    password: document.getElementById('password').value,
                    gender: document.getElementById('gender').value,
                    profileImage: base64Image,
                    
                    isUniversityMember: (currentMemberType === 'university'),
                    universityId: currentMemberType === 'university' ? document.getElementById('uniID').value : null,
                    department: currentMemberType === 'university' ? document.getElementById('department').value : null,
                    
                    nationalId: currentMemberType === 'external' ? document.getElementById('nationalID').value : null,
                    address: currentMemberType === 'external' ? document.getElementById('address').value : null,
                    
                    membershipId: membershipId,
                    discountPercentage: (currentMemberType === 'university' ? 20 : 0),
                    membershipType: planType,
                    membershipStatus: "active",
                    joinDate: today,
                    expiryDate: calculateExpiry(planType),
                    paymentStatus: "Paid" 
                };

                // Send POST Request
                try {
                    const response = await fetch('http://localhost:3000/users', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(newUser)
                    });

                    if (response.ok) {
                        alert(`Success! Member registered with ID: ${membershipId}. Redirecting to Login...`);
                        window.location.href = '../login/login.html';
                    } else {
                        throw new Error('Server responded with error');
                    }
                } catch (error) {
                    console.error("Registration failed:", error);
                    alert("Registration failed. Ensure JSON Server is running.");
                }
            });
        });