function replaceCalendarWithModernCards() {
    var calWrapper = document.getElementById('calendar-wrapper');
    if (!calWrapper) return;

    var titleText = calWrapper.querySelector('.title');
    if (titleText) {
        titleText.innerHTML = '<i class="fab fa-facebook-square" style="color:#1877F2; font-size: 1.2em; vertical-align: middle;"></i> ข่าวสารจากเพจเขตคลองเตย';
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
                // สมมติว่าอยากโชว์แค่ 12 การ์ดล่าสุด ก็ใช้ .slice(0, 12) ตัดข้อมูล
                renderCards(data.slice(0, 12)); 
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }
}

// สร้างกล่อง Popup ซ่อนไว้ในหน้าเว็บ
function createFbModal() {
    // ถ้ามีแล้วไม่ต้องสร้างใหม่
    if (document.getElementById('fb-custom-modal')) return;
    
    var modalHtml = `
        <div id="fb-custom-modal" class="fb-modal-overlay" onclick="closeFbModal(event)">
            <div class="fb-modal-box" onclick="event.stopPropagation()">
                <button class="fb-modal-close" onclick="closeFbModal(event)"><i class="fas fa-times"></i></button>
                <img id="fb-modal-img" src="" class="fb-modal-img" alt="post image">
                <div class="fb-modal-body">
                    <div id="fb-modal-date" style="color: #65676B; font-size: 0.9rem; margin-bottom: 15px; font-weight:600;">
                        <i class="far fa-clock"></i> <span></span>
                    </div>
                    <div id="fb-modal-text" class="fb-modal-text"></div>
                </div>
                <div class="fb-modal-footer">
                    <a id="fb-modal-link" href="#" target="_blank" class="fb-btn">
                        <i class="fab fa-facebook"></i> ดูโพสต์ต้นฉบับบน Facebook
                    </a>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// ฟังก์ชันเปิด/ปิด Popup
window.openFbModal = function(image, text, link, date) {
    document.getElementById('fb-modal-img').src = image;
    document.getElementById('fb-modal-text').textContent = decodeURIComponent(text);
    document.getElementById('fb-modal-link').href = link;
    document.querySelector('#fb-modal-date span').textContent = date;
    
    document.getElementById('fb-custom-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeFbModal = function(e) {
    if(e) e.preventDefault();
    document.getElementById('fb-custom-modal').classList.remove('active');
    document.body.style.overflow = '';
};

// ฟังก์ชันวาดการ์ด 
function renderCards(posts) {
    var container = document.getElementById('fb-card-container');
    if (!container) return;

    createFbModal();

    var html = '';
    posts.forEach(function(post) {
        var formattedDate = post.date; 
        try {
            var d = new Date(post.date);
            if(!isNaN(d.getTime())) {
                var hh = String(d.getHours()).padStart(2, '0');
                var mm = String(d.getMinutes()).padStart(2, '0');
                var dd = String(d.getDate()).padStart(2, '0');
                var mo = String(d.getMonth() + 1).padStart(2, '0');
                var yyyy = d.getFullYear();
                
                formattedDate = hh + '.' + mm + ' ' + dd + '-' + mo + '-' + yyyy;
            }
        } catch(e) {
            console.log("Date parsing error", e);
        }

        var encodedText = encodeURIComponent(post.text);
        
        html += `
            <div class="fb-card" onclick="openFbModal('${post.image}', '${encodedText}', '${post.link}', '${formattedDate}')">
                <img src="${post.image}" class="fb-img" alt="cover">
                <div class="fb-content">
                    <div class="fb-date"><i class="far fa-clock"></i> ${formattedDate}</div>
                    <div class="fb-text">${post.text}</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}
// =========================================================
// อัปเกรดปุ่ม Social Media ใน Footer 
// =========================================================
function upgradeSocialFooter() {
    // วิ่งหากล่อง social-wrapper ในหน้าเว็บ
    var socialWrapper = document.querySelector('.social-wrapper ul');
    if (!socialWrapper) return;

    // ถ้ายังไม่ได้อัปเกรด ค่อยทำงาน (ป้องกันการรันซ้ำ)
    if (!socialWrapper.classList.contains('upgraded')) {
        socialWrapper.classList.add('upgraded');
        
        // ปรับ CSS ของกล่อง ul ให้เรียงเป็นแนวตั้งสวยๆ
        socialWrapper.style.display = 'flex';
        socialWrapper.style.flexDirection = 'column';
        socialWrapper.style.gap = '15px';
        socialWrapper.style.alignItems = 'flex-start';

        // ยัด HTML ตัวใหม่เข้าไปแทนที่ของเดิม (รวม TikTok)
        socialWrapper.innerHTML = `
            <li class="facebook" style="width: 100%; transition: transform 0.2s;">
                <a href="https://www.facebook.com/khlongtoei599/" target="_blank" title="facebook" style="display: flex; align-items: center; text-decoration: none;">
                    <img src="/template1/assets/images/icons/icon-social-facebook.svg" alt="icon" style="width: 35px; height: 35px;">
                    <span style="color: #ffffff; margin-left: 15px; font-size: 1.1rem; font-weight: 500;">Facebook สำนักงานเขตคลองเตย</span>
                </a>
            </li>
            <li class="tiktok" style="width: 100%; transition: transform 0.2s;">
                <a href="https://www.tiktok.com/@khlongtoei_district" target="_blank" title="tiktok" style="display: flex; align-items: center; text-decoration: none;">
                    <!-- ใช้ FontAwesome สร้างไอคอน TikTok พื้นหลังดำ -->
                    <i class="fab fa-tiktok" style="color: #ffffff; font-size: 1.3rem; background: #000000; width: 35px; height: 35px; display: flex; justify-content: center; align-items: center; border-radius: 50%;"></i>
                    <span style="color: #ffffff; margin-left: 15px; font-size: 1.1rem; font-weight: 500;">TikTok สำนักงานเขตคลองเตย</span>
                </a>
            </li>
        `;
    }
}

//  setTimeout หน่วงเวลาโหลด)
upgradeSocialFooter();
setTimeout(upgradeSocialFooter, 1000);
setTimeout(upgradeSocialFooter, 3000);

replaceCalendarWithModernCards();
setTimeout(replaceCalendarWithModernCards, 1000);
setTimeout(replaceCalendarWithModernCards, 3000);


