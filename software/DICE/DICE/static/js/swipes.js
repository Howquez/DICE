console.log("swipes ready!")

// Define an array to store carousel item visibility duration data
var carouselVisibilityData = [];

// Object to store information about the currently visible carousel item
var visibleCarouselItem = {
    id: null,
    startTime: 0
};

// Function to handle carousel slide events
function handleCarouselSlide(event) {
    // Finalize timing for the previous item if it exists
    finalizePreviousItem();

    // Start timing the new item
    var nextItem = event.relatedTarget;
    var nextItemId = nextItem.getAttribute('data-doc-id');
    if (nextItemId) {
        visibleCarouselItem.id = parseInt(nextItemId);
        visibleCarouselItem.startTime = Date.now();
    }
}

// Finalize the timing for the previous item
function finalizePreviousItem() {
    if (visibleCarouselItem.id !== null) {
        const duration = (Date.now() - visibleCarouselItem.startTime) / 1000;
        if (duration > 0.1) { // Ignore durations shorter than 0.1 seconds
            carouselVisibilityData.push({
                doc_id: visibleCarouselItem.id,
                duration: duration
            });
        }
        // Reset the visible item info
        visibleCarouselItem.id = null;
    }
}

// Update the visibility data when the carousel stops being interacted with or on specific events
function finalizeCarouselData() {
    finalizePreviousItem(); // Finalize any currently timed item
    updateViewportData(); // Update the hidden input field with final data
}

// Update the hidden input field with the latest data
function updateViewportData() {
    document.getElementById('viewport_data').value = JSON.stringify(carouselVisibilityData);
}

// Attach event listeners to the carousel
var carouselElement = document.querySelector('#tweetCarousel');
carouselElement.addEventListener('slid.bs.carousel', handleCarouselSlide);

// Optional: Handle page unload and form submission events
window.addEventListener('beforeunload', finalizeCarouselData);
document.getElementById('submitButton').addEventListener('click', function() {
    finalizeCarouselData();
    // You may also want to submit the form or perform other actions here
});

// Optional: Function to stop observing the carousel
function stopObservingCarousel() {
    carouselElement.removeEventListener('slid.bs.carousel', handleCarouselSlide);
    finalizeCarouselData(); // Finalize data collection when stopping
}