// =========================================================
// ดึงข่าวสารจาก Facebook ลงมาเป็นการ์ด + ระบบ Fullscreen Modal
// =========================================================

window.fbModalImages = [];
window.fbModalCurrentIndex = 0;
window.fbPostData = {};
window.fbAllPosts = []; // เก็บข้อมูลข่าวทั้งหมด
window.fbFeedCurrentPage = 1; // หน้าปัจจุบันของ Fullscreen Modal
window.fbFeedPageSize = 10; // จำนวนข่าวต่อหน้า

function replaceCalendarWithModernCards() {
    var calWrapper = document.getElementById('calendar-wrapper');
    if (!calWrapper) return;

    var titleText = calWrapper.querySelector('.title');
    if (titleText) {
        titleText.innerHTML = '<i class="fab fa-facebook-square" style="color:#1877F2; font-size: 1.2em; vertical-align: middle;"></i> ข่าวสารจากสำนักงานเขตคลองเตย';
        titleText.href = 'javascript:void(0);'; // เปลี่ยนไม่ให้เด้งไปหน้าอื่น
        titleText.removeAttribute('target');
        titleText.style.cursor = 'pointer';
        titleText.onclick = function(e) {
            e.preventDefault();
            openFbFeedModal();
        };
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

        const WORKER_API_URL = 'https://webportal-fb-api.kt-sd-project.workers.dev/';

        fetch(WORKER_API_URL)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                // จัดเรียงข้อมูลล่าสุดไปเก่าสุด
                data.sort((a, b) => new Date(b.date) - new Date(a.date));
                window.fbAllPosts = data; // เก็บข้อมูลทั้งหมดไว้ใน Global
                renderCards(data);
            })
            .catch(error => {
                console.error('❌ Error fetching Facebook posts:', error);
                var container = document.getElementById('fb-card-container');
                if (container) {
                    container.innerHTML = '<div style="text-align: center; width: 100%; padding: 40px; color: red;">เกิดข้อผิดพลาดในการโหลดข่าวสาร โปรดลองใหม่อีกครั้ง</div>';
                }
            });
    }
}

// ---------------------------------------------------------
// สร้าง Fullscreen Modal สำหรับดูข่าวทั้งหมด (10 ข่าว/หน้า)
// ---------------------------------------------------------
function createFbFeedModal() {
    if (document.getElementById('fb-feed-modal')) return;

    var feedModalHtml = `
        <div id="fb-feed-modal" class="fb-feed-overlay" onclick="closeFbFeedModal(event)">
            <div class="fb-feed-box" onclick="event.stopPropagation()">
                <div class="fb-feed-header">
                    <div class="fb-feed-title">
                        <i class="fab fa-facebook-square" style="color:#1877F2;"></i> ข่าวสารทั้งหมดจากสำนักงานเขตคลองเตย
                    </div>
                    <div>
                        <a href="https://www.facebook.com/khlongtoei599" target="_blank" class="fb-feed-pagelink" title="เปิดเพจบน Facebook"><i class="fas fa-external-link-alt"></i></a>
                        <button class="fb-feed-close" onclick="closeFbFeedModal(event)"><i class="fas fa-times"></i></button>
                    </div>
                </div>
                <div class="fb-feed-body" id="fb-feed-body-container">
                    <!-- โหลดรายการข่าว 10 ข่าว/หน้า ตรงนี้ -->
                </div>
                <div class="fb-feed-footer">
                    <button id="fb-feed-prev-btn" class="fb-page-btn" onclick="changeFbFeedPage(-1)"><i class="fas fa-chevron-left"></i> หน้าก่อนหน้า</button>
                    <span id="fb-feed-page-info" class="fb-page-info">หน้า 1 / 1</span>
                    <button id="fb-feed-next-btn" class="fb-page-btn" onclick="changeFbFeedPage(1)">หน้าถัดไป <i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', feedModalHtml);
}

window.openFbFeedModal = function() {
    createFbFeedModal();
    window.fbFeedCurrentPage = 1;
    renderFbFeedPage();
    document.getElementById('fb-feed-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeFbFeedModal = function(e) {
    if(e) e.preventDefault();
    document.getElementById('fb-feed-modal').classList.remove('active');
    document.body.style.overflow = '';
};

window.changeFbFeedPage = function(direction) {
    var totalPages = Math.ceil(window.fbAllPosts.length / window.fbFeedPageSize);
    var targetPage = window.fbFeedCurrentPage + direction;

    if (targetPage >= 1 && targetPage <= totalPages) {
        window.fbFeedCurrentPage = targetPage;
        renderFbFeedPage();
        // เลื่อนกลับไปบนสุดของ Modal Body เมื่อเปลี่ยนหน้า
        var bodyContainer = document.getElementById('fb-feed-body-container');
        if (bodyContainer) bodyContainer.scrollTop = 0;
    }
};

function renderFbFeedPage() {
    var container = document.getElementById('fb-feed-body-container');
    if (!container) return;

    var totalPosts = window.fbAllPosts.length;
    var totalPages = Math.ceil(totalPosts / window.fbFeedPageSize) || 1;
    var startIndex = (window.fbFeedCurrentPage - 1) * window.fbFeedPageSize;
    var endIndex = startIndex + window.fbFeedPageSize;
    var postsToShow = window.fbAllPosts.slice(startIndex, endIndex);

    // อัปเดตปุ่ม Pagination
    document.getElementById('fb-feed-page-info').textContent = 'หน้า ' + window.fbFeedCurrentPage + ' / ' + totalPages;
    document.getElementById('fb-feed-prev-btn').disabled = (window.fbFeedCurrentPage === 1);
    document.getElementById('fb-feed-next-btn').disabled = (window.fbFeedCurrentPage === totalPages);

    if (postsToShow.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding: 40px; color:#888;">ไม่พบข้อมูลข่าวสาร</div>';
        return;
    }

    var html = '<div class="fb-grid fb-feed-grid">';
    postsToShow.forEach(function(post) {
        var cardData = preparePostCardData(post);
        html += generateFbCardHtml(post, cardData);
    });
    html += '</div>';

    container.innerHTML = html;
}

// ---------------------------------------------------------
// ฟังก์ชันเตรียมข้อมูลรูปและวันที่ (ใช้ร่วมกันทั้งหน้าหลักและ Fullscreen)
// ---------------------------------------------------------
function preparePostCardData(post) {
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
    } catch(e) {}

    var textSnippet = post.text ? post.text : 'คลิกเพื่อดูรายละเอียดเพิ่มเติม';
    var encodedText = encodeURIComponent(textSnippet);
    
    var imgArray = ['https://via.placeholder.com/600x400/003366/FFFFFF?text=Khlong+Toei+News'];
    if (post.image) {
        try {
            var parsedImg = JSON.parse(post.image);
            if (Array.isArray(parsedImg) && parsedImg.length > 0) {
                var uniqueImages = [];
                var seenBases = new Set();
                parsedImg.forEach(function(url) {
                    var baseUrl = url.split('?')[0]; 
                    if (!seenBases.has(baseUrl)) {
                        seenBases.add(baseUrl);
                        uniqueImages.push(url);
                    }
                });
                imgArray = uniqueImages;
            }
        } catch (e) {
            imgArray = [post.image]; 
        }
    }

    // เก็บภาพเข้า Store Global สำหรับเปิด Popup รายละเอียดข่าว
    window.fbPostData[post.id] = imgArray;

    var coverHtml = '';
    if (imgArray.length === 1) {
        coverHtml = `<img src="${imgArray[0]}" class="fb-img" alt="cover" style="width: 100%; height: 160px; object-fit: cover; display: block;">`;
    } else {
        var moreBadge = imgArray.length > 2 
            ? `<div style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.75); color: #fff; padding: 3px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: bold; z-index: 2; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">+${imgArray.length - 2}</div>` 
            : '';
        
        coverHtml = `
            <div style="display: flex; height: 160px; width: 100%; overflow: hidden; position: relative;">
                <img src="${imgArray[0]}" style="width: 50%; height: 100%; object-fit: cover; border-right: 2px solid #fff;" alt="cover 1">
                <img src="${imgArray[1]}" style="width: 50%; height: 100%; object-fit: cover;" alt="cover 2">
                ${moreBadge}
            </div>
        `;
    }

    return {
        formattedDate: formattedDate,
        textSnippet: textSnippet,
        encodedText: encodedText,
        coverHtml: coverHtml
    };
}

function generateFbCardHtml(post, cardData) {
    return `
        <div class="fb-card" onclick="openFbModal('${post.id}', '${cardData.encodedText}', '${post.link}', '${cardData.formattedDate}')">
            ${cardData.coverHtml}
            <div class="fb-content">
                <div class="fb-date"><i class="far fa-clock"></i> ${cardData.formattedDate}</div>
                <div class="fb-text">${cardData.textSnippet}</div>
            </div>
        </div>
    `;
}

// ---------------------------------------------------------
// ฟังก์ชันสร้าง Popup รายละเอียดข่าวเดิม (ปรับปรุง Overflow เวลาปิด)
// ---------------------------------------------------------
function createFbModal() {
    if (document.getElementById('fb-custom-modal')) return;
    
    var modalHtml = `
        <div id="fb-custom-modal" class="fb-modal-overlay" onclick="closeFbModal(event)">
            <div class="fb-modal-box" onclick="event.stopPropagation()">
                <button class="fb-modal-close" onclick="closeFbModal(event)"><i class="fas fa-times"></i></button>
                
                <div style="position: relative; width: 100%; background: #000; display: flex; align-items: center; justify-content: center; min-height: 250px;">
                    <button id="fb-prev-btn" onclick="prevFbImage(event)" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.7); color: #333; border: none; border-radius: 50%; width: 40px; height: 40px; font-size: 1.2rem; cursor: pointer; z-index: 10; display: none; transition: 0.2s;"><i class="fas fa-chevron-left"></i></button>
                    
                    <img id="fb-modal-img" src="" class="fb-modal-img" alt="post image" style="width: 100%; max-height: 400px; object-fit: contain; background: #000; transition: opacity 0.2s ease-in-out;">
                    
                    <button id="fb-next-btn" onclick="nextFbImage(event)" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.7); color: #333; border: none; border-radius: 50%; width: 40px; height: 40px; font-size: 1.2rem; cursor: pointer; z-index: 10; display: none; transition: 0.2s;"><i class="fas fa-chevron-right"></i></button>
                    
                    <div id="fb-img-counter" style="position: absolute; bottom: 15px; right: 15px; background: rgba(0,0,0,0.6); color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; z-index: 10; display: none;">1 / 1</div>
                </div>

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

    document.getElementById('fb-prev-btn').onmouseover = function() { this.style.background = '#fff'; };
    document.getElementById('fb-prev-btn').onmouseout = function() { this.style.background = 'rgba(255,255,255,0.7)'; };
    document.getElementById('fb-next-btn').onmouseover = function() { this.style.background = '#fff'; };
    document.getElementById('fb-next-btn').onmouseout = function() { this.style.background = 'rgba(255,255,255,0.7)'; };
}

window.updateFbModalImage = function() {
    const imgEl = document.getElementById('fb-modal-img');
    const counterEl = document.getElementById('fb-img-counter');
    const prevBtn = document.getElementById('fb-prev-btn');
    const nextBtn = document.getElementById('fb-next-btn');

    imgEl.style.opacity = 0;
    setTimeout(() => {
        imgEl.src = window.fbModalImages[window.fbModalCurrentIndex];
        imgEl.style.opacity = 1;
    }, 150);

    if (window.fbModalImages.length > 1) {
        counterEl.style.display = 'block';
        counterEl.textContent = (window.fbModalCurrentIndex + 1) + ' / ' + window.fbModalImages.length;
        
        prevBtn.style.display = window.fbModalCurrentIndex > 0 ? 'block' : 'none';
        nextBtn.style.display = window.fbModalCurrentIndex < window.fbModalImages.length - 1 ? 'block' : 'none';
    } else {
        counterEl.style.display = 'none';
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    }
};

window.prevFbImage = function(e) {
    if(e) e.stopPropagation();
    if (window.fbModalCurrentIndex > 0) {
        window.fbModalCurrentIndex--;
        updateFbModalImage();
    }
};

window.nextFbImage = function(e) {
    if(e) e.stopPropagation();
    if (window.fbModalCurrentIndex < window.fbModalImages.length - 1) {
        window.fbModalCurrentIndex++;
        updateFbModalImage();
    }
};

window.openFbModal = function(postId, encodedText, link, date) {
    window.fbModalImages = window.fbPostData[postId] || ['https://via.placeholder.com/600x400/003366/FFFFFF?text=No+Image'];
    window.fbModalCurrentIndex = 0;
    
    updateFbModalImage(); 

    document.getElementById('fb-modal-text').textContent = decodeURIComponent(encodedText);
    document.getElementById('fb-modal-link').href = link;
    document.querySelector('#fb-modal-date span').textContent = date;
    
    document.getElementById('fb-custom-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeFbModal = function(e) {
    if(e) e.preventDefault();
    document.getElementById('fb-custom-modal').classList.remove('active');
    // เช็คว่าถ้า Fullscreen Feed Modal ยังเปิดอยู่ ไม่ต้องปลดล็อก scroll bar ของ body
    var feedModal = document.getElementById('fb-feed-modal');
    if (!feedModal || !feedModal.classList.contains('active')) {
        document.body.style.overflow = '';
    }
};

// =========================================================
// วาดการ์ด Facebook ลงในหน้าเว็บหลัก
// =========================================================
function renderCards(posts) {
    var container = document.getElementById('fb-card-container');
    if (!container) return;

    createFbModal();
    createFbFeedModal();

    if (!posts || posts.length === 0) {
        container.innerHTML = '<div style="text-align: center; width: 100%; padding: 40px; color: #888;">ไม่พบข้อมูลข่าวสารล่าสุด</div>';
        return;
    }

    var html = '';
    
    // ตัดข้อมูลมาวาดแค่ 12 โพสต์แรกสำหรับหน้า Index (ป้องกันเว็บอืด)
    // สำหรับหน้าจอมือถือ CSS จะซ่อนการ์ดใบที่ 7-12 ให้อัตโนมัติ (เหลือ 6 ใบ)
    var indexPosts = posts.slice(0, 12);
    
    indexPosts.forEach(function(post) {
        var cardData = preparePostCardData(post);
        html += generateFbCardHtml(post, cardData);
    });
    
    container.innerHTML = html;
}

// =========================================================
// ปรับแต่ง UI อื่นๆ (Sidebar และ Social Icons)
// =========================================================

function upgradeFloatingSidebar() {
    var sidebarSocial = document.querySelector('.fixed-left-wrapper .social-wrapper ul');
    if (!sidebarSocial) return;

    if (!sidebarSocial.classList.contains('upgraded')) {
        sidebarSocial.classList.add('upgraded');
        
        sidebarSocial.innerHTML = `
            <li class="messenger" style="margin-top: 5px; transition: transform 0.2s; display: flex; justify-content: center;">
                <a target="_blank" href="https://m.me/khlongtoei599" title="ติดต่อเราผ่าน Messenger" 
                   style="display: flex; justify-content: center; align-items: center; width: 45px; height: 45px; background: #0084FF; border-radius: 50%; box-shadow: 0 4px 15px rgba(0, 132, 255, 0.4); text-decoration: none;">
                    <i class="fab fa-facebook-messenger" style="color: #fff; font-size: 1.5rem;"></i>
                </a>
            </li>
        `;
    }
}

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

// =========================================================
// ฝังแผนที่ (Embed Map) ใน Footer
// =========================================================
function setupMapNavigation() {
    var mapContainer = document.querySelector('.group-footer.left .group-content-footer .text-content');
    
    if (mapContainer && !mapContainer.classList.contains('map-embedded')) {
        mapContainer.classList.add('map-embedded');
        
        var embedHtml = `
            <div style="margin-top: 5px; width: 100%; max-width: 450px;">
                <div style="border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; background: #fff;">
                    <iframe width="100%" height="250" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" 
                            src="https://maps.google.com/maps?q=สำนักงานเขตคลองเตย&t=&z=16&ie=UTF8&iwloc=&output=embed"
                            style="display: block;">
                    </iframe>
                </div>
                
                <a href="https://maps.app.goo.gl/GY4LhYZCkKfCtYBk7" target="_blank" 
                   style="display: flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(to right, #059669, #0d9488); color: #ffffff !important; text-decoration: none !important; padding: 12px; border-radius: 12px; font-size: 2rem; font-weight: bold; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); margin-top: 15px; transition: transform 0.2s;"
                   onmouseover="this.style.transform='scale(0.97)'" 
                   onmouseout="this.style.transform='scale(1)'">
                    📍 นำทางด้วย Google Maps
                </a>
            </div>
        `;
        
        mapContainer.innerHTML = embedHtml;
    }
}

// =========================================================
// แปลงโฉมข้อมูลสาธารณะ (Open Data / OIT)
// =========================================================
function upgradeOitSection() {
    var observer = new MutationObserver(function(mutations, me) {
        var oitSection = document.querySelector('.section-content[data-id="1_4262"]');
        
        if (oitSection && !oitSection.classList.contains('oit-upgraded')) {
            oitSection.classList.add('oit-upgraded');
            me.disconnect(); 

            var harvestedItems = [];
            var rows = oitSection.querySelectorAll('.main-content .row.no-gutters');

            rows.forEach(function(row) {
                var linkEl = row.querySelector('.desc-news a');
                if (!linkEl) return;
                
                var title = linkEl.innerText.trim().replace(/^-\s*/, '');
                var href = linkEl.href;

                var imgEl = row.querySelector('.img-news img');
                var imgSrc = imgEl ? imgEl.src : '';
                if (!imgSrc || imgSrc.includes('logo_default.jpg')) {
                    imgSrc = '/user_files/45/20594235356a47711c2fd409.91301971.png'; 
                }

                harvestedItems.push({
                    title: title,
                    link: href,
                    imgSrc: imgSrc
                });

                row.style.display = 'none'; 
            });

            if (harvestedItems.length > 0) {
                var mainContentContainer = oitSection.querySelector('.main-content');
                var cardsGridHtml = '<div class="oit-grid">';
                
                harvestedItems.forEach(function(item) {
                    cardsGridHtml += `
                        <div style="position:relative; display:flex; flex-direction:column; height: 100%;">
                            <a href="${item.link}" class="fb-card" style="flex-grow:1; text-decoration:none !important; display:flex; flex-direction:column; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.05); border:1px solid #eee;">
                                <img src="${item.imgSrc}" class="oit-card-img" alt="OIT Cover">
                                <div style="padding:15px; display:flex; flex-direction:column; justify-content: center; flex-grow:1;">
                                    <div class="oit-card-title">
                                        ${item.title}
                                    </div>
                                </div>
                            </a>
                        </div>
                    `;
                });
                
                cardsGridHtml += '</div>';
                mainContentContainer.insertAdjacentHTML('beforeend', cardsGridHtml);
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

// =========================================================
// ซ่อน Banner เมื่อไม่ได้อยู่หน้าแรก
// =========================================================
function hideBannerOnSubpages() {
    var currentUrl = window.location.href;
    
    var isHomePage = false;
    if (currentUrl.endsWith('/khlongtoei') || 
        currentUrl.endsWith('/khlongtoei/') || 
        currentUrl.includes('/page/main/6/หน้าแรก')) {
        isHomePage = true;
    }

    if (!isHomePage) {
        var bannerWrapper = document.querySelector('.banner-wrapper.onlyOne');
        
        if (bannerWrapper) {
            bannerWrapper.style.display = 'none';
        }
    }
}

// =========================================================
// จัดระเบียบที่อยู่และข้อมูลติดต่อใน Footer
// =========================================================
function upgradeFooterAddress() {
    var addressTitle = document.querySelector('.group-footer.left .title-footer h2.title');
    
    if (addressTitle && !addressTitle.classList.contains('address-upgraded')) {
        addressTitle.classList.add('address-upgraded');
        
        addressTitle.innerHTML = `
            <div style="text-align: right; color: #ffffff; line-height: 1.8; margin-bottom: 25px;">
                <strong style="font-size: 2.5rem; color: #fbbf24; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">สำนักงานเขตคลองเตย</strong><br>
                <span style="font-size: 2.0rem; font-weight: 300;">
                    599 สามแยกกล้วยน้ำไท แขวงคลองเตย เขตคลองเตย<br>
                    กรุงเทพมหานคร 10110
                </span>
                <div style="margin-top: 5px; font-size: 2.0rem; font-weight: 300;">
                    <div style="margin-bottom: 5px;">
                        โทรศัพท์ : 0 2240 2121 &nbsp;&nbsp;|&nbsp;&nbsp; โทรสาร : 0 2249 0260
                        <i class="fas fa-phone-alt" style="margin-left: 10px; color: #fbbf24;"></i> 
                    </div>
                    <div style="margin-bottom: 5px;">
                        E-Mail : <a href="mailto:saraban.khlongtoei@bangkok.go.th" style="color: #ffffff; text-decoration: none;">saraban.khlongtoei@bangkok.go.th</a>
                        <i class="fas fa-envelope" style="margin-left: 10px; color: #fbbf24;"></i> 
                    </div>
                    <div>
                        E-Mail : <a href="mailto:khlongtoei.district@gmail.com      " style="color: #ffffff; text-decoration: none;">khlongtoei.district@gmail.com</a>
                        <i class="fas fa-envelope" style="margin-left: 10px; color: #fbbf24;"></i> 
                    </div>
                </div>
            </div>
        `;
        
        addressTitle.style.margin = "0";
    }
}

// =========================================================
// ตัวสั่งรันฟังก์ชันทั้งหมด
// =========================================================
function initAllCustomScripts() {
    upgradeFloatingSidebar();
    upgradeFooterSocial();
    replaceCalendarWithModernCards();
    upgradeFooterAddress();
    setupMapNavigation();
    upgradeOitSection(); 
    hideBannerOnSubpages();
}

document.addEventListener("DOMContentLoaded", function() {
    initAllCustomScripts();
    setTimeout(initAllCustomScripts, 1000);
    setTimeout(initAllCustomScripts, 3000);
});

window.addEventListener("load", function() {
    initAllCustomScripts();
});
