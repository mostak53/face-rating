// Data storage (in production, use a real database)
let users = JSON.parse(localStorage.getItem('users')) || [];
let photos = JSON.parse(localStorage.getItem('photos')) || [];
let currentUser = null;
let ratedPhotos = new Set();
let shuffledPhotos = [];

// Admin credentials
const ADMIN_PASSWORD = 'admin123';

// Initialize default data
if (photos.length === 0) {
    photos = [
        { id: 1, name: 'Celebrity 1 - Front', src: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=500&fit=crop', celebrity: 'celebrity1', angle: 'front' },
        { id: 2, name: 'Celebrity 1 - Side', src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop', celebrity: 'celebrity1', angle: 'side' },
        { id: 3, name: 'Celebrity 2 - Front', src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop', celebrity: 'celebrity2', angle: 'front' },
        { id: 4, name: 'Celebrity 2 - Profile', src: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b7?w=400&h=500&fit=crop', celebrity: 'celebrity2', angle: 'profile' },
        { id: 5, name: 'Celebrity 3 - Front', src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop', celebrity: 'celebrity3', angle: 'front' },
        { id: 6, name: 'Celebrity 3 - Angle', src: 'https://images.unsplash.com/photo-1524504388940-b6b749e7148d?w=400&h=500&fit=crop', celebrity: 'celebrity3', angle: 'angle' }
    ];
    localStorage.setItem('photos', JSON.stringify(photos));
}

// DOM Elements
const getStartedBtn = document.getElementById('getStartedBtn');
const loginModal = document.getElementById('loginModal');
const closeModal = document.querySelector('.close');

// Navigation
const navLinks = document.querySelectorAll('.nav-link');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// Tab functionality
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initTabs();
    initModal();
    
    // Sample photos for demo (replace with your images)
    shufflePhotos();
});

// Navigation functionality
function initNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            targetSection.scrollIntoView({ behavior: 'smooth' });
        });
    });

    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        navMenu.classList.remove('active');
    }));
}

function initTabs() {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(targetTab + '-tab').classList.add('active');
            
            // Update form title
            if (targetTab === 'user') {
                const title = document.getElementById('userTitle');
                const submitBtn = document.getElementById('userSubmitBtn');
                const toggleText = document.getElementById('toggleUserText');
                
                if (title.textContent === 'Login') {
                    title.textContent = 'Login';
                    submitBtn.textContent = 'Login';
                    toggleText.innerHTML = "Don't have an account? <span id='registerLink'>Register</span>";
                }
            }
        });
    });

    // Register/Login toggle
    document.addEventListener('click', (e) => {
        if (e.target.id === 'registerLink') {
            toggleUserForm();
        }
    });
}

function initModal() {
    getStartedBtn.addEventListener('click', () => {
        loginModal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });

    // User form submission
    document.getElementById('userForm').addEventListener('submit', handleUserForm);

    // Admin form submission
    document.getElementById('adminForm').addEventListener('submit', handleAdminLogin);
}

function toggleUserForm() {
    const title = document.getElementById('userTitle');
    const submitBtn = document.getElementById('userSubmitBtn');
    const toggleText = document.getElementById('toggleUserText');
    
    if (title.textContent === 'Login') {
        title.textContent = 'Register';
        submitBtn.textContent = 'Register';
        toggleText.innerHTML = "Already have an account? <span id='registerLink'>Login</span>";
    } else {
        title.textContent = 'Login';
        submitBtn.textContent = 'Login';
        toggleText.innerHTML = "Don't have an account? <span id='registerLink'>Register</span>";
    }
}

function handleUserForm(e) {
    e.preventDefault();
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const isRegister = document.getElementById('userTitle').textContent === 'Register';

    if (isRegister) {
        // Register new user
        if (users.find(u => u.email === email)) {
            alert('User already exists!');
            return;
        }
        const newUser = {
            id: Date.now(),
            email,
            password,
            ratings: [],
            totalRatings: 0,
            ratedPhotos: []
        };
        users.push(newUser);
        currentUser = newUser;
        alert('Registration successful!');
    } else {
        // Login existing user
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            currentUser = user;
            loadUserRatings();
            alert('Login successful! Redirecting to rating page...');
            window.location.href = 'rating.html';
        } else {
            alert('Invalid credentials!');
            return;
        }
    }

    localStorage.setItem('users', JSON.stringify(users));
    loginModal.style.display = 'none';
    document.getElementById('userForm').reset();
}

function handleAdminLogin(e) {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;
    
    if (password === ADMIN_PASSWORD) {
        window.location.href = 'admin.html';
    } else {
        alert('Invalid admin password!');
    }
}

function shufflePhotos() {
    // Group photos by celebrity and shuffle angles
    const celebrityGroups = {};
    photos.forEach(photo => {
        if (!celebrityGroups[photo.celebrity]) {
            celebrityGroups[photo.celebrity] = [];
        }
        celebrityGroups[photo.celebrity].push(photo);
    });

    shuffledPhotos = [];
    Object.values(celebrityGroups).forEach(group => {
        const shuffledGroup = [...group].sort(() => Math.random() - 0.5);
        shuffledPhotos.push(...shuffledGroup.slice(0, 2)); // Show 2 angles per celebrity
    });

    shuffledPhotos = shuffledPhotos.sort(() => Math.random() - 0.5);
}

function loadUserRatings() {
    if (currentUser) {
        ratedPhotos = new Set(currentUser.ratedPhotos);
    }
}

// Export functions for rating page
window.shufflePhotos = shufflePhotos;
window.getPhotos = () => shuffledPhotos;
window.getCurrentUser = () => currentUser;
window.getUsers = () => users;
window.getRatedPhotos = () => ratedPhotos;
window.updateUserRatings = (photoId, rating) => {
    if (currentUser) {
        if (!currentUser.ratings.find(r => r.photoId === photoId)) {
            currentUser.ratings.push({ photoId, rating });
            currentUser.totalRatings++;
            currentUser.ratedPhotos.push(photoId);
        }
        localStorage.setItem('users', JSON.stringify(users));
    }
};