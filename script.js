
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

            /* ---------- Sidebar Navigation ---------- */
            document.querySelectorAll(".menu-item").forEach(item => {
                item.addEventListener("click", () => {
                    const index = parseInt(item.dataset.index);
                    const marginLeft =
                        parseFloat(getComputedStyle(panels[0]).marginLeft) || 0;
                    target = panels[index].offsetLeft - marginLeft;
                });
            });

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
