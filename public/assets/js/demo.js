$(function() {
    "use strict";
    skinChanger();
    CustomScrollbar();
    initSparkline();
    initCounters();
    CustomPageJS();
});
// Sparkline
function initSparkline() {
    $(".sparkline").each(function() {
        var $this = $(this);
        $this.sparkline('html', $this.data());
    });
}
// Counters JS 
function initCounters() {
    $('.count-to').countTo();
}
//Skin changer
function skinChanger() {
    $('.right-sidebar .choose-skin li').on('click', function() {
        var $body = $('body');
        var $this = $(this);

        var existTheme = $('.right-sidebar .choose-skin li.active').data('theme');
        $('.right-sidebar .choose-skin li').removeClass('active');
        $body.removeClass('theme-' + existTheme);
        $this.addClass('active');
        $body.addClass('theme-' + $this.data('theme'));
    });
}
// All Custom Scrollbar JS
function CustomScrollbar() {
    $('.ls-closed .sidebar .list').slimscroll({
        height: 'calc(100vh - 0px)',
        color: 'rgba(0,0,0,0.2)',
        position: 'left',
        size: '2px',
        alwaysVisible: false,
        borderRadius: '3px',
        railBorderRadius: '0'
    });

    $('.navbar-nav .dropdown-menu .body .menu').slimscroll({
        height: '250px',
        color: 'rgba(0,0,0,0.2)',
        size: '3px',
        alwaysVisible: false,
        borderRadius: '3px',
        railBorderRadius: '0'
    });
    $('.cwidget-scroll').slimscroll({
        height: '306px',
        color: 'rgba(0,0,0,0.4)',
        size: '2px',
        alwaysVisible: false,
        borderRadius: '3px',
        railBorderRadius: '2px'
    });

    $('.right_chat .chat_body .chat-widget').slimscroll({
        height: 'calc(100vh - 145px)',
        color: 'rgba(0,0,0,0.1)',
        size: '2px',
        alwaysVisible: false,
        borderRadius: '3px',
        railBorderRadius: '2px',
        position: 'left',
    });

    $('.right-sidebar .slim_scroll').slimscroll({
        height: 'calc(100vh - 60px)',
        color: 'rgba(0,0,0,0.4)',
        size: '2px',
        alwaysVisible: false,
        borderRadius: '3px',
        railBorderRadius: '0'
    });
   
}
function CustomPageJS() {
    $(".boxs-close").on('click', function(){
        var element = $(this);
        var cards = element.parents('.card');
        cards.addClass('closed').fadeOut();
    });

    $('.sub_menu_btn').on('click', function() {
        $('.sub_menu').toggleClass('show');
    });

    // Theme Light and Dark  ============
    $('.theme-light-dark .t-light').on('click', function() {
        $('body').removeClass('menu_dark');
    });

    $('.theme-light-dark .t-dark').on('click', function() {
        $('body').addClass('menu_dark');
    });

    //Chat widget js ====
    $(document).ready(function(){
        $(".btn_overlay").on('click',function(){
            $(".overlay_menu").fadeToggle(200);
        $(this).toggleClass('btn-open').toggleClass('btn-close');
        });
    });
    $('.overlay_menu').on('click', function(){
        $(".overlay_menu").fadeToggle(200);   
        $(".overlay_menu button.btn").toggleClass('btn-open').toggleClass('btn-close');
        open = false;
    });
    //=========
    $('.form-control').on("focus", function() {
        $(this).parent('.input-group').addClass("input-group-focus");
    }).on("blur", function() {
        $(this).parent(".input-group").removeClass("input-group-focus");
    });
}