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
    var rcard_review_box = document.querySelectorAll('.rcard_review_box_btn');
    var rcard_review_open_box = document.querySelectorAll('.rcard_review_box');
    if (rcard_review_box) {
        for (var i = 0; i < rcard_review_box.length; i++) {
            rcard_review_box[i].addEventListener('click', function (e) {
                e.stopPropagation();
                var el = this;
                if(el.parentNode.classList.contains('active')){
                    el.parentNode.classList.remove('active');
                } else {
                    for (var i = 0; i < rcard_review_open_box.length; i++) {
                        rcard_review_open_box[i].classList.remove('active');
                    }
                    el.parentNode.classList.add('active');
                }
            });
        }
    }

    window.addEventListener('click', function(e){
        if(rcard_review_open_box){
            const isClosest = e.target.closest('.rcard_review_box');
            for (var i = 0; i < rcard_review_open_box.length; i++) {
                if ( isClosest == null ) {
                    rcard_review_open_box[i].classList.remove('active');
                }
            }
        }

    });


    var review_pop_swiper = document.querySelectorAll('.review-pop-swiper');
    if (review_pop_swiper) {
        var review_pop_swipers = new Swiper('.review-pop-swiper', {
            loop: true,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
    }



});