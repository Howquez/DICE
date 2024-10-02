console.log("dwell ready")

// js vars
let dwell_threshold = js_vars.dwell_threshold
console.log("Dwell Threshold = " + dwell_threshold)

// Array to store row visibility duration data
var rowVisibilityData = [];

// Object to store information about currently visible rows
var visibleRows = {};

// Variable to track if the page is currently visible
var isPageVisible = true;

// Function to handle when a row becomes visible or hidden
function handleRowVisibility(entries, observer) {
    if (!isPageVisible) return; // Don't process if page is not visible

    const currentTime = Date.now();
    entries.forEach((entry) => {
        const row = entry.target;
        const index = parseInt(row.id);

        if (isNaN(index)) return; // Skip rows without valid IDs

        if (entry.isIntersecting) {
            // Row is visible
            if (!visibleRows[index]) {
                visibleRows[index] = currentTime;
            }
        } else {
            // Row is not visible
            if (visibleRows[index]) {
                const duration = (currentTime - visibleRows[index]) / 1000;
                rowVisibilityData.push({ doc_id: index, duration: Number(duration.toFixed(3)) });
                delete visibleRows[index];
            }
        }
    });

    updateViewportData();
}

// Function to update the dwell time for visible rows
function updateVisibleRowsDwellTime() {
    const currentTime = Date.now();
    Object.keys(visibleRows).forEach((index) => {
        const duration = (currentTime - visibleRows[index]) / 1000;
        rowVisibilityData.push({ doc_id: parseInt(index), duration: Number(duration.toFixed(3)) });
        delete visibleRows[index];
    });
    updateViewportData();
}

function updateViewportData() {
    document.getElementById('viewport_data').value = JSON.stringify(rowVisibilityData);
}

// Function to handle page visibility changes
function handleVisibilityChange() {
    if (document.hidden) {
        isPageVisible = false;
        // Page is now hidden, update dwell times
        updateVisibleRowsDwellTime();
    } else {
        isPageVisible = true;
        // Page is visible again, reset start times for visible rows
        const currentTime = Date.now();
        Object.keys(visibleRows).forEach(index => {
            visibleRows[index] = currentTime;
        });
    }
}

// Function to initialize the IntersectionObserver
function initializeObserver() {
    const observer = new IntersectionObserver(handleRowVisibility, {
        root: null,
        rootMargin: '0px',
        threshold: dwell_threshold / 100,
    });

    document.querySelectorAll('tr[id]').forEach(row => observer.observe(row));
    console.log('Visibility tracking initialized');

    // Add event listener for page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

// Wait for both window load and pre-loader completion
window.addEventListener('load', function() {
    // Check if pre-loader is still active
    if (document.getElementById('loadingScreen').classList.contains('d-none')) {
        initializeObserver();
    } else {
        // Wait for pre-loader to finish
        const checkPreloader = setInterval(function() {
            if (document.getElementById('loadingScreen').classList.contains('d-none')) {
                clearInterval(checkPreloader);
                initializeObserver();
            }
        }, 100); // Check every 100ms
    }
});

// Attach the function to the submit button click event
document.getElementById('submitButton').addEventListener('click', updateVisibleRowsDwellTime);

// Add an event listener for when the user is about to leave the page
window.addEventListener('beforeunload', updateVisibleRowsDwellTime);