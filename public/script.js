const socket = io();

window.onload = () => {
    const savedEmail = localStorage.getItem('drk_email');
    if (savedEmail) socket.emit('check-user', savedEmail);
    socket.emit('get-all-channels');
};

// --- GİRİŞ VE KAYIT ---
function checkEmail() {
    const email = document.getElementById('email-input').value;
    if (!email) return alert("E-posta lazım kanka!");
    localStorage.setItem('drk_email', email);
    socket.emit('check-user', email);
}

socket.on('user-found', (data) => { localStorage.setItem('drk_username', data.username); showApp(); });
socket.on('user-not-found', () => { 
    document.getElementById('auth-screen').style.display = 'none'; 
    document.getElementById('username-modal').style.display = 'flex'; 
});

function saveUser() {
    const email = localStorage.getItem('drk_email');
    const username = document.getElementById('username-input').value;
    if (!username) return alert("İsimsiz olmaz!");
    localStorage.setItem('drk_username', username);
    socket.emit('yeni-uye', { email, username });
    showApp();
}

function showApp() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('username-modal').style.display = 'none';
    document.getElementById('app').style.display = 'grid';
    document.getElementById('user-info').innerText = "👤 " + localStorage.getItem('drk_username');
}

// --- KANAL YÖNETİMİ ---
function joinChannel(channelName) {
    localStorage.setItem('current_channel', channelName);
    document.getElementById('chat-area').style.display = 'flex';
    document.getElementById('messages').innerHTML = `<h3># ${channelName}</h3>`;
    socket.emit('get-history', channelName);
    toggleSidebar();
}

// --- SOCKET DİNLEYİCİLERİ ---
// 1. Kanal Listesini Güncelleme
socket.on('load-all-channels', (channels) => {
    const joinedDiv = document.getElementById('joined-channels');
    joinedDiv.innerHTML = ''; 
    channels.forEach(ch => renderJoinedChannel(ch.name));
});

function renderJoinedChannel(channelName) {
    const joinedDiv = document.getElementById('joined-channels');
    if (document.getElementById('joined-' + channelName)) return;
    const newChan = document.createElement('div');
    newChan.id = 'joined-' + channelName;
    newChan.className = 'channel';
    newChan.innerText = `# ${channelName}`;
    newChan.onclick = () => joinChannel(channelName);
    joinedDiv.appendChild(newChan);
}

// --- MESAJLAŞMA (ÇİFT MESAJ SORUNU ÇÖZÜLDÜ) ---
function sendMessage() {
    const input = document.getElementById('msg-input');
    const channel = localStorage.getItem('current_channel');
    const username = localStorage.getItem('drk_username');
    if(!input.value) return;

    socket.emit('chat-mesaj', { channel, username, mesaj: input.value });
    input.value = '';
}

// MESAJ ALMA (TEK YERDEN ÇALIŞIYOR)
socket.on('yeni-mesaj', (data) => { 
    if (data.channel === localStorage.getItem('current_channel')) { 
        const msgDiv = document.getElementById('messages');
        msgDiv.innerHTML += `<p><b>${data.username}:</b> ${data.mesaj}</p>`; 
        msgDiv.scrollTop = msgDiv.scrollHeight;
    } 
});

socket.on('load-history', (messages) => { 
    const msgDiv = document.getElementById('messages'); 
    messages.forEach(data => msgDiv.innerHTML += `<p><b>${data.username}:</b> ${data.mesaj}</p>`); 
});

// --- DİĞER ---
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active'); }

function showBasvuruFormu() { 
    const channelName = prompt("Kanal adı:"); 
    if(channelName) {
        socket.emit('kanal-basvuru', { 
            username: localStorage.getItem('drk_username'), 
            email: localStorage.getItem('drk_email'), 
            channelName 
        });
        alert("Başvurunuz admin'e iletildi.");
    }
}