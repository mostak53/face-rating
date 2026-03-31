document.addEventListener('DOMContentLoaded', function() {
    const currentUser = window.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('totalRatings').textContent = currentUser.totalRatings || 0;
    
    loadRatingInterface();
    initEvents();
});

function initEvents() {
    document.getElementById('logoutBtn').addEventListener('click', () => {
        window.currentUser = null;
        window.location.href = 'index.html';
    });
}

function loadRatingInterface() {
    window.shufflePhotos();
    const photos = window.getPhotos();
    const ratedPhotos = window.getRatedPhotos();
    
    const grid = document.getElementById('photosGrid');
    const photosLeftEl = document.getElementById('photosLeft');
    
    // Filter unrated photos
    const unratedPhotos = photos.filter(photo => !ratedPhotos.has(photo.id));
    
    photosLeftEl.textContent = unratedPhotos.length;
    
    if (unratedPhotos.length === 0) {
        document.getElementById('photosGrid').style.display = 'none';
        document.getElementById('completeMessage').style.display = 'block';
        return;
    }

    grid.innerHTML = '';
    
    unratedPhotos.forEach(photo => {
        const photoCard = document.createElement('div');
        photoCard.className = 'photo-card rating-card';
        photoCard.innerHTML = `
            <div class="photo-container">
                <img src="${photo.src}" alt="${photo.name}" onerror="this.src='https://via.placeholder.com/300x400?text=${photo.name}'">
                <div class="photo-overlay">
                    <h3>${photo.name}</h3>
                    <p>${photo.celebrity} - ${photo.angle}</p>
                </div>
            </div>
            <div class="rating-section">
                <div class="stars-container" data-photo-id="${photo.id}">
                    <i class="fas fa-star" data-rating="1"></i>
                    <i class="fas fa-star" data-rating="2"></i>
                    <i class="fas fa-star" data-rating="3"></i>
                    <i class="fas fa-star" data-rating="4"></i>
                    <i class="fas fa-star" data-rating="5"></i>
                </div>
            </div>
        `;
        grid.appendChild(photoCard);
    });

    // Star rating functionality
    document.querySelectorAll('.stars-container i').forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            const container = this.parentElement;
            const photoId = parseInt(container.dataset.photoId);
            
            // Update stars
            container.querySelectorAll('i').forEach((s, index) => {
                s.classList.toggle('rated', index < rating);
            });
            
            // Save rating
            window.updateUserRatings(photoId, rating);
            
            // Update UI
            document.getElementById('totalRatings').textContent = window.getCurrentUser().totalRatings;
            document.getElementById('photosLeft').textContent = 
                window.getPhotos().filter(p => !window.getRatedPhotos().has(p.id)).length;
            
            // Show completion if done
            if (document.querySelectorAll('.stars-container i.rated').length === 0) {
                setTimeout(() => {
                    if (window.getPhotos().filter(p => !window.getRatedPhotos().has(p.id)).length === 0) {
                        document.getElementById('photosGrid').style.display = 'none';
                        document.getElementById('completeMessage').style.display = 'block';
                    }
                }, 500);
            }
        });

        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.dataset.rating);
            this.parentElement.querySelectorAll('i').forEach((s, index) => {
                s.classList.toggle('hover', index < rating);
            });
        });

        star.addEventListener('mouseleave', function() {
            this.parentElement.querySelectorAll('i').forEach(s => {
                s.classList.remove('hover');
            });
        });
    });
}