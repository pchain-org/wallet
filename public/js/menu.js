/**
 * Created by skykingit on 2017/3/31.
 */


const links = document.querySelectorAll('link[rel="import"]')

// Import and add each page to the DOM
Array.prototype.forEach.call(links, function (link) {
    let template = link.import.querySelector('.task-template')
    let clone = document.importNode(template.content, true)
    if (link.href.match('menu.html')) {
        document.querySelector('.leftHideMenu').appendChild(clone) //导入menu.html
    } else{
        var temArr = link.href.split('/');
        var SubPageName = temArr[temArr.length-1].replace('.html','');
        var htmlAreaClass = SubPageName+"SubPage";
        document.querySelector('.'+htmlAreaClass).appendChild(clone);
    }
})

$(function () {
    var menuBtn = $('#menuBtn');

    menuBtn.on('click',function () {
        var tar = $(this);
        $('body').toggleClass('menu-open');
        console.log('in menubtn');

    });

    var subPage = $('#pageContent .subPage');
    var menuItem = $('.leftHideMenu  li');
    menuItem.on('click',function (e) {
        console.log("in...");
        var tar = $(this);
        var index = menuItem.index(tar);
        menuItem.removeClass('active');
        menuItem.eq(index).addClass('active');

        subPage.hide();
        subPage.eq(index).show();

        //点击blockinfo时候调用函数
        var scope=angular.element('#angularApp').scope();
        if(index == 3){
            scope.getBlockInfo();
            scope.getBlockLoop();
        }else{
            clearInterval(scope.blockLoopFlag);
        }

    });
});

