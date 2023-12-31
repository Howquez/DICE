
var off_canvases = document.querySelectorAll(".offcanvas");

off_canvases.forEach(function(off_canvas) {
    let time_spent = 0;
    let start_time = 0;
    var input_field  = off_canvas.querySelector(".time-field");
    var total_time = 0;

    off_canvas.addEventListener("show.bs.offcanvas", function () {
        start_time = new Date().getTime(); // Record the start time
        console.log('hi')
    });

    off_canvas.addEventListener("hide.bs.offcanvas", function () {
        const end_time = new Date().getTime(); // Record the end time
        const elapsed_time = (end_time - start_time)/1000; // Calculate the elapsed time in milliseconds
        total_time = parseFloat(elapsed_time) + parseFloat(total_time);
        liveSend(input_field.id + '=' + elapsed_time);
        console.log("Total time open: " + (total_time) + " seconds");
    });
});