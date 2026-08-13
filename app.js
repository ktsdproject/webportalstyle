// =========================================================
// ไฟล์: app.js (ระบบ SPA ใหม่ เขตคลองเตย V2 + Facebook)
// =========================================================

const mockData = {
    news: [
        { id: 1, dept: "ฝ่ายโยธา", title: "ซ่อมแซมผิวจราจร ซอยสุขุมวิท 50", date: "2026-08-13" },
        { id: 2, dept: "ฝ่ายการคลัง", title: "ประกาศผลการประกวดราคา ซื้อกล้อง CCTV", date: "2026-08-12" }
    ]
};

// ตัวแปร Global 
let bannerInterval = null;
let fbPostData = {}; // เก็บข้อมูลรูปภาพแยกตามโพสต์
let fbModalImages = []; // เก็บรูประหว่างเปิด Popup
let fbModalCurrentIndex = 0;

// =========================================================
// 1. ฟังก์ชัน ยึดพื้นที่เว็บ (Hijack DOM)
// =========================================================
function initSPA() {
    if (!window.location.hash || window.location.hash === '#') return; 

    document.body.innerHTML = '<div id="app-root"></div>';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = '#f4f7f6';
    document.body.style.fontFamily = "'Kanit', sans-serif";

    router();
}

// =========================================================
// 2. ระบบสลับหน้า (Router)
// =========================================================
function router() {
    const appRoot = document.getElementById('app-root');
    if (!appRoot) return;

    let hash = window.location.hash;
    if (hash === '') hash = '#index'; 

    if (bannerInterval) {
        clearInterval(bannerInterval);
        bannerInterval = null;
    }

    appRoot.innerHTML = '';
    appRoot.innerHTML = renderNavbar();

    const mainContent = document.createElement('main');
    mainContent.className = 'container';
    appRoot.appendChild(mainContent);

    switch (hash) {
        case '#index':
            mainContent.innerHTML = PageHome();
            initBannerSlider(); 
            fetchFbPosts(); // <--- สั่งโหลด Facebook ทันทีที่เข้าหน้าแรก
            break;
        case '#news':
            mainContent.innerHTML = PageNews();
            break;
        default:
            mainContent.innerHTML = `<h2 style="text-align:center; margin-top:50px; color: #dc3545;">❌ 404 ไม่พบหน้าที่ต้องการ</h2>`;
            break;
    }
}

// =========================================================
// 3. Components (ชิ้นส่วนหน้าจอ)
// =========================================================
function renderNavbar() {
    return `
        <nav class="spa-navbar">
            <div class="nav-brand">
                <i class="fas fa-building"></i> สำนักงานเขตคลองเตย
            </div>
            <div class="nav-links">
                <a href="#index"><i class="fas fa-home"></i> หน้าหลัก</a>
                <a href="#news"><i class="fas fa-newspaper"></i> ข่าวสารระบบใหม่</a>
            </div>
        </nav>
    `;
}

function PageHome() {
    return `
        <div class="portal-container">
            <div id="spa-banner-wrapper">
                <div class="banner-container">
                    <div class="banner-loading">กำลังเตรียมแบนเนอร์...</div>
                </div>
            </div>

            <div class="profile-hero">
                <div class="avatar"><i class="fas fa-building"></i></div>
                <div>
                    <h2>ยินดีต้อนรับเข้าสู่ระบบ e-Services</h2>
                    <p>ระบบบริหารจัดการข้อมูล และบริการประชาชน ศูนย์ข้อมูลรวมศูนย์</p>
                </div>
            </div>

            <!-- เปลี่ยนหัวข้อและใส่โครงสร้างรอรับ Facebook -->
            <div class="section-header"><i class="fas fa-bullhorn" style="margin-right:8px;"></i> ข่าวประชาสัมพันธ์และกิจกรรมของสำนักงานเขตคลองเตย</div>
            <div class="fb-grid" id="fb-card-container">
                <div style="text-align: center; width: 100%; padding: 40px; color: #888;">
                    กำลังโหลดข่าวสารล่าสุด...
                </div>
            </div>

            <div class="section-header"><i class="fas fa-cogs" style="margin-right:8px;"></i> ระบบจัดการภายใน</div>
            <div class="service-grid">
                <div class="service-card">
                    <div class="svc-icon red"><i class="fas fa-user-shield"></i></div>
                    <h4>ตั้งค่าสิทธิ์ผู้ใช้งาน (RBAC)</h4>
                    <a href="#admin" class="btn-svc red">จัดการสิทธิ์</a>
                </div>
            </div>
        </div>
    `;
}

function PageNews() {
    let newsHtml = `
        <div class="page-header">
            <h1>จัดการข่าวสารแบ่งตามฝ่าย</h1>
            <button class="btn btn-primary">+ สร้างข่าวใหม่</button>
        </div>
        <div class="news-list">
    `;
    mockData.news.forEach(item => {
        newsHtml += `
            <div class="news-item">
                <span class="dept-badge">${item.dept}</span>
                <h4>${item.title}</h4>
                <small><i class="far fa-clock"></i> ${item.date}</small>
            </div>
        `;
    });
    newsHtml += '</div>';
    return newsHtml;
}

// =========================================================
// 4. ระบบ Banner Slide
// =========================================================
async function initBannerSlider() {
    const bannerWrapper = document.getElementById('spa-banner-wrapper');
    if (!bannerWrapper) return;
    try {
        const repoUrl = 'https://api.github.com/repos/ktsdproject/webportalstyle/contents/banner';
        const response = await fetch(repoUrl);
        if (!response.ok) throw new Error('ไม่พบโฟลเดอร์');
        
        const files = await response.json();
        const images = files.filter(file => file.type === 'file' && file.name.match(/\.(jpe?g|png|gif|webp)$/i));

        if (images.length === 0) {
            bannerWrapper.style.display = 'none';
            return;
        }

        let html = '<div class="banner-container">';
        images.forEach((img, index) => {
            const activeClass = index === 0 ? 'active' : ''; 
            html += `<div class="banner-slide ${activeClass}"><img src="${img.download_url}" alt="Banner"></div>`;
        });
        html += '</div>';
        bannerWrapper.innerHTML = html;

        if (images.length > 1) {
            let currentIndex = 0;
            const slides = bannerWrapper.querySelectorAll('.banner-slide');
            bannerInterval = setInterval(() => {
                slides[currentIndex].classList.remove('active');
                currentIndex = (currentIndex + 1) % slides.length;
                slides[currentIndex].classList.add('active');
            }, 5000);
        }
    } catch (error) {
        bannerWrapper.style.display = 'none'; 
    }
}

// =========================================================
// 5. ระบบดึงข่าว Facebook และ Popup (อิมพอร์ตจากเวอร์ชันเดิม)
// =========================================================
function fetchFbPosts() {
    const WORKER_API_URL = 'https://webportal-fb-api.kt-sd-project.workers.dev/';
    fetch(WORKER_API_URL)
        .then(response => {
            if (!response.ok) throw new Error('Network error');
            return response.json();
        })
        .then(data => {
            data.sort((a, b) => new Date(b.date) - new Date(a.date));
            renderCards(data);
        })
        .catch(error => {
            console.error('FB Fetch Error:', error);
            const container = document.getElementById('fb-card-container');
            if (container) {
                container.innerHTML = '<div style="text-align: center; width: 100%; padding: 40px; color: red;">เกิดข้อผิดพลาดในการโหลดข่าวสาร</div>';
            }
        });
}

function renderCards(posts) {
    var container = document.getElementById('fb-card-container');
    if (!container) return;

    createFbModal(); // เตรียม Popup ไว้รอ

    if (!posts || posts.length === 0) {
        container.innerHTML = '<div style="text-align: center; width: 100%; padding: 40px; color: #888;">ไม่พบข้อมูลข่าวสารล่าสุด</div>';
        return;
    }

    var html = '';
    var indexPosts = posts.slice(0, 12); // โชว์ 12 ข่าวแรก
    
    indexPosts.forEach(function(post) {
        var cardData = preparePostCardData(post);
        html += `
            <div class="fb-card" onclick="openFbModal('${post.id}', '${cardData.encodedText}', '${post.link}', '${cardData.formattedDate}')">
                ${cardData.coverHtml}
                <div class="fb-content">
                    <div class="fb-date"><i class="far fa-clock"></i> ${cardData.formattedDate}</div>
                    <div class="fb-text">${cardData.textSnippet}</div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function preparePostCardData(post) {
    var formattedDate = post.date; 
    try {
        var d = new Date(post.date);
        if(!isNaN(d.getTime())) {
            var hh = String(d.getHours()).padStart(2, '0');
            var mm = String(d.getMinutes()).padStart(2, '0');
            var dd = String(d.getDate()).padStart(2, '0');
            var mo = String(d.getMonth() + 1).padStart(2, '0');
            formattedDate = hh + '.' + mm + ' ' + dd + '-' + mo + '-' + d.getFullYear();
        }
    } catch(e) {}

    var textSnippet = post.text ? post.text : 'คลิกเพื่อดูรายละเอียดเพิ่มเติม';
    var encodedText = encodeURIComponent(textSnippet);
    
    var imgArray = ['https://via.placeholder.com/600x400/00744B/FFFFFF?text=Khlong+Toei+News'];
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

    fbPostData[post.id] = imgArray; // เก็บรูปเข้าตัวแปร Global

    var coverHtml = '';
    if (imgArray.length === 1) {
        coverHtml = `<img src="${imgArray[0]}" class="fb-img" alt="cover">`;
    } else {
        var moreBadge = imgArray.length > 2 ? `<div style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.75); color: #fff; padding: 3px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">+${imgArray.length - 2}</div>` : '';
        coverHtml = `
            <div style="display: flex; height: 160px; width: 100%; overflow: hidden; position: relative;">
                <img src="${imgArray[0]}" style="width: 50%; height: 100%; object-fit: cover; border-right: 2px solid #fff;" alt="cover 1">
                <img src="${imgArray[1]}" style="width: 50%; height: 100%; object-fit: cover;" alt="cover 2">
                ${moreBadge}
            </div>
        `;
    }

    return { formattedDate: formattedDate, textSnippet: textSnippet, encodedText: encodedText, coverHtml: coverHtml };
}

function createFbModal() {
    if (document.getElementById('fb-custom-modal')) return;
    
    var modalHtml = `
        <div id="fb-custom-modal" class="fb-modal-overlay" onclick="closeFbModal(event)">
            <div class="fb-modal-box" onclick="event.stopPropagation()">
                <button class="fb-modal-close" onclick="closeFbModal(event)"><i class="fas fa-times"></i></button>
                
                <div style="position: relative; width: 100%; background: #000; display: flex; align-items: center; justify-content: center; min-height: 250px;">
                    <button id="fb-prev-btn" onclick="prevFbImage(event)" style="position: absolute; left: 10px; z-index: 10; cursor: pointer; border-radius: 50%; width: 40px; height: 40px;"><i class="fas fa-chevron-left"></i></button>
                    <img id="fb-modal-img" src="" class="fb-modal-img" style="width: 100%; max-height: 400px; object-fit: contain;">
                    <button id="fb-next-btn" onclick="nextFbImage(event)" style="position: absolute; right: 10px; z-index: 10; cursor: pointer; border-radius: 50%; width: 40px; height: 40px;"><i class="fas fa-chevron-right"></i></button>
                    <div id="fb-img-counter" style="position: absolute; bottom: 15px; right: 15px; background: rgba(0,0,0,0.6); color: #fff; padding: 4px 12px; border-radius: 20px;"></div>
                </div>

                <div class="fb-modal-body">
                    <div id="fb-modal-date" style="color: #65676B; font-size: 0.9rem; margin-bottom: 15px; font-weight:600;"><i class="far fa-clock"></i> <span></span></div>
                    <div id="fb-modal-text" class="fb-modal-text"></div>
                </div>
                <div class="fb-modal-footer">
                    <a id="fb-modal-link" href="#" target="_blank" class="fb-btn"><i class="fab fa-facebook"></i> ดูโพสต์ต้นฉบับบน Facebook</a>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function openFbModal(postId, encodedText, link, date) {
    fbModalImages = fbPostData[postId] || ['https://via.placeholder.com/600x400/00744B/FFFFFF?text=No+Image'];
    fbModalCurrentIndex = 0;
    
    updateFbModalImage(); 

    document.getElementById('fb-modal-text').textContent = decodeURIComponent(encodedText);
    document.getElementById('fb-modal-link').href = link;
    document.querySelector('#fb-modal-date span').textContent = date;
    
    document.getElementById('fb-custom-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeFbModal(e) {
    if(e) e.preventDefault();
    document.getElementById('fb-custom-modal').classList.remove('active');
    document.body.style.overflow = '';
}

function updateFbModalImage() {
    const imgEl = document.getElementById('fb-modal-img');
    const counterEl = document.getElementById('fb-img-counter');
    const prevBtn = document.getElementById('fb-prev-btn');
    const nextBtn = document.getElementById('fb-next-btn');

    imgEl.src = fbModalImages[fbModalCurrentIndex];

    if (fbModalImages.length > 1) {
        counterEl.style.display = 'block';
        counterEl.textContent = (fbModalCurrentIndex + 1) + ' / ' + fbModalImages.length;
        prevBtn.style.display = fbModalCurrentIndex > 0 ? 'block' : 'none';
        nextBtn.style.display = fbModalCurrentIndex < fbModalImages.length - 1 ? 'block' : 'none';
    } else {
        counterEl.style.display = 'none';
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    }
}

function prevFbImage(e) {
    if(e) e.stopPropagation();
    if (fbModalCurrentIndex > 0) {
        fbModalCurrentIndex--;
        updateFbModalImage();
    }
}

function nextFbImage(e) {
    if(e) e.stopPropagation();
    if (fbModalCurrentIndex < fbModalImages.length - 1) {
        fbModalCurrentIndex++;
        updateFbModalImage();
    }
}

// =========================================================
// 6. ตั้งค่า Event Listeners
// =========================================================
if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", initSPA);
} else {
    initSPA(); 
}

window.addEventListener("hashchange", function() {
    if (!window.location.hash || window.location.hash === '#') {
        window.location.reload();
    } else {
        router(); 
    }
});
