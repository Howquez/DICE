console.log("row hider ready!");

$( document ).ready(function() {
    $('.my_rows').fadeOut(duration=0);
    $('#tr-0').fadeIn(duration=0);
});

let rows = js_vars.rows + 1;
var i = 0

function rowhider(){
    var hidden_tr = $('.my_rows').filter(function(){
                return (this.id.replace('tr-','') <= i);
           });
    var shown_tr = $('.my_rows').filter(function(){
                return (this.id.replace('tr-','') == i+1);
           });

    if(i == rows - 1){
        $('.btn-outline-dark').hide();
        $('.btn-primary').fadeIn("slow");
    }else{
        i += 1
        $(hidden_tr).fadeOut("fast");
        $(shown_tr).fadeIn("slow");
    }
}

function rowdisplayer(){
    $('.my_rows').fadeIn(duration=0)
}