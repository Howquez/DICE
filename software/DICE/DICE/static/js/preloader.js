console.log("pre-loader ready! This includes placeholders for expired images. Not (yet) for user images, though");

// Disable scrolling
document.body.style.overflow = "hidden";

document.addEventListener("DOMContentLoaded", function() {
    function replaceWithPlaceholder(element) {
        // Create placeholder div
        const placeholder = document.createElement('div');
        placeholder.textContent = 'Image not available anymore';
        placeholder.className = 'img-fluid rounded-4 mt-2';

        // Add styling
        Object.assign(placeholder.style, {
            width: "100%",
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f0f0f0',
            color: '#555',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '0.75rem',
            marginTop: '0.5rem',
            objectFit: 'cover',
            maxWidth: '100%'  // Ensure responsiveness
        });

        // Replace the original element
        element.parentNode.replaceChild(placeholder, element);
    }

    // Handle images that failed to load
    document.querySelectorAll('img.img-fluid.rounded-4.mt-2').forEach((img) => {
        // Only add error listener if image is not already loaded successfully
        if (img.complete) {
            if (img.naturalWidth === 0) {
                // Image is complete but has no width - it failed to load
                replaceWithPlaceholder(img);
            }
            // Otherwise image is loaded successfully - do nothing
        } else {
            // Image is still loading - add error listener
            img.addEventListener('error', () => {
                console.log('Failed to load image:', img.src);
                replaceWithPlaceholder(img);
            });
        }
    });

    // Loading screen handling
    setTimeout(function() {
        var loadingScreen = document.getElementById("loadingScreen");
        var mainContent = document.getElementById("mainContent");

        loadingScreen.classList.add("d-none"); // Hide loading screen
        mainContent.classList.remove("d-none"); // Show main content

        // Enable scrolling
        document.body.style.overflow = "";

        console.log("fully loaded");
    }, 5000);
});