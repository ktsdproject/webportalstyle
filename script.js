function replaceCalendarWithFacebook() {
    // หาบล็อก "ปฏิทินกิจกรรม"
    var calWrapper = document.getElementById('calendar-wrapper');
    
    if (calWrapper) {
        // 1. เปลี่ยนชื่อหัวข้อ และลิงก์ให้คลิกไปที่เพจ
        var titleText = calWrapper.querySelector('.title');
        if (titleText) {
            titleText.innerHTML = '<i class="fab fa-facebook-square" style="color:#1877F2;"></i> อัปเดตข่าวสารจาก Facebook';
            titleText.href = 'https://www.facebook.com/khlongtoei599';
            titleText.target = '_blank';
        }
        
        // 2. ซ่อนข้อความบรรทัดเล็กๆ ด้านล่าง (คำว่า Calendar และ วันที่)
        var descTexts = calWrapper.querySelectorAll('.desc');
        descTexts.forEach(function(el) { el.style.display = 'none'; });
        
        // 3. ซ่อนปุ่ม "กิจกรรมทั้งหมด"
        var btnAll = calWrapper.querySelector('.group-gotoall');
        if (btnAll) btnAll.style.display = 'none';
        
        // 4. ทุบเนื้อหาปฏิทินเดิมทิ้ง แล้วยัด Iframe ของเพจคลองเตยลงไปแทน
        var mainContent = calWrapper.querySelector('.main-content');
        if (mainContent && !mainContent.classList.contains('fb-loaded')) {
            mainContent.classList.add('fb-loaded'); // ป้องกันโค้ดรันซ้ำ
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

// สั่งรันโค้ดทันทีเมื่อโหลดไฟล์เสร็จ
replaceCalendarWithFacebook();
// ดักรันซ้ำเผื่อระบบเว็บดึงข้อมูลปฏิทินมาช้า (หน่วง 1 วิ และ 3 วิ)
setTimeout(replaceCalendarWithFacebook, 1000);
setTimeout(replaceCalendarWithFacebook, 3000);
