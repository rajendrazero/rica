
            feather.replace();

            const wrap = document.getElementById("hWrap");
            const panels = document.querySelectorAll(".panel");
            const indicator = document.getElementById("indicator");
            const themeToggle = document.getElementById("themeToggle");

            let startX = 0,
                scrollLeft = 0,
                isDown = false;
            let target = 0,
                current = 0;
            let isAutoSnapping = false; // flag to ignore programmatic scroll during snap
            const scrollSpeed = 1.2;

            /* ---------- Smooth Scroll ---------- */
            if (window.innerWidth > 768) {
                function smoothScroll() {
                    // If user is actively dragging, don't interpolate — just follow user scroll
                    if (isDown) {
                        // keep current in sync so when user releases animation continues smoothly
                        current = wrap.scrollLeft;
                        requestAnimationFrame(smoothScroll);
                        return;
                    }

                    current += (target - current) * 0.08;
                    wrap.scrollLeft = current;
                    // if we are auto-snapping and very close to target, stop the flag
                    if (isAutoSnapping && Math.abs(target - current) < 1) {
                        isAutoSnapping = false;
                    }
                    requestAnimationFrame(smoothScroll);
                }
                smoothScroll();

                window.addEventListener(
                    "wheel",
                    e => {
                        e.preventDefault();
                        target += e.deltaY * scrollSpeed;
                        target = Math.max(
                            0,
                            Math.min(
                                target,
                                wrap.scrollWidth - window.innerWidth
                            )
                        );
                    },
                    { passive: false }
                );
            }

            /* ---------- Touch & Mouse Drag ---------- */
            wrap.addEventListener("touchstart", e => {
                isDown = true;
                startX = e.touches[0].pageX;
                scrollLeft = wrap.scrollLeft;
            });
            wrap.addEventListener("touchmove", e => {
                const x = e.touches[0].pageX;
                wrap.scrollLeft = scrollLeft + (startX - x);
            });
            wrap.addEventListener("mousedown", e => {
                isDown = true;
                startX = e.pageX;
                scrollLeft = wrap.scrollLeft;
            });
            wrap.addEventListener("mouseup", () => {
                isDown = false;
                // resync smooth scroll variables so animation continues from current position
                current = wrap.scrollLeft;
                target = current;
            });
            wrap.addEventListener("mouseleave", () => {
                isDown = false;
                current = wrap.scrollLeft;
                target = current;
            });
            wrap.addEventListener("touchend", () => {
                isDown = false;
                current = wrap.scrollLeft;
                target = current;
            });
            wrap.addEventListener("mousemove", e => {
                if (!isDown) return;
                e.preventDefault();
                wrap.scrollLeft = scrollLeft + (startX - e.pageX);
            });

            /* ---------- Indicator Update ---------- */
            function updateIndicator() {
                const index = Math.round(current / window.innerWidth);
                indicator.innerHTML = Array.from(panels)
                    .map(
                        (_, i) =>
                            `<span class="dot ${
                                i === index ? "active" : ""
                            }"></span>`
                    )
                    .join("");
            }
            setInterval(updateIndicator, 300);

            /* ---------- Panel Fade-In ---------- */
            function checkVisiblePanels() {
                panels.forEach(p => {
                    const rect = p.getBoundingClientRect();
                    if (rect.left < window.innerWidth && rect.right > 0)
                        p.classList.add("visible");
                });
            }
            setInterval(checkVisiblePanels, 200);

            /* ---------- Enhanced Sidebar Navigation ---------- */
            const menuItems = document.querySelectorAll(".menu-item");
            
            function updateActiveMenuItem() {
                const index = Math.round(current / window.innerWidth);
                menuItems.forEach((item, i) => {
                    item.classList.toggle('active', i === index);
                    
                    // Add subtle animation for icon when active
                    const icon = item.querySelector('.icon');
                    if (i === index) {
                        icon.style.transform = 'scale(1.1)';
                        icon.style.filter = 'drop-shadow(0 0 8px rgba(202, 160, 255, 0.6))';
                    } else {
                        icon.style.transform = 'scale(1)';
                        icon.style.filter = 'none';
                    }
                });
            }

            menuItems.forEach(item => {
                item.addEventListener("click", () => {
                    const index = parseInt(item.dataset.index);
                    const marginLeft = parseFloat(getComputedStyle(panels[0]).marginLeft) || 0;
                    
                    // Add click feedback animation
                    item.style.transform = 'scale(0.95)';
                    setTimeout(() => item.style.transform = '', 150);
                    
                    // Smooth scroll to target panel
                    target = panels[index].offsetLeft - marginLeft;
                    
                    // Update active states
                    menuItems.forEach(mi => mi.classList.remove('active'));
                    item.classList.add('active');
                });
                
                // Add hover sound effect (optional)
                item.addEventListener('mouseenter', () => {
                    if (window.innerWidth > 768) { // Only on desktop
                        item.style.transform = 'translateX(3px) scale(1.02)';
                    }
                });
                
                item.addEventListener('mouseleave', () => {
                    if (window.innerWidth > 768) {
                        item.style.transform = '';
                    }
                });
            });
            
            // Update active menu item periodically
            setInterval(updateActiveMenuItem, 300);

            /* ---------- Theme Toggle ---------- */
            themeToggle.addEventListener("click", () => {
                document.body.classList.toggle("purple");
                themeToggle.textContent = document.body.classList.contains(
                    "purple"
                )
                    ? "🌙"
                    : "💜";
            });

            /* ---------- Fungsionalitas Musik ---------- */
            const music = document.getElementById("sweetMusic");
            const playButton = document.querySelector(".play-button");
            let isPlaying = false;

            function toggleMusic() {
                if (isPlaying) {
                    music.pause();
                    playButton.textContent = "▶ Play Music";
                } else {
                    music.play();
                    playButton.textContent = "II Pause Music";
                }
                isPlaying = !isPlaying;
            }
        
            /* ---------- Auto-snap after inactivity (5s) ---------- */
            // When user stops interacting for 5 seconds, snap to nearest panel
            (function () {
                const INACTIVITY_MS = 2000; // 5 seconds
                let inactivityTimer = null;

                function resetInactivityTimer() {
                    if (inactivityTimer) clearTimeout(inactivityTimer);
                    inactivityTimer = setTimeout(() => {
                        snapToNearestPanel();
                    }, INACTIVITY_MS);
                }

                // Determine nearest panel index based on current scrollLeft
                function nearestPanelIndex() {
                    const scrollLeft = wrap.scrollLeft;
                    const viewportCenter = scrollLeft + window.innerWidth / 2;
                    let nearest = 0;
                    let minDist = Infinity;
                    panels.forEach((p, i) => {
                        const pLeft = p.offsetLeft;
                        const pCenter = pLeft + p.offsetWidth / 2;
                        const dist = Math.abs(pCenter - viewportCenter);
                        if (dist < minDist) {
                            minDist = dist;
                            nearest = i;
                        }
                    });
                    return { index: nearest, distance: minDist };
                }

                // Snap smoothly to nearest panel using existing smooth scroll target
                function snapToNearestPanel() {
                    const res = nearestPanelIndex();
                    const idx = res.index;
                    const dist = res.distance;
                    // If already pretty close, do nothing
                    if (dist <= 8) return;
                    const marginLeft = parseFloat(getComputedStyle(panels[0]).marginLeft) || 0;
                    const destination = panels[idx].offsetLeft - marginLeft;
                    // If smoothScroll loop exists (desktop), set target so it animates
                    if (window.innerWidth > 768) {
                        isAutoSnapping = true;
                        target = Math.max(0, Math.min(destination, wrap.scrollWidth - window.innerWidth));
                        // Also ensure current is synced so animation is smooth
                        current = wrap.scrollLeft;
                    } else {
                        // On small screens just use native smooth scroll
                        isAutoSnapping = true;
                        wrap.scrollTo({ left: destination, behavior: "smooth" });
                        // clear flag after estimated animation time (500ms)
                        setTimeout(() => (isAutoSnapping = false), 700);
                    }
                }

                // Reset timer on user interactions that indicate scrolling activity
                // Wheel
                window.addEventListener(
                    "wheel",
                    e => {
                        resetInactivityTimer();
                    },
                    { passive: true }
                );

                // Drag / touch events
                wrap.addEventListener("touchstart", resetInactivityTimer, { passive: true });
                wrap.addEventListener("touchmove", resetInactivityTimer, { passive: true });
                wrap.addEventListener("mousedown", resetInactivityTimer);
                wrap.addEventListener("mousemove", e => {
                    if (isDown) resetInactivityTimer();
                });
                wrap.addEventListener("mouseup", resetInactivityTimer);
                wrap.addEventListener("scroll", () => {
                    // Ignore scroll events triggered by our auto-snap animation
                    if (isAutoSnapping) return;
                    // scroll events can be frequent; debounce by clearing and setting
                    if (inactivityTimer) clearTimeout(inactivityTimer);
                    inactivityTimer = setTimeout(snapToNearestPanel, INACTIVITY_MS);
                }, { passive: true });

                // Start initial timer in case user doesn't interact
                resetInactivityTimer();

                /* ---------- Prev / Next Buttons ---------- */
                function goToPanel(index) {
                    index = Math.max(0, Math.min(index, panels.length - 1));
                    const marginLeft = parseFloat(getComputedStyle(panels[0]).marginLeft) || 0;
                    const destination = panels[index].offsetLeft - marginLeft;
                    if (window.innerWidth > 768) {
                        isAutoSnapping = true;
                        target = Math.max(0, Math.min(destination, wrap.scrollWidth - window.innerWidth));
                        current = wrap.scrollLeft;
                    } else {
                        isAutoSnapping = true;
                        wrap.scrollTo({ left: destination, behavior: "smooth" });
                        setTimeout(() => (isAutoSnapping = false), 700);
                    }
                }

                function goToNext() {
                    const idx = nearestPanelIndex().index;
                    goToPanel(idx + 1);
                }

                function goToPrev() {
                    const idx = nearestPanelIndex().index;
                    goToPanel(idx - 1);
                }

                const btnNext = document.getElementById("next");
                const btnPrev = document.getElementById("prev");
                if (btnNext) btnNext.addEventListener("click", () => {
                    goToNext();
                });
                if (btnPrev) btnPrev.addEventListener("click", () => {
                    goToPrev();
                });
            })();

    /* ---------- Floating hearts generator (decorative) ---------- */
    (function () {
        const container = document.getElementById("floatingHearts");
        if (!container) return;

        const HEARTS = 18; // number of floating hearts
        const classes = ["small", "medium", "large"];
        const colors = ["purple", "pink", "deep"];

        function rand(min, max) {
            return Math.random() * (max - min) + min;
        }

        for (let i = 0; i < HEARTS; i++) {
            const el = document.createElement("div");
            el.className = "heart " + classes[Math.floor(rand(0, classes.length))] + " " + colors[Math.floor(rand(0, colors.length))];
            el.innerText = "❤";
            // random horizontal position
            el.style.left = rand(2, 96) + "%";
            // random animation duration and delay
            const dur = rand(6, 14).toFixed(2) + "s";
            const delay = rand(0, 8).toFixed(2) + "s";
            el.style.animationDuration = dur;
            el.style.animationDelay = delay;
            // slight horizontal drift via CSS transform translateX applied with inline --dx
            const dx = rand(-12, 12).toFixed(2) + "px";
            el.style.setProperty("--dx", dx);
            // small random opacity base
            el.style.opacity = rand(0.6, 1).toFixed(2);

            // small additional movement via a tiny CSS transition on hover not needed; always decorative
            container.appendChild(el);
        }

        // optional: respawn hearts when window is resized to reposition nicely
        let resizeTimer = null;
        window.addEventListener("resize", () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                // reposition hearts horizontally
                Array.from(container.children).forEach((c) => {
                    c.style.left = rand(2, 96) + "%";
                });
            }, 250);
        });
    })();

    
/* =============================== */
/* 💜 CHAT ROMANTIS RAJ X ICAA 💜 */
/* =============================== */
/* Chat data (urutan percakapanmu) */
const chatSequence = [
  {who:'raj', text:'bingung, kk gak suka gantung orang, tp kk dah mau tamat juga ntar lagi juga pkl', time:'23:33'},
  {who:'icaa', text:'kaka mau mati kah?', time:'23:37'},
  {who:'icaa', text:'😭', time:'23:37'},
  {who:'raj', text:'ahhh gak seru🙂‍↕️', time:'23:37'},
  {who:'icaa', text:'SERIUS', time:'23:38'},
  {who:'icaa', text:'gantung orang gimana?', time:'23:38'},
  {who:'raj', text:'hm... you know i like you, and kk bingung, mau bawa hubungan yang lebih dari teman atau kayak sekarang aja', time:'23:40'},
  {who:'icaa', text:'up to u sii kakk', time:'23:47'},
  {who:'raj', text:'okeh deh.', time:'23:53'},
  {who:'raj', text:'Yaps mungkin kk bukan orang terbaik, and bukan yang bisa selalu ada dan selalu memberi, tapi kk bisa berusaha dan terus berkembang, so unfriend, and be my girlfriend??', time:'23:57', important:true},
  {who:'icaa', text:'kak? sejak kapan bisa gini? 🤗', time:'23:57'},
  {who:'icaa', text:'WKWKWKW ANJIRR, MAWWW', time:'23:57'},
  {who:'raj', text:'wkkwkw ko meremehkan penulis ulung🙂‍↕️ meski gak pernah nembak orang, yang curhat sama kk banyak juga🙂‍↕️ jadi bisalah wkwk', time:'23:59'},
  {who:'raj', text:'yapsss saya tak bisa berkata kata 🙂‍↕️', time:'23:59'},
  {who:'raj', text:'thanksss icaaa😁', time:'00:01'},
  {who:'icaa', text:'WKWKWKWK PLIS AK SYOK DIKIT', time:'00:01', final:true}
];

const messagesEl = document.getElementById('messages');
const typingIndicator = document.getElementById('typingIndicator');
const fakeInput = document.getElementById('fakeInput');
const chatWindow = document.getElementById('chatWindow');
const replayBtn = document.getElementById('replayChat');

/* Simple escape HTML */
function escapeHtml(s){ return s.replaceAll('<','&lt;').replaceAll('>','&gt;'); }

/* Buat elemen pesan */
function createMsgEl(msg){
  const li = document.createElement('li');
  li.className = 'msg ' + (msg.who === 'raj' ? 'raj' : 'icaa');
  li.innerHTML = `
    <div class="bubble">${escapeHtml(msg.text)}</div>
    <div class="time">${msg.time || ''}</div>
  `;
  return li;
}

/* Typing */
function showTyping(on=true){
  typingIndicator.style.display = on ? 'flex' : 'none';
}

/* Scroll */
function scrollToBottom(){
  chatWindow.scrollTo({ top: chatWindow.scrollHeight + 200, behavior: 'smooth' });
}

/* Partikel love */
function burst(xPercent = 50, yPercent = 50){
  const wrap = document.createElement('div');
  wrap.className = 'particle-wrap';
  document.querySelector('.romantic-chat-panel').appendChild(wrap);

  const colors = ['#ffd6fb','#fbe1ff','#caa0ff','#ff9ab3'];
  for(let i=0;i<18;i++){
    const p = document.createElement('div');
    p.style.position='absolute';
    p.style.left = (xPercent + (Math.random()*40-20)) + '%';
    p.style.top  = (yPercent + (Math.random()*30-15)) + '%';
    p.style.fontSize = (12 + Math.random()*18) + 'px';
    p.style.opacity = 0;
    p.innerText = Math.random() > 0.6 ? '💖' : (Math.random()>0.5 ? '✨' : '💜');
    wrap.appendChild(p);
    gsap.to(p, { y: '-=' + (40+Math.random()*80), opacity:1, x: '+=' + (Math.random()*60-30), duration: 0.9+Math.random(), ease:'power2.out', onComplete:()=>{
      gsap.to(p,{opacity:0, duration:0.4, delay:0.1, onComplete:()=>p.remove()});
    }});
  }
  setTimeout(()=>wrap.remove(),1600);
}

/* Highlight penting */
function celebrateImportant(el){
  gsap.timeline()
    .to(el, { scale: 1.03, duration: 0.18, ease:'power1.out' })
    .to(el, { x: -6, duration:0.07, ease:'power2.inOut' })
    .to(el, { x: 6, duration:0.07, ease:'power2.inOut' })
    .to(el, { x: 0, duration:0.07, ease:'power2.inOut' })
    .to(el, { scale: 1, boxShadow: '0 16px 50px rgba(202,160,255,0.18)', duration:0.2 });
}

/* Delay helper */
function wait(ms){ return new Promise(res=>setTimeout(res, ms)); }

let playing = false;
let observer = null;
let stopFlag = false;

/* Main player */
async function playSequence(){
  stopFlag = false;
  for(let i=0;i<chatSequence.length;i++){
    if (stopFlag) return;
    const msg = chatSequence[i];

    showTyping(true);
    fakeInput.placeholder = msg.who === 'raj' ? 'Raj is typing…' : 'Icaa is typing…';
    const typingDelay = 800 + Math.min(msg.text.length * 12, 1600);
    await wait(typingDelay);

    if (stopFlag) return;
    showTyping(false);
    const el = createMsgEl(msg);
    messagesEl.appendChild(el);

    gsap.fromTo(el, {opacity:0, y:18, scale:0.98}, {opacity:1, y:0, scale:1, duration:0.7, ease:'back.out(0.45)'});
    scrollToBottom();

    if(msg.important){
      celebrateImportant(el);
      burst(78, 55);
    }

    if(msg.final){
      await wait(500);
      burst(60,50);
      gsap.timeline().to('.chat-stage', { boxShadow: '0 30px 80px rgba(156,39,176,0.18)', duration:0.6 })
        .fromTo('.chat-header .mood', { scale:0.6, opacity:0}, {scale:1, opacity:1, duration:0.6, ease:'elastic.out(1,0.6)'});
    }

    await wait(350 + Math.min(msg.text.length * 6, 700));
  }

  // final caption
  const caption = document.createElement('li');
  caption.className = 'msg raj';
  caption.innerHTML = `<div class="bubble">I Love You Icaa 💜</div>`;
  messagesEl.appendChild(caption);
  gsap.fromTo(caption, {opacity:0,y:20},{opacity:1,y:0,duration:0.9, ease:'power3.out'});
  scrollToBottom();
}

/* Bersihkan partikel */
function clearParticles() {
  document.querySelectorAll('.particle-wrap').forEach(el => el.remove());
}

/* Reset total */
function resetChat() {
  stopFlag = true; // hentikan playSequence lama
  playing = false;
  messagesEl.innerHTML = '';
  showTyping(false);
  clearParticles();
  chatWindow.scrollTop = 0;
}

/* Jalankan ulang */
async function startChatScene() {
  resetChat();
  playing = true;
  gsap.fromTo('.chat-stage', {opacity:0, y:24}, {opacity:1, y:0, duration:0.9, ease:'power3.out'});
  await wait(600);
  playSequence().then(() => playing = false);
}

/* Tombol replay manual */
if (replayBtn) {
  replayBtn.addEventListener('click', () => {
    if (playing) return;
    startChatScene();
  });
}

/* Observer otomatis */
observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !playing) {
      startChatScene();
      observer.disconnect();
    }
  });
}, { threshold: 0.6 });

observer.observe(document.querySelector('.romantic-chat-panel'));



// ===== PANEL 6: Langit Bintang + Quotes =====
const canvas6 = document.getElementById("starCanvas");
const ctx6 = canvas6.getContext("2d");
const quoteBox = document.getElementById("loveQuote");
const replayBtnStar = document.getElementById("replayStars");

let stars6 = [];
const quotes = [
  "Kamu itu kayak langit malam, gak perlu terang buat indah.",
  "Setiap bintang di sini, nyimpen doa kecil tentang kamu.",
  "Langit tahu, aku gak pernah berhenti nyari sinar matamu.",
  "Kalau aku bisa, aku mau gantung namamu di antara rasi bintang.",
  "Kita mungkin jauh, tapi langit ini selalu sama, kan?",
  "Aku gak butuh semua bintang, cukup kamu yang tetap bersinar di hidupku.",
  "Icaa, kadang aku cemburu pada langit yang selalu bersamamu"
];

function resizeCanvas6() {
  canvas6.width = window.innerWidth;
  canvas6.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas6);
resizeCanvas6();

function createStars6(count = 120) {
  stars6 = [];
  for (let i = 0; i < count; i++) {
    stars6.push({
      x: Math.random() * canvas6.width,
      y: Math.random() * canvas6.height,
      radius: Math.random() * 1.2,
      alpha: Math.random(),
      speed: Math.random() * 0.003 + 0.001
    });
  }
}

function drawStars6() {
  ctx6.clearRect(0, 0, canvas6.width, canvas6.height);
  stars6.forEach(s => {
    ctx6.beginPath();
    ctx6.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx6.fillStyle = `rgba(255,255,255,${s.alpha})`;
    ctx6.fill();
  });
}

function animateStars6() {
  stars6.forEach(s => {
    s.alpha += s.speed;
    if (s.alpha <= 0 || s.alpha >= 1) s.speed = -s.speed;
  });
  drawStars6();
  requestAnimationFrame(animateStars6);
}

function showQuote(x, y) {
  const text = quotes[Math.floor(Math.random() * quotes.length)];
  quoteBox.style.left = x - 150 + "px";
  quoteBox.style.top = y - 40 + "px";
  quoteBox.innerText = text;
  quoteBox.style.opacity = 1;
  setTimeout(() => (quoteBox.style.opacity = 0), 4000);
}

canvas6.addEventListener("click", e => {
  showQuote(e.clientX, e.clientY);
  gsap.fromTo("#loveQuote", { scale: 0.8 }, { scale: 1, duration: 0.5, ease: "elastic.out(1,0.4)" });
  gsap.to(canvas6, { backgroundColor: "#1a0f2e", duration: 1, yoyo: true, repeat: 1 });
});

replayBtnStar.addEventListener("click", () => {
  gsap.to("#loveQuote", { opacity: 0 });
  createStars6();
});

createStars6();
animateStars6();


// ===== PANEL 7: Gunung + Bintang Jatuh =====
const canvas7 = document.getElementById("stars");
const ctx7 = canvas7.getContext("2d");
let w7, h7;
let stars7 = [];
let shootingStar;

function resizeCanvas7() {
  w7 = canvas7.width = window.innerWidth;
  h7 = canvas7.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas7);
resizeCanvas7();

function createStars7(count = 150) {
  stars7 = [];
  for (let i = 0; i < count; i++) {
    stars7.push({
      x: Math.random() * w7,
      y: Math.random() * h7,
      radius: Math.random() * 1.2,
      speed: Math.random() * 0.5 + 0.2
    });
  }
}

function createShootingStar() {
  shootingStar = {
    x: Math.random() * w7,
    y: Math.random() * h7 / 2,
    len: Math.random() * 80 + 100,
    speed: Math.random() * 10 + 6,
    active: true
  };
}

function drawStars7() {
  ctx7.clearRect(0, 0, w7, h7);
  ctx7.fillStyle = "white";
  stars7.forEach(star => {
    ctx7.beginPath();
    ctx7.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx7.fill();
    star.y += star.speed;
    if (star.y > h7) star.y = 0;
  });
}

function drawShootingStar7() {
  if (!shootingStar.active) return;
  const grad = ctx7.createLinearGradient(
    shootingStar.x,
    shootingStar.y,
    shootingStar.x + shootingStar.len,
    shootingStar.y + shootingStar.len
  );
  grad.addColorStop(0, "white");
  grad.addColorStop(1, "transparent");
  ctx7.strokeStyle = grad;
  ctx7.lineWidth = 2;
  ctx7.beginPath();
  ctx7.moveTo(shootingStar.x, shootingStar.y);
  ctx7.lineTo(shootingStar.x + shootingStar.len, shootingStar.y + shootingStar.len);
  ctx7.stroke();

  shootingStar.x += shootingStar.speed;
  shootingStar.y += shootingStar.speed;

  if (shootingStar.x > w7 || shootingStar.y > h7) {
    shootingStar.active = false;
    setTimeout(createShootingStar, 4000);
  }
}

function animate7() {
  drawStars7();
  drawShootingStar7();
  requestAnimationFrame(animate7);
}

createStars7();
createShootingStar();
animate7();
