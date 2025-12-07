document.addEventListener('DOMContentLoaded', async () => {
            
            // --- 0. Authentication Check ---
            const sessionUser = JSON.parse(localStorage.getItem('currentUser'));
            const userRole = localStorage.getItem('userRole');

            if (!sessionUser || userRole !== 'admin') {
                window.location.href = '../login/login.html';
                return;
            }

            document.getElementById('adminProfileName').innerHTML = `<i class="fas fa-user-shield me-1"></i> ${sessionUser.fullName}`;

            const API_URL = 'http://localhost:3000/users';
            let membersData = []; // Will store fetched data
            
            // Reference Date
            const CURRENT_DATE = new Date(); 

            // Initialize
            setupThemeToggle();
            setupLogout();
            await fetchMembers();
            
            // --- 1. Fetch Data ---
            async function fetchMembers() {
                try {
                    const res = await fetch(API_URL);
                    membersData = await res.json();
                    
                    // Add processed status to data for easier filtering
                    membersData = membersData.map(member => {
                        const statusObj = getMembershipStatus(member.expiryDate);
                        return { ...member, ...statusObj };
                    });

                    updateStatistics();
                    renderAdminAlerts();
                    renderMembersTable(membersData);
                } catch (err) {
                    console.error("Failed to fetch members:", err);
                    alert("Error fetching data. Is JSON Server running?");
                }
            }

            // --- 2. Utility: Status Calculation ---
            function getMembershipStatus(expiryDateStr) {
                if (!expiryDateStr) return { computedStatus: 'unknown', badgeClass: 'bg-secondary', daysLeft: 0 };
                
                const expiry = new Date(expiryDateStr);
                const diffTime = expiry.getTime() - CURRENT_DATE.getTime();
                const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                let computedStatus, badgeClass;

                if (daysLeft < 0) {
                    computedStatus = "expired";
                    badgeClass = "bg-danger";
                } else if (daysLeft <= 7) {
                    computedStatus = "expiring_soon";
                    badgeClass = "bg-warning text-dark";
                } else {
                    computedStatus = "active";
                    badgeClass = "bg-success";
                }
                
                return { computedStatus, badgeClass, daysLeft };
            }

            // --- 3. Statistics ---
            function updateStatistics() {
                const totalMembers = membersData.length;
                const activeMembers = membersData.filter(m => m.computedStatus === 'active' || m.computedStatus === 'expiring_soon').length;
                const expiredMembers = membersData.filter(m => m.computedStatus === 'expired').length;
                const uniMembers = membersData.filter(m => m.isUniversityMember).length;
                const extMembers = totalMembers - uniMembers;
                
                // Simple Revenue Estimation based on plan types found in DB
                // Pricing assumption: Monthly: 300, 3Months: 800, 6Months: 1500, 1Year: 2500
                const pricing = { 'Monthly': 300, '3Months': 800, '6Months': 1500, '1Year': 2500 };
                
                const totalRevenue = membersData.reduce((sum, member) => {
                    return sum + (pricing[member.membershipType] || 0);
                }, 0);

                // Update Cards
                document.getElementById('statTotalMembers').textContent = totalMembers;
                document.getElementById('statActiveMembers').textContent = activeMembers;
                document.getElementById('statExpiredMembers').textContent = expiredMembers;
                document.getElementById('statUniMembers').textContent = uniMembers;
                document.getElementById('statExtMembers').textContent = extMembers;
                document.getElementById('statTotalRevenue').textContent = totalRevenue.toLocaleString();
                document.getElementById('sumYearlyRevenue').textContent = totalRevenue.toLocaleString() + " ETB";
                document.getElementById('sumPaymentsDue').textContent = `${expiredMembers} Members`;
            }

            // --- 4. Alerts ---
            function renderAdminAlerts() {
                const alertContainer = document.getElementById('adminAlerts');
                alertContainer.innerHTML = '';
                
                const expiredCount = membersData.filter(m => m.computedStatus === 'expired').length;
                const expiringCount = membersData.filter(m => m.computedStatus === 'expiring_soon').length;

                if (expiredCount > 0) {
                    alertContainer.insertAdjacentHTML('beforeend', `
                        <div class="alert alert-danger d-flex align-items-center py-2" role="alert">
                            <i class="fas fa-exclamation-circle me-2"></i>
                            <strong>Attention:</strong> ${expiredCount} memberships are currently expired.
                        </div>
                    `);
                }
                if (expiringCount > 0) {
                    alertContainer.insertAdjacentHTML('beforeend', `
                        <div class="alert alert-warning d-flex align-items-center py-2" role="alert">
                            <i class="fas fa-bell me-2"></i>
                            <strong>Warning:</strong> ${expiringCount} memberships expire within 7 days.
                        </div>
                    `);
                }
            }

            // --- 5. Render Table ---
            function renderMembersTable(data) {
                const tbody = document.getElementById('membersTableBody');
                tbody.innerHTML = ''; 

                if(data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="8" class="text-center">No members found.</td></tr>';
                    return;
                }

                data.forEach(member => {
                    const row = tbody.insertRow();
                    const statusLabel = member.computedStatus === 'expiring_soon' ? 'Expiring Soon' : 
                                        member.computedStatus.charAt(0).toUpperCase() + member.computedStatus.slice(1);

                    row.innerHTML = `
                        <td>${member.membershipId}</td>
                        <td>${member.fullName}</td>
                        <td>${member.isUniversityMember ? 'University' : 'External'}</td>
                        <td>${member.phone}</td>
                        <td>${member.membershipType}</td>
                        <td>${member.expiryDate}</td>
                        <td><span class="badge ${member.badgeClass}">${statusLabel}</span></td>
                        <td>
                            <button class="btn btn-sm btn-action btn-outline-danger" onclick="deleteMember('${member.id}')"><i class="fas fa-trash-alt"></i></button>
                        </td>
                    `;
                });
            }

            // --- 6. Filtering ---
            const searchInput = document.getElementById('memberSearch');
            const filterStatus = document.getElementById('memberFilterStatus');
            const filterType = document.getElementById('memberFilterType');

            function applyFilters() {
                const term = searchInput.value.toLowerCase();
                const status = filterStatus.value;
                const type = filterType.value; // 'university' or 'external'

                const filtered = membersData.filter(m => {
                    const matchesSearch = m.membershipId.toLowerCase().includes(term) || m.fullName.toLowerCase().includes(term);
                    const matchesStatus = !status || m.computedStatus === status;
                    
                    let typeMatch = true;
                    if(type === 'university') typeMatch = m.isUniversityMember;
                    if(type === 'external') typeMatch = !m.isUniversityMember;

                    return matchesSearch && matchesStatus && typeMatch;
                });

                renderMembersTable(filtered);
            }

            searchInput.addEventListener('input', applyFilters);
            filterStatus.addEventListener('change', applyFilters);
            filterType.addEventListener('change', applyFilters);

            // --- 7. Delete Logic ---
            window.deleteMember = async (id) => {
                if(confirm("Are you sure you want to delete this member? This cannot be undone.")) {
                    try {
                        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                        alert("Member deleted.");
                        fetchMembers(); // Reload
                    } catch (err) {
                        alert("Failed to delete member.");
                    }
                }
            };

            // --- 8. Add Member Modal Logic ---
            const addForm = document.getElementById('addNewMemberForm');
            const uniBtn = document.getElementById('modal-type-uni-btn');
            const extBtn = document.getElementById('modal-type-ext-btn');
            const gymIdDisplay = document.getElementById('modalGymIdDisplay');
            let currentAddType = 'university';

            function toggleAddType(type) {
                currentAddType = type;
                uniBtn.classList.toggle('active', type === 'university');
                extBtn.classList.toggle('active', type === 'external');
                document.getElementById('modal-uniFields').classList.toggle('d-none', type === 'external');
                document.getElementById('modal-extFields').classList.toggle('d-none', type === 'university');
                
                document.getElementById('modalUniID').required = (type === 'university');
                document.getElementById('modalDepartment').required = (type === 'university');
                document.getElementById('modalNationalID').required = (type === 'external');
                document.getElementById('modalAddress').required = (type === 'external');
                
                // Update ID Preview
                const prefix = type === 'university' ? 'DBU' : 'EXT';
                const count = membersData.length + 1; 
                gymIdDisplay.textContent = `${prefix}-${new Date().getFullYear()}-${String(count).padStart(4,'0')}`;
            }

            uniBtn.addEventListener('click', () => toggleAddType('university'));
            extBtn.addEventListener('click', () => toggleAddType('external'));
            
            // Initialize modal ID
            const addNewModalEl = document.getElementById('addNewMemberModal');
            addNewModalEl.addEventListener('show.bs.modal', () => toggleAddType('university'));

            addForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Calculate Expiry
                const plan = document.getElementById('modalMembershipType').value;
                const date = new Date();
                if (plan === 'Monthly') date.setMonth(date.getMonth() + 1);
                else if (plan === '3Months') date.setMonth(date.getMonth() + 3);
                else if (plan === '6Months') date.setMonth(date.getMonth() + 6);
                else if (plan === '1Year') date.setFullYear(date.getFullYear() + 1);
                
                const newMember = {
                    role: "user",
                    fullName: document.getElementById('modalFullName').value,
                    email: document.getElementById('modalEmail').value,
                    phone: document.getElementById('modalPhoneNumber').value,
                    password: document.getElementById('modalPassword').value,
                    gender: document.getElementById('modalGender').value,
                    profileImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==",
                    
                    isUniversityMember: currentAddType === 'university',
                    universityId: currentAddType === 'university' ? document.getElementById('modalUniID').value : null,
                    department: currentAddType === 'university' ? document.getElementById('modalDepartment').value : null,
                    nationalId: currentAddType === 'external' ? document.getElementById('modalNationalID').value : null,
                    address: currentAddType === 'external' ? document.getElementById('modalAddress').value : null,

                    membershipId: gymIdDisplay.textContent,
                    discountPercentage: currentAddType === 'university' ? 20 : 0,
                    membershipType: plan,
                    membershipStatus: "active",
                    joinDate: new Date().toISOString().split('T')[0],
                    expiryDate: date.toISOString().split('T')[0],
                    paymentStatus: "Paid"
                };

                try {
                    const res = await fetch(API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newMember)
                    });
                    if(res.ok) {
                        alert("Member Added!");
                        bootstrap.Modal.getInstance(addNewModalEl).hide();
                        addForm.reset();
                        fetchMembers();
                    }
                } catch(err) {
                    alert("Failed to add member.");
                }
            });


            // --- Theme & Logout Utils ---
            function setupThemeToggle() {
                const body = document.body;
                const toggle = document.getElementById('theme-toggle');
                const icon = toggle.querySelector('i');
                const theme = localStorage.getItem('admin-theme');
                if(theme === 'dark') { body.classList.add('dark-mode'); icon.className = 'fas fa-sun'; }
                
                toggle.addEventListener('click', () => {
                    body.classList.toggle('dark-mode');
                    const isDark = body.classList.contains('dark-mode');
                    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
                    localStorage.setItem('admin-theme', isDark ? 'dark' : 'light');
                });
            }

            function setupLogout() {
                document.getElementById('logoutBtn').addEventListener('click', () => {
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('userRole');
                    window.location.href = '../login/login.html';
                });
            }
        });