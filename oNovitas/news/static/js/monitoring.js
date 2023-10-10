// Define an array to store row visibility duration data
var rowVisibilityData = [];

// Object to store information about currently visible rows
var visibleRows = {};

// Function to monitor row visibility duration
function monitorRowVisibility() {
    var tableRows = document.querySelectorAll('tr'); // Select all table rows

    // Iterate through the table rows
    tableRows.forEach(function(row, index) {
        var rowRect = row.getBoundingClientRect();

        // Check if the row is fully or partially in the viewport
        var isVisible = rowRect.top < window.innerHeight && rowRect.bottom >= 0;

        if (isVisible) {
            // Row is visible, but not in the visibleRows object, so it just became visible
            if (!visibleRows[index]) {
                visibleRows[index] = Date.now(); // Record the timestamp when it became visible
            }
        } else {
            // Row is not visible and was previously in the visibleRows object, so it just became invisible
            if (visibleRows[index]) {
                var duration = Date.now() - visibleRows[index]; // Calculate the duration
                rowVisibilityData.push({ doc_id: parseInt(row.id), duration: duration/1000 });
                delete visibleRows[index]; // Remove from visibleRows
            }
        }
    });

    // You can perform further analysis or actions with the row visibility duration data here

    // Log the row visibility duration data to the console (for demonstration purposes)
    console.log(rowVisibilityData);
    document.getElementById('viewport_data').value = JSON.stringify(rowVisibilityData);
}

// Attach the monitorRowVisibility function to the scroll event
window.addEventListener('scroll', monitorRowVisibility);

// Attach the monitorRowVisibility function to the touchmove event for mobile devices
window.addEventListener('touchmove', monitorRowVisibility);