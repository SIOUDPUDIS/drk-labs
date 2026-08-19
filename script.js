// Formu dinle
document.getElementById('hack-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const message = document.getElementById('user-message').value;
    const platform = document.getElementById('user-platform').value;
    const contact = document.getElementById('user-contact').value;
    const statusDiv = document.getElementById('response-status');

    // Gönderim başladığında kullanıcıya bilgi ver
    statusDiv.style.color = "#00ff66";
    statusDiv.innerHTML = "Sistem verileri doğruluyor...";

    // Sunucuya göndereceğimiz paket
    const payload = {
        message: message,
        platform: platform,
        contact: contact // Kullanıcı ister link ister kullanıcı adı girsin, olduğu gibi alıyoruz
    };

    try {
        const response = await fetch('/api/talep', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (data.success) {
            statusDiv.innerHTML = "İşlem başarılı! Yetkili en kısa sürede iletişime geçecek.";
            document.getElementById('hack-form').reset();
        } else {
            statusDiv.style.color = "#ff0055";
            statusDiv.innerHTML = "Sistem hatası: Veri iletilemedi.";
        }
    } catch (err) {
        document.getElementById('connection-error').classList.remove('hidden');
    }
});

// Arka planda sunucuyu sürekli kontrol et
setInterval(async () => {
    try {
        const res = await fetch('/api/health');
        if (!res.ok) document.getElementById('connection-error').classList.remove('hidden');
    } catch (e) {
        document.getElementById('connection-error').classList.remove('hidden');
    }
}, 5000);

// Yan Pencere Yazıları (Daktilo Efekti)
const textLeft = "> [+] DRK Teknoloji Operasyon Merkezi...\n> [!] Hızlı işlem modu aktif.\n> [status] Veri transferi şifrelendi.\n> [INFO] Formu doldur, saniyeler içinde iletelim.";
const textRight = "> [!] Hedef hesap linkini veya kullanıcı adını gir.\n> [+] Sistem veriyi doğrudan işleyecek.\n> [?] Başka bir şeye ihtiyacın olursa buradayız.";

function typeWriter(text, elementId, speed = 40) {
    let i = 0;
    function type() {
        if (i < text.length) {
            document.getElementById(elementId).innerHTML += text.charAt(i) === '\n' ? '<br>' : text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

setTimeout(() => {
    typeWriter(textLeft, 'typewriter-left', 35);
    typeWriter(textRight, 'typewriter-right', 35);
}, 2500);