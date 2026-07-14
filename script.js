function replaceCalendarWithFacebook() {
    var calWrapper = document.getElementById('calendar-wrapper');
    
    if (calWrapper) {
        var titleText = calWrapper.querySelector('.title');
        if (titleText) {
            titleText.innerHTML = '<i class="fab fa-facebook-square" style="color:#1877F2;"></i> ข่าวสารจาก Facebook';
            titleText.href = 'https://www.facebook.com/khlongtoei599';
            titleText.target = '_blank';
        }
        
        var descTexts = calWrapper.querySelectorAll('.desc');
        descTexts.forEach(function(el) { el.style.display = 'none'; });
        
        var btnAll = calWrapper.querySelector('.group-gotoall');
        if (btnAll) btnAll.style.display = 'none';
        
        var mainContent = calWrapper.querySelector('.main-content');
        if (mainContent && !mainContent.classList.contains('fb-loaded')) {
            mainContent.classList.add('fb-loaded');
            mainContent.innerHTML = `
                <div style="display: flex; justify-content: center; width: 100%; padding: 10px 0;">
                    <iframe src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fkhlongtoei599&tabs=timeline&width=500&height=600&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true" 
                    width="500" height="600" style="border:none; overflow:hidden; max-width:100%; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" 
                    scrolling="no" frameborder="0" allowTransparency="true" allow="encrypted-media"></iframe>
                </div>
            `;
        }
    }
}


replaceCalendarWithFacebook();
setTimeout(replaceCalendarWithFacebook, 1000);
setTimeout(replaceCalendarWithFacebook, 3000);
