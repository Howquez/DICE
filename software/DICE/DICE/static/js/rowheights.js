console.log("Measuring rowheights ready!");

// Script to track and store the height of each row in a separate JSON string

// Define an array to store row height data
var rowHeightData = [];

// Function to handle when a row becomes visible or changes in visibility
function handleRowHeight(entries, observer) {
    entries.forEach((entry) => {
        const row = entry.target; // Get the observed row element
        const index = parseInt(row.id); // Assuming row IDs are integers for simplicity

        if (entry.isIntersecting) {
            // Row is visible or has become visible
            const height = row.offsetHeight; // Or row.getBoundingClientRect().height for more precise measurement
            const existingIndex = rowHeightData.findIndex(item => item.doc_id === index);

            if (existingIndex !== -1) {
                // Update existing entry
                rowHeightData[existingIndex].height = height;
            } else {
                // Add new entry
                rowHeightData.push({ doc_id: index, height: height });
            }
        }
    });

    // Update the hidden input field with the latest height data
    updateHeightDataStorage();
}

// Function to update the hidden input field with the latest height data
function updateHeightDataStorage() {
    // Serialize the rowHeightData array to a JSON string
    var serializedData = JSON.stringify(rowHeightData);
    // Find the hidden input field by its ID and update its value with the serialized data
    document.getElementById('rowheight_data').value = serializedData;
}

// Create an Intersection Observer to track row visibility changes
const heightObserver = new IntersectionObserver(handleRowHeight, {
    root: null, // Use the viewport as the root
    rootMargin: '0px', // No margin
    threshold: 0.1, // Trigger even with slight visibility, adjust as needed
});

// Observe all the table rows
document.querySelectorAll('tr').forEach((row) => {
    heightObserver.observe(row);
});

// Call this function to update the height for all currently visible rows
// Can be tied to a 'resize' event or called periodically
function updateVisibleRowHeights() {
    document.querySelectorAll('tr').forEach(row => {
        if (row.offsetHeight > 0) { // Simple check for visibility
            handleRowHeight([{target: row, isIntersecting: true}]);
        }
    });
}

// Ensure row heights are updated on window resize
window.addEventListener('resize', updateVisibleRowHeights);
