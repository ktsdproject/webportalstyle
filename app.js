// =========================================================
// ไฟล์: app.js (ระบบ SPA ใหม่ เขตคลองเตย V2)
// =========================================================

// ตัวแปรเก็บข้อมูลจำลอง (Mock Data) สำหรับพัฒนา UI
const mockData = {
    news: [
        { id: 1, dept: "ฝ่ายโยธา", title: "ซ่อมแซมผิวจราจร ซอยสุขุมวิท 50", date: "2026-08-13" },
        { id: 2, dept: "ฝ่ายการคลัง", title: "ประกาศผลการประกวดราคา ซื้อกล้อง CCTV", date: "2026-08-12" }
    ]
};

// ตัวแปรสำหรับคุมเวลา Banner Slide
let bannerInterval = null;

// =========================================================
// 1. ฟังก์ชัน ยึดพื้นที่เว็บ (Hijack DOM)
// =========================================================
function initSPA() {
    // เช็กว่า URL มี # หรือไม่ (ถ้าไม่มี แปลว่าให้โชว์เว็บ กทม. ปกติไปก่อน)
    if (!window.location.hash || window.location.hash === '#') return; 

    // ล้างเนื้อหาเว็บ กทม. เดิมทิ้งทั้งหมด!
    document.body.innerHTML = '<div id="app-root"></div>';
    
    // รีเซ็ต Style ของ Body ให้สะอาด
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = '#f4f7f6';
    document.body.style.fontFamily = "'Kanit', sans-serif";

    // สั่งรัน Router เพื่อสลับหน้า
    router();
}

// =========================================================
// 2. ระบบสลับหน้า (Router)
// =========================================================
function router() {
    const appRoot = document.getElementById('app-root');
    if (!appRoot) return;

    let hash = window.location.hash;
    if (hash === '') hash = '#index'; // ค่าเริ่มต้นถ้าไม่มี Hash

    // เคลียร์การนับเวลาของ Banner เมื่อมีการเปลี่ยนหน้า (ป้องกันบั๊กภาพกระพริบรัว)
    if (bannerInterval) {
        clearInterval(bannerInterval);
        bannerInterval = null;
    }

    // ล้างหน้าจอเก่าออกก่อนวาดใหม่
    appRoot.innerHTML = '';

    // วาดแถบ Navbar ด้านบน
    appRoot.innerHTML = renderNavbar();

    // สร้างพื้นที่สำหรับเนื้อหาตรงกลาง (Main Container)
    const mainContent = document.createElement('main');
    mainContent.className = 'container';
    appRoot.appendChild(mainContent);

    // เลือกวาดหน้าเว็บตาม Hash ใน URL
    switch (hash) {
        case '#index':
            mainContent.innerHTML = PageHome();
            initBannerSlider(); // โหลดข้อมูลแบนเนอร์ทันทีที่วาดหน้าแรกเสร็จ
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

// แถบเมนูด้านบน
function renderNavbar() {
    return `
        <nav class="spa-navbar">
            <div class="nav-brand">
                <i class="fas fa-building"></i> สำนักงานเขตคลองเตย
            </div>
            <div class="nav-links">
                <a href="#index"><i class="fas fa-home"></i> หน้าหลัก</a>
                <a href="#news"><i class="fas fa-newspaper"></i> ข่าวสาร</a>
            </div>
        </nav>
    `;
}

// หน้าหลัก (#index) - แดชบอร์ดสไตล์ e-Service
function PageHome() {
    return `
        <div class="portal-container">
            
            <!-- โครงสร้างกล่อง Banner Slide -->
            <div id="spa-banner-wrapper">
                <div class="banner-container">
                    <div class="banner-loading">กำลังเตรียมแบนเนอร์...</div>
                </div>
            </div>

            <!-- ส่วน Profile ต้อนรับ -->
            <div class="profile-hero">
                <div class="avatar"><i class="fas fa-building"></i></div>
                <div>
                    <h2>ยินดีต้อนรับเข้าสู่ระบบ e-Services</h2>
                    <p>ระบบบริหารจัดการข้อมูล และบริการประชาชน ศูนย์ข้อมูลรวมศูนย์</p>
                </div>
            </div>

            <!-- หมวดหมู่ที่ 1 -->
            <div class="section-header"><i class="fas fa-bullhorn" style="margin-right:8px;"></i> ระบบจัดการข่าวสารและประชาสัมพันธ์</div>
            <div class="service-grid">
                <div class="service-card">
                    <div class="svc-icon blue"><i class="fab fa-facebook-f"></i></div>
                    <h4>จัดการข่าว Facebook</h4>
                    <a href="#news" class="btn-svc blue">เข้าสู่ระบบ</a>
                </div>
                <div class="service-card">
                    <div class="svc-icon orange"><i class="fas fa-file-alt"></i></div>
                    <h4>ระบบฐานข้อมูล PDF</h4>
                    <a href="#pdf" class="btn-svc orange">จัดการไฟล์เอกสาร</a>
                </div>
                <div class="service-card">
                    <div class="svc-icon green"><i class="fas fa-chart-line"></i></div>
                    <h4>สถิติการเข้าชมเว็บ</h4>
                    <a href="#stats" class="btn-svc green">ดูรายงานสถิติ</a>
                </div>
            </div>

            <!-- หมวดหมู่ที่ 2 -->
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

// หน้าข่าวสาร (#news)
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
// 4. ระบบ Banner Slide ดึงรูปอัตโนมัติจาก GitHub
// =========================================================
async function initBannerSlider() {
    const bannerWrapper = document.getElementById('spa-banner-wrapper');
    if (!bannerWrapper) return;

    try {
        // ใช้ GitHub API ยิงไปดึงรายชื่อไฟล์ในโฟลเดอร์ banner
        const repoUrl = 'https://api.github.com/repos/ktsdproject/webportalstyle/contents/banner';
        const response = await fetch(repoUrl);
        
        if (!response.ok) throw new Error('ไม่พบโฟลเดอร์ หรือติด Limit');
        
        const files = await response.json();
        
        // กรองเอามาเฉพาะไฟล์นามสกุลรูปภาพ
        const images = files.filter(file => 
            file.type === 'file' && 
            file.name.match(/\.(jpe?g|png|gif|webp)$/i)
        );

        // ถ้าในโฟลเดอร์ไม่มีรูปภาพเลย ให้ซ่อนกล่องแบนเนอร์ทิ้งไป
        if (images.length === 0) {
            bannerWrapper.style.display = 'none';
            return;
        }

        // วาดรูปลงใน HTML
        let html = '<div class="banner-container">';
        images.forEach((img, index) => {
            const activeClass = index === 0 ? 'active' : ''; // รูปแรกให้แสดงทันที
            html += `
                <div class="banner-slide ${activeClass}">
                    <img src="${img.download_url}" alt="Banner ${index + 1}">
                </div>
            `;
        });
        html += '</div>';
        bannerWrapper.innerHTML = html;

        // ถ้ารูปมีมากกว่า 1 รูป ให้รันระบบสลับภาพ (5 วินาที/ภาพ)
        if (images.length > 1) {
            let currentIndex = 0;
            const slides = bannerWrapper.querySelectorAll('.banner-slide');
            
            bannerInterval = setInterval(() => {
                slides[currentIndex].classList.remove('active');
                currentIndex = (currentIndex + 1) % slides.length; // วนกลับรูปแรกถ้าถึงรูปสุดท้าย
                slides[currentIndex].classList.add('active');
            }, 5000);
        }

    } catch (error) {
        console.error('Banner Load Error:', error);
        bannerWrapper.style.display = 'none'; // ซ่อนถ้ามี Error ป้องกันหน้าเว็บพัง
    }
}

// =========================================================
// 5. ตั้งค่า Event Listeners (ดักจับการโหลดและเปลี่ยนหน้า)
// =========================================================

// ตรวจสอบว่าหน้าเว็บโหลดเสร็จหรือยัง? (รองรับการรันผ่าน Dynamic Loader)
if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", initSPA);
} else {
    // ถ้าระบบหลักโหลดเสร็จไปก่อนแล้ว ให้รันระบบ SPA ทันที
    initSPA(); 
}

// ดักจับเมื่อผู้ใช้กดเปลี่ยนหน้า หรือกดปุ่ม Back/Forward
window.addEventListener("hashchange", function() {
    // ถ้าผู้ใช้ลบ # ออกจนหมด ให้เด้งกลับไปหน้าเว็บปกติของ กทม. (Refresh)
    if (!window.location.hash || window.location.hash === '#') {
        window.location.reload();
    } else {
        router(); // ถ้ามี # ให้สลับหน้าภายใน SPA ของเรา
    }
});
