console.log('hover: ready!')

    var arr;
    var update;

    function sequence(item){
        arr = document.getElementById('scroll_sequence').value;
        update = arr + '-' + item
        document.getElementById('scroll_sequence').value = update;
    }