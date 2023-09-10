var cta;

function clicked_cta(){
    cta = document.getElementById('cta')
    cta.value = 'True'
}


var arr;
var update;

function sequence(item){
    arr = document.getElementById('scroll_sequence').value;
    update = arr + '-' + item
    document.getElementById('scroll_sequence').value = update;
    console.log(update)
}