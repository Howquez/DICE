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

    // You can perform further analysis or actions with the row visibility duration data here
    // Log the row visibility duration data to the console (for demonstration purposes)
    console.log(rowVisibilityData);

    // Update the value of 'viewport_data'
    document.getElementById('viewport_data').value = JSON.stringify(rowVisibilityData);
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
