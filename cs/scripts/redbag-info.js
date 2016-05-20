$('.tabs').delegate('.menu', 'click', function() {
    $('.tabs li').removeClass('active');
    $(this).addClass('active');
    typeModule = $(this).attr('type') == 'web' ? 1 : 2;
    if (typeModule === 1) {
        $('.list-item:first-child').show();
        $('.list-item:last-child').hide();
    } else {
        $('.list-item:last-child').show();
        $('.list-item:first-child').hide();
    }
});
