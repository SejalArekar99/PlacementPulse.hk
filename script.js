document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---

    // Sections
    const profileSection = document.getElementById('profile-section');
    const uploadSection = document.getElementById('upload-section');
    const loadingState = document.getElementById('loading-state');
    const dashboardSection = document.getElementById('dashboard-section');
    const dropZoneContainer = document.getElementById('drop-zone');

    // Auth Elements
    const authButtonsContainer = document.getElementById('auth-buttons');
    const authModal = document.getElementById('auth-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const authForm = document.getElementById('auth-form');
    const nameGroup = document.getElementById('name-group');
    const authName = document.getElementById('auth-name');
    const authEmail = document.getElementById('auth-email');
    const authPassword = document.getElementById('auth-password');
    const authError = document.getElementById('auth-error');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const modalTitle = document.getElementById('modal-title');

    // Profile Form Elements
    const studentForm = document.getElementById('student-form');
    const nextToUploadBtn = document.getElementById('next-to-upload');
    const studentNameInput = document.getElementById('student-name');
    const cgpaInput = document.getElementById('cgpa');
    const internshipsInput = document.getElementById('internships');
    const dsaScoreInput = document.getElementById('dsa-score');

    // Upload Elements
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    // Loading Elements
    const statusMsg = document.getElementById('status-msg');
    const progressBar = document.getElementById('progress-bar');

    // Dashboard Elements
    const atsScoreVal = document.getElementById('ats-score-val');
    const atsScoreCircle = document.getElementById('ats-score-circle');
    const probVal = document.getElementById('prob-val');
    const probFill = document.getElementById('prob-fill');
    const resetBtn = document.getElementById('reset-btn');
    const strengthsList = document.getElementById('strengths-list');
    const improvementsList = document.getElementById('improvements-list');
    const rolesTags = document.getElementById('roles-tags');

    // Chart
    let skillsChartInstance = null;
    const API_BASE_URL = 'http://localhost:5000/api';

    // State
    let studentData = { cgpa: 0, internships: 0, dsa: 0 };
    let isLoginMode = true;

    // --- Authentication Logic ---
    function updateAuthUI() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (token && user) {
            authButtonsContainer.innerHTML = `
                <span class="text-white mr-3">Hi, ${user.name}</span>
                <button id="logout-btn" class="btn btn-outline">Logout</button>
            `;
            document.getElementById('logout-btn').addEventListener('click', handleLogout);
            
            // Auto-fill student name in profile if empty
            if (!studentNameInput.value) {
                studentNameInput.value = user.name;
            }
        } else {
            authButtonsContainer.innerHTML = `
                <button id="open-login-btn" class="btn btn-outline">Login</button>
            `;
            document.getElementById('open-login-btn').addEventListener('click', openModal);
        }
    }

    function openModal() {
        authModal.classList.remove('hidden');
        resetAuthForm();
    }

    function closeModal() {
        authModal.classList.add('hidden');
        resetAuthForm();
    }

    function resetAuthForm() {
        authForm.reset();
        authError.classList.add('hidden');
        authError.textContent = '';
    }

    function handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        updateAuthUI();
        
        // Reset full state if logged out
        resetToInitial();
    }

    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === authModal) closeModal();
    });

    tabLogin.addEventListener('click', () => {
        isLoginMode = true;
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        nameGroup.classList.add('hidden');
        authName.removeAttribute('required');
        authSubmitBtn.textContent = 'Login';
        modalTitle.textContent = 'Welcome Back';
        resetAuthForm();
    });

    tabRegister.addEventListener('click', () => {
        isLoginMode = false;
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        nameGroup.classList.remove('hidden');
        authName.setAttribute('required', 'true');
        authSubmitBtn.textContent = 'Register';
        modalTitle.textContent = 'Create an Account';
        resetAuthForm();
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
        const payload = {
            email: authEmail.value.trim(),
            password: authPassword.value.trim()
        };
        
        if (!isLoginMode) {
            payload.name = authName.value.trim();
        }

        try {
            authSubmitBtn.disabled = true;
            authSubmitBtn.textContent = 'Loading...';
            
            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.msg || 'Authentication failed');
            }
            
            // Save token
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            closeModal();
            updateAuthUI();
            
        } catch (err) {
            authError.textContent = err.message;
            authError.classList.remove('hidden');
        } finally {
            authSubmitBtn.disabled = false;
            authSubmitBtn.textContent = isLoginMode ? 'Login' : 'Register';
        }
    });

    // Initialize Auth UI
    updateAuthUI();

    // --- Profile Form Logic ---
    nextToUploadBtn.addEventListener('click', () => {
        if (!localStorage.getItem('token')) {
            openModal();
            return;
        }

        if (!studentForm.checkValidity()) {
            studentForm.reportValidity();
            return;
        }

        studentData = {
            cgpa: parseFloat(cgpaInput.value),
            internships: parseInt(internshipsInput.value),
            dsa: parseInt(dsaScoreInput.value)
        };

        uploadSection.classList.remove('hidden');
        uploadSection.scrollIntoView({ behavior: 'smooth' });

        Array.from(studentForm.elements).forEach(el => el.disabled = true);
        nextToUploadBtn.innerHTML = 'Profile Saved <i class="fa-solid fa-check"></i>';
        nextToUploadBtn.classList.replace('btn-primary', 'btn-secondary');
    });

    // --- Upload Logic ---
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropZone.classList.add('dragover');
    }

    function unhighlight(e) {
        dropZone.classList.remove('dragover');
    }

    dropZone.addEventListener('drop', handleDrop, false);
    fileInput.addEventListener('change', function () {
        if (this.files.length) handleFiles(this.files);
    });

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) handleFiles(files);
    }

    async function handleFiles(files) {
        if (!localStorage.getItem('token')) {
            openModal();
            return;
        }

        const file = files[0];
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
            alert('Please upload a valid PDF or Word document.');
            return;
        }

        dropZoneContainer.classList.add('hidden');
        loadingState.classList.remove('hidden');
        loadingState.scrollIntoView({ behavior: 'smooth' });
        
        let progressInterval = simulateProgressUI();

        try {
            const formData = new FormData();
            formData.append('resume', file);
            formData.append('cgpa', studentData.cgpa);
            formData.append('internships', studentData.internships);
            formData.append('dsaScore', studentData.dsa);

            const res = await fetch(`${API_BASE_URL}/resume/analyze`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.msg || 'Analysis failed');
            }

            clearInterval(progressInterval);
            progressBar.style.width = `100%`;
            statusMsg.textContent = "Analysis Complete!";
            
            setTimeout(() => {
                showDashboard(data.analysis);
            }, 800);

        } catch (err) {
            clearInterval(progressInterval);
            alert('Error analyzing resume: ' + err.message);
            // Revert UI
            loadingState.classList.add('hidden');
            dropZoneContainer.classList.remove('hidden');
        }
    }

    function simulateProgressUI() {
        const stages = [
            "Uploading file...",
            "Parsing resume structure...",
            "Connecting to AI Engine...",
            "Extracting skills & keywords...",
            "Calculating probability metrics..."
        ];

        let progress = 0;
        let stageIndex = 0;

        return setInterval(() => {
            progress += Math.random() * 8; // Slower progress max ~90%
            if (progress > 90) progress = 90;

            progressBar.style.width = `${progress}%`;

            const expectedStage = Math.floor((progress / 90) * stages.length);
            if (expectedStage > stageIndex && expectedStage < stages.length) {
                stageIndex = expectedStage;
                statusMsg.textContent = stages[stageIndex];
            }
        }, 500);
    }

    // --- Dashboard logic ---
    function populateFeedback(analysis) {
        strengthsList.innerHTML = '';
        improvementsList.innerHTML = '';
        rolesTags.innerHTML = '';
        
        const strengths = analysis.strengths.filter(s => s.trim() !== '');
        if (strengths.length === 0) strengths.push('Foundation created, proceed with skill expansion');
        
        strengths.forEach(s => {
            const li = document.createElement('li');
            li.textContent = s;
            strengthsList.appendChild(li);
        });

        const improvements = analysis.improvements.filter(i => i.trim() !== '');
        if (improvements.length === 0) improvements.push('Excellent profile, prepare for advanced interviews.');

        improvements.forEach(i => {
            const li = document.createElement('li');
            li.textContent = i;
            improvementsList.appendChild(li);
        });

        const roles = analysis.roles || ['Software Engineer'];
        roles.forEach(r => {
            const span = document.createElement('span');
            span.className = 'tag';
            span.textContent = r;
            rolesTags.appendChild(span);
        });
    }

    function showDashboard(analysis) {
        loadingState.classList.add('hidden');
        uploadSection.classList.add('hidden');
        profileSection.classList.add('hidden');

        dashboardSection.classList.remove('hidden');

        populateFeedback(analysis);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        animateScore(atsScoreVal, atsScoreCircle, analysis.atsScore);

        setTimeout(() => {
            probFill.style.width = `${analysis.probability}%`;
            animateNumber(probVal, analysis.probability, '%');
        }, 500);

        initChart(analysis.skills);
    }

    function animateScore(textElement, circleElement, targetScore) {
        let current = 0;
        const duration = 1500;
        const interval = 20;
        const increment = targetScore / (duration / interval);

        const timer = setInterval(() => {
            current += increment;
            if (current >= targetScore) {
                current = targetScore;
                clearInterval(timer);
            }

            const rounded = Math.round(current);
            textElement.textContent = `${rounded}%`;

            let color = 'var(--danger)';
            if (current >= 75) color = 'var(--success)';
            else if (current >= 50) color = 'var(--warning)';

            circleElement.style.setProperty('--progress', current);
            circleElement.style.background = `conic-gradient(${color} calc(var(--progress) * 1%), var(--glass-border) 0)`;

        }, interval);
    }

    function animateNumber(element, target, suffix = '') {
        let current = 0;
        const duration = 1500;
        const interval = 30;
        const increment = target / (duration / interval);

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = `${Math.round(current)}${suffix}`;

            if (current >= 75) element.style.color = 'var(--success)';
            else if (current >= 50) element.style.color = 'var(--warning)';
            else element.style.color = 'var(--danger)';

        }, interval);
    }

    function initChart(extractedSkills) {
        const ctx = document.getElementById('skillsChart').getContext('2d');
        if (skillsChartInstance) skillsChartInstance.destroy();

        // Calculate chart values dynamically based on provided skills/metrics
        const problemSolving = Math.min(studentData.dsa, 100) || 75;
        const logic = Math.min(studentData.cgpa * 10, 100) || 80;
        const practical = Math.min(50 + (studentData.internships * 15), 95) || 60;
        
        let frameworks = 40;
        extractedSkills.forEach(s => {
            if (['React', 'Node', 'Express', 'Django', 'Flask'].includes(s)) frameworks += 15;
        });
        frameworks = Math.min(frameworks, 95);

        let mlData = 40;
        extractedSkills.forEach(s => {
            if (['Python', 'Machine Learning', 'Data Structures', 'Aws'].includes(s)) mlData += 15;
        });
        mlData = Math.min(mlData, 95);

        skillsChartInstance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Algorithms & DSA', 'Core Logic', 'Practical Eng.', 'Frameworks', 'Data/ML', 'Tooling/Git'],
                datasets: [{
                    label: 'Skill Proficiency',
                    data: [problemSolving, logic, practical, frameworks, mlData, 70],
                    backgroundColor: 'rgba(67, 97, 238, 0.2)',
                    borderColor: 'rgba(67, 97, 238, 1)',
                    pointBackgroundColor: 'rgba(114, 9, 183, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(114, 9, 183, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: { color: 'rgba(255, 255, 255, 0.7)', font: { family: 'Inter', size: 12 } },
                        ticks: { display: false, min: 0, max: 100 }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    // --- Reset ---
    function resetToInitial() {
        dashboardSection.classList.add('hidden');
        profileSection.classList.remove('hidden');
        uploadSection.classList.add('hidden');

        Array.from(studentForm.elements).forEach(el => el.disabled = false);
        studentForm.reset();
        nextToUploadBtn.innerHTML = 'Continue to Resume Upload <i class="fa-solid fa-arrow-right"></i>';
        nextToUploadBtn.classList.replace('btn-secondary', 'btn-primary');

        dropZoneContainer.classList.remove('hidden');
        fileInput.value = '';
        progressBar.style.width = '0%';
        statusMsg.textContent = 'Extracting keywords...';

        window.scrollTo({ top: 0, behavior: 'smooth' });
        updateAuthUI();
    }

    resetBtn.addEventListener('click', resetToInitial);
});
