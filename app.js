const mockData = {
    news: [
        { id: 1, dept: "ฝ่ายโยธา", title: "ซ่อมแซมผิวจราจร ซอยสุขุมวิท 50", date: "2026-08-13" },
        { id: 2, dept: "ฝ่ายการคลัง", title: "ประกาศผลการประกวดราคา ซื้อกล้อง CCTV", date: "2026-08-12" }
    ]
};

// =========================================================
// 1. ฟังก์ชัน Hijack DOM
// =========================================================
function initSPA() {
    if (!window.location.hash) return; 

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
    appRoot.innerHTML = '';

    appRoot.innerHTML = renderNavbar();

    const mainContent = document.createElement('main');
    mainContent.className = 'container';
    appRoot.appendChild(mainContent);

    switch (hash) {
        case '#index':
            mainContent.innerHTML = PageHome();
            break;
        case '#news':
            mainContent.innerHTML = PageNews();
            break;
        default:
            mainContent.innerHTML = `<h2 style="text-align:center; margin-top:50px;">❌ 404 ไม่พบหน้าที่ต้องการ</h2>`;
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
                <i class="fas fa-building"></i> ระบบบริหารจัดการ เขตคลองเตย
            </div>
            <div class="nav-links">
                <a href="#index"><i class="fas fa-home"></i> หน้าหลัก</a>
                <a href="#news"><i class="fas fa-newspaper"></i> ข่าวสาร</a>
            </div>
        </nav>
    `;
}

function PageHome() {
    return `
        <div class="page-header">
            <h1>แดชบอร์ดส่วนกลาง</h1>
            <p>ยินดีต้อนรับเข้าสู่ระบบจัดการข้อมูล สำนักงานเขตคลองเตย</p>
        </div>
        <div class="grid-cards">
            <div class="stat-card">
                <h3>จำนวนข่าวสาร</h3>
                <h2>${mockData.news.length} โพสต์</h2>
            </div>
            <div class="stat-card">
                <h3>สถานะระบบ</h3>
                <h2 style="color: #059669;">🟢 ปกติ</h2>
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
// 4. ตั้งค่า Event Listeners
// =========================================================
window.addEventListener("DOMContentLoaded", initSPA);
window.addEventListener("hashchange", function() {
    // ถ้ามีคนลบ Hash ออกจนหมด ให้เด้งกลับไปหน้าเว็บปกติ (Refresh)
    if (!window.location.hash) {
        window.location.reload();
    } else {
        router(); // ถ้า Hash เปลี่ยน ก็วาดหน้าจอใหม่
    }
});
