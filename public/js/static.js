window.mdc.autoInit();

const featuresBtn = document.getElementById('features-button');
const featuresMenu = new mdc.menu.MDCMenu(document.getElementById('features-menu'));
featuresBtn.addEventListener('click',function(){
    featuresMenu.open = true;
})

const solutionsBtn = document.getElementById('solutions-button');
const solutionsMenu = new mdc.menu.MDCMenu(document.getElementById('solutions-menu'));
solutionsBtn.addEventListener('click',function(){
    solutionsMenu.open = true;
})


// const menu = new mdc.iconButton.MDCIconButtonToggle(document.getElementById('menu'))
// menu.listen('MDCIconButtonToggle:change', function (event) {

// })


function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

