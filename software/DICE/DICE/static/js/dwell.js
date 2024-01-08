// Define an array to store row visibility duration data
var rowVisibilityData = [];

// Object to store information about currently visible rows
var visibleRows = {};

// Function to handle when a row becomes visible or hidden
function handleRowVisibility(entries, observer) {
    entries.forEach((entry) => {
        const row = entry.target; // Get the observed row element
        const index = parseInt(row.id);

        if (entry.isIntersecting) {
            // Row is visible
            if (!visibleRows[index]) {
                visibleRows[index] = Date.now(); // Record the timestamp when it became visible
            }
        } else {
            // Row is not visible
            if (visibleRows[index]) {
                const duration = Date.now() - visibleRows[index]; // Calculate the duration
                rowVisibilityData.push({ doc_id: index, duration: duration / 1000 });
                delete visibleRows[index]; // Remove from visibleRows
            }
        }
    });

    // Update the value of 'viewport_data'
    document.getElementById('viewport_data').value = JSON.stringify(rowVisibilityData);
}

// Function to update the dwell time for visible rows
function updateVisibleRowsDwellTime() {
    Object.keys(visibleRows).forEach((index) => {
        const duration = Date.now() - visibleRows[index];
        rowVisibilityData.push({ doc_id: parseInt(index), duration: duration / 1000 });
        delete visibleRows[index];
    });
}

// Create an Intersection Observer
const observer = new IntersectionObserver(handleRowVisibility, {
    root: null, // Use the viewport as the root
    rootMargin: '0px', // No margin
    threshold: 0.5, // Trigger when at least 50% of the element is in the viewport
});

// Get all the table rows and observe them
const tableRows = document.querySelectorAll('tr');
tableRows.forEach((row) => {
    observer.observe(row);
});

// Attach the function to the submit button click event
document.getElementById('submitButton').addEventListener('click', function() {
    updateVisibleRowsDwellTime();
    // Here, you might also want to add any other actions to be performed on submit
    // For example, you can put the code to handle the form submission here
});
