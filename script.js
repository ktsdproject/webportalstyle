function replaceCalendarWithModernCards() {
    var calWrapper = document.getElementById('calendar-wrapper');
    if (!calWrapper) return;

    // 1. เปลี่ยนชื่อหัวข้อ
    var titleText = calWrapper.querySelector('.title');
    if (titleText) {
        titleText.innerHTML = '<i class="fab fa-facebook-square" style="color:#1877F2; font-size: 1.2em; vertical-align: middle;"></i> อัปเดตข่าวสารจากเพจเขตคลองเตย';
        titleText.href = 'https://www.facebook.com/khlongtoei599';
        titleText.target = '_blank';
    }

    // 2. ซ่อนองค์ประกอบเดิมที่ไม่ใช้
    var descElements = calWrapper.querySelectorAll('.desc, .group-gotoall');
    descElements.forEach(function(el) { el.style.display = 'none'; });

    // 3. แทรกคอนเทนเนอร์สำหรับการ์ด
    var mainContent = calWrapper.querySelector('.main-content');
    if (mainContent && !mainContent.classList.contains('cards-loaded')) {
        mainContent.classList.add('cards-loaded');
        
        // วางโครงกล่องเปล่าๆ ไว้รอข้อมูล
        mainContent.innerHTML = `
            <div class="container">
                <div class="fb-grid" id="fb-card-container">
                    <div style="text-align: center; width: 100%; padding: 20px; color: #888;">กำลังโหลดข่าวสาร...</div>
                </div>
            </div>
        `;

        // สั่งวาดการ์ดโดยใช้ Mock Data (แทนที่ด้วย Fetch API ในอนาคต)
        renderCards(mockFacebookPosts);
    }
}

// ---------------------------------------------------------
// ฟังก์ชันวาดการ์ดลงใน HTML
// ---------------------------------------------------------
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
// ข้อมูลจำลอง (Mock Data) 10 โพสต์ เพื่อดูความสวยงามของการ์ด
var mockFacebookPosts = [];
for(var i = 1; i <= 10; i++) {
    mockFacebookPosts.push({
        // ใช้รูป placeholder สวยๆ สุ่มตามลำดับ
        image: 'https://picsum.photos/400/300?random=' + i, 
        date: '14 ก.ค. 2569',
        text: 'ตัวอย่างข้อความโพสต์อัปเดตภารกิจของสำนักงานเขตคลองเตย ลำดับที่ ' + i + ' ข้อความยาวๆ จะถูกตัดให้พอดีที่ 3 บรรทัดอัตโนมัติ เพื่อให้การ์ดเท่ากันทุกใบ',
        link: 'https://www.facebook.com/khlongtoei599'
    });
}

// สั่งรันทำงาน
replaceCalendarWithModernCards();
setTimeout(replaceCalendarWithModernCards, 1000);
setTimeout(replaceCalendarWithModernCards, 3000);
