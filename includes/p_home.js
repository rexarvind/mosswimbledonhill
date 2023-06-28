function site_ready(callbackFunc) {
    if (document.readyState !== 'loading') {
        // Document is already ready, call the callback directly
        callbackFunc();
    } else if (document.addEventListener) {
        // All modern browsers to register DOMContentLoaded
        document.addEventListener('DOMContentLoaded', callbackFunc);
    } else {
        // Old IE browsers
        document.attachEvent('onreadystatechange', function () {
            if (document.readyState === 'complete') {
                callbackFunc();
            }
        });
    }
}

site_ready(function () {
    var rcard_review_box = document.querySelectorAll('.rcard_review_box');
    if (rcard_review_box) {
        for (var i = 0; i < rcard_review_box.length; i++) {
            rcard_review_box[i].addEventListener('click', function () {
                console.log(this);
            });
        }
    }

});