// Admin password check
const ADMIN_PASSWORD = 'admin123';

document.addEventListener('DOMContentLoaded', function() {
    // Check if coming from login
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('token') !== 'admin123') {
        window.location.href = 'index.html';
        return;
    }

    loadAdminData();
    initAdminEvents();
});

function loadAdminData() {
    const photos = JSON.parse(localStorage.getItem('photos')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Update stats
    document.getElementById('totalPhotos').textContent = photos.length;
    document.getElementById('totalUsers').textContent = users.length;
    let totalRatings = 0;
    users.forEach(user => totalRatings += user.ratings?.length || 0);
    document.getElementById('totalRatings').textContent = totalRatings;

    // Load photos grid
    loadPhotosGrid(photos);
}

function initAdminEvents() {
    // Celebrity select
    document.getElementById('celebritySelect').addEventListener('change', function() {
        const newCelebrityInput = document.getElementById('newCelebrity');
        if (this.value === 'new') {
            newCelebrityInput.style.display = 'block';
        } else {
            newCelebrityInput.style.display = 'none';
        }
    });

    // Upload form
    document.getElementById('uploadForm').addEventListener('submit', handleUpload);

    // Export buttons
    document.getElementById('exportExcel').addEventListener('click', exportRatings);
    document.getElementById('exportUsers').addEventListener('click', exportUsers);
}

function handleUpload(e) {
    e.preventDefault();
    const name = document.getElementById('photoName').value;
    const file = document.getElementById('photoFile').files[0];
    const celebritySelect = document.getElementById('celebritySelect').value;
    const newCelebrity = document.getElementById('newCelebrity').value;

    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const photo = {
            id: Date.now(),
            name: name,
            src: e.target.result,
            celebrity: celebritySelect === 'new' ? newCelebrity.toLowerCase().replace(/\s+/g, '') : celebritySelect,
            angle: name.toLowerCase().includes('front') ? 'front' : 
                   name.toLowerCase().includes('side') ? 'side' : 
                   name.toLowerCase().includes('profile') ? 'profile' : 'angle'
        };

        let photos = JSON.parse(localStorage.getItem('photos')) || [];
        photos.push(photo);
        localStorage.setItem('photos', JSON.stringify(photos));

        alert('Photo uploaded successfully!');
        loadAdminData();
        e.target.form.reset();
    };
    reader.readAsDataURL(file);
}

function loadPhotosGrid(photos) {
    const grid = document.getElementById('photosGrid');
    grid.innerHTML = '';

    photos.forEach(photo => {
        const photoCard = document.createElement('div');
        photoCard.className = 'photo-card';
        photoCard.innerHTML = `
            <img src="${photo.src}" alt="${photo.name}" onerror="this.src='https://via.placeholder.com/200x250?text=No+Image'">
            <div class="photo-info">
                <h4>${photo.name}</h4>
                <p>Celebrity: ${photo.celebrity}</p>
                <p>Angle: ${photo.angle}</p>
                <button onclick="deletePhoto(${photo.id})" class="delete-btn">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        grid.appendChild(photoCard);
    });
}

function deletePhoto(id) {
    if (confirm('Are you sure you want to delete this photo?')) {
        let photos = JSON.parse(localStorage.getItem('photos')) || [];
        photos = photos.filter(p => p.id !== id);
        localStorage.setItem('photos', JSON.stringify(photos));
        loadAdminData();
    }
}

function exportRatings() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    let csvContent = 'Photo ID,Photo Name,Celebrity,User Email,Rating\n';
    
    users.forEach(user => {
        if (user.ratings) {
            user.ratings.forEach(rating => {
                const photo = JSON.parse(localStorage.getItem('photos'))?.find(p => p.id == rating.photoId);
                if (photo) {
                    csvContent += `${rating.photoId},"${photo.name}","${photo.celebrity}",${user.email},${rating.rating}\n`;
                }
            });
        }
    });

    downloadCSV(csvContent, 'ratings_report.csv');
}

function exportUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    let csvContent = 'User ID,Email,Total Ratings\n';
    
    users.forEach(user => {
        csvContent += `${user.id},${user.email},${user.totalRatings || 0}\n`;
    });

    downloadCSV(csvContent, 'users_report.csv');
}

function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}