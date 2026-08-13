(function loadMyAssets() {
    var head = document.getElementsByTagName('head')[0];
    var timestamp = new Date().getTime(); 

    var css1 = document.createElement('link');
    css1.rel = 'stylesheet';
    css1.href = 'https://ktsdproject.github.io/webportalstyle/style.css?v=' + timestamp;
    head.appendChild(css1);

    var css2 = document.createElement('link');
    css2.rel = 'stylesheet';
    css2.href = 'https://ktsdproject.github.io/webportalstyle/app.css?v=' + timestamp;
    head.appendChild(css2);

    var js1 = document.createElement('script');
    js1.src = 'https://ktsdproject.github.io/webportalstyle/script.js?v=' + timestamp;
    head.appendChild(js1);

    var js2 = document.createElement('script');
    js2.src = 'https://ktsdproject.github.io/webportalstyle/app.js?v=' + timestamp;
    head.appendChild(js2);
})();
