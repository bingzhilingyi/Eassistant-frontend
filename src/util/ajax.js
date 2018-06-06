import $ from 'jquery';

var my_ajax = (opt) => {
    $.ajax({
        ...opt,
        async: true,
        dataType: 'json',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
    })
}

export default my_ajax