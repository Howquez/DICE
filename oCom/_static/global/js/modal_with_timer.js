console.log("modal ready!")

var modal = document.getElementById("modal")
var modal_button = document.getElementById("modal_button")

$(document).ready(function(){
    $(modal).modal('show')
});

setTimeout(function(){
	$(modal_button).prop('disabled', false);
	$(modal_button).attr('class', 'btn btn-outline-primary');
}, 5000);