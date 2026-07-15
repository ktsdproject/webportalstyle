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

// ปรับแต่งเมนูด้านซ้าย (เหลือแค่ปุ่ม Messenger)
function upgradeFloatingSidebar() {
    // social-wrapper
    var sidebarSocial = document.querySelector('.fixed-left-wrapper .social-wrapper ul');
    if (!sidebarSocial) return;

    if (!sidebarSocial.classList.contains('upgraded')) {
        sidebarSocial.classList.add('upgraded');
        
        // ล้างของเดิม ใส่ Messenger 
        sidebarSocial.innerHTML = `
            <li class="messenger" style="margin-top: 15px; transition: transform 0.2s; display: flex; justify-content: center;">
                <a target="_blank" href="https://m.me/khlongtoei599" title="ติดต่อเราผ่าน Messenger" 
                   style="display: flex; justify-content: center; align-items: center; width: 45px; height: 45px; background: #0084FF; border-radius: 50%; box-shadow: 0 4px 15px rgba(0, 132, 255, 0.4); text-decoration: none;">
                    <i class="fab fa-facebook-messenger" style="color: #fff; font-size: 1.5rem;"></i>
                </a>
            </li>
        `;
    }
}

// สั่งรันแบบหน่วงเวลา
upgradeFloatingSidebar();
setTimeout(upgradeFloatingSidebar, 1000);
setTimeout(upgradeFloatingSidebar, 3000);


// ปรับแต่งเมนู Social Media ด้านล่าง ให้มี FbTT
function upgradeFooterSocial() {
    var allSocialWrappers = document.querySelectorAll('.social-wrapper ul');
    
    allSocialWrappers.forEach(function(ul) {
        if (!ul.closest('.fixed-left-wrapper')) {
            if (!ul.classList.contains('footer-upgraded')) {
                ul.classList.add('footer-upgraded');
                
                ul.style.display = 'flex';
                ul.style.flexDirection = 'column';
                ul.style.gap = '15px';
                ul.style.alignItems = 'flex-start';


                ul.innerHTML = `
                    <li style="list-style: none !important; margin: 0 !important; padding: 0 !important;">
                        <a href="https://www.facebook.com/khlongtoei599/" target="_blank" title="facebook" 
                           style="display: flex !important; align-items: center !important; text-decoration: none !important; width: max-content !important; height: auto !important; background: transparent !important; padding: 0 !important; border-radius: 0 !important;">
                            <!-- ใช้ FontAwesome แทนรูปภาพเดิม เพื่อหลีกเลี่ยง CSS เก่า -->
                            <i class="fab fa-facebook" style="color: #ffffff !important; font-size: 3.0rem !important; margin: 0 !important;"></i>
                            <span style="color: #ffffff !important; margin-left: 15px !important; font-size: 1.5rem !important; font-weight: 500 !important; white-space: nowrap !important;">Facebook สำนักงานเขตคลองเตย</span>
                        </a>
                    </li>
                    <li style="list-style: none !important; margin: 0 !important; padding: 0 !important;">
                        <a href="https://www.tiktok.com/@khlongtoei_district" target="_blank" title="tiktok" 
                           style="display: flex !important; align-items: center !important; text-decoration: none !important; width: max-content !important; height: auto !important; background: transparent !important; padding: 0 !important; border-radius: 0 !important;">
                            <i class="fab fa-tiktok" style="color: #ffffff !important; font-size: 1.3rem !important; background: #000000 !important; width: 35px !important; height: 35px !important; display: flex !important; justify-content: center !important; align-items: center !important; border-radius: 50% !important; margin: 0 !important;"></i>
                            <span style="color: #ffffff !important; margin-left: 15px !important; font-size: 1.5rem !important; font-weight: 500 !important; white-space: nowrap !important;">TikTok สำนักงานเขตคลองเตย</span>
                        </a>
                    </li>
                `;
            }
        }
    });
}

// สั่งรันแบบหน่วงเวลา
upgradeFooterSocial();
setTimeout(upgradeFooterSocial, 1000);
setTimeout(upgradeFooterSocial, 3000);

replaceCalendarWithModernCards();
setTimeout(replaceCalendarWithModernCards, 1000);
setTimeout(replaceCalendarWithModernCards, 3000);


