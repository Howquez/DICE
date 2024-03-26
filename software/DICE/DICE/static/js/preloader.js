console.log('pre-loader ready!');

// Disable scrolling
document.body.style.overflow = 'hidden';

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        var loadingScreen = document.getElementById('loadingScreen');
        var mainContent = document.getElementById('mainContent');

        loadingScreen.classList.add('d-none'); // Hide loading screen
        mainContent.classList.remove('d-none'); // Show main content

        // Enable scrolling
        document.body.style.overflow = '';

        console.log('fully loaded');
    }, 5000); // 5000 milliseconds = 5 seconds
});
