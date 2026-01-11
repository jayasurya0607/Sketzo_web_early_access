/* ============================================
   Pixel Meadows - JavaScript Interactions
   ============================================
   Keeping interactions minimal and pixel-like
   No smooth animations, only step transitions
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

    // === Custom Pixel Cursor with Smoke Trail ===
    const pixelCursor = document.getElementById('pixelCursor');
    const particleContainer = document.getElementById('particleContainer');
    let lastX = 0;
    let lastY = 0;
    let isMoving = false;
    let idleTimeout = null;
    let particleThrottle = 0;

    if (pixelCursor) {
        // Enable custom cursor immediately
        document.body.classList.add('custom-cursor-active');
        pixelCursor.classList.add('idle');
        pixelCursor.classList.add('facing-right'); // Default facing right

        // Track mouse movement
        document.addEventListener('mousemove', function (e) {
            // Update cursor position
            pixelCursor.style.left = e.clientX + 'px';
            pixelCursor.style.top = e.clientY + 'px';

            // Determine direction (flip sprite based on movement)
            const deltaX = e.clientX - lastX;

            if (Math.abs(deltaX) > 2) {
                if (deltaX < 0) {
                    pixelCursor.classList.remove('facing-right');
                    pixelCursor.classList.add('facing-left');
                } else {
                    pixelCursor.classList.remove('facing-left');
                    pixelCursor.classList.add('facing-right');
                }
            }

            // Check if moving
            const distance = Math.sqrt(Math.pow(e.clientX - lastX, 2) + Math.pow(e.clientY - lastY, 2));

            if (distance > 3) {
                // Mouse is moving - trigger running animation
                if (!isMoving) {
                    isMoving = true;
                    pixelCursor.classList.remove('idle');
                    pixelCursor.classList.add('running');
                }

                // Clear previous idle timeout
                if (idleTimeout) {
                    clearTimeout(idleTimeout);
                }

                // Set timeout to return to idle
                idleTimeout = setTimeout(function () {
                    isMoving = false;
                    pixelCursor.classList.remove('running');
                    pixelCursor.classList.add('idle');
                }, 150);
            }

            lastX = e.clientX;
            lastY = e.clientY;
        });

        // Hide cursor when leaving window
        document.addEventListener('mouseleave', function () {
            pixelCursor.style.opacity = '0';
        });

        // Show cursor when entering window
        document.addEventListener('mouseenter', function () {
            pixelCursor.style.opacity = '1';
        });

        // Add click effect
        document.addEventListener('mousedown', function () {
            pixelCursor.style.transform = 'translate(-50%, -50%) scale(0.9)';
            // Create burst of particles on click
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const offsetX = (Math.random() - 0.5) * 30;
                    const offsetY = (Math.random() - 0.5) * 30;
                    createSmokeParticle(lastX + offsetX, lastY + 25 + offsetY);
                }, i * 30);
            }
        });

        document.addEventListener('mouseup', function () {
            pixelCursor.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    }

    // === Smoke Particle Creation ===
    function createSmokeParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'smoke-particle';

        // Random size
        const sizes = ['small', 'medium', 'large'];
        const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
        particle.classList.add(randomSize);

        // Random color from palette
        const colors = ['color-1', 'color-2', 'color-3', 'color-4'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        particle.classList.add(randomColor);

        // Position with slight random offset
        const offsetX = (Math.random() - 0.5) * 10;
        const offsetY = Math.random() * 8;
        particle.style.left = (x + offsetX) + 'px';
        particle.style.top = (y + offsetY) + 'px';

        particleContainer.appendChild(particle);

        // Remove particle after animation completes
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
        }, 600);
    }

    // === Mobile Menu Toggle ===
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function () {
            navLinks.classList.toggle('active');

            // Toggle button appearance
            const spans = mobileMenuBtn.querySelectorAll('span');
            if (navLinks.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // === Active Navigation Link ===
    const sections = document.querySelectorAll('section[id]');
    const navLinksAll = document.querySelectorAll('.nav-link');

    function updateActiveNavLink() {
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinksAll.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // Throttled scroll listener
    let scrollTimeout;
    window.addEventListener('scroll', function () {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(updateActiveNavLink, 50);
    });

    // === Smooth Scroll (but with step-like behavior) ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            // Skip if it's an external link or empty hash
            if (!targetId || targetId === '#' || targetId.length <= 1) {
                return;
            }

            e.preventDefault();
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Close mobile menu if open
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }

                // Step-like scroll: jump in larger increments
                const targetPosition = targetElement.offsetTop - 100;
                const startPosition = window.scrollY;
                const distance = targetPosition - startPosition;
                const steps = 8;
                let currentStep = 0;

                function stepScroll() {
                    currentStep++;
                    const progress = currentStep / steps;
                    const newPosition = startPosition + (distance * progress);
                    window.scrollTo(0, newPosition);

                    if (currentStep < steps) {
                        setTimeout(stepScroll, 30);
                    }
                }

                stepScroll();
            }
        });
    });

    // === Form Submission ===
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');

            // Simple validation
            if (!name || !email || !message) {
                showPixelAlert('Please fill in all fields!', 'warning');
                return;
            }

            // Show success message (in real app, would send to server)
            showPixelAlert('Message sent successfully! We\'ll respond soon.', 'success');
            contactForm.reset();
        });
    }

    // === Pixel-style Alert ===
    function showPixelAlert(message, type) {
        // Remove existing alerts
        const existingAlert = document.querySelector('.pixel-alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // Create alert element
        const alert = document.createElement('div');
        alert.className = `pixel-alert pixel-alert-${type}`;
        alert.innerHTML = `
            <span class="alert-icon">${type === 'success' ? '✓' : '!'}</span>
            <span class="alert-text">${message}</span>
            <button class="alert-close">✕</button>
        `;

        // Style the alert
        Object.assign(alert.style, {
            position: 'fixed',
            top: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '16px 24px',
            backgroundColor: type === 'success' ? '#4a7a54' : '#c47a4a',
            border: '4px solid',
            borderColor: type === 'success' ? '#2a5a3c' : '#8a6848',
            boxShadow: `4px 4px 0 ${type === 'success' ? '#2a5a3c' : '#4a4238'}`,
            fontFamily: "'VT323', monospace",
            fontSize: '22px',
            color: '#f5efe8',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: '1000'
        });

        document.body.appendChild(alert);

        // Close button functionality
        alert.querySelector('.alert-close').addEventListener('click', function () {
            alert.remove();
        });

        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 4000);
    }

    // === Parallax-like effect for floating pixels ===
    const floatingPixels = document.querySelectorAll('.floating-pixel');

    window.addEventListener('scroll', function () {
        const scrollY = window.scrollY;

        floatingPixels.forEach((pixel, index) => {
            const speed = 0.1 + (index * 0.05);
            const yPos = Math.floor(scrollY * speed / 4) * 4; // Step movement
            pixel.style.transform = `translateY(${yPos}px)`;
        });
    });

    // === Add hover sound effect simulation (visual feedback) ===
    const buttons = document.querySelectorAll('.pixel-btn');

    buttons.forEach(button => {
        button.addEventListener('mouseenter', function () {
            // Quick flash effect
            this.style.filter = 'brightness(1.1)';
            setTimeout(() => {
                this.style.filter = 'none';
            }, 50);
        });
    });

    // === Gallery item interaction ===
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        item.addEventListener('click', function () {
            // Simple selection effect
            galleryItems.forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // === Video Background Handler ===
    const bgVideo = document.querySelector('.bg-video');
    const bgImage = document.querySelector('.bg-image');

    if (bgVideo) {
        // If video loads successfully, hide image fallback
        bgVideo.addEventListener('loadeddata', function () {
            if (bgImage) {
                bgImage.style.display = 'none';
            }
        });

        // If video fails to load, keep image visible
        bgVideo.addEventListener('error', function () {
            if (bgImage) {
                bgImage.style.display = 'block';
            }
        });
    }

    // === Authentication Modal ===
    const authModal = document.getElementById('authModal');
    const earlyAccessBtn = document.getElementById('earlyAccessBtn');
    const authCloseBtn = document.getElementById('authCloseBtn');
    const authModalBackdrop = document.getElementById('authModalBackdrop');
    const authTabs = document.querySelectorAll('.auth-tab');
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const authSuccess = document.getElementById('authSuccess');
    const authError = document.getElementById('authError');
    const authErrorText = document.getElementById('authErrorText');

    // Open modal
    if (earlyAccessBtn && authModal) {
        earlyAccessBtn.addEventListener('click', function () {
            authModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Close modal
    function closeAuthModal() {
        if (authModal) {
            authModal.classList.remove('active');
            document.body.style.overflow = '';
            hideError();
            hideSuccess();
        }
    }

    if (authCloseBtn) {
        authCloseBtn.addEventListener('click', closeAuthModal);
    }

    if (authModalBackdrop) {
        authModalBackdrop.addEventListener('click', closeAuthModal);
    }

    // Tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const tabName = this.dataset.tab;

            authTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            if (tabName === 'signin') {
                signInForm.classList.remove('hidden');
                signUpForm.classList.add('hidden');
            } else {
                signInForm.classList.add('hidden');
                signUpForm.classList.remove('hidden');
            }

            hideError();
        });
    });

    // Show error
    function showError(message) {
        if (authError && authErrorText) {
            authErrorText.textContent = message;
            authError.classList.remove('hidden');
        }
    }

    // Hide error
    function hideError() {
        if (authError) {
            authError.classList.add('hidden');
        }
    }

    // (Success state removed — Keep modal content as-is)
    function hideSuccess() {
        // No-op now, but kept so closeAuthModal() still calls it safely
    }

    // Show success message
    function showSuccess() {
        const googleBtn = document.querySelector('.google-btn');
        const authVideo = document.querySelector('.auth-video');
        const authTitle = document.querySelector('.auth-title');
        const authSubtitle = document.querySelector('.auth-subtitle');

        if (googleBtn) googleBtn.classList.add('hidden');
        if (authVideo) authVideo.classList.add('hidden');
        if (authTitle) authTitle.classList.add('hidden');
        if (authSubtitle) authSubtitle.classList.add('hidden');

        if (authSuccess) {
            authSuccess.classList.remove('hidden');
        }
    }

    // Google Sign In
    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', async function () {
            this.classList.add('loading');
            hideError();

            try {
                const result = await signInWithGoogle();
                if (result.success) {
                    showSuccess();
                } else {
                    showError(result.error || 'Google sign-in failed');
                }
            } catch (error) {
                console.error('Google sign-in error:', error);
                showError('Google sign-in failed. Please try again.');
            }

            this.classList.remove('loading');
        });
    }

    // Email Sign In
    if (signInForm) {
        signInForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = document.getElementById('signInEmail').value;
            const password = document.getElementById('signInPassword').value;
            const submitBtn = this.querySelector('.auth-submit-btn');

            submitBtn.classList.add('loading');
            hideError();

            try {
                const result = await signInWithEmail(email, password);
                if (result.success) {
                    showSuccess();
                } else {
                    showError(result.error);
                }
            } catch (error) {
                showError('Authentication is not configured yet. Please set up Firebase.');
            }

            submitBtn.classList.remove('loading');
        });
    }

    // Email Sign Up
    if (signUpForm) {
        signUpForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const name = document.getElementById('signUpName').value;
            const email = document.getElementById('signUpEmail').value;
            const password = document.getElementById('signUpPassword').value;
            const submitBtn = this.querySelector('.auth-submit-btn');

            submitBtn.classList.add('loading');
            hideError();

            try {
                const result = await signUpWithEmail(name, email, password);
                if (result.success) {
                    showSuccess();
                } else {
                    showError(result.error);
                }
            } catch (error) {
                showError('Authentication is not configured yet. Please set up Firebase.');
            }

            submitBtn.classList.remove('loading');
        });
    }

    // === Split-Layout Features Section - Natural Scroll with Intersection Observer ===
    const featureNavItems = document.querySelectorAll('.feature-nav-item');
    const featureDetailPanels = document.querySelectorAll('.feature-detail-panel');

    if (featureNavItems.length > 0 && featureDetailPanels.length > 0) {

        // Function to update active nav item
        function setActiveNavItem(index) {
            featureNavItems.forEach((item, i) => {
                item.classList.toggle('active', i === index);
            });
        }

        // Click handler for nav items - smooth scroll to corresponding panel
        featureNavItems.forEach((navItem, index) => {
            navItem.addEventListener('click', function () {
                const targetPanel = featureDetailPanels[index];
                if (targetPanel) {
                    targetPanel.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            });
        });

        // Intersection Observer - highlights nav item when panel is in view
        const observerOptions = {
            root: null,
            rootMargin: '-30% 0px -30% 0px', // Trigger when panel is in center 40% of viewport
            threshold: 0.1
        };

        const featureObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const panelIndex = parseInt(entry.target.dataset.panel);

                if (entry.isIntersecting) {
                    // Panel is in view - highlight corresponding nav item
                    setActiveNavItem(panelIndex);
                    entry.target.classList.add('in-view');
                } else {
                    entry.target.classList.remove('in-view');
                }
            });
        }, observerOptions);

        // Observe all feature panels
        featureDetailPanels.forEach(panel => {
            featureObserver.observe(panel);
        });

        console.log('✨ Features section natural scroll ready!');
    }

    // === Demo Image Carousel - Auto-scroll every 5 seconds ===
    const carouselTrack = document.querySelector('.carousel-track');
    const carouselSlides = document.querySelectorAll('.carousel-slide');
    const carouselDots = document.querySelectorAll('.carousel-dot');

    if (carouselTrack && carouselSlides.length > 0) {
        let currentSlide = 0;
        const totalSlides = carouselSlides.length;
        const autoScrollInterval = 1250; // 1 second

        // Function to go to a specific slide
        function goToSlide(index) {
            if (index < 0) index = totalSlides - 1;
            if (index >= totalSlides) index = 0;

            currentSlide = index;
            carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

            // Update dots
            carouselDots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentSlide);
            });
        }

        // Click handlers for dots
        carouselDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSlide(index);
            });
        });

        // Auto-scroll every 5 seconds
        let autoScroll = setInterval(() => {
            goToSlide(currentSlide + 1);
        }, autoScrollInterval);

        // Pause on hover
        const carousel = document.querySelector('.demo-carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', () => {
                clearInterval(autoScroll);
            });
            carousel.addEventListener('mouseleave', () => {
                autoScroll = setInterval(() => {
                    goToSlide(currentSlide + 1);
                }, autoScrollInterval);
            });
        }

        console.log('🖼️ Demo carousel ready - auto-scrolling every 5 seconds!');
    }

    // === Blog Modal Popup ===
    const blogModal = document.getElementById('blogModal');
    const blogModalTitle = blogModal?.querySelector('.blog-modal-title');
    const blogModalTag = blogModal?.querySelector('.blog-modal-tag');
    const blogModalBody = blogModal?.querySelector('.blog-modal-body');
    const blogModalClose = blogModal?.querySelector('.blog-modal-close');
    const blogModalOverlay = blogModal?.querySelector('.blog-modal-overlay');
    const blogLinks = document.querySelectorAll('.blog-link[data-blog-id]');

    if (blogModal && blogLinks.length > 0) {
        // Open modal when clicking Read more
        blogLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const blogId = link.dataset.blogId;
                const blogCard = document.querySelector(`.blog-card[data-blog="${blogId}"]`);

                if (blogCard) {
                    const title = blogCard.querySelector('.blog-title')?.textContent || '';
                    const tag = blogCard.querySelector('.blog-tag')?.textContent || '';
                    const fullContent = blogCard.querySelector('.blog-full-content')?.innerHTML || '';

                    blogModalTitle.textContent = title;
                    blogModalTag.textContent = tag;
                    blogModalBody.innerHTML = fullContent;

                    blogModal.hidden = false;
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        // Close modal function
        function closeBlogModal() {
            blogModal.hidden = true;
            document.body.style.overflow = '';
        }

        // Close on X button
        blogModalClose?.addEventListener('click', closeBlogModal);

        // Close on overlay click
        blogModalOverlay?.addEventListener('click', closeBlogModal);

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !blogModal.hidden) {
                closeBlogModal();
            }
        });

        console.log('📖 Blog modal ready!');
    }

    // === Blog Pagination (Arrow Navigation) ===
    const blogPrevBtn = document.querySelector('.blog-nav-prev');
    const blogNextBtn = document.querySelector('.blog-nav-next');
    const allBlogCards = document.querySelectorAll('.blog-card');

    if (blogPrevBtn && blogNextBtn && allBlogCards.length > 0) {
        let currentBlogPage = 1;
        const blogsPerPage = 3;
        const totalPages = Math.ceil(allBlogCards.length / blogsPerPage);

        function updateBlogDisplay() {
            allBlogCards.forEach((card, index) => {
                const cardPage = Math.floor(index / blogsPerPage) + 1;
                if (cardPage === currentBlogPage) {
                    card.classList.remove('blog-hidden');
                } else {
                    card.classList.add('blog-hidden');
                }
            });

            // Update button states
            blogPrevBtn.disabled = currentBlogPage === 1;
            blogNextBtn.disabled = currentBlogPage === totalPages;
        }

        blogPrevBtn.addEventListener('click', () => {
            if (currentBlogPage > 1) {
                currentBlogPage--;
                updateBlogDisplay();
            }
        });

        blogNextBtn.addEventListener('click', () => {
            if (currentBlogPage < totalPages) {
                currentBlogPage++;
                updateBlogDisplay();
            }
        });

        // Initialize display
        updateBlogDisplay();

        console.log('📄 Blog pagination ready!');
    }

    // === Initialize ===
    updateActiveNavLink();

    console.log('🌾 Pixel Meadows loaded successfully!');
    console.log('🔐 Early Access authentication ready!');
});

