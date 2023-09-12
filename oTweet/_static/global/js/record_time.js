console.log("time recording ready!")

// vars from otree
let tmpl = js_vars.template;

// Measure the time the calculator was opened
var startTime;
var endTime;
var increment = 0;
var sum = 0;

if (tmpl == "intro") {
    var trigger = document.getElementById('offcanvasGDPR');
    var output = document.getElementById("privacy_time")
}

if (tmpl == "decision") {
    var trigger = document.getElementById('offcanvasInstructions');
    var output = document.getElementById("instructions_time")
}

trigger.addEventListener('show.bs.offcanvas',
function () {
    startTime = Date.now()
})

trigger.addEventListener('hidden.bs.offcanvas',
function () {
    endTime = Date.now();
    increment = endTime - startTime;
    sum += increment

    output.value = sum/1000;
})