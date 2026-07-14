function replaceCalendarWithModernCards() {
    var calWrapper = document.getElementById('calendar-wrapper');
    if (!calWrapper) return;

    var titleText = calWrapper.querySelector('.title');
    if (titleText) {
        titleText.innerHTML = '<i class="fab fa-facebook-square" style="color:#1877F2; font-size: 1.2em; vertical-align: middle;"></i> อัปเดตข่าวสารจากเพจเขตคลองเตย';
        titleText.href = 'https://www.facebook.com/khlongtoei599';
        titleText.target = '_blank';
    }

    var descElements = calWrapper.querySelectorAll('.desc, .group-gotoall');
    descElements.forEach(function(el) { el.style.display = 'none'; });

    var mainContent = calWrapper.querySelector('.main-content');
    if (mainContent && !mainContent.classList.contains('cards-loaded')) {
        mainContent.classList.add('cards-loaded');
        
        mainContent.innerHTML = `
            <div class="container">
                <div class="fb-grid" id="fb-card-container">
                    <div style="text-align: center; width: 100%; padding: 40px; color: #888;">
                        กำลังโหลดข่าวสารล่าสุด...
                    </div>
                </div>
            </div>
        `;

        var GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxdEAeHYEB4DL2qzEQSN8YEXrTKfjggtqaoo1tBuAEoOi3z0fNggnZqZTp1HN9Ia_E6/exec';

        fetch(GAS_WEB_APP_URL)
            .then(response => response.json())
            .then(data => {
                // สมมติว่าอยากโชว์แค่ 12 การ์ดล่าสุด ก็ใช้ .slice(0, 12) ตัดข้อมูลเอาครับ
                renderCards(data.slice(0, 12)); 
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }
}

function renderCards(posts) {
    var container = document.getElementById('fb-card-container');
    if (!container) return;

    var html = '';
    posts.forEach(function(post) {
        html += `
            <a href="${post.link}" target="_blank" class="fb-card">
                <img src="${post.image}" class="fb-img" alt="cover">
                <div class="fb-content">
                    <div class="fb-date"><i class="far fa-calendar-alt"></i> ${post.date}</div>
                    <div class="fb-text">${post.text}</div>
                </div>
            </a>
        `;
    });
    
    container.innerHTML = html;
}

replaceCalendarWithModernCards();
setTimeout(replaceCalendarWithModernCards, 1000);
setTimeout(replaceCalendarWithModernCards, 3000);
