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

// Activate the first carousel item (no hard-coded intro slide)
var firstItem = carouselElement.querySelector('.carousel-item');
if (firstItem && !carouselElement.querySelector('.carousel-item.active')) {
    firstItem.classList.add('active');
}

// Start timing the first visible item
var activeItem = carouselElement.querySelector('.carousel-item.active');
if (activeItem) {
    var docId = activeItem.getAttribute('data-doc-id');
    if (docId) {
        visibleCarouselItem.id = parseInt(docId);
        visibleCarouselItem.startTime = Date.now();
    }
}

// Hide prev/next arrows at carousel endpoints
function updateCarouselControls() {
    var items = carouselElement.querySelectorAll('.carousel-item');
    var active = carouselElement.querySelector('.carousel-item.active');
    var prevBtn = carouselElement.querySelector('.carousel-control-prev');
    var nextBtn = carouselElement.querySelector('.carousel-control-next');
    if (prevBtn) prevBtn.style.visibility = (active === items[0]) ? 'hidden' : 'visible';
    if (nextBtn) nextBtn.style.visibility = (active === items[items.length - 1]) ? 'hidden' : 'visible';
}
updateCarouselControls();

// Animate the next-arrow on the first slide as a navigation hint
var nextBtn = carouselElement.querySelector('.carousel-control-next');
if (nextBtn) nextBtn.classList.add('chevron-hint');
function removeChevronHint() {
    if (nextBtn) nextBtn.classList.remove('chevron-hint');
    carouselElement.removeEventListener('slide.bs.carousel', removeChevronHint);
}
carouselElement.addEventListener('slide.bs.carousel', removeChevronHint);

carouselElement.addEventListener('slid.bs.carousel', handleCarouselSlide);
carouselElement.addEventListener('slid.bs.carousel', updateCarouselControls);

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