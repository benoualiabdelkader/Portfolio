// ========== PORTFOLIO WEBSITE JAVASCRIPT ==========

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeApp();
    } catch (error) {
        console.error('Critical error during initialization:', error);
        // Fallback: at least try to set the theme
        try {
            setInitialTheme();
        } catch (themeError) {
            console.error('Failed to set initial theme:', themeError);
        }
    }
});

// ========== INITIALIZATION ==========
function initializeApp() {
    try {
        // Initialize all components
        initializeThemeToggle();
        initializeLanguageSelector();
        initializeMobileMenu();
        initializeHeaderScroll();
        initializeScrollAnimations();
        initializeSkillBars();
        initializeProjectModals();
    initializeProjectFilters();
        initializeContactForm();
        initializeSmoothScrolling();
        initializeParallaxEffects();
        initializeCertificatesSlider();
        initializeCertificateViewer();
    initializeSkillBubbles();
    // New: build animated skill spheres from semantic list
    initializeSkillSpheres();
        initializeLogoLinks();
        initializeLazyLoading();
        initializeAudioDownload();
    initializeHeroSocials();
        initializeHeroTypingControls();
        
        // Set initial theme
        setInitialTheme();
        
        // Initialize animations with delay
        setTimeout(() => {
            initializeCounterAnimation();
            initializeTypingAnimation();
            // Start the enhanced hero typing animation on load
            try { initializeHeroTyping(); } catch (e) {  }
        }, 500);

            // Hero section removed from HTML — skip hero-specific initialization
// Smooth scroll for ABZ logo link - consolidated
function initializeLogoLinks() {
    document.querySelectorAll('.logo-link').forEach(link => {
        link.addEventListener('click', function(e) {
            // Force navigate to home section
            const target = document.querySelector('#home');
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Hero socials: add click animation and ensure accessible behavior
function initializeHeroSocials() {
    try {
        document.querySelectorAll('.hero-socials .social').forEach(el => {
            el.addEventListener('click', (e) => {
                // tiny pulse effect on click
                el.classList.add('social-clicked');
                setTimeout(() => el.classList.remove('social-clicked'), 420);
            });
            // ensure keyboard activation has same visual
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    el.classList.add('social-clicked');
                    setTimeout(() => el.classList.remove('social-clicked'), 420);
                }
            });
        });

        // small handler for WhatsApp CTA to add glow and log
        const wa = document.querySelector('.hero-cta a[href*="wa.me"]');
        if (wa) {
            wa.addEventListener('click', () => {
                wa.classList.add('wa-clicked');
                setTimeout(() => wa.classList.remove('wa-clicked'), 600);
                            });
        }
    } catch (e) {  }
}

// ========== LAZY LOADING FOR IMAGES ==========
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src], img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px', // Start loading 50px before entering viewport
            threshold: 0.01
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers without IntersectionObserver
        images.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
            img.classList.remove('lazy');
        });
    }
}

// Build and wire project filters based on projectData types
function initializeProjectFilters() {
    try {
        // Reconstruct the same projectData map used by initializeProjectModals
        const projectCards = Array.from(document.querySelectorAll('.project-card'));
        if (!projectCards.length) return;

        // Gather types from DOM 'data-project' attributes by looking up projectData from the module scope
        // To avoid duplicating projectData, attempt to read from the function scope by recreating the map
        // We'll use the same keys: look up type via dataset attributes on cards (data-type fallback)
        const types = new Set();
        projectCards.forEach(card => {
            // prefer explicit data-type attribute, otherwise infer from card content (title) via mapping below
            const t = card.dataset.type;
            if (t) types.add(t);
        });

        // Fallback: if no data-type attributes present, use categories derived from existing UI (voice/listen/presentation)
        if (!types.size) {
            projectCards.forEach(card => {
                const btn = card.querySelector('.project-btn');
                const txt = btn ? (btn.textContent || '').toLowerCase() : '';
                if (txt.includes('listen') || txt.includes('استمع')) types.add('voiceover');
                else if (txt.includes('presentation') || txt.includes('presentation') || txt.includes('عرض')) types.add('presentation');
                else types.add('webdev');
            });
        }

        const container = document.getElementById('projectFilters');
        if (!container) return;

        // Insert a fixed, carefully-styled set of filters (keeps order predictable)
        const filters = [
            { key: 'all', label: 'All', icon: '<span class="filter-icon"><i class="fas fa-star"></i></span>' },
            { key: 'presentation', label: 'Presentation', icon: '<span class="filter-icon"><i class="fas fa-file-powerpoint"></i></span>' },
            { key: 'voiceover', label: 'Voiceover', icon: '<span class="filter-icon"><i class="fas fa-microphone"></i></span>' },
            { key: 'webdev', label: 'Webdev', icon: '<span class="filter-icon"><i class="fas fa-code"></i></span>' },
            { key: 'chatbot', label: 'Chatbot', icon: '<span class="filter-icon"><i class="fas fa-robot"></i></span>' },
        ];

        // If container already has buttons (e.g., server-rendered), skip adding
        if (!container.querySelector('.project-filter-btn')) {
            filters.forEach((f, i) => {
                const btn = document.createElement('button');
                btn.className = 'project-filter-btn';
                btn.dataset.filter = f.key;
                btn.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
                btn.innerHTML = `${f.icon}<span class="filter-label">${f.label}</span>`;
                container.appendChild(btn);
            });
        }

        // filter handler (supports multiple types/tags per project and looks up PROJECT_DATA when available)
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.project-filter-btn');
            if (!btn) return;
            const filter = (btn.dataset.filter || '').toLowerCase();

            // update pressed states
            container.querySelectorAll('.project-filter-btn').forEach(b => b.setAttribute('aria-pressed', 'false'));
            btn.setAttribute('aria-pressed', 'true');

            // show/hide project cards
            document.querySelectorAll('.project-card').forEach(card => {
                const pid = card.dataset.project;
                let types = [];

                // Prefer explicit data attributes on the card (data-type or data-tags)
                if (card.dataset.type) {
                    types = card.dataset.type.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
                } else if (card.dataset.tags) {
                    types = card.dataset.tags.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
                } else if (window.PROJECT_DATA && window.PROJECT_DATA[pid]) {
                    // Fallback to PROJECT_DATA map if available
                    const pd = window.PROJECT_DATA[pid];
                    if (Array.isArray(pd.types)) types = pd.types.map(t => String(t).toLowerCase());
                    else if (pd.type) types = [String(pd.type).toLowerCase()];
                    else if (Array.isArray(pd.technologies)) types = pd.technologies.map(t => String(t).toLowerCase());
                } else {
                    // Last-resort heuristic from button text
                    const btnText = (card.querySelector('.project-btn')?.textContent || '').toLowerCase();
                    if (btnText.includes('listen') || btnText.includes('استمع')) types.push('voiceover');
                    if (btnText.includes('presentation') || btnText.includes('عرض')) types.push('presentation');
                    if (btnText.includes('project') || btnText.includes('view')) types.push('webdev');
                }

                // If the filter is 'all' show everything
                if (filter === 'all' || !filter) {
                    card.classList.remove('hidden');
                    return;
                }

                // Match when any of the project's types/tags equals the filter
                const matches = types.some(t => t === filter);

                if (matches) card.classList.remove('hidden'); else card.classList.add('hidden');
            });
        });

    } catch (e) {  }
}

// ========== AUDIO DOWNLOAD FUNCTIONALITY ==========
function initializeAudioDownload() {
    const downloadBtn = document.getElementById('downloadAudioBtn');

    if (!downloadBtn) return;

    // Use the anchor's href when available (native download) otherwise fallback to audio element
    downloadBtn.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href && href !== '#') {
            // Let the browser handle the download via the anchor tag
            return;
        }

        // No valid href set: try to find the audio element inside the voiceAudioContainer
        e.preventDefault();
        const audioContainer = document.getElementById('voiceAudioContainer');
        if (audioContainer) {
            const audioElement = audioContainer.querySelector('audio');
            if (audioElement && audioElement.src) {
                const link = document.createElement('a');
                link.href = audioElement.src;
                link.download = this.getAttribute('download') || 'voice-over-audio.mp3';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                return;
            }
        }

            });
}
        
        // Loading animation removed - using hourglass loading screen instead
    } catch (error) {
        console.error('Error during app initialization:', error);
    }
}

// Skill bubble interactions: hover + active selection + keyboard support
function initializeSkillBubbles() {
    try {
        const bubbles = document.querySelectorAll('.skill-bubble');
        if (!bubbles || bubbles.length === 0) return;

        bubbles.forEach(bubble => {
            // hover effects handled by CSS; add active toggle on click
            bubble.addEventListener('click', function() {
                bubbles.forEach(b => b.classList.remove('active-bubble'));
                this.classList.add('active-bubble');
            });

            bubble.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });

        // Make the first bubble active by default for clarity
        bubbles[0].classList.add('active-bubble');
    } catch (e) {
            }
}

// Create animated glowing spheres for the Skills section based on the semantic hidden list
function initializeSkillSpheres() {
    try {
        const container = document.getElementById('skillsSpheres');
        const dataList = document.querySelectorAll('.skills-data li');
        if (!container || !dataList || dataList.length === 0) return;

        // Clear any previous content
        container.innerHTML = '';

        // Basic layout bounds
        const bounds = container.getBoundingClientRect();
        const w = Math.max(bounds.width, 600);
        const h = Math.max(bounds.height, 240);

        // Helper to randomize positions
        const rand = (min, max) => Math.random() * (max - min) + min;

        // Predefined sizes for visual variety
        const sizes = [72, 92, 112, 136, 56, 80];

        // small mapping from skill name to FA icon class
        const iconMap = {
            'HTML': 'fab fa-html5',
            'CSS': 'fab fa-css3-alt',
            'JavaScript': 'fab fa-js',
            'Python': 'fab fa-python',
            'IT Support': 'fas fa-headset',
            'Word': 'fas fa-file-word',
            'PowerPoint': 'fas fa-file-powerpoint',
            'Excel': 'fas fa-file-excel',
            'Figma': 'fab fa-figma'
        };

        const placed = [];
        const maxAttempts = 24;

        dataList.forEach((li, i) => {
            const text = li.textContent.trim();
            const size = sizes[i % sizes.length];

            // find a non-overlapping position (basic packing heuristic)
            let left, top;
            let attempts = 0;
            do {
                left = Math.round(rand(12, 88));
                top = Math.round(rand(18, 78));
                attempts++;
                // check overlap against placed positions
                let conflict = false;
                for (const p of placed) {
                    const dx = (left - p.left) * (w / 100);
                    const dy = (top - p.top) * (h / 100);
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < (size + p.size) * 0.45) { // heuristic threshold
                        conflict = true;
                        break;
                    }
                }
                if (!conflict) break;
            } while (attempts < maxAttempts);

            const sphere = document.createElement('button');
            sphere.className = 'sphere';
            sphere.type = 'button';
            sphere.setAttribute('aria-label', text + ' skill');
            sphere.setAttribute('role', 'button');
            sphere.setAttribute('tabindex', '0');

            // Random anchored position within container (percent)
            sphere.style.left = left + '%';
            sphere.style.top = top + '%';
            sphere.style.width = size + 'px';
            sphere.style.height = size + 'px';

            // remember this sphere for future overlap checks
            placed.push({ left, top, size });

            // Add subtle animation flags to vary motion
            if (i % 2 === 0) sphere.dataset.animate = 'float';
            else sphere.dataset.animate = 'float-y';

            const inner = document.createElement('div');
            inner.className = 'sphere-inner';

            // insert icon element if mapping exists
            const faClass = iconMap[text] || 'fas fa-star';
            const iconEl = document.createElement('i');
            iconEl.className = faClass + ' sphere-icon';
            inner.appendChild(iconEl);

            const label = document.createElement('div');
            label.className = 'skill-label';
            label.textContent = text;

            sphere.appendChild(inner);
            sphere.appendChild(label);

            // Keyboard/Click interaction: announce (via visually showing label) and pulse
            sphere.addEventListener('click', () => {
                // temporary larger pulse
                sphere.style.transform = 'translate(-50%, -50%) scale(1.12)';
                setTimeout(() => sphere.style.transform = '', 420);
            });

            sphere.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    sphere.click();
                }
            });

            container.appendChild(sphere);
        });

        // Respect reduced motion preference: pause animations
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            container.querySelectorAll('.sphere').forEach(s => s.style.animation = 'none');
        }
    } catch (e) {
            }
}

// Normalize image path for cross-platform file:// usage and handle spaces
function normalizePath(p) {
    if (!p) return p;
    // If it's an absolute URL (http/https/data) return as-is
    if (/^(https?:|data:|file:)/i.test(p)) return p;
    // Replace backslashes with forward slashes
    let path = p.replace(/\\/g, '/');
    // Encode spaces and special characters
    path = path.split('/').map(segment => encodeURI(segment)).join('/');
    return path;
}

// ========== HERO ROLE ROTATOR ==========
function initializeRoleRotator() {
    try {
            // support both old and new markup for backward compatibility
            // First look for new hero rotator markup
            const heroRotator = document.querySelector('.hero-rotator');
            if (heroRotator) {
                const items = Array.from(heroRotator.querySelectorAll('.rot-item'));
                if (items.length === 0) return;

                let current = 0;
                items.forEach((it, i) => {
                    it.classList.remove('active', 'out');
                    if (i === 0) it.classList.add('active');
                });

                const interval = setInterval(() => {
                    const prev = current;
                    current = (current + 1) % items.length;

                    // animate previous out
                    items[prev].classList.remove('active');
                    items[prev].classList.add('out');

                    setTimeout(() => {
                        items[prev].classList.remove('out');
                    }, 700);

                    // show next
                    items[current].classList.add('active');
                }, 3200);

                heroRotator.dataset.rotatorInterval = interval;
                return;
            }

            // Legacy support: if roles-wrapper exists (old markup), keep previous behavior
            const legacy = document.querySelector('.roles-wrapper') || document.querySelector('.hero-roles');
            if (!legacy) return;
            const roles = Array.from(legacy.querySelectorAll('.role'));
            if (roles.length === 0) return;

            let currentLegacy = 0;
            const showRoleLegacy = (index) => {
                roles.forEach((r) => {
                    r.style.animation = 'none';
                    r.style.opacity = '0';
                });
                const el = roles[index];
                el.style.animation = 'role-in 700ms cubic-bezier(.2,.9,.2,1) forwards';
                el.style.opacity = '1';
                setTimeout(() => {
                    el.style.animation = 'role-out 600ms cubic-bezier(.2,.9,.2,1) forwards';
                }, 2200);
            };

            showRoleLegacy(currentLegacy);
            const intervalLegacy = setInterval(() => {
                currentLegacy = (currentLegacy + 1) % roles.length;
                showRoleLegacy(currentLegacy);
            }, 3000);
            legacy.dataset.rotatorInterval = intervalLegacy;
    } catch (error) {
        console.error('Role rotator failed:', error);
    }
}

// ========== THEME TOGGLE FUNCTIONALITY ==========
function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    if (!themeToggle) {
                return;
    }
    
    themeToggle.addEventListener('click', function() {
        body.classList.toggle('dark-mode');
        
        // Update icon
        const icon = themeToggle.querySelector('i');
        if (icon) {
            if (body.classList.contains('dark-mode')) {
                icon.className = 'fas fa-sun';
                localStorage.setItem('theme', 'dark');
            } else {
                icon.className = 'fas fa-moon';
                localStorage.setItem('theme', 'light');
            }
        }
        
        // Add animation effect
        themeToggle.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            themeToggle.style.transform = 'rotate(0deg)';
        }, 300);
    });
}

function setInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    
    if (!themeToggle) {
                return;
    }
    
    const icon = themeToggle.querySelector('i');
    
    if (savedTheme === 'light') {
        body.classList.remove('dark-mode');
        if (icon) icon.className = 'fas fa-moon';
    } else {
        body.classList.add('dark-mode');
        if (icon) icon.className = 'fas fa-sun';
    }
}

// ========== LANGUAGE SELECTOR ==========
function initializeLanguageSelector() {
    const langBtn = document.getElementById('langBtn');
    const langDropdown = document.getElementById('langDropdown');
    const langOptions = document.querySelectorAll('.lang-option');
    
    if (!langBtn || !langDropdown) {
                return;
    }
    
    // Toggle dropdown
    langBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        langDropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        langDropdown.classList.remove('active');
    });
    
    // Handle language selection
    langOptions.forEach(option => {
        option.addEventListener('click', function() {
            const selectedLang = this.dataset.lang;
            const langText = this.textContent;
            
            // Update button text
            langBtn.innerHTML = `${getLanguageCode(selectedLang)} <i class="fas fa-chevron-down"></i>`;
            
            // Close dropdown
            langDropdown.classList.remove('active');
            
            // Apply language
            applyLanguage(selectedLang);
            
            // Save to localStorage
            localStorage.setItem('language', selectedLang);
        });
    });
    
    // Load saved language
    const savedLanguage = localStorage.getItem('language') || 'en';
    // Set button text immediately to saved language code to avoid flicker
    langBtn.innerHTML = `${getLanguageCode(savedLanguage)} <i class="fas fa-chevron-down"></i>`;
    applyLanguage(savedLanguage);
}

function getLanguageCode(lang) {
    const codes = {
        'en': 'EN',
        'fr': 'FR',
        'ar': 'AR'
    };
    return codes[lang] || 'EN';
}

function applyLanguage(lang) {
    try {
        const translations = getTranslations();
        const elements = document.querySelectorAll('[data-translate]');
        
        if (!translations[lang]) {
                        lang = 'en';
        }
        
        elements.forEach(element => {
            const key = element.dataset.translate;
            if (translations[lang] && translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });

        // Translate placeholders for inputs/textareas
        try {
            const placeholderElements = document.querySelectorAll('[data-translate-placeholder]');
            placeholderElements.forEach(el => {
                const key = el.dataset.translatePlaceholder;
                if (translations[lang] && translations[lang][key]) {
                    if (el.tagName.toLowerCase() === 'input' || el.tagName.toLowerCase() === 'textarea') {
                        el.placeholder = translations[lang][key];
                    } else {
                        el.setAttribute('placeholder', translations[lang][key]);
                    }
                }
            });
        } catch (e) {}
        
        // Update language button
        const langBtn = document.getElementById('langBtn');
        if (langBtn) {
            langBtn.innerHTML = `${getLanguageCode(lang)} <i class="fas fa-chevron-down"></i>`;
        }

        // Apply RTL for Arabic
        const documentElement = document.documentElement;
        const body = document.body;
        
        if (lang === 'ar') {
            documentElement.setAttribute('dir', 'rtl');
            documentElement.setAttribute('lang', 'ar');
            body.classList.add('rtl');
        } else {
            documentElement.setAttribute('dir', 'ltr');
            documentElement.setAttribute('lang', lang);
            body.classList.remove('rtl');
        }

        // Update document title and meta description (SEO)
        try {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (translations[lang].metaTitle) document.title = translations[lang].metaTitle;
            if (translations[lang].metaDescription) {
                if (metaDesc) metaDesc.setAttribute('content', translations[lang].metaDescription);
                else {
                    const m = document.createElement('meta');
                    m.name = 'description';
                    m.content = translations[lang].metaDescription;
                    document.head.appendChild(m);
                }
            }
        } catch (e) {
                    }

        // Update hero greeting and role dataset used by typing animation
        try {
            const greetingEl = document.querySelector('.hero-greeting');
            const rolesEl = document.querySelector('.hero-typed-roles');
            if (greetingEl && translations[lang]['hero-greeting']) {
                greetingEl.dataset.text = translations[lang]['hero-greeting'];
                // If element has data-translate key, also set its content
                if (greetingEl.dataset.translate) greetingEl.textContent = translations[lang][greetingEl.dataset.translate] || greetingEl.textContent;
            }
            if (rolesEl && translations[lang]['hero-roles']) {
                rolesEl.dataset.text = translations[lang]['hero-roles'];
                if (rolesEl.dataset.translate) rolesEl.textContent = translations[lang][rolesEl.dataset.translate] || rolesEl.textContent;
            }
        } catch (e) {}

        // Translate project cards which do not have data-translate attributes
        try {
            const projectCards = document.querySelectorAll('.project-card');
            projectCards.forEach(card => {
                const id = card.dataset.project;
                if (!id) return;
                const titleEl = card.querySelector('.project-title');
                const descEl = card.querySelector('.project-description');
                const btnEl = card.querySelector('.project-btn');

                const titleKey = `project-${id}-title`;
                const descKey = `project-${id}-desc`;
                if (titleEl && translations[lang][titleKey]) titleEl.textContent = translations[lang][titleKey];
                if (descEl && translations[lang][descKey]) descEl.textContent = translations[lang][descKey];

                if (btnEl) {
                    const span = btnEl.querySelector('span');
                    // Determine appropriate label (listen vs view)
                    const current = (span && span.textContent) ? span.textContent.toLowerCase() : btnEl.textContent.toLowerCase();
                    if (current.includes('listen') || current.includes('استمع') || current.includes('écouter') ) {
                        if (span) span.textContent = translations[lang]['btn-listen'] || translations[lang]['view-project'];
                        else btnEl.textContent = translations[lang]['btn-listen'] || translations[lang]['view-project'];
                    } else if (current.includes('presentation') || current.includes('presentation') || current.includes('présentation')) {
                        if (span) span.textContent = translations[lang]['view-presentation'] || translations[lang]['view-project'];
                        else btnEl.textContent = translations[lang]['view-presentation'] || translations[lang]['view-project'];
                    } else {
                        if (span) span.textContent = translations[lang]['view-project'] || span.textContent;
                        else btnEl.textContent = translations[lang]['view-project'] || btnEl.textContent;
                    }
                }
            });
        } catch (e) {}

        // Translate hero WhatsApp CTA (preserve icon)
        try {
            const waBtn = document.querySelector('.hero-cta a[href*="wa.me"]');
            if (waBtn && translations[lang]['btn-whatsapp']) {
                waBtn.innerHTML = `<i class="fab fa-whatsapp"></i> ${translations[lang]['btn-whatsapp']}`;
            }
        } catch (e) {}

        // Localize contact form validation messages by storing current language for other functions
        try {
            localStorage.setItem('language', lang);
        } catch (e) {}

        // Restart hero typing animation so the new datasets are used
        try {
            setTimeout(() => {
                initializeHeroTyping();
            }, 120);
        } catch (e) {}
    } catch (error) {
        console.error('Error applying language:', error);
    }
}

function getCurrentLanguage() {
    return localStorage.getItem('language') || 'en';
}

function getTranslations() {
    return {
        en: {
            metaTitle: 'Abdelkader Benouali - Frontend Developer & UI/UX Designer',
            metaDescription: 'Frontend developer, UI/UX designer, and AI enthusiast creating responsive web and mobile experiences.',
            // Navigation
            'nav-home': 'Home',
            'nav-about': 'About',
            'nav-projects': 'Projects',
            'nav-services': 'Services',
            'nav-skills': 'Skills',
            'nav-certificates': 'Certificates',
            'nav-contact': 'Contact',

            // Hero
            'hero-greeting': "Hi, it's",
            'hero-roles': "I'am a Frontend Devloper|I'am UI/UX Designer|I'am Ai enthinlis|I'am IT support speacilts",
            'hero-subtitle': "I'am a Frontend Devloper",
            'hero-description': "Passionate about creating innovative digital solutions, with 3+ years of experience in Front end and Ui ux , AI chatbots, presentation design, and voice over services.",
            'btn-whatsapp': 'WhatsApp Me',
            'btn-contact': 'Get In Touch',
            'btn-listen': 'Listen',
            'view-presentation': 'View Presentation',
            'view-project': 'View Project',

            // About
            'about-title': 'About Me',
            'about-heading': 'Passionate Developer & Designer with Creative Vision',
            'about-description': "I am a dedicated AI enthusiast, accomplished  UI/UX designer, versatile front end developer, and experienced IT support specialist with over three years of professional expertise in designing, developing, and delivering innovative, user centric digital solutions. My work blends creativity, technical precision, and emerging technologies to build seamless experiences that solve real world problems, optimize performance, and empower users. With a strong foundation in modern frameworks, problem solving, and cross functional collaboration, I continually push boundaries to transform ideas into impactful digital products that drive innovation and success.",
            'projects-completed': 'Projects Completed',
            'years-experience': 'Years Experience',
            'certifications': 'Certifications',
            'certificates-title': 'Certifications',

            // Services
            'services-title': 'My Services',
            'svc-mobile': 'Mobile Development',
            'svc-ai': 'AI Chatbots',
            'svc-uiux': 'UI/UX Design',
            'svc-presentation': 'Presentation Design',
            'svc-voice': 'Voice Over',

            // Projects (short keys used to populate cards)
            'projects-title': 'Featured Projects',
            // project-{id}-title and project-{id}-desc (english)
            'project-1-title': 'AIGenX - AI Platform',
            'project-1-desc': 'Revolutionary AI platform that turns imagination into reality',
            'project-2-title': 'Fatmote - Food Delivery App',
            'project-2-desc': 'Modern food delivery app with intuitive user experience',
            'project-3-title': 'Fitness & Nutrition Tracker',
            'project-3-desc': 'Comprehensive health and fitness tracking application',
            'project-4-title': 'Movie Streaming App',
            'project-4-desc': 'Sleek movie streaming platform with modern interface',
            'project-5-title': 'Send Money App',
            'project-5-desc': 'Secure and user-friendly money transfer application',
            'project-6-title': 'Travel Planning App',
            'project-6-desc': 'Beautiful travel planning and booking application',
            // Named project keys used in HTML
            'project-aigenx-title': 'AIGenX - AI Platform',
            'project-aigenx-desc': 'Revolutionary AI platform that turns imagination into reality',
            'project-fatmote-title': 'Fatmote - Food Delivery App',
            'project-fatmote-desc': 'Modern food delivery app with intuitive user experience',
            'project-fitness-title': 'Fitness & Nutrition Tracker',
            'project-fitness-desc': 'Comprehensive health and fitness tracking application',
            'project-movie-title': 'Movie Streaming App',
            'project-movie-desc': 'Sleek movie streaming platform with modern interface',
            'project-sendmoney-title': 'Send Money App',
            'project-sendmoney-desc': 'Secure and user-friendly money transfer application',
            'project-travel-title': 'Travel Planning App',
            'project-travel-desc': 'Beautiful travel planning and booking application',
            'tag-foodtech': 'Food Tech',
            'project-7-title': 'SAFE - Safe Water Safe Money',
            'project-7-desc': 'AAF Summer University 2025 entrepreneurship project proposal',
            'project-8-title': 'Artificial Intelligence: An Introduction to the Future',
            'project-8-desc': 'Comprehensive AI overview covering history, applications, and future',
            'project-9-title': 'My Portfolio',
            'project-9-desc': 'A showcase of my best work in UI/UX, frontend, AI, and more.',
            'project-10-title': 'Multimodal Interfaces',
            'project-10-desc': 'Technical analysis of multimodal interaction design and applications',
            'project-11-title': 'SSD Drives: A Revolution in Storage',
            'project-11-desc': 'Technical presentation on solid-state drive technology impact',
            'project-12-title': 'Quora Knowledge Hub',
            'project-12-desc': 'Analysis of knowledge sharing platforms and societal impact',
            'project-13-title': 'PrimeVision - Movie & TV Tracker',
            'project-13-desc': 'Discover, track, and manage movies & TV shows with AI recommendations',
            'project-14-title': 'Wanderlust AI - Travel Companion',
            'project-14-desc': 'AI-powered travel companion for smart itinerary planning',
            'project-15-title': 'NewsBot - AI News Assistant',
            'project-15-desc': 'AI-powered chatbot with Google Gemini for real-time news',
            'project-16-title': 'Tech-Nova-Shop - Electronics Store',
            'project-16-desc': 'Modern e-commerce website with Tailwind CSS and JavaScript',
            'project-17-title': 'Algeria - Land of Heroes',
            'project-17-desc': "Documentary narration celebrating Algeria's heroic legacy",
            'project-18-title': 'The Little Prince',
            'project-18-desc': 'Heartwarming narration of the beloved classic tale',
            'project-19-title': 'Le Petit Prince (French)',
            'project-19-desc': "Beautiful French narration of Saint-Exupéry's masterpiece",
            'project-20-title': 'The Quantum Breakthrough',
            'project-20-desc': 'Scientific narration exploring quantum physics',
            'project-21-title': 'Future Destiny',
            'project-21-desc': "Visionary exploration of humanity's potential futures",
            'project-22-title': 'The Crusades Unveiled',
            'project-22-desc': 'Dramatic historical narration of medieval conflicts',
            'project-23-title': 'زيكولا - تحليل نفسي',
            'project-23-desc': 'تحليل نفسي للنجاة المتجددة في الأدب الحديث',
            'project-24-title': 'Personal Portfolio',
            'project-24-desc': 'My personal portfolio showcasing skills, projects, and professional journey',

            // Project buttons and tags
            'btn-view-details-1': 'View Details',
            'btn-view-details-2': 'View Details',
            'btn-view-details-3': 'View Details',
            'btn-view-details-4': 'View Details',
            'btn-view-details-5': 'View Details',
            'btn-view-details-6': 'View Details',
            'btn-view-certificate': 'View Certificate',
            'tag-uiux': 'UI/UX Design',
            'tag-figma': 'Figma',
            'tag-aiml': 'AI/ML',
            'tag-mobile': 'Mobile Design',

            // Modal and project modal labels
            'modal-title': 'Project Title',
            'modal-description-title': 'Project Description',

            // Contact
            'contact-title': "Let's Work Together",
            'contact-subtitle': "Have a project in mind? Let's discuss how we can bring your ideas to life.",
            'form-name': 'Your Name',
            'form-email': 'Your Email',
            'form-message': 'Your Message',
            'form-submit': 'Send Message',
            'placeholder-name': 'Your name',
            'placeholder-email': 'your.email@example.com',
            'placeholder-message': 'How can I help you?',
            'contact-email': 'Email',
            'contact-phone': 'Phone',
            'contact-location': 'Location',
            'contact-whatsapp': 'WhatsApp',
            'contact-country': 'Algeria',

            // Footer
            'footer-text': 'I am a passionate front end developer and UI/UX designer dedicated to crafting innovative digital solutions with cutting edge technologies.',
            'footer-quick-links': 'Quick Links',
            'footer-services': 'Services',
            'footer-contact-info': 'Contact Info',
            'footer-available': 'Available 24/7'
        },
        fr: {
            metaTitle: 'Abdelkader Benouali - Développeur Frontend & Designer UI/UX',
            metaDescription: 'Développeur frontend, designer UI/UX et passionné d’IA créant des expériences web et mobiles réactives.',
            // Navigation
            'nav-home': 'Accueil',
            'nav-about': 'À propos',
            'nav-projects': 'Projets',
            'nav-services': 'Services',
            'nav-skills': 'Compétences',
            'nav-certificates': 'Certificats',
            'nav-contact': 'Contact',

            // Hero
            'hero-greeting': 'Bonjour, je suis',
            'hero-roles': "Je suis développeur Frontend | Je suis UI/UX Designer | Je suis passionné par l'IA | Je suis spécialiste support IT",
            'hero-subtitle': 'Je suis développeur Frontend',
            'hero-description': "Passionné par la création de solutions numériques innovantes, avec plus de 3 ans d'expérience en développement Front end, UI/UX, chatbots IA, conception de présentations et services de voix-off.",
            'btn-whatsapp': 'Contactez-moi sur WhatsApp',
            'btn-contact': 'Entrer en contact',
            'btn-listen': 'Écouter',
            'view-presentation': 'Voir la présentation',
            'view-project': 'Voir le projet',

            // About
            'about-title': 'À propos de moi',
            'about-heading': 'Développeur et designer passionné, vision créative',
            'about-description': "Je suis un passionné d'IA, designer UI/UX accompli, développeur frontend polyvalent, et spécialiste support IT avec plus de trois ans d'expérience professionnelle dans la conception, le développement et la livraison de solutions numériques centrées utilisateur. Mon travail mêle créativité, précision technique et technologies émergentes pour construire des expériences fluides qui résolvent des problèmes réels, optimisent les performances et responsabilisent les utilisateurs.",
            'projects-completed': 'Projets terminés',
            'years-experience': "Années d'expérience",
            'certifications': 'Certifications',
            'certificates-title': 'Certifications',

            // Services (footer/service list)
            'services-title': 'Mes services',
            'svc-mobile': 'Développement mobile',
            'svc-ai': 'Chatbots IA',
            'svc-uiux': 'Design UI/UX',
            'svc-presentation': 'Conception de présentations',
            'svc-voice': 'Voix-off',

            // Projects (French titles/descriptions)
            'projects-title': 'Projets en vedette',
            'project-1-title': 'AIGenX – Plateforme IA',
            'project-1-desc': 'Plateforme IA révolutionnaire qui transforme l’imagination en réalité',
            'project-2-title': 'Fatmote – Application de livraison',
            'project-2-desc': 'Application moderne de livraison de repas avec une expérience utilisateur intuitive',
            'project-3-title': 'Suivi Fitness & Nutrition',
            'project-3-desc': 'Application complète de suivi de la santé et du fitness',
            'project-4-title': 'Application de streaming vidéo',
            'project-4-desc': 'Plateforme de streaming élégante avec interface moderne',
            'project-5-title': 'Application d’envoi d’argent',
            'project-5-desc': 'Application de transfert d’argent sécurisée et conviviale',
            'project-6-title': 'Application de planification de voyage',
            'project-6-desc': 'Application élégante pour planifier et réserver vos voyages',
            // Named project keys used in HTML (FR)
            'project-aigenx-title': 'AIGenX – Plateforme IA',
            'project-aigenx-desc': 'Plateforme IA révolutionnaire qui transforme l’imagination en réalité',
            'project-fatmote-title': 'Fatmote – Application de livraison',
            'project-fatmote-desc': 'Application moderne de livraison de repas avec une expérience utilisateur intuitive',
            'project-fitness-title': 'Suivi Fitness & Nutrition',
            'project-fitness-desc': 'Application complète de suivi de la santé et du fitness',
            'project-movie-title': 'Application de streaming vidéo',
            'project-movie-desc': 'Plateforme de streaming élégante avec interface moderne',
            'project-sendmoney-title': 'Application d’envoi d’argent',
            'project-sendmoney-desc': 'Application de transfert d’argent sécurisée et conviviale',
            'project-travel-title': 'Application de planification de voyage',
            'project-travel-desc': 'Application élégante pour planifier et réserver vos voyages',
            'tag-foodtech': 'Tech alimentaire',
            'project-7-title': 'SAFE – Eau sûre, argent sûr',
            'project-7-desc': "Projet entrepreneurial présenté à l'AAF Summer University 2025 axé sur des solutions agricoles durables.",
            'project-8-title': 'Intelligence artificielle : Introduction au futur',
            'project-8-desc': 'Vue d’ensemble complète de l’IA : histoire, applications et perspectives',
            'project-9-title': 'Classify',
            'project-9-desc': 'Démonstration de classification d’images et de modèles ML pour la vision par ordinateur',
            'project-10-title': 'Interfaces multimodales',
            'project-10-desc': 'Analyse technique des interfaces multimodales et de leurs applications',
            'project-11-title': 'SSD : Révolution du stockage',
            'project-11-desc': 'Présentation technique sur l’impact des disques SSD',
            'project-12-title': 'Quora Knowledge Hub',
            'project-12-desc': 'Analyse des plateformes de partage de connaissances et de leur impact sociétal',
            'project-13-title': 'PrimeVision – Suivi films & séries',
            'project-13-desc': 'Découvrir, suivre et gérer films et séries avec recommandations IA',
            'project-14-title': 'Wanderlust AI – Compagnon de voyage',
            'project-14-desc': 'Compagnon de voyage intelligent propulsé par l’IA pour planifier des itinéraires',
            'project-15-title': 'NewsBot – Assistant d’actualités IA',
            'project-15-desc': 'Chatbot IA fournissant des résumés d’actualités en temps réel',
            'project-16-title': 'Tech-Nova-Shop – Boutique électronique',
            'project-16-desc': 'Site e‑commerce moderne construit avec Tailwind CSS et JavaScript',
            'project-17-title': "Algérie – Terre des héros",
            'project-17-desc': 'Narration documentaire célébrant l’héritage héroïque de l’Algérie',
            'project-18-title': 'Le Petit Prince',
            'project-18-desc': 'Magnifique narration française du chef‑d’oeuvre de Saint‑Exupéry',
            'project-19-title': 'Le Petit Prince (français)',
            'project-19-desc': 'Belle narration française du chef-d’œuvre de Saint‑Exupéry',
            'project-20-title': 'La percée quantique',
            'project-20-desc': 'Narration scientifique explorant la physique quantique',
            'project-21-title': 'Destin futur',
            'project-21-desc': "Exploration visionnaire des futurs potentiels de l'humanité",
            'project-22-title': 'Les croisades dévoilées',
            'project-22-desc': 'Narration historique dramatique des conflits médiévaux',
            'project-23-title': 'زيكولا – تحليل نفسي',
            'project-23-desc': 'تحليل نفسي للنجاة المتجددة في الأدب الحديث',
            'project-24-title': 'Portfolio Personnel',
            'project-24-desc': 'Mon portfolio personnel présentant mes compétences, projets et parcours professionnel',

            // Contact
            'contact-title': 'Travaillons ensemble',
            'contact-subtitle': 'Vous avez un projet en tête ? Discutons de la manière dont nous pouvons donner vie à vos idées.',
            'form-name': 'Votre nom',
            'form-email': 'Votre email',
            'form-message': 'Votre message',
            'form-submit': 'Envoyer le message',
            'placeholder-name': 'Votre nom',
            'placeholder-email': 'votre.email@exemple.com',
            'placeholder-message': 'Comment puis-je vous aider ?',
            'contact-email': 'Email',
            'contact-phone': 'Téléphone',
            'contact-location': 'Localisation',
            'contact-whatsapp': 'WhatsApp',
            'contact-country': 'Algérie',

            // Footer
            'footer-text': 'Créé par ABZ — développeur frontend et designer UI/UX.',
            'footer-quick-links': 'Liens rapides',
            'footer-services': 'Services',
            'footer-contact-info': 'Informations de contact',
            'footer-available': 'Disponible 24h/24'
            ,
            // Project buttons and tags (FR)
            'btn-view-details-1': 'Voir les détails',
            'btn-view-details-2': 'Voir les détails',
            'btn-view-details-3': 'Voir les détails',
            'btn-view-details-4': 'Voir les détails',
            'btn-view-details-5': 'Voir les détails',
            'btn-view-details-6': 'Voir les détails',
            'btn-view-certificate': 'Voir le certificat',
            'tag-uiux': 'Design UI/UX',
            'tag-figma': 'Figma',
            'tag-aiml': 'IA/ML',
            'tag-mobile': 'Design mobile',

            // Modal and project modal labels (FR)
            'modal-title': 'Titre du projet',
            'modal-description-title': 'Description du projet',
        },
        ar: {
            metaTitle: 'عبد القادر بن علي — مطور واجهات ومصمم تجربة المستخدم',
            metaDescription: 'مطور واجهات أمامية ومصمم تجربة مستخدم مهتم بالذكاء الاصطناعي. أصنع واجهات سريعة وسهلة الاستخدام مع تركيز قوي على تجربة المستخدم.',
            // Navigation
            'nav-home': 'الرئيسية',
            'nav-about': 'نبذة عني',
            'nav-projects': 'المشاريع',
            'nav-services': 'الخدمات',
            'nav-skills': 'المهارات',
            'nav-certificates': 'الشهادات',
            'nav-contact': 'اتصل بي',

            // Hero
            'hero-greeting': 'مرحباً، أنا',
            'hero-roles': 'مطور واجهات أمامية · مصمم تجربة المستخدم · مهتم بالذكاء الاصطناعي · أخصائي دعم تقني',
            'hero-subtitle': 'مطور واجهات أمامية',
            'hero-description': 'أعمل على تصميم وتطوير واجهات ويب تفاعلية ومصممة بعناية. لدي أكثر من ثلاث سنوات خبرة في تطوير الواجهات، تصميم UI/UX، بناء روبوتات دردشة ذكية، وإعداد عروض تقديمية احترافية وخدمات تسجيل صوتي.',
            'btn-whatsapp': 'راسلني على واتساب',
            'btn-contact': 'تواصل الآن',
            'btn-listen': 'استمع',
            'view-presentation': 'عرض العرض التقديمي',
            'view-project': 'عرض المشروع',

            // About
            'about-title': 'نبذة عني',
            'about-heading': 'مطور ومصمم شغوف برؤية ابتكارية',
            'about-description': 'أنا متخصص في تصميم وبناء تجارب رقمية تركّز على المستخدم. أملك خبرة عملية في تصميم واجهات مستخدم حديثة، تطوير واجهات تفاعلية، وتطبيق حلول ذكاء اصطناعي تُحسّن تجربة المنتج وتزيد من فعاليته.',
            'projects-completed': 'المشاريع المكتملة',
            'years-experience': 'سنوات الخبرة',
            'certifications': 'الشهادات',

            // Services
            'services-title': 'خدماتي',
            'svc-mobile': 'تطوير تطبيقات متنقلة',
            'svc-ai': 'تطوير روبوتات الدردشة الذكية',
            'svc-uiux': 'تصميم واجهات وتجربة المستخدم (UI/UX)',
            'svc-presentation': 'تصميم عروض تقديمية احترافية',
            'svc-voice': 'خدمات التسجيل الصوتي',

            // Projects: fallback to English or original Arabic where relevant
            'projects-title': 'المشاريع المميزة',
            'project-1-title': 'AIGenX - AI Platform',
            'project-1-desc': 'منصة ذكاء اصطناعي مبتكرة تحول الخيال إلى واقع',
            'project-2-title': 'Fatmote - Food Delivery App',
            'project-2-desc': 'تطبيق توصيل طعام عصري مع تجربة مستخدم بديهية',
            'project-3-title': 'Fitness & Nutrition Tracker',
            'project-3-desc': 'تطبيق شامل لتتبع الصحة واللياقة',
            'project-4-title': 'Movie Streaming App',
            'project-4-desc': 'منصة بث أفلام أنيقة بواجهة حديثة',
            'project-5-title': 'Send Money App',
            'project-5-desc': 'تطبيق تحويل أموال آمن وسهل الاستخدام',
            'project-6-title': 'Travel Planning App',
            'project-6-desc': 'تطبيق جميل لتخطيط وحجز الرحلات',
            // Named project keys used in HTML (AR)
            'project-aigenx-title': 'AIGenX - AI Platform',
            'project-aigenx-desc': 'منصة ذكاء اصطناعي مبتكرة تحول الخيال إلى واقع',
            'project-fatmote-title': 'Fatmote - Food Delivery App',
            'project-fatmote-desc': 'تطبيق توصيل طعام عصري مع تجربة مستخدم بديهية',
            'project-fitness-title': 'Fitness & Nutrition Tracker',
            'project-fitness-desc': 'تطبيق شامل لتتبع الصحة واللياقة',
            'project-movie-title': 'Movie Streaming App',
            'project-movie-desc': 'منصة بث أفلام أنيقة بواجهة حديثة',
            'project-sendmoney-title': 'Send Money App',
            'project-sendmoney-desc': 'تطبيق تحويل أموال آمن وسهل الاستخدام',
            'project-travel-title': 'Travel Planning App',
            'project-travel-desc': 'تطبيق جميل لتخطيط وحجز الرحلات',
            'tag-foodtech': 'تكنولوجيا الأغذية',
            'project-7-title': 'SAFE - Safe Water Safe Money',
            'project-7-desc': 'مشروع ريادي للزراعة والاستدامة',
            'project-8-title': 'Artificial Intelligence: An Introduction to the Future',
            'project-8-desc': 'نظرة شاملة على الذكاء الاصطناعي',
            'project-9-title': 'Classify',
            'project-9-desc': 'تجربة تطبيق تصنيف الصور ونماذج التعلم الآلي',
            'project-10-title': 'Multimodal Interfaces',
            'project-10-desc': 'تحليل فني لتصميم واجهات متعددة الوسائط',
            'project-11-title': 'SSD Drives: A Revolution in Storage',
            'project-11-desc': 'عرض تقني حول تأثير وحدات التخزين الحالة',
            'project-12-title': 'Quora Knowledge Hub',
            'project-12-desc': 'تحليل منصات تبادل المعرفة وتأثيرها',
            'project-13-title': 'PrimeVision - Movie & TV Tracker',
            'project-13-desc': 'اكتشاف وتتبع وإدارة الأفلام والمسلسلات مع توصيات ذكية',
            'project-14-title': 'Wanderlust AI - Travel Companion',
            'project-14-desc': 'مساعد سفر ذكي مدعوم بالذكاء الاصطناعي',
            'project-15-title': 'NewsBot - AI News Assistant',
            'project-15-desc': 'روبوت دردشة لتلخيص الأخبار في الوقت الفعلي',
            'project-16-title': 'Tech-Nova-Shop - Electronics Store',
            'project-16-desc': 'متجر إلكتروني حديث مبني باستخدام Tailwind وJavaScript',
            'project-17-title': 'Algeria - Land of Heroes',
            'project-17-desc': 'السرد الوثائقي للاحتفاء بالإرث البطولي للجزائر',
            'project-18-title': 'The Little Prince',
            'project-18-desc': 'نسخة إنجليزية من رواية الأمير الصغير',
            'project-19-title': 'Le Petit Prince (French)',
            'project-19-desc': 'نسخة فرنسية من الأمير الصغير',
            'project-20-title': 'The Quantum Breakthrough',
            'project-20-desc': 'سرد علمي يستكشف الفيزياء الكمومية',
            'project-21-title': 'Future Destiny',
            'project-21-desc': 'استكشاف رؤيوي لمستقبل البشرية',
            'project-22-title': 'When Heaven and Earth Collided - The Crusades Unveiled',
            'project-22-desc': 'سرد تاريخي درامي حول الحروب الصليبية',
            'project-23-title': 'زيكولا - تحليل نفسي',
            'project-23-desc': 'تحليل نفسي للنص الأدبي',
            'project-24-title': 'بورتفوليو شخصي',
            'project-24-desc': 'ملف أعمالي الشخصي يعرض مهاراتي ومشاريعي ومسيرتي المهنية',

            // Contact
            'contact-title': 'لنعمل معاً',
            'contact-subtitle': 'هل لديك مشروع؟ دعنا نناقش كيف نحوله إلى واقع.',
            'form-name': 'الاسم',
            'form-email': 'البريد الإلكتروني',
            'form-message': 'الرسالة',
            'form-submit': 'إرسال الرسالة',
            'placeholder-name': 'الاسم',
            'placeholder-email': 'example@domain.com',
            'placeholder-message': 'كيف أستطيع مساعدتك؟',
            'contact-email': 'البريد الإلكتروني',
            'contact-phone': 'الهاتف',
            'contact-location': 'الموقع',
            'contact-whatsapp': 'واتساب',
            'contact-country': 'الجزائر',

            // Footer
            'footer-text': 'صُنِع بواسطة عبد القادر بن علي — مطور واجهات ومصمم تجربة المستخدم.',
            'footer-quick-links': 'روابط سريعة',
            'footer-services': 'خدماتي',
            'footer-contact-info': 'معلومات التواصل',
            'footer-available': 'متاح 24/7'
        }
    };
}

// ========== MOBILE MENU ==========
function initializeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!mobileMenuToggle || !navMenu) {
                return;
    }
    
    // Toggle mobile menu
    mobileMenuToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        
        // Animate hamburger
        const spans = mobileMenuToggle.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            spans.forEach((span, index) => {
                if (index === 0) span.style.transform = 'rotate(45deg) translate(6px, 6px)';
                else if (index === 1) span.style.opacity = '0';
                else if (index === 2) span.style.transform = 'rotate(-45deg) translate(6px, -6px)';
            });
        } else {
            spans.forEach((span, index) => {
                if (index === 0) span.style.transform = 'none';
                else if (index === 1) span.style.opacity = '1';
                else if (index === 2) span.style.transform = 'none';
            });
        }
    });
    
    // Close menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            document.body.style.overflow = '';
            
            // Reset hamburger
            const spans = mobileMenuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!mobileMenuToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            document.body.style.overflow = '';
            
            // Reset hamburger
            const spans = mobileMenuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            document.body.style.overflow = '';
            
            // Reset hamburger
            const spans = mobileMenuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// ========== HEADER SCROLL EFFECT ==========
function initializeHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // Add scrolled class when scrolled down
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
    
    // Update active nav link based on scroll position
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= (sectionTop - 100)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ========== SCROLL ANIMATIONS ==========
function initializeScrollAnimations() {
    try {
        // Check if IntersectionObserver is supported
        if (!window.IntersectionObserver) {
                        return;
        }
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, observerOptions);
        
        // Add scroll-reveal class to elements
        const elementsToReveal = document.querySelectorAll('.service-card, .project-card, .skill-item, .timeline-item, .testimonial-card');
        
        if (elementsToReveal.length === 0) {
                        return;
        }
        
        elementsToReveal.forEach(element => {
            element.classList.add('scroll-reveal');
            observer.observe(element);
        });
    } catch (error) {
        console.error('Error initializing scroll animations:', error);
    }
}

// ========== SKILL BARS ANIMATION ==========
function initializeSkillBars() {
    try {
        const skillBars = document.querySelectorAll('.skill-progress');
        
        if (skillBars.length === 0) {
            // Not an error - some pages may not include skill bars. Skip quietly.
            return;
        }
        
        // Check if IntersectionObserver is supported
        if (!window.IntersectionObserver) {
                        skillBars.forEach(bar => {
                const width = bar.dataset.width;
                if (width) {
                    bar.style.width = width + '%';
                }
            });
            return;
        }
        
        const skillObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const skillBar = entry.target;
                    const width = skillBar.dataset.width;
                    
                    if (width) {
                        setTimeout(() => {
                            skillBar.style.width = width + '%';
                        }, 200);
                    }
                }
            });
        }, { threshold: 0.5 });
        
        skillBars.forEach(bar => {
            skillObserver.observe(bar);
        });
    } catch (error) {
        console.error('Error initializing skill bars:', error);
    }
}

// ========== PROJECT MODALS ==========
function initializeProjectModals() {
    const projectCards = document.querySelectorAll('.project-card');
    const modal = document.getElementById('projectModal');
    const modalClose = document.getElementById('modalClose');
    
    if (!modal || !modalClose) {
                return;
    }
    
    // Project data
    const projectData = {
        '1': {
            title: 'AIGenX - AI Platform',
            description: 'A revolutionary AI platform that turns imagination into reality. This cutting-edge application leverages advanced machine learning algorithms to help users create, innovate, and bring their creative visions to life through intuitive AI-powered tools.',
            image: 'Project/UI UX Design/AIGenX - Turn Imagination into Reality.png',
            type: 'uiux',
            behanceUrl: 'https://www.behance.net/gallery/210304523/AIGenX-Turn-Imagination-into-Reality',
            features: [
                'AI-powered content generation',
                'Intuitive user interface design',
                'Advanced creative tools',
                'Real-time collaboration features',
                'Cloud-based processing',
                'Mobile-responsive design'
            ],
            technologies: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research', 'Design Systems']
        },
        '2': {
            title: 'Fatmote - Food Delivery App',
            description: 'A modern food delivery application with an exceptional user experience. Features intuitive navigation, seamless ordering process, real-time tracking, and a beautiful interface that makes food ordering delightful and efficient.',
            image: 'Project/UI UX Design/Fatmote - Food App.png',
            type: 'uiux',
            behanceUrl: 'https://www.behance.net/gallery/233190529/Fatmote-Food-App',
            features: [
                'Streamlined ordering process',
                'Real-time order tracking',
                'Restaurant discovery features',
                'Payment integration design',
                'Rating and review system',
                'Loyalty program interface'
            ],
            technologies: ['Mobile UI Design', 'User Experience', 'Prototyping', 'Food Tech', 'iOS/Android Design', 'Interaction Design']
        },
        '3': {
            title: 'Fitness & Nutrition Tracker',
            description: 'A comprehensive health and fitness tracking application designed to help users achieve their wellness goals. Features beautiful data visualizations, progress tracking, meal planning, and motivational elements.',
            image: 'Project/UI UX Design/fitness and nutrition tracke App.png',
            type: 'uiux',
            behanceUrl: 'https://www.behance.net/gallery/233092691/fitness-and-nutrition-tracke-App',
            features: [
                'Activity tracking interface',
                'Nutrition logging system',
                'Progress visualization',
                'Goal setting features',
                'Social sharing components',
                'Health insights dashboard'
            ],
            technologies: ['Health Tech UI', 'Data Visualization', 'Mobile Design', 'Wellness Apps', 'User Engagement', 'Health Analytics']
        },
        '4': {
            title: 'Movie Streaming App',
            description: 'A sleek movie streaming platform with a modern and engaging interface. Designed for optimal content discovery, seamless playback experience, and personalized recommendations that keep users engaged.',
            image: 'Project/UI UX Design/Movie App.png',
            type: 'uiux',
            behanceUrl: 'https://www.behance.net/gallery/210135483/Movie-App',
            features: [
                'Content discovery interface',
                'Video player design',
                'Recommendation system UI',
                'Search and filter features',
                'Watchlist management',
                'Multi-device experience'
            ],
            technologies: ['Entertainment UI', 'Video Streaming', 'Content Management', 'Media Players', 'Recommendation Systems', 'Cross-platform Design']
        },
        '5': {
            title: 'Send Money App',
            description: 'A secure and user-friendly money transfer application focusing on trust, security, and ease of use. Features clear transaction flows, security indicators, and intuitive navigation for financial operations.',
            image: 'Project/UI UX Design/Send Money App.jpg',
            type: 'uiux',
            behanceUrl: 'https://www.behance.net/gallery/233092387/Send-Money-App',
            features: [
                'Secure transaction flows',
                'Biometric authentication UI',
                'Transaction history design',
                'Contact management system',
                'Security verification flows',
                'Multi-currency support'
            ],
            technologies: ['FinTech UI', 'Security Design', 'Mobile Banking', 'Payment Systems', 'Financial Apps', 'Trust & Safety']
        },
        '6': {
            title: 'Travel Planning App',
            description: 'A beautiful travel planning and booking application that inspires wanderlust. Features stunning visuals, intuitive booking flows, itinerary management, and discovery tools for the modern traveler.',
            image: 'Project/UI UX Design/Travel App.png',
            type: 'uiux',
            behanceUrl: 'https://www.behance.net/gallery/210135661/Travel-App',
            features: [
                'Destination discovery interface',
                'Booking flow design',
                'Itinerary planning tools',
                'Travel recommendations',
                'Photo sharing features',
                'Trip management system'
            ],
            technologies: ['Travel Tech UI', 'Booking Systems', 'Location Services', 'Visual Design', 'Travel Planning', 'Mobile Experience']
        },
        '7': {
            title: 'SAFE - Safe Water Safe Money',
            description: 'AAF Summer University 2025 project proposal for agricultural sector solutions',
            type: 'presentation',
            image: 'Project/Presentaion/SAFE.PNG',
            overview: 'A comprehensive business solution targeting farmers with innovative approaches to water management and financial systems. This project was presented at the AAF Summer University 2025, focusing on sustainable agricultural practices and economic empowerment for farming communities.',
            highlights: [
                'Innovative water management solutions for agriculture',
                'Financial technology integration for farmers',
                'Sustainable agricultural practices framework',
                'Market analysis and competitive positioning',
                'Target client identification and value proposition',
                'Comprehensive business model development'
            ],
            technologies: ['PowerPoint', 'Canva', 'Business Analysis', 'Market Research', 'Presentation Design', 'Data Visualization'],
            embed: `<div class="presentation-embed">
                <iframe loading="lazy" src="https://www.canva.com/design/DAGulWdXCt0/Dr1UEtJ9YGpmOWTTDYDyhg/view?embed" allowfullscreen allow="fullscreen" title="SAFE presentation"></iframe>
            </div>`,
            downloadUrl: 'https://www.canva.com/design/DAGulWdXCt0/Dr1UEtJ9YGpmOWTTDYDyhg/view?utm_content=DAGulWdXCt0&utm_campaign=designshare&utm_medium=embeds&utm_source=link'
        },
        '8': {
            title: 'Artificial Intelligence: An Introduction to the Future',
            description: 'Comprehensive overview of AI history, applications, and future implications',
            type: 'presentation',
            image: 'Project/Presentaion/Artificial Intelligence.PNG',
            overview: 'A detailed educational presentation exploring the evolution of Artificial Intelligence from its theoretical foundations to modern applications. Covers the history of AI development, current implementations in various sectors, and future possibilities with ethical considerations.',
            highlights: [
                'Historical timeline of AI development from Turing to modern day',
                'Key breakthroughs and milestone achievements',
                'AI applications in medicine and healthcare',
                'Transportation and autonomous systems',
                'Military and defense applications',
                'Ethical considerations and responsible AI development'
            ],
            technologies: ['PowerPoint', 'Canva', 'Research & Analysis', 'Content Design', 'Educational Design', 'Visual Storytelling'],
            embed: `<div class="presentation-embed">
                <iframe loading="lazy" src="https://www.canva.com/design/DAF2a3wDKMo/tHEzwms8Mh4B5mANmVazAg/view?embed" allowfullscreen allow="fullscreen" title="Artificial Intelligence presentation"></iframe>
            </div>`,
            downloadUrl: 'https://www.canva.com/design/DAF2a3wDKMo/tHEzwms8Mh4B5mANmVazAg/view?utm_content=DAF2a3wDKMo&utm_campaign=designshare&utm_medium=embeds&utm_source=link'
        },
        '9': {
            title: 'Multimodal Interfaces',
            description: 'In-depth analysis of multimodal interfaces, technologies, and applications',
            type: 'presentation',
            image: 'Project/Presentaion/multimodal.PNG',
            overview: 'Technical presentation examining multimodal interface design, covering the foundations, technologies, advantages, and challenges. Explores practical applications across smart home systems, automotive interfaces, accessibility solutions, and emerging technologies like VR.',
            highlights: [
                'Foundations of multimodal interaction design',
                'Visual, auditory, haptic, and gestural interaction modes',
                'Advanced sensors and AI algorithm integration',
                'Smart home assistants and voice interfaces',
                'Automotive and in-car interface systems',
                'Accessibility solutions for disabled users',
                'VR and immersive technology applications'
            ],
            technologies: ['PowerPoint', 'Canva', 'Technical Writing', 'UX Research', 'Interface Design', 'Academic Presentation'],
            embed: `<div class="presentation-embed">
                <iframe loading="lazy" src="https://www.canva.com/design/DAGx1k-n9pk/WIC24yEbRzmmWR3_52LC3g/view?embed" allowfullscreen allow="fullscreen" title="Multimodal Interfaces presentation"></iframe>
            </div>`,
            downloadUrl: 'https://www.canva.com/design/DAGx1k-n9pk/WIC24yEbRzmmWR3_52LC3g/view?utm_content=DAGx1k-n9pk&utm_campaign=designshare&utm_medium=embeds&utm_source=link'
        },
        '10': {
            title: 'SSD Drives: A Revolution in Storage',
            description: 'Technical analysis of solid-state drive technology and its impact',
            type: 'presentation',
            image: 'Project/Presentaion/SSD drives.PNG',
            overview: 'Technical presentation exploring the revolutionary impact of Solid State Drives on modern computing. Covers the technology behind SSDs, performance comparisons with traditional storage, and their transformative effect on various computing applications.',
            highlights: [
                'SSD technology fundamentals and architecture',
                'Performance advantages over traditional HDDs',
                'Impact on system boot times and application loading',
                'Energy efficiency and thermal characteristics',
                'Reliability and durability improvements',
                'Cost-benefit analysis and market adoption',
                'Future developments in storage technology'
            ],
            technologies: ['PowerPoint', 'Canva', 'Technical Documentation', 'Hardware Analysis', 'Infographics', 'Technical Presentation'],
            embed: `<div class="presentation-embed">
                <iframe loading="lazy" src="https://www.canva.com/design/DAFRugae-sQ/EGSvGYcWkcnOOdez52jE4w/view?embed" allowfullscreen allow="fullscreen" title="SSD Drives presentation"></iframe>
            </div>`,
            downloadUrl: 'https://www.canva.com/design/DAFRugae-sQ/EGSvGYcWkcnOOdez52jE4w/view?utm_content=DAFRugae-sQ&utm_campaign=designshare&utm_medium=embeds&utm_source=link'
        },
        '11': {
            title: 'Quora Knowledge Hub',
            description: 'Analysis of knowledge sharing platforms and their societal impact',
            type: 'presentation',
            image: 'Project/Presentaion/Quora Knowledge Hub.PNG',
            overview: 'An analytical presentation examining Quora as a knowledge-sharing platform, exploring its role in democratizing information access and its broader societal implications. Discusses the power of knowledge in the modern world and platform-based learning.',
            highlights: [
                'Quora platform analysis and user demographics',
                'Knowledge sharing ecosystem and community engagement',
                'Expert insights and quality content curation',
                'Global reach and cultural impact',
                'The role of knowledge in societal development',
                'Digital literacy and information accessibility',
                'Future of knowledge-sharing platforms'
            ],
            technologies: ['PowerPoint', 'Canva', 'Social Media Analysis', 'Platform Research', 'Data Analysis', 'Content Strategy'],
            embed: `<div class="presentation-embed">
                <iframe loading="lazy" src="https://www.canva.com/design/DAGx1gY6EEw/QLV9dYbZCNyyukkwHmZUpw/view?embed" allowfullscreen allow="fullscreen" title="Quora Knowledge Hub presentation"></iframe>
            </div>`,
            downloadUrl: 'https://www.canva.com/design/DAGx1gY6EEw/QLV9dYbZCNyyukkwHmZUpw/view?utm_content=DAGx1gY6EEw&utm_campaign=designshare&utm_medium=embeds&utm_source=link'
        },
        '12': {
            title: 'PrimeVision - Movie & TV Tracker',
            description: 'Discover, track, and manage movies & TV shows with personalized recommendations, favorites, and watchlists. A comprehensive entertainment platform that brings the cinematic experience to your fingertips.',
            type: 'webdev',
            // use local project asset to ensure the modal shows images offline
            image: 'Project/Web Dev/PrimeVision/design01.png',
            githubUrl: 'https://github.com/benoualiabdelkader/PrimeVision',
            liveUrl: 'https://benoualiabdelkader.github.io/PrimeVision/',
            features: [
                'Real-time movie and TV show discovery',
                'Personalized recommendation engine',
                'Advanced search and filtering system',
                'Watchlist and favorites management',
                'Detailed movie/show information',
                'Responsive design for all devices',
                'User rating and review system',
                'Trending content tracking'
            ],
            technologies: ['React', 'JavaScript', 'CSS3', 'TMDb API', 'Responsive Design', 'Local Storage', 'RESTful APIs', 'Modern UI/UX']
        },
        '13': {
            title: 'Wanderlust AI - Travel Companion',
            description: 'Your AI-powered travel companion that helps you discover destinations, plan smart itineraries, and manage trips effortlessly. Experience intelligent travel planning with personalized recommendations.',
            // prefer an explicit types array so filters can match multiple categories
            types: ['webdev', 'chatbot', 'ai/ml', 'travel-tech'],
            // local preview copy
            image: 'Project/Web Dev/Wanderlust AI/ll.png',
            githubUrl: 'https://github.com/benoualiabdelkader/Wanderlust-AI',
            liveUrl: 'https://benoualiabdelkader.github.io/Wanderlust-AI/',
            features: [
                'AI-powered destination recommendations',
                'Smart itinerary planning and optimization',
                'Weather integration and forecasting',
                'Budget tracking and cost estimation',
                'Local attractions and activities discovery',
                'Multi-destination trip planning',
                'Travel tips and insights',
                'Interactive maps and navigation'
            ],
            technologies: ['React', 'AI/ML Integration', 'JavaScript', 'CSS3', 'Travel APIs', 'Geolocation', 'Weather APIs', 'Google Maps API']
        },
        '14': {
            title: 'NewsBot - AI News Assistant',
            description: 'An AI-powered chatbot using Google Gemini 1.5 to deliver real-time news and summaries across multiple categories, with a responsive interface and fact-checking features.',
            // mark as both webdev and chatbot so filters show it under Chatbot
            types: ['webdev', 'chatbot', 'ai-chatbot', 'google-gemini'],
            // local preview copy
            image: 'Project/Web Dev/NewsBot/Capture.png',
            githubUrl: 'https://github.com/benoualiabdelkader/NewsBot',
            liveUrl: 'https://benoualiabdelkader.github.io/NewsBot/',
            features: [
                'AI-powered news summaries using Google Gemini 1.5',
                'Real-time news updates across categories',
                'Intelligent fact-checking capabilities',
                'Multi-category news filtering',
                'Conversational news interface',
                'Source verification and credibility scoring',
                'Personalized news feed',
                'Breaking news alerts'
            ],
            technologies: ['JavaScript', 'Google Gemini API', 'News APIs', 'AI/ML', 'CSS3', 'Real-time Data', 'Natural Language Processing', 'Responsive Design']
        },
        '15': {
            title: 'Tech-Nova-Shop - Electronics Store',
            description: 'A modern, responsive e-commerce website for electronics, built with HTML, Tailwind CSS, and JavaScript. Features include product catalog, advanced search and filters, shopping cart, secure checkout, user accounts, and demo login for testing.',
            type: 'webdev',
            // local preview copy
            image: 'Project/Web Dev/Tech-Nova-Shop/home.png',
            githubUrl: 'https://github.com/benoualiabdelkader/Tech-Nova-Shop',
            liveUrl: 'https://benoualiabdelkader.github.io/Tech-Nova-Shop/',
            features: [
                'Complete product catalog with categories',
                'Advanced search and filtering system',
                'Shopping cart and checkout process',
                'User authentication and accounts',
                'Product reviews and ratings',
                'Wishlist and comparison features',
                'Order tracking and history',
                'Admin panel for inventory management'
            ],
            technologies: ['HTML5', 'Tailwind CSS', 'JavaScript', 'E-commerce', 'Local Storage', 'Responsive Design', 'User Authentication', 'Shopping Cart']
        },
        '16': {
            title: 'Algeria - Land of Heroes and Infinite Horizons',
            description: 'A powerful voice-over narration celebrating Algeria\'s rich history, heroic legacy, and boundless potential for the future.',
            type: 'voiceover',
            image: 'Project/Voice off/Algeria - Land of Heroes and Infinite Horizons/Algeria - Land of Heroes and Infinite Horizons.png',
            audioUrl: 'Project/Voice off/Algeria - Land of Heroes and Infinite Horizons/Algeria - Land of Heroes and Infinite Horizons.wav',
            duration: '3:45',
            language: 'English',
            genre: 'Documentary Narration',
            features: [
                'Professional documentary-style narration',
                'Emotionally engaging storytelling',
                'Clear articulation and pacing',
                'Cultural sensitivity and authenticity',
                'High-quality audio production',
                'Inspirational tone and delivery'
            ],
            skills: ['Voice Acting', 'Documentary Narration', 'Audio Production', 'Storytelling', 'Cultural Awareness', 'Professional Recording']
        },
        '17': {
            title: 'The Little Prince',
            description: 'A heartwarming English narration of Antoine de Saint-Exupéry\'s beloved classic tale, bringing the timeless story to life.',
            type: 'voiceover',
            image: 'Project/Voice off/the little prince/The Little Prince.png',
            audioUrl: 'Project/Voice off/the little prince/little pricncewav.mp3',
            duration: '4:20',
            language: 'English',
            genre: 'Literary Narration',
            features: [
                'Character voice differentiation',
                'Expressive emotional delivery',
                'Literary interpretation skills',
                'Child-friendly narration style',
                'Classic literature adaptation',
                'Engaging storytelling pace'
            ],
            skills: ['Literary Narration', 'Character Voices', 'Emotional Expression', 'Children\'s Content', 'Classic Literature', 'Audio Storytelling']
        },
        '18': {
            title: 'Le Petit Prince (French)',
            description: 'A beautiful French narration of "Le Petit Prince," delivering the original essence of Saint-Exupéry\'s masterpiece in its native language.',
            type: 'voiceover',
            image: 'Project/Voice off/The Little Prince fr/7719668e-e52b-46ea-bfaa-98a9b74d0603.png',
            audioUrl: 'Project/Voice off/The Little Prince fr/The Little Prince fr.mp3',
            duration: '4:15',
            language: 'French',
            genre: 'Literary Narration',
            features: [
                'Native French pronunciation',
                'Cultural authenticity',
                'Poetic delivery style',
                'Emotional depth and nuance',
                'Original language interpretation',
                'Professional French diction'
            ],
            skills: ['French Voice Acting', 'Literary Interpretation', 'Cultural Authenticity', 'Multilingual Narration', 'Poetic Expression', 'European French Accent']
        },
        '19': {
            title: 'The Quantum Breakthrough',
            description: 'An engaging scientific narration exploring the fascinating world of quantum physics and its revolutionary implications for our future.',
            type: 'voiceover',
            image: 'Project/Voice off/The Quantum Breakthrough/The Quantum Breakthrough.png',
            audioUrl: 'Project/Voice off/The Quantum Breakthrough/The Quantum Breakthrough.wav',
            duration: '5:30',
            language: 'English',
            genre: 'Scientific Narration',
            features: [
                'Technical terminology mastery',
                'Educational content delivery',
                'Complex concept explanation',
                'Scientific accuracy',
                'Engaging educational style',
                'Clear technical pronunciation'
            ],
            skills: ['Scientific Narration', 'Educational Content', 'Technical Vocabulary', 'Complex Concepts', 'Academic Delivery', 'Science Communication']
        },
        '20': {
            title: 'Future Destiny',
            description: 'A visionary voice-over piece that explores humanity\'s potential futures and the choices that will shape our destiny.',
            type: 'voiceover',
            image: 'Project/Voice off/future destiny/FUTURE DESTINY.png',
            audioUrl: 'Project/Voice off/future destiny/future destiny.mp3',
            duration: '3:55',
            language: 'English',
            genre: 'Futuristic Narration',
            features: [
                'Visionary storytelling approach',
                'Inspirational delivery tone',
                'Future-focused narrative',
                'Motivational content style',
                'Professional pacing',
                'Thought-provoking delivery'
            ],
            skills: ['Futuristic Narration', 'Inspirational Speaking', 'Visionary Content', 'Motivational Delivery', 'Conceptual Storytelling', 'Professional Voice Work']
        },
        '21': {
            title: 'When Heaven and Earth Collided - The Crusades Unveiled',
            description: 'A dramatic historical narration unveiling the complex story of the Crusades, where faith, politics, and human ambition intersected.',
            type: 'voiceover',
            image: 'Project/Voice off/When Heaven and Earth Collided - The Crusades Unveiled/When Heaven and Earth Collided - The Crusades Unveiled.png',
            audioUrl: 'Project/Voice off/When Heaven and Earth Collided - The Crusades Unveiled/When Heaven and Earth Collided - The Crusades Unveiled.wav',
            duration: '6:12',
            language: 'English',
            genre: 'Historical Documentary',
            features: [
                'Historical accuracy and depth',
                'Dramatic narrative style',
                'Complex historical events',
                'Objective historical perspective',
                'Engaging documentary tone',
                'Educational historical content'
            ],
            skills: ['Historical Narration', 'Documentary Voice', 'Educational Content', 'Historical Accuracy', 'Dramatic Delivery', 'Complex Narratives']
        },
        '22': {
            title: 'الجزائر الأمة والمجتمع (Algeria: Nation and Society)',
            description: 'تحليل عميق باللغة العربية لجدلية الاستمرارية والانقطاع في المقاومة الجزائرية وبناء الهوية الوطنية.',
            type: 'voiceover',
            image: 'Project/Voice off/الجزائر الامة والمجتمع/الجزائر امة والمجتمع.png',
            audioUrl: 'Project/Voice off/الجزائر الامة والمجتمع/الجزائر__أمة_ومجتمع_-_جدلية_الاستمرارية_والانقطاع_في_المقاومة_ا.mp4',
            duration: '8:45',
            language: 'Arabic',
            genre: 'Academic Analysis',
            features: [
                'Professional Arabic narration',
                'Academic content delivery',
                'Historical analysis presentation',
                'Cultural depth and authenticity',
                'Scholarly tone and approach',
                'Complex sociological concepts'
            ],
            skills: ['Arabic Voice Acting', 'Academic Narration', 'Historical Analysis', 'Cultural Content', 'Scholarly Delivery', 'Sociological Concepts']
        },
        '23': {
            title: 'زيكولا - تحليل نفسي للنجاة المتجددة (Zikola - Psychological Analysis)',
            description: 'تحليل نفسي عميق باللغة العربية لشخصية خالد في زيكولا، يستكشف النجاة المتجددة بين فوضى الانهيار والأمل.',
            type: 'voiceover',
            image: 'Project/Voice off/زيكولا/زيكولا.png',
            audioUrl: 'Project/Voice off/زيكولا/خالد_في_زيكولا__تحليل_نفسي_لـ_النجاة_المتجددة__بين_فوضى_الانهيا.mp3',
            duration: '7:20',
            language: 'Arabic',
            genre: 'Psychological Analysis',
            features: [
                'Psychological analysis delivery',
                'Literary character interpretation',
                'Academic Arabic presentation',
                'Complex psychological concepts',
                'Analytical thinking expression',
                'Professional academic tone'
            ],
            skills: ['Psychological Narration', 'Literary Analysis', 'Academic Arabic', 'Complex Analysis', 'Intellectual Content', 'Character Study']
        },
        '24': {
            title: 'Personal Portfolio',
            description: 'My personal portfolio website showcasing my skills, projects, and professional journey. A comprehensive platform featuring responsive design, smooth animations, and an intuitive user experience that highlights my work across web development, UI/UX design, AI chatbots, and voice-over services.',
            type: 'webdev',
            image: 'Project/Web Dev/Portfolio/hero section.PNG',
            githubUrl: 'https://github.com/benoualiabdelkader/Portfolio',
            liveUrl: '#',
            features: [
                'Responsive design for all devices',
                'Smooth animations and transitions',
                'Interactive project showcase',
                'Multi-language support (English, French, Arabic)',
                'Dark/Light mode toggle',
                'Certificate viewer with zoom controls',
                'Loading animations with hourglass effect',
                'Advanced modal windows',
                'Accessibility features',
                'SEO optimized',
                'Progressive Web App (PWA) ready'
            ],
            technologies: ['HTML5', 'CSS3', 'JavaScript', 'Font Awesome', 'Responsive Design', 'CSS Animations', 'PWA', 'Multi-language', 'Accessibility']
        }
    };
    // expose project data for other modules (filters etc.)
    try { window.PROJECT_DATA = projectData; } catch (e) {}
    
    // Use event delegation on the projects grid to reliably resolve which project card was clicked.
    // This prevents mismatches caused by dynamic DOM changes or multiple listeners.
    const projectsGrid = document.querySelector('.projects-grid');
    if (projectsGrid) {
        projectsGrid.addEventListener('click', function(e) {
            // Find the closest project-card ancestor of the clicked element
            const card = e.target.closest('.project-card');
            if (!card) return;

            const projectId = card.dataset.project;
            if (!projectId) return;
            let project = projectData[projectId];
            
            // If project not in projectData, build it from HTML card
            if (!project) {
                const title = card.querySelector('.project-title')?.textContent || 'Project';
                const description = card.querySelector('.project-description')?.textContent || '';
                const image = card.querySelector('.project-image img')?.src || '';
                const tags = card.dataset.tags ? card.dataset.tags.split(',') : [];
                
                project = {
                    title: title,
                    description: description,
                    image: image,
                    tags: tags,
                    features: [],
                    skills: tags
                };
            }

            populateModal(project);

            if (project.type === 'voiceover') {
                // Hide the main modal visuals to show the strict voiceover viewer
                if (modal) {

    // Keep track of where modal-project-details originally lived so we can move it for presentation view and restore later
    const modalProjectDetails = document.querySelector('.modal-project-details');
    let modalProjectDetailsOriginalParent = modalProjectDetails ? modalProjectDetails.parentElement : null;
                    modal.classList.remove('active');
                    modal.style.display = 'none';
                    modal.style.visibility = 'hidden';
                    modal.style.opacity = '0';
                    modal.style.pointerEvents = 'none';
                }

                const modalContent = document.querySelector('.modal-content');
                if (modalContent) modalContent.style.display = 'none';

                const voiceoverViewer = document.getElementById('voiceoverViewer');
                try {
                    document.querySelectorAll('audio').forEach(a => { try { a.pause(); a.currentTime = 0; } catch (e) {} });
                } catch (e) {}
                if (voiceoverViewer) voiceoverViewer.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            } else {
                if (modal) {
                    modal.style.display = '';
                    modal.classList.add('active');
                }
                document.body.style.overflow = 'hidden';
            }
        });
    }
    
    // Close modal
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close the strict voiceover viewer when its compact close button is clicked
    const modalCloseCompact = document.getElementById('modalCloseCompact');
    if (modalCloseCompact) {
        modalCloseCompact.addEventListener('click', function() {
            const voiceoverViewer = document.getElementById('voiceoverViewer');
            if (voiceoverViewer) voiceoverViewer.style.display = 'none';
            document.body.style.overflow = 'auto';
            // restore project modal visuals in case they were hidden
            if (modal) {
                modal.style.display = '';
                modal.style.visibility = '';
                modal.style.opacity = '';
                modal.style.pointerEvents = '';
            }
            const modalContent = document.querySelector('.modal-content');
            if (modalContent) modalContent.style.display = '';
            
            // Stop ALL audio elements
            document.querySelectorAll('audio').forEach(audio => {
                try {
                    audio.pause();
                    audio.currentTime = 0;
                } catch (e) {}
            });
        });
    }

    // Close voiceover viewer when clicking outside the card
    const voiceoverViewer = document.getElementById('voiceoverViewer');
    if (voiceoverViewer) {
        voiceoverViewer.addEventListener('click', function(e) {
            const card = voiceoverViewer.querySelector('.voiceover-card');
            if (!card) return;
            if (!card.contains(e.target)) {
                // Stop all audio before closing
                document.querySelectorAll('audio').forEach(a => { 
                    try { 
                        a.pause(); 
                        a.currentTime = 0; 
                    } catch (e) {} 
                });
                voiceoverViewer.style.display = 'none';
            }
        });
    }

    // Close modal and voiceover viewer on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('projectModal');
            const voiceoverViewer = document.getElementById('voiceoverViewer');
            
            // Check if voiceover viewer is open
            if (voiceoverViewer && voiceoverViewer.style.display === 'flex') {
                // Stop all audio before closing
                document.querySelectorAll('audio').forEach(a => { 
                    try { 
                        a.pause(); 
                        a.currentTime = 0; 
                    } catch (e) {} 
                });
                voiceoverViewer.style.display = 'none';
            }
            // Check if project modal is open
            else if (modal && modal.classList.contains('active')) {
                closeModal();
            }
        }
    });

    // Helper: populate modal content for a given project (kept minimal and robust)
    function populateModal(project) {
        try {
            const titleEl = document.getElementById('modalTitle');
            const descEl = document.getElementById('modalDescription');
            const modalImage = document.getElementById('modalImage');
            const downloadLink = document.getElementById('downloadPresentation');
            const downloadPresentationBtn = document.getElementById('downloadPresentationBtn');
            const viewOnBehanceBtn = document.getElementById('viewOnBehanceBtn');
            const viewOnGithubBtn = document.getElementById('viewOnGithubBtn');

            if (titleEl) titleEl.textContent = project.title || 'Project';
            if (descEl) descEl.textContent = project.description || '';
            if (modalImage && project.image) modalImage.src = normalizePath(project.image);
            
            // Check if project is UI/UX based on type, category, or tags
            const isUIUXProject = project.type === 'uiux' || 
                                 project.category === 'uiux' || 
                                 (project.tags && (
                                     project.tags.includes('uiux') || 
                                     project.tags.includes('UI/UX') ||
                                     project.tags.includes('mobile') ||
                                     project.tags.includes('figma')
                                 ));
            
            // Check if project is Web Dev or has GitHub URL
            const isWebDevProject = project.type === 'webdev' || 
                                   (project.types && project.types.includes('webdev')) ||
                                   project.githubUrl;
            
            // Handle buttons based on project type
            if (project.type === 'presentation') {
                // For presentations: show download button
                if (downloadPresentationBtn) {
                    if (project.downloadUrl) {
                        downloadPresentationBtn.href = project.downloadUrl;
                        downloadPresentationBtn.style.display = 'inline-flex';
                    } else {
                        downloadPresentationBtn.style.display = 'none';
                    }
                }
                // Hide Behance and GitHub buttons for presentations
                if (viewOnBehanceBtn) viewOnBehanceBtn.style.display = 'none';
                if (viewOnGithubBtn) viewOnGithubBtn.style.display = 'none';
            } else if (isUIUXProject) {
                // For UI/UX projects: show Behance button
                if (viewOnBehanceBtn) {
                    if (project.behanceUrl) {
                        viewOnBehanceBtn.href = project.behanceUrl;
                        viewOnBehanceBtn.style.display = 'inline-flex';
                    } else {
                        // Default Behance URL if not specified
                        viewOnBehanceBtn.href = 'https://www.behance.net';
                        viewOnBehanceBtn.style.display = 'inline-flex';
                    }
                }
                // Hide download and GitHub buttons for UI/UX projects
                if (downloadPresentationBtn) downloadPresentationBtn.style.display = 'none';
                if (viewOnGithubBtn) viewOnGithubBtn.style.display = 'none';
            } else if (isWebDevProject) {
                // For Web Dev projects: show GitHub button
                if (viewOnGithubBtn) {
                    if (project.githubUrl) {
                        viewOnGithubBtn.href = project.githubUrl;
                        viewOnGithubBtn.style.display = 'inline-flex';
                    } else {
                        viewOnGithubBtn.style.display = 'none';
                    }
                }
                // Hide Behance and download buttons for Web Dev projects
                if (viewOnBehanceBtn) viewOnBehanceBtn.style.display = 'none';
                if (downloadPresentationBtn) downloadPresentationBtn.style.display = 'none';
            } else {
                // For other projects: hide all buttons
                if (downloadPresentationBtn) downloadPresentationBtn.style.display = 'none';
                if (viewOnBehanceBtn) viewOnBehanceBtn.style.display = 'none';
                if (viewOnGithubBtn) viewOnGithubBtn.style.display = 'none';
            }
            if (downloadLink) {
                if (project.downloadUrl) {
                    downloadLink.href = project.downloadUrl;
                    downloadLink.style.display = '';
                } else {
                    downloadLink.style.display = 'none';
                }
            }

            const featuresList = document.getElementById('modalFeatures');
            if (featuresList) {
                featuresList.innerHTML = '';
                const list = project.features || project.highlights || [];
                list.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    featuresList.appendChild(li);
                });
            }

            // Populate Tools Used (modalTech) from project.skills, project.tools or project.tags
            try {
                const modalTech = document.getElementById('modalTech');
                if (modalTech) {
                    modalTech.innerHTML = '';
                    const tools = project.skills || project.tools || project.tags || project.technologies || [];
                    (Array.isArray(tools) ? tools : []).forEach(t => {
                        const span = document.createElement('span');
                        span.className = 'tool-tag';
                        span.textContent = t;
                        modalTech.appendChild(span);
                    });
                }
            } catch (err) {  }

            // If this is a voiceover project, populate the dedicated voiceover viewer
            try {
                if (project.type === 'voiceover') {
                    const vImage = document.getElementById('voiceImage');
                    const vTitle = document.getElementById('voiceTitle');
                    const vDesc = document.getElementById('voiceDescription');
                    const vDuration = document.getElementById('voiceDuration');
                    const vLanguage = document.getElementById('voiceLanguage');
                    const vGenre = document.getElementById('voiceGenre');
                    const vAudioContainer = document.getElementById('voiceAudioContainer');
                    const downloadBtn = document.getElementById('downloadAudioBtn');

                    if (vImage && project.image) vImage.src = normalizePath(project.image);
                    if (vTitle) vTitle.textContent = project.title || '';
                    if (vDesc) vDesc.textContent = project.description || '';
                    if (vDuration) vDuration.textContent = project.duration || '';
                    if (vLanguage) vLanguage.textContent = project.language || '';
                    if (vGenre) vGenre.textContent = project.genre || '';

                    // Inject a simple audio player into the viewer and initialize it
                    if (vAudioContainer) {
                        vAudioContainer.innerHTML = createSimpleAudioPlayer(project);
                        try { initializeSimpleAudioPlayer(); } catch (e) {  }
                    }

                    // Populate download link (use native anchor download when audioUrl exists)
                    if (downloadBtn) {
                        if (project.audioUrl) {
                            downloadBtn.href = normalizePath(project.audioUrl);
                            downloadBtn.style.display = '';
                            downloadBtn.setAttribute('download', '');
                        } else {
                            downloadBtn.href = '#';
                            downloadBtn.style.display = 'none';
                        }
                    }
                }
            } catch (err) {  }
            // Toggle UI vs Presentation sections and behavior
            try {
                const uiDetails = document.getElementById('uiProjectDetails');
                const modalContent = document.querySelector('.modal-content');
                const modalProjectDetails = document.querySelector('.modal-project-details');
                const modalBody = document.querySelector('.modal-body');
                const modalEmbedContainer = document.getElementById('modalEmbedContainer');

                if (project.type === 'presentation') {
                    // Inject Canva embed for presentation projects with hourglass loader
                    if (modalEmbedContainer) {
                        // Add hourglass loader first
                        modalEmbedContainer.innerHTML = `
                            <div class="mini-hourglass-loader active" id="presentationHourglassLoader">
                                <div class="mini-hourglass">
                                    <div class="mini-glass-frame-top"></div>
                                    <div class="mini-glass-frame-bottom"></div>
                                    <div class="mini-glass-top"></div>
                                    <div class="mini-glass-middle"></div>
                                    <div class="mini-glass-bottom"></div>
                                    <div class="mini-sand-top"></div>
                                    <div class="mini-sand-stream"></div>
                                    <div class="mini-sand-bottom"></div>
                                    <div class="mini-sand-particle"></div>
                                    <div class="mini-sand-particle"></div>
                                    <div class="mini-sand-particle"></div>
                                </div>
                                <div class="mini-hourglass-text">Loading Presentation...</div>
                            </div>
                            ${project.embed || ''}
                        `;
                        
                        // Hide hourglass when iframe loads
                        setTimeout(() => {
                            const hourglassLoader = document.getElementById('presentationHourglassLoader');
                            const iframe = modalEmbedContainer.querySelector('iframe');
                            
                            if (iframe && hourglassLoader) {
                                iframe.addEventListener('load', () => {
                                    hourglassLoader.classList.remove('active');
                                });
                                
                                // Fallback: hide after 3 seconds if load event doesn't fire
                                setTimeout(() => {
                                    hourglassLoader.classList.remove('active');
                                }, 3000);
                            }
                        }, 100);
                    }
                    if (uiDetails) uiDetails.style.display = '';
                    if (modalProjectDetails) modalProjectDetails.style.display = '';
                    if (modalContent) modalContent.classList.add('presentation-modal');
                    if (modalBody) modalBody.classList.add('presentation-layout');
                    // Show download link where appropriate
                    const downloadPres = document.getElementById('downloadPresentation');
                    if (downloadPres) {
                        if (project.downloadUrl) { downloadPres.href = project.downloadUrl; downloadPres.style.display = ''; }
                        else { downloadPres.href = '#'; downloadPres.style.display = 'none'; }
                    }
                } else {
                    // Non-presentation projects: show static image in modal with advanced controls
                    if (modalEmbedContainer) {
                        // Check if project has multiple images (slider)
                        if (project.images && project.images.length > 1) {
                            console.log('Creating slider with images:', project.images);
                            // Create image slider
                            modalEmbedContainer.innerHTML = `
                                <div class='modal-image-slider-container'>
                                    <div class='modal-slider-wrapper' id='modalSliderWrapper'>
                                        <div class="mini-hourglass-loader active" id="sliderHourglassLoader">
                                            <div class="mini-hourglass">
                                                <div class="mini-glass-frame-top"></div>
                                                <div class="mini-glass-frame-bottom"></div>
                                                <div class="mini-glass-top"></div>
                                                <div class="mini-glass-middle"></div>
                                                <div class="mini-glass-bottom"></div>
                                                <div class="mini-sand-top"></div>
                                                <div class="mini-sand-stream"></div>
                                                <div class="mini-sand-bottom"></div>
                                                <div class="mini-sand-particle"></div>
                                                <div class="mini-sand-particle"></div>
                                                <div class="mini-sand-particle"></div>
                                            </div>
                                            <div class="mini-hourglass-text">Loading Images...</div>
                                        </div>
                                        <div class='modal-slider-images' id='modalSliderImages'>
                                            ${project.images.map((img, idx) => `
                                                <img src='${normalizePath(img)}' 
                                                     alt='${project.title} - Image ${idx + 1}' 
                                                     class='modal-slider-image ${idx === 0 ? 'active' : ''}' 
                                                     data-index='${idx}'
                                                     draggable='false' />
                                            `).join('')}
                                        </div>
                                        <button class='modal-slider-btn modal-slider-prev' id='sliderPrevBtn' title='Previous Image (←)'>
                                            <i class="fas fa-chevron-left"></i>
                                        </button>
                                        <button class='modal-slider-btn modal-slider-next' id='sliderNextBtn' title='Next Image (→)'>
                                            <i class="fas fa-chevron-right"></i>
                                        </button>
                                        <div class='modal-slider-indicators' id='sliderIndicators'>
                                            ${project.images.map((_, idx) => `
                                                <button class='slider-indicator ${idx === 0 ? 'active' : ''}' 
                                                        data-index='${idx}' 
                                                        title='Image ${idx + 1}'></button>
                                            `).join('')}
                                        </div>
                                        <div class='modal-slider-counter' id='sliderCounter'>1 / ${project.images.length}</div>
                                    </div>
                                </div>
                            `;
                        } else if (project.image) {
                            modalEmbedContainer.innerHTML = `
                                <div class='modal-image-hints'>
                                    <h4><i class="fas fa-info-circle"></i> Controls</h4>
                                    <ul>
                                        <li><i class="fas fa-mouse"></i> Drag to move</li>
                                        <li><i class="fas fa-scroll"></i> Scroll to zoom</li>
                                        <li><kbd>ESC</kbd> to close</li>
                                        <li><kbd>F</kbd> fullscreen</li>
                                    </ul>
                                </div>
                                <div class='modal-image-container-wrapper' id='modalImageWrapper'>
                                    <div class="mini-hourglass-loader" id="modalHourglassLoader">
                                        <div class="mini-hourglass">
                                            <div class="mini-glass-frame-top"></div>
                                            <div class="mini-glass-frame-bottom"></div>
                                            <div class="mini-glass-top"></div>
                                            <div class="mini-glass-middle"></div>
                                            <div class="mini-glass-bottom"></div>
                                            <div class="mini-sand-top"></div>
                                            <div class="mini-sand-stream"></div>
                                            <div class="mini-sand-bottom"></div>
                                            <div class="mini-sand-particle"></div>
                                            <div class="mini-sand-particle"></div>
                                            <div class="mini-sand-particle"></div>
                                        </div>
                                        <div class="mini-hourglass-text">Loading...</div>
                                    </div>
                                    <img src='${normalizePath(project.image)}' alt='${project.title || "Project Image"}' class='modal-zoomable' id='modalZoomableImage' draggable='false' />
                                </div>
                                <div class='modal-image-controls-advanced'>
                                    <button class='modal-control-btn' id='zoomInBtn' title='Zoom In (+)'>
                                        <i class="fas fa-search-plus"></i>
                                    </button>
                                    <button class='modal-control-btn' id='zoomOutBtn' title='Zoom Out (-)'>
                                        <i class="fas fa-search-minus"></i>
                                    </button>
                                    <button class='modal-control-btn' id='resetViewBtn' title='Reset View (0)'>
                                        <i class="fas fa-compress-arrows-alt"></i>
                                    </button>
                                    <div class='modal-control-divider'></div>
                                    <div class='modal-zoom-level' id='modalZoomLevel'>100%</div>
                                    <div class='modal-control-divider'></div>
                                    <button class='modal-control-btn' id='modalFullscreenBtn' title='Fullscreen (F)'>
                                        <i class="fas fa-expand"></i>
                                    </button>
                                    <button class='modal-control-btn' id='modalDownloadBtn' title='Download'>
                                        <i class="fas fa-download"></i>
                                    </button>
                                </div>
                            `;
                            // Add advanced zoom/move logic with smooth animations
                            setTimeout(() => {
                                const img = document.getElementById('modalZoomableImage');
                                const wrapper = document.getElementById('modalImageWrapper');
                                const zoomLevelDisplay = document.getElementById('modalZoomLevel');
                                const fullscreenBtn = document.getElementById('modalFullscreenBtn');
                                const downloadBtn = document.getElementById('modalDownloadBtn');
                                const hourglassLoader = document.getElementById('modalHourglassLoader');
                                
                                // Show loading state with hourglass
                                if (wrapper) wrapper.classList.add('loading');
                                if (img) img.classList.remove('loaded');
                                if (hourglassLoader) hourglassLoader.classList.add('active');
                                
                                // Preload image
                                const preloadImg = new Image();
                                preloadImg.onload = () => {
                                    if (wrapper) wrapper.classList.remove('loading');
                                    if (hourglassLoader) hourglassLoader.classList.remove('active');
                                    if (img) {
                                        setTimeout(() => {
                                            img.classList.add('loaded');
                                        }, 50);
                                    }
                                };
                                preloadImg.onerror = () => {
                                    if (wrapper) wrapper.classList.remove('loading');
                                    if (hourglassLoader) hourglassLoader.classList.remove('active');
                                    console.error('Failed to load project image');
                                };
                                preloadImg.src = normalizePath(project.image);
                                
                                let scale = 1, posX = 0, posY = 0;
                                let isDragging = false, startX = 0, startY = 0;
                                
                                function updateTransform() {
                                    img.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
                                    if (zoomLevelDisplay) {
                                        zoomLevelDisplay.textContent = `${Math.round(scale * 100)}%`;
                                    }
                                }
                                
                                function resetView() {
                                    scale = 1;
                                    posX = 0;
                                    posY = 0;
                                    updateTransform();
                                }
                                
                                // Zoom controls
                                document.getElementById('zoomInBtn').onclick = () => { 
                                    scale = Math.min(scale + 0.25, 5); 
                                    updateTransform(); 
                                };
                                document.getElementById('zoomOutBtn').onclick = () => { 
                                    scale = Math.max(scale - 0.25, 0.5); 
                                    updateTransform(); 
                                };
                                document.getElementById('resetViewBtn').onclick = resetView;
                                
                                // Fullscreen
                                if (fullscreenBtn) {
                                    fullscreenBtn.onclick = () => {
                                        const modalContent = document.querySelector('.modal-content');
                                        if (modalContent) {
                                            if (modalContent.requestFullscreen) {
                                                modalContent.requestFullscreen();
                                            } else if (modalContent.webkitRequestFullscreen) {
                                                modalContent.webkitRequestFullscreen();
                                            } else if (modalContent.msRequestFullscreen) {
                                                modalContent.msRequestFullscreen();
                                            }
                                        }
                                    };
                                }
                                
                                // Download
                                if (downloadBtn) {
                                    downloadBtn.onclick = () => {
                                        const link = document.createElement('a');
                                        link.href = normalizePath(project.image);
                                        link.download = project.image.split('/').pop();
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    };
                                }
                                
                                // Mouse wheel zoom
                                if (wrapper) {
                                    wrapper.addEventListener('wheel', (e) => {
                                        e.preventDefault();
                                        if (e.deltaY < 0) {
                                            scale = Math.min(scale + 0.1, 5);
                                        } else {
                                            scale = Math.max(scale - 0.1, 0.5);
                                        }
                                        updateTransform();
                                    }, { passive: false });
                                }
                                
                                // Drag to move
                                img.onmousedown = e => { 
                                    isDragging = true; 
                                    startX = e.clientX - posX; 
                                    startY = e.clientY - posY; 
                                    img.style.cursor = 'grabbing';
                                    wrapper.style.cursor = 'grabbing';
                                };
                                
                                document.onmousemove = e => { 
                                    if (isDragging) { 
                                        posX = e.clientX - startX; 
                                        posY = e.clientY - startY; 
                                        updateTransform(); 
                                    } 
                                };
                                
                                document.onmouseup = () => { 
                                    isDragging = false; 
                                    img.style.cursor = 'grab';
                                    if (wrapper) wrapper.style.cursor = 'grab';
                                };
                                
                                // Touch support
                                let touchStartX = 0, touchStartY = 0, lastTouchDistance = 0;
                                
                                img.addEventListener('touchstart', (e) => {
                                    if (e.touches.length === 1) {
                                        isDragging = true;
                                        touchStartX = e.touches[0].clientX - posX;
                                        touchStartY = e.touches[0].clientY - posY;
                                    } else if (e.touches.length === 2) {
                                        const dx = e.touches[0].clientX - e.touches[1].clientX;
                                        const dy = e.touches[0].clientY - e.touches[1].clientY;
                                        lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
                                    }
                                });
                                
                                img.addEventListener('touchmove', (e) => {
                                    e.preventDefault();
                                    if (e.touches.length === 1 && isDragging) {
                                        posX = e.touches[0].clientX - touchStartX;
                                        posY = e.touches[0].clientY - touchStartY;
                                        updateTransform();
                                    } else if (e.touches.length === 2) {
                                        const dx = e.touches[0].clientX - e.touches[1].clientX;
                                        const dy = e.touches[0].clientY - e.touches[1].clientY;
                                        const distance = Math.sqrt(dx * dx + dy * dy);
                                        
                                        if (lastTouchDistance > 0) {
                                            const delta = distance - lastTouchDistance;
                                            scale = Math.max(0.5, Math.min(5, scale + delta * 0.01));
                                            updateTransform();
                                        }
                                        lastTouchDistance = distance;
                                    }
                                }, { passive: false });
                                
                                img.addEventListener('touchend', () => {
                                    isDragging = false;
                                    lastTouchDistance = 0;
                                });
                                
                                // Keyboard shortcuts
                                const handleKeyboard = (e) => {
                                    if (document.getElementById('projectModal').style.display === 'flex') {
                                        switch(e.key) {
                                            case '+':
                                            case '=':
                                                scale = Math.min(scale + 0.25, 5);
                                                updateTransform();
                                                e.preventDefault();
                                                break;
                                            case '-':
                                            case '_':
                                                scale = Math.max(scale - 0.25, 0.5);
                                                updateTransform();
                                                e.preventDefault();
                                                break;
                                            case '0':
                                                resetView();
                                                e.preventDefault();
                                                break;
                                            case 'f':
                                            case 'F':
                                                if (fullscreenBtn) fullscreenBtn.click();
                                                e.preventDefault();
                                                break;
                                        }
                                    }
                                };
                                
                                document.addEventListener('keydown', handleKeyboard);
                                
                                // Set initial cursor
                                img.style.cursor = 'grab';
                                if (wrapper) wrapper.style.cursor = 'grab';
                            }, 100);
                        }
                        
                        // Initialize slider if project has multiple images
                        if (project.images && project.images.length > 1) {
                            setTimeout(() => {
                                const sliderWrapper = document.getElementById('modalSliderWrapper');
                                const sliderImages = document.querySelectorAll('.modal-slider-image');
                                const prevBtn = document.getElementById('sliderPrevBtn');
                                const nextBtn = document.getElementById('sliderNextBtn');
                                const indicators = document.querySelectorAll('.slider-indicator');
                                const counter = document.getElementById('sliderCounter');
                                const hourglassLoader = document.getElementById('sliderHourglassLoader');
                                
                                console.log('Slider initialized. Images found:', sliderImages.length);
                                console.log('First image element:', sliderImages[0]);
                                console.log('First image src:', sliderImages[0]?.src);
                                console.log('First image classList:', sliderImages[0]?.classList);
                                
                                // Force first image to be visible immediately
                                if (sliderImages.length > 0) {
                                    sliderImages[0].style.opacity = '1';
                                    sliderImages[0].style.visibility = 'visible';
                                    sliderImages[0].style.transform = 'translate(-50%, -50%) scale(1)';
                                    console.log('First image forced visible');
                                }
                                
                                let currentIndex = 0;
                                let imagesLoaded = 0;
                                const totalImages = sliderImages.length;
                                
                                // Fallback: hide hourglass after 2 seconds if images don't load
                                setTimeout(() => {
                                    if (hourglassLoader) {
                                        hourglassLoader.classList.remove('active');
                                    }
                                }, 2000);
                                
                                // Preload all images
                                sliderImages.forEach((img, index) => {
                                    const preloadImg = new Image();
                                    preloadImg.onload = () => {
                                        imagesLoaded++;
                                        console.log(`Image ${index + 1}/${totalImages} loaded`);
                                        if (imagesLoaded === totalImages && hourglassLoader) {
                                            hourglassLoader.classList.remove('active');
                                        }
                                    };
                                    preloadImg.onerror = () => {
                                        imagesLoaded++;
                                        console.error(`Failed to load image ${index + 1}: ${img.src}`);
                                        if (imagesLoaded === totalImages && hourglassLoader) {
                                            hourglassLoader.classList.remove('active');
                                        }
                                    };
                                    preloadImg.src = img.src;
                                });
                                
                                function updateSlider(newIndex) {
                                    if (newIndex < 0) newIndex = totalImages - 1;
                                    if (newIndex >= totalImages) newIndex = 0;
                                    
                                    // Update images
                                    sliderImages.forEach((img, idx) => {
                                        img.classList.toggle('active', idx === newIndex);
                                    });
                                    
                                    // Update indicators
                                    indicators.forEach((ind, idx) => {
                                        ind.classList.toggle('active', idx === newIndex);
                                    });
                                    
                                    // Update counter
                                    if (counter) {
                                        counter.textContent = `${newIndex + 1} / ${totalImages}`;
                                    }
                                    
                                    currentIndex = newIndex;
                                }
                                
                                // Previous button
                                if (prevBtn) {
                                    prevBtn.addEventListener('click', () => {
                                        updateSlider(currentIndex - 1);
                                    });
                                }
                                
                                // Next button
                                if (nextBtn) {
                                    nextBtn.addEventListener('click', () => {
                                        updateSlider(currentIndex + 1);
                                    });
                                }
                                
                                // Indicator buttons
                                indicators.forEach((indicator, idx) => {
                                    indicator.addEventListener('click', () => {
                                        updateSlider(idx);
                                    });
                                });
                                
                                // Keyboard navigation
                                const handleSliderKeyboard = (e) => {
                                    if (document.getElementById('projectModal').style.display === 'flex') {
                                        if (e.key === 'ArrowLeft') {
                                            updateSlider(currentIndex - 1);
                                            e.preventDefault();
                                        } else if (e.key === 'ArrowRight') {
                                            updateSlider(currentIndex + 1);
                                            e.preventDefault();
                                        }
                                    }
                                };
                                
                                document.addEventListener('keydown', handleSliderKeyboard);
                                
                                // Touch swipe support
                                let touchStartX = 0;
                                let touchEndX = 0;
                                
                                if (sliderWrapper) {
                                    sliderWrapper.addEventListener('touchstart', (e) => {
                                        touchStartX = e.touches[0].clientX;
                                    }, { passive: true });
                                    
                                    sliderWrapper.addEventListener('touchend', (e) => {
                                        touchEndX = e.changedTouches[0].clientX;
                                        const diff = touchStartX - touchEndX;
                                        
                                        if (Math.abs(diff) > 50) {
                                            if (diff > 0) {
                                                // Swipe left - next image
                                                updateSlider(currentIndex + 1);
                                            } else {
                                                // Swipe right - previous image
                                                updateSlider(currentIndex - 1);
                                            }
                                        }
                                    }, { passive: true });
                                }
                            }, 100);
                        }
                    }
                    if (uiDetails) uiDetails.style.display = '';
                    if (modalProjectDetails) modalProjectDetails.style.display = '';
                    if (modalContent) modalContent.classList.remove('presentation-modal');
                    if (modalBody) modalBody.classList.remove('presentation-layout');
                    // Hide download presentation button for non-presentation projects
                    if (downloadPresentationBtn) downloadPresentationBtn.style.display = 'none';
                }
            } catch (err) {  }
        } catch (err) {  }
    }

    function initializeImageViewer() {
        const modalImage = document.getElementById('modalImage');
        const zoomInBtn = document.getElementById('zoomIn');
        const zoomOutBtn = document.getElementById('zoomOut');
        const fitScreenBtn = document.getElementById('fitScreen');
        const fullScreenBtn = document.getElementById('fullScreen');
        const resetViewBtn = document.getElementById('resetView');
        
        let scale = 1;
        let posX = 0;
        let posY = 0;
        
        function updateImageTransform() {
            modalImage.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
        }
        
        zoomInBtn.addEventListener('click', () => {
            scale = Math.min(scale * 1.2, 3);
            updateImageTransform();
        });
        
        zoomOutBtn.addEventListener('click', () => {
            scale = Math.max(scale / 1.2, 0.5);
            updateImageTransform();
        });
        
        fitScreenBtn.addEventListener('click', () => {
            scale = 1;
            posX = 0;
            posY = 0;
            updateImageTransform();
        });
        
        resetViewBtn.addEventListener('click', () => {
            scale = 1;
            posX = 0;
            posY = 0;
            updateImageTransform();
        });
        
        fullScreenBtn.addEventListener('click', () => {
            if (modalImage.requestFullscreen) {
                modalImage.requestFullscreen();
            }
        });
        
        // Image dragging functionality
        let isDragging = false;
        let startX, startY;
        
        modalImage.addEventListener('mousedown', (e) => {
            if (scale > 1) {
                isDragging = true;
                startX = e.clientX - posX;
                startY = e.clientY - posY;
                modalImage.style.cursor = 'grabbing';
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                posX = e.clientX - startX;
                posY = e.clientY - startY;
                updateImageTransform();
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
            modalImage.style.cursor = scale > 1 ? 'grab' : 'default';
        });
        
        // Wheel zoom
        modalImage.addEventListener('wheel', (e) => {
            e.preventDefault();
            const rect = modalImage.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            const newScale = Math.min(Math.max(scale * delta, 0.5), 3);
            
            if (newScale !== scale) {
                scale = newScale;
                updateImageTransform();
            }
        });
    }
    }

    function closeModal() {
        const modal = document.getElementById('projectModal');
        if (modal) {
            modal.classList.add('closing');
            
            setTimeout(() => {
                modal.classList.remove('active');
                modal.classList.remove('closing');
                document.body.style.overflow = 'auto';
                
                // Remove presentation modal classes
                const modalContent = document.querySelector('.modal-content');
                const modalBody = document.querySelector('.modal-body');
                
                if (modalContent) {
                    modalContent.classList.remove('presentation-modal');
                }
                if (modalBody) {
                    modalBody.classList.remove('presentation-layout');
                }
            }, 300);
        }
        
        // Stop ALL audio elements (voice-overs and presentations)
        document.querySelectorAll('audio').forEach(audio => {
            try {
                audio.pause();
                audio.currentTime = 0;
            } catch (e) {
                // Ignore errors for audio elements that can't be paused
            }
        });
        
        // Ensure strict voiceover viewer is hidden
        const voiceoverViewer = document.getElementById('voiceoverViewer');
        if (voiceoverViewer) {
            voiceoverViewer.style.display = 'none';
        }

        // Reset modal inline styles in case voiceover flow hid it earlier
        if (modal) {
            modal.style.display = '';
            modal.style.visibility = '';
            modal.style.opacity = '';
        }
    }

// ========== CONTACT FORM ==========
function initializeContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (!contactForm) {
                return;
    }
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const nameField = document.getElementById('name');
        const emailField = document.getElementById('email');
        const messageField = document.getElementById('message');
        
        if (!nameField || !emailField || !messageField) {
                        return;
        }
        
        const name = nameField.value;
        const email = emailField.value;
        const message = messageField.value;
        
        // Validate form
        if (!name || !email || !message) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Simulate form submission
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            showNotification('Message sent successfully!', 'success');
            this.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        ${type === 'success' ? 'background: #10b981;' : 'background: #ef4444;'}
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ========== SMOOTH SCROLLING ==========
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = 70;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Update active nav link based on scroll position
    window.addEventListener('scroll', updateActiveNavLink);
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// ========== AUDIO PLAYER FUNCTIONS ==========
function createAudioPlayer(project) {
    return `
        <div class="custom-audio-player">
            <div class="audio-header">
                <div class="audio-info">
                    <h4>${project.title}</h4>
                    <div class="audio-meta">
                        <span><i class="fas fa-clock"></i> ${project.duration}</span>
                        <span><i class="fas fa-language"></i> ${project.language}</span>
                        <span><i class="fas fa-microphone"></i> ${project.genre}</span>
                    </div>
                </div>
            </div>
            
            <div class="audio-waveform">
                <div class="waveform-bars">
                    ${Array.from({length: 50}, (_, i) => 
                        `<div class="waveform-bar" style="height: ${Math.random() * 80 + 20}%"></div>`
                    ).join('')}
                </div>
            </div>
            
            <div class="audio-controls">
                <button class="play-pause-btn" id="playPauseBtn">
                    <i class="fas fa-play"></i>
                </button>
                <div class="progress-container" id="progressContainer">
                    <div class="progress-bar" id="progressBar"></div>
                </div>
                <div class="time-display">
                    <span id="currentTime">0:00</span>
                    <span>/</span>
                    <span id="totalTime">${project.duration}</span>
                </div>
                <div class="volume-control">
                    <button class="volume-btn" id="volumeBtn">
                        <i class="fas fa-volume-up"></i>
                    </button>
                    <input type="range" class="volume-slider" id="volumeSlider" min="0" max="100" value="100">
                </div>
            </div>
            
            <audio id="audioElement" preload="metadata">
                <source src="${project.audioUrl}" type="audio/mpeg">
                <source src="${project.audioUrl}" type="audio/wav">
                Your browser does not support the audio element.
            </audio>
        </div>
    `;
}

// Create a much simpler rectangular audio player for Voiceover viewer
function createSimpleAudioPlayer(project) {
    // Use unique IDs scoped to the voiceover viewer
    return `
        <div class="simple-audio-player" aria-label="Voice over player">
            <button class="simple-play-btn" id="voicePlayPauseBtn" aria-label="Play">
                <i class="fas fa-play"></i>
            </button>
            <div class="simple-progress" id="voiceProgressContainer">
                <div class="simple-progress-bar" id="voiceProgressBar"></div>
            </div>
            <div class="simple-time" aria-hidden="true">
                <span id="voiceCurrentTime">0:00</span>
                <span>/</span>
                <span id="voiceTotalTime">${project.duration || '0:00'}</span>
            </div>
            <audio id="voiceAudioElement" preload="metadata">
                <source src="${project.audioUrl || ''}">
                Your browser does not support the audio element.
            </audio>
        </div>
    `;
}

function initializeSimpleAudioPlayer() {
    const audio = document.getElementById('voiceAudioElement');
    const playBtn = document.getElementById('voicePlayPauseBtn');
    const progressContainer = document.getElementById('voiceProgressContainer');
    const progressBar = document.getElementById('voiceProgressBar');
    const currentTimeSpan = document.getElementById('voiceCurrentTime');
    const totalTimeSpan = document.getElementById('voiceTotalTime');

    if (!audio || !playBtn || !progressContainer || !progressBar) return;

    let isPlaying = false;

    // Update total time when metadata loads
    audio.addEventListener('loadedmetadata', () => {
        if (audio.duration && totalTimeSpan) {
            const minutes = Math.floor(audio.duration / 60);
            const seconds = Math.floor(audio.duration % 60).toString().padStart(2, '0');
            totalTimeSpan.textContent = `${minutes}:${seconds}`;
        }
    });

    playBtn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            isPlaying = false;
        } else {
            audio.play();
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            isPlaying = true;
        }
    });

    audio.addEventListener('timeupdate', () => {
        if (!audio.duration) return;
        const percent = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = percent + '%';
        if (currentTimeSpan) {
            const m = Math.floor(audio.currentTime / 60);
            const s = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
            currentTimeSpan.textContent = `${m}:${s}`;
        }
    });

    // Seek when clicking the progress container
    progressContainer.addEventListener('click', (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        if (audio.duration) audio.currentTime = percent * audio.duration;
    });

    audio.addEventListener('ended', () => {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        progressBar.style.width = '0%';
        if (currentTimeSpan) currentTimeSpan.textContent = '0:00';
        isPlaying = false;
    });
}

function initializeAudioPlayer() {
    const audio = document.getElementById('audioElement');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const currentTimeSpan = document.getElementById('currentTime');
    const volumeBtn = document.getElementById('volumeBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const waveformBars = document.querySelectorAll('.waveform-bar');
    
    if (!audio || !playPauseBtn) return;
    
    let isPlaying = false;
    let currentWaveformIndex = 0;
    
    // Play/Pause functionality
    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            isPlaying = false;
        } else {
            audio.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            isPlaying = true;
        }
    });
    
    // Update progress
    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = progress + '%';
            
            // Update current time
            const minutes = Math.floor(audio.currentTime / 60);
            const seconds = Math.floor(audio.currentTime % 60);
            currentTimeSpan.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            // Animate waveform
            const newIndex = Math.floor((audio.currentTime / audio.duration) * waveformBars.length);
            if (newIndex !== currentWaveformIndex) {
                waveformBars.forEach((bar, i) => {
                    bar.classList.toggle('active', i <= newIndex);
                });
                currentWaveformIndex = newIndex;
            }
        }
    });
    
    // Seek functionality
    progressContainer.addEventListener('click', (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.currentTime = percent * audio.duration;
    });
    
    // Volume control
    volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value / 100;
        updateVolumeIcon(e.target.value);
    });
    
    volumeBtn.addEventListener('click', () => {
        if (audio.volume > 0) {
            audio.volume = 0;
            volumeSlider.value = 0;
            volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else {
            audio.volume = 1;
            volumeSlider.value = 100;
            volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    });
    
    function updateVolumeIcon(volume) {
        if (volume == 0) {
            volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else if (volume < 50) {
            volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
        } else {
            volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    }
    
    // Reset on audio end
    audio.addEventListener('ended', () => {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        isPlaying = false;
        progressBar.style.width = '0%';
        currentTimeSpan.textContent = '0:00';
        waveformBars.forEach(bar => bar.classList.remove('active'));
        currentWaveformIndex = 0;
    });
}

// ========== PARALLAX EFFECTS ==========
function initializeParallaxEffects() {
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.style.transform = `translateY(${rate}px)`;
        }
    });
}

// ========== LOADING SCREEN - REMOVED ==========
// Using hourglass loading screen in HTML instead

// ========== CERTIFICATES SLIDER ==========
function initializeCertificatesSlider() {
    const slider = document.getElementById('certificatesSlider');
    
    if (!slider) {
                return;
    }
    
    const slides = slider.querySelectorAll('.certificate-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // Check if required elements exist
    if (!slides.length) {
                return;
    }
    
    let currentSlide = 0;
    let isTransitioning = false;
    
    // Auto-slide interval
    let autoSlideInterval;
    
    function updateSlider() {
        if (isTransitioning) return;
        if (!slides || slides.length === 0) return;
        if (currentSlide < 0 || currentSlide >= slides.length) {
            currentSlide = 0; // Reset to safe value
        }
        
        isTransitioning = true;
        
        // Remove all active classes - with additional safety
        try {
            slides.forEach((slide, index) => {
                if (slide && slide.classList) {
                    slide.classList.remove('active', 'prev');
                    if (index < currentSlide) {
                        slide.classList.add('prev');
                    }
                }
            });
        } catch (e) {
                        isTransitioning = false;
            return;
        }
        
        // Update dots safely
        if (dots && dots.length > 0) {
            try {
                dots.forEach(dot => {
                    if (dot && dot.classList) {
                        dot.classList.remove('active');
                    }
                });
            } catch (e) {
                            }
        }
        
        // Add active class to current slide and dot
        try {
            if (slides[currentSlide] && slides[currentSlide].classList) {
                slides[currentSlide].classList.add('active');
            }
            if (dots && dots[currentSlide] && dots[currentSlide].classList) {
                dots[currentSlide].classList.add('active');
            }
        } catch (e) {
                    }
        
        // Update button states
        try {
            if (prevBtn) {
                prevBtn.disabled = currentSlide === 0;
            }
            if (nextBtn) {
                nextBtn.disabled = currentSlide === slides.length - 1;
            }
        } catch (e) {
                    }
        
        setTimeout(() => {
            isTransitioning = false;
        }, 800);
    }
    
    function nextSlide() {
        if (!slides || slides.length === 0) return;
        if (currentSlide < slides.length - 1) {
            currentSlide++;
            updateSlider();
        }
    }
    
    function prevSlide() {
        if (!slides || slides.length === 0) return;
        if (currentSlide > 0) {
            currentSlide--;
            updateSlider();
        }
    }
    
    function goToSlide(index) {
        if (!slides || slides.length === 0) return;
        if (index >= 0 && index < slides.length && index !== currentSlide) {
            currentSlide = index;
            updateSlider();
        }
    }
    
    function startAutoSlide() {
        if (!slides || slides.length <= 1) return; // Don't auto-slide if there's only one slide or none
        
        autoSlideInterval = setInterval(() => {
            if (currentSlide < slides.length - 1) {
                nextSlide();
            } else {
                currentSlide = 0;
                updateSlider();
            }
        }, 5000); // 5 seconds
    }
    
    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }
    
    // Event listeners
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoSlide();
            startAutoSlide();
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoSlide();
            startAutoSlide();
        });
    }
    
    if (dots.length > 0) {
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSlide(index);
                stopAutoSlide();
                startAutoSlide();
            });
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            stopAutoSlide();
            startAutoSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            stopAutoSlide();
            startAutoSlide();
        }
    });
    
    // Touch/swipe support
    let startX = 0;
    let endX = 0;
    
    slider.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        stopAutoSlide();
    });
    
    slider.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
        startAutoSlide();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left (next)
                nextSlide();
            } else {
                // Swipe right (prev)
                prevSlide();
            }
        }
    }
    
    // Pause auto-slide on hover
    slider.addEventListener('mouseenter', stopAutoSlide);
    slider.addEventListener('mouseleave', startAutoSlide);
    
    // Initialize
    updateSlider();
    startAutoSlide();
}

// ========== UTILITY FUNCTIONS ==========

// Throttle function for performance optimization
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Debounce function for performance optimization
function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Optimize scroll events
window.addEventListener('scroll', throttle(function() {
    updateActiveNavLink();
}, 100));

// ========== PERFORMANCE OPTIMIZATIONS ==========

// Lazy loading for images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Service Worker for caching (if needed)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                // Service worker registered successfully
            })
            .catch(function(registrationError) {
                // Service worker registration failed
            });
    });
}

// ========== ADDITIONAL ANIMATIONS ==========

// Typing animation for hero subtitle
function initializeTypingAnimation() {
    const subtitle = document.querySelector('.hero-subtitle');
    
    if (!subtitle) {
                return;
    }
    
    const text = subtitle.textContent;
    subtitle.textContent = '';
    
    let i = 0;
    const timer = setInterval(() => {
        if (i < text.length) {
            subtitle.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(timer);
        }
    }, 100);
}

// Typing animation for hero greeting and roles
function initializeHeroTyping() {
    try {
                const greetingEl = document.querySelector('.hero-greeting');
        const rolesEl = document.querySelector('.hero-typed-roles');
        if (!greetingEl || !rolesEl) return;

        const greetingText = greetingEl.dataset.text || greetingEl.textContent || "Hi, it's";

        // parse roles from pipe-separated dataset
        const roles = (rolesEl.dataset.text || rolesEl.textContent || '').split('|').map(s => s.trim()).filter(Boolean);

        // typing helper
        const sleep = (ms) => new Promise(r => setTimeout(r, ms));
        const typeText = async (el, text, speed = 60) => {
            el.textContent = '';
            el.classList.add('typing-cursor');
            for (let i = 0; i < text.length; i++) {
                el.textContent += text.charAt(i);
                await sleep(speed);
            }
            el.classList.remove('typing-cursor');
        };
        const backspace = async (el, speed = 40) => {
            el.classList.add('typing-cursor');
            while (el.textContent.length > 0) {
                el.textContent = el.textContent.slice(0, -1);
                await sleep(speed);
            }
            el.classList.remove('typing-cursor');
        };

    // controller to allow pause/resume from hover or focus
    window.__heroTypingController = window.__heroTypingController || { paused: false };

    (async () => {
            // type greeting once (fast)
            await typeText(greetingEl, greetingText, 80);
            await sleep(220);

            // ensure roles container is ready
            rolesEl.textContent = '';

            let idx = 0;
            while (true) {
                // respect pause flag (busy-wait with small sleep)
                while (window.__heroTypingController.paused) {
                    await sleep(180);
                }
                const text = roles[idx] || '';
                await typeText(rolesEl, text, 70);
                // trigger flourish animation
                rolesEl.classList.add('role-animated');
                await sleep(420);
                rolesEl.classList.remove('role-animated');
                await sleep(980);
                await backspace(rolesEl, 36);
                await sleep(280);
                idx = (idx + 1) % roles.length;
            }
        })();

    } catch (error) {
        console.error('Hero typing init failed:', error);
    }
}

// Pause/resume typing when user hovers or focuses hero area for accessibility
function initializeHeroTypingControls() {
    try {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        hero.addEventListener('mouseenter', () => { if (window.__heroTypingController) window.__heroTypingController.paused = true; });
        hero.addEventListener('mouseleave', () => { if (window.__heroTypingController) window.__heroTypingController.paused = false; });

        // keyboard accessibility: pause on focus within hero, resume on blur
        hero.addEventListener('focusin', () => { if (window.__heroTypingController) window.__heroTypingController.paused = true; });
        hero.addEventListener('focusout', () => { if (window.__heroTypingController) window.__heroTypingController.paused = false; });
    } catch (e) {  }
}

// Counter animation for stats
function initializeCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');
    
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                // detect suffix in sibling .stat-suffix or in text
                let suffix = '';
                const parent = counter.parentElement;
                if (parent) {
                    const s = parent.querySelector('.stat-suffix');
                    if (s) suffix = s.textContent || '';
                }

                // parse numeric target safely
                const raw = counter.textContent.replace(/[^0-9]/g, '');
                const target = parseInt(raw) || 0;
                let current = 0;
                const steps = 100;
                const increment = target / steps;
                const timer = setInterval(() => {
                    current += increment;
                    const displayed = Math.ceil(current);
                    counter.textContent = displayed;
                    if (current >= target) {
                        counter.textContent = target;
                        clearInterval(timer);
                    }
                }, 12);
                
                counterObserver.unobserve(counter);
            }
        });
    }, { threshold: 0.7 });
    
    counters.forEach(counter => counterObserver.observe(counter));
}

// ========== ACCESSIBILITY IMPROVEMENTS ==========

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    // Focus management for modal
    if (e.key === 'Tab' && document.querySelector('#projectModal.active')) {
        const modal = document.querySelector('#projectModal');
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }
});

// Announce page changes for screen readers
function announcePageChange(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// ========== ERROR HANDLING ==========

// ========== CERTIFICATE VIEWER ==========
function initializeCertificateViewer() {
    // Certificate modal HTML with controls
    const modalHTML = `
        <div id="certificateModal" class="certificate-modal">
            <div class="certificate-modal-content">
                <span class="certificate-close" title="Close (ESC)">&times;</span>
                <div class="certificate-hints">
                    <h4><i class="fas fa-info-circle"></i> Controls</h4>
                    <ul>
                        <li><i class="fas fa-mouse"></i> Drag to move</li>
                        <li><i class="fas fa-scroll"></i> Scroll to zoom</li>
                        <li><kbd>ESC</kbd> to close</li>
                        <li><kbd>F</kbd> fullscreen</li>
                    </ul>
                </div>
                <div class="certificate-image-container" id="certImageContainer">
                    <div class="mini-hourglass-loader" id="certHourglassLoader">
                        <div class="mini-hourglass">
                            <div class="mini-glass-frame-top"></div>
                            <div class="mini-glass-frame-bottom"></div>
                            <div class="mini-glass-top"></div>
                            <div class="mini-glass-middle"></div>
                            <div class="mini-glass-bottom"></div>
                            <div class="mini-sand-top"></div>
                            <div class="mini-sand-stream"></div>
                            <div class="mini-sand-bottom"></div>
                            <div class="mini-sand-particle"></div>
                            <div class="mini-sand-particle"></div>
                            <div class="mini-sand-particle"></div>
                        </div>
                        <div class="mini-hourglass-text">Loading...</div>
                    </div>
                    <img id="certificateImage" src="" alt="Certificate" draggable="false">
                </div>
                <div class="certificate-controls">
                    <button class="certificate-control-btn" id="certZoomIn" title="Zoom In (+)">
                        <i class="fas fa-search-plus"></i>
                    </button>
                    <button class="certificate-control-btn" id="certZoomOut" title="Zoom Out (-)">
                        <i class="fas fa-search-minus"></i>
                    </button>
                    <button class="certificate-control-btn" id="certResetZoom" title="Reset View (0)">
                        <i class="fas fa-compress-arrows-alt"></i>
                    </button>
                    <div class="certificate-control-divider"></div>
                    <div class="certificate-zoom-level" id="certZoomLevel">100%</div>
                    <div class="certificate-control-divider"></div>
                    <button class="certificate-control-btn" id="certFullscreen" title="Fullscreen (F)">
                        <i class="fas fa-expand"></i>
                    </button>
                    <button class="certificate-control-btn" id="certDownload" title="Download">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById('certificateModal');
    const modalContent = document.querySelector('.certificate-modal-content');
    const modalImage = document.getElementById('certificateImage');
    const imageContainer = document.getElementById('certImageContainer');
    const hourglassLoader = document.getElementById('certHourglassLoader');
    const closeBtn = document.querySelector('.certificate-close');
    const zoomInBtn = document.getElementById('certZoomIn');
    const zoomOutBtn = document.getElementById('certZoomOut');
    const resetZoomBtn = document.getElementById('certResetZoom');
    const fullscreenBtn = document.getElementById('certFullscreen');
    const downloadBtn = document.getElementById('certDownload');
    const zoomLevelDisplay = document.getElementById('certZoomLevel');
    
    let scale = 1;
    let posX = 0;
    let posY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentCertPath = '';
    
    function updateTransform() {
        modalImage.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
        zoomLevelDisplay.textContent = `${Math.round(scale * 100)}%`;
    }
    
    function resetView() {
        scale = 1;
        posX = 0;
        posY = 0;
        updateTransform();
    }
    
    // Zoom In
    zoomInBtn.addEventListener('click', () => {
        scale = Math.min(scale + 0.25, 5);
        updateTransform();
    });
    
    // Zoom Out
    zoomOutBtn.addEventListener('click', () => {
        scale = Math.max(scale - 0.25, 0.5);
        updateTransform();
    });
    
    // Reset Zoom
    resetZoomBtn.addEventListener('click', resetView);
    
    // Fullscreen
    fullscreenBtn.addEventListener('click', () => {
        if (modalContent.requestFullscreen) {
            modalContent.requestFullscreen();
        } else if (modalContent.webkitRequestFullscreen) {
            modalContent.webkitRequestFullscreen();
        } else if (modalContent.msRequestFullscreen) {
            modalContent.msRequestFullscreen();
        }
    });
    
    // Download
    downloadBtn.addEventListener('click', () => {
        if (currentCertPath) {
            const link = document.createElement('a');
            link.href = currentCertPath;
            link.download = currentCertPath.split('/').pop();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });
    
    // Mouse wheel zoom
    imageContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            scale = Math.min(scale + 0.1, 5);
        } else {
            scale = Math.max(scale - 0.1, 0.5);
        }
        updateTransform();
    }, { passive: false });
    
    // Dragging functionality
    imageContainer.addEventListener('mousedown', (e) => {
        if (e.target === modalImage) {
            isDragging = true;
            startX = e.clientX - posX;
            startY = e.clientY - posY;
            imageContainer.style.cursor = 'grabbing';
        }
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            posX = e.clientX - startX;
            posY = e.clientY - startY;
            updateTransform();
        }
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
        imageContainer.style.cursor = 'grab';
    });
    
    // Touch support for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    let lastTouchDistance = 0;
    
    imageContainer.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            touchStartX = e.touches[0].clientX - posX;
            touchStartY = e.touches[0].clientY - posY;
        } else if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
        }
    });
    
    imageContainer.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (e.touches.length === 1 && isDragging) {
            posX = e.touches[0].clientX - touchStartX;
            posY = e.touches[0].clientY - touchStartY;
            updateTransform();
        } else if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (lastTouchDistance > 0) {
                const delta = distance - lastTouchDistance;
                scale = Math.max(0.5, Math.min(5, scale + delta * 0.01));
                updateTransform();
            }
            lastTouchDistance = distance;
        }
    }, { passive: false });
    
    imageContainer.addEventListener('touchend', () => {
        isDragging = false;
        lastTouchDistance = 0;
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'flex') {
            switch(e.key) {
                case 'Escape':
                    closeCertificateModal();
                    break;
                case '+':
                case '=':
                    scale = Math.min(scale + 0.25, 5);
                    updateTransform();
                    break;
                case '-':
                case '_':
                    scale = Math.max(scale - 0.25, 0.5);
                    updateTransform();
                    break;
                case '0':
                    resetView();
                    break;
                case 'f':
                case 'F':
                    fullscreenBtn.click();
                    break;
            }
        }
    });
    
    // Add event listeners to all view certificate buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-certificate-btn') || e.target.closest('.view-certificate-btn')) {
            const btn = e.target.classList.contains('view-certificate-btn') ? e.target : e.target.closest('.view-certificate-btn');
            const certPath = btn.getAttribute('data-cert');
            
            if (certPath) {
                currentCertPath = certPath;
                
                // Show hourglass loader
                if (hourglassLoader) hourglassLoader.classList.add('active');
                modalImage.classList.remove('loaded');
                
                // Load image
                const img = new Image();
                img.onload = () => {
                    modalImage.src = certPath;
                    // Hide hourglass loader
                    if (hourglassLoader) hourglassLoader.classList.remove('active');
                    setTimeout(() => {
                        modalImage.classList.add('loaded');
                    }, 50);
                };
                img.onerror = () => {
                    // Hide hourglass loader on error
                    if (hourglassLoader) hourglassLoader.classList.remove('active');
                    console.error('Failed to load certificate image');
                };
                img.src = certPath;
                
                modal.style.display = 'flex';
                modal.classList.add('active');
                modal.classList.remove('closing');
                document.body.style.overflow = 'hidden';
                resetView();
            }
        }
    });
    
    // Close modal with animation
    function closeCertificateModal() {
        modal.classList.add('closing');
        modal.classList.remove('active');
        
        setTimeout(() => {
            modal.style.display = 'none';
            modal.classList.remove('closing');
            document.body.style.overflow = 'auto';
            resetView();
            currentCertPath = '';
        }, 300);
    }
    
    closeBtn.addEventListener('click', closeCertificateModal);
    
    // Close on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeCertificateModal();
        }
    });
}

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error || e.message || 'Unknown error');
    // Prevent default error handling to avoid showing error to user
    return true;
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
});

// Promise rejection handler
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    // Could send error to logging service
});

// Presentation overlay removed by request

// Portfolio initialization complete

// ========== MINI VOICEOVER PERSISTENT PLAYER ==========
;(function(){
    try {
        const mini = document.getElementById('miniVoicePlayer');
        const miniPlayBtn = document.getElementById('miniPlayBtn');
        const miniPlayIcon = document.getElementById('miniPlayIcon');
        const miniClose = document.getElementById('miniCloseBtn');
        const miniTitle = document.getElementById('miniVoiceTitle');
        const miniSub = document.getElementById('miniVoiceSub');
        const voiceoverViewer = document.getElementById('voiceoverViewer');

        if (!mini) return; // nothing to do

        // Helper: find audio element inside voiceAudioContainer
        function getVoiceAudioElement() {
            const container = document.getElementById('voiceAudioContainer');
            if (!container) return null;
            // look for audio element by id or tag
            const audio = container.querySelector('audio') || document.getElementById('voiceAudioElement') || container.querySelector('audio');
            return audio;
        }

        // Update mini UI from project details
        function syncMiniInfo() {
            const title = document.getElementById('voiceTitle')?.textContent || 'Voice Over';
            const desc = document.getElementById('voiceDescription')?.textContent || '';
            if (miniTitle) miniTitle.textContent = title.length > 36 ? title.slice(0,34)+'…' : title;
            if (miniSub) miniSub.textContent = desc ? desc.slice(0,48) : 'Listening in background';
        }

        // Show/hide mini based on audio playing state
        function updateMiniVisibility() {
            const audio = getVoiceAudioElement();
            if (!audio) { mini.style.display = 'none'; mini.setAttribute('aria-hidden','true'); return; }

            // if audio is playing and the voiceover viewer is not visible -> show mini
            const isPlaying = !audio.paused && !audio.ended && audio.currentTime > 0;
            const viewerVisible = voiceoverViewer && window.getComputedStyle(voiceoverViewer).display !== 'none';

            if (isPlaying && !viewerVisible) {
                syncMiniInfo();
                mini.style.display = 'flex';
                mini.setAttribute('aria-hidden','false');
            } else {
                mini.style.display = 'none';
                mini.setAttribute('aria-hidden','true');
            }
        }

        // Toggle play/pause
        function togglePlayPause() {
            const audio = getVoiceAudioElement();
            if (!audio) return;
            if (audio.paused) { audio.play().catch(()=>{}); }
            else { audio.pause(); }
            updateMiniIcon();
        }

        function updateMiniIcon() {
            const audio = getVoiceAudioElement();
            if (!audio) { miniPlayIcon.className = 'fas fa-play'; return; }
            miniPlayIcon.className = audio.paused ? 'fas fa-play' : 'fas fa-pause';
        }

        // Reopen viewer when clicking on mini area (but avoid when clicking close button)
        mini.addEventListener('click', (e) => {
            if (e.target === miniClose || miniClose.contains(e.target)) return;
            // show the voiceover viewer
            if (voiceoverViewer) {
                voiceoverViewer.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
            // optionally focus the compact close button
            const compactClose = document.getElementById('modalCloseCompact'); if (compactClose) compactClose.focus();
            updateMiniVisibility();
        });

        // Play/pause button
        if (miniPlayBtn) miniPlayBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePlayPause(); });

        // Close mini player (stop audio)
        if (miniClose) miniClose.addEventListener('click', (e) => {
            e.stopPropagation();
            const audio = getVoiceAudioElement();
            if (audio) { try { audio.pause(); audio.currentTime = 0; } catch (err) {} }
            mini.style.display = 'none';
            mini.setAttribute('aria-hidden','true');
            document.body.style.overflow = 'auto';
        });

        // Listen for play/pause events on any audio inside voiceAudioContainer
        const observer = new MutationObserver(() => {
            const audio = getVoiceAudioElement();
            if (audio) {
                audio.removeEventListener('play', updateMiniVisibility);
                audio.removeEventListener('pause', updateMiniVisibility);
                audio.removeEventListener('ended', updateMiniVisibility);
                audio.addEventListener('play', updateMiniVisibility);
                audio.addEventListener('pause', updateMiniVisibility);
                audio.addEventListener('ended', updateMiniVisibility);
            }
            updateMiniIcon();
            updateMiniVisibility();
        });

        // observe container for audio insertion
        const container = document.getElementById('voiceAudioContainer');
        if (container) observer.observe(container, { childList: true, subtree: true });

        // Also periodically check (in case audio loaded earlier)
        setInterval(updateMiniVisibility, 800);

        // initial sync
        setTimeout(() => { updateMiniVisibility(); updateMiniIcon(); }, 200);

    } catch (err) {  }
})();

// ========== HOURGLASS LOADING SCREEN ==========
(function initializeLoadingScreen() {
    try {
        // Get references to loading screen, website content, and hourglass
        const loadingScreen = document.getElementById('loading-screen');
        const websiteContent = document.getElementById('website-content');
        const hourglassContainer = document.querySelector('.hourglass-container');
        
        if (!loadingScreen || !websiteContent) {
                        return;
        }
        
        // Ensure body doesn't scroll during loading
        document.body.style.overflow = 'hidden';
        
        // Animation timing configuration (reduced for faster loading)
        const sandFallDuration = 2500;  // Time for sand to fall (2.5 seconds - faster)
        const flipDuration = 800;       // Time for hourglass flip (0.8 seconds - faster)
        
        // Step 1: Wait for sand to finish falling
        setTimeout(function() {
            
            // Step 2: Start hourglass flip animation
            if (hourglassContainer) {
                hourglassContainer.classList.add('flip');
            }
            
            // Step 3: After flip completes, start dissolve effect
            setTimeout(function() {
                if (loadingScreen) {
                    loadingScreen.classList.add('fade-out');
                }
                
                // Step 4: After dissolve starts, reveal website content
                setTimeout(function() {
                    // Hide loading screen completely
                    if (loadingScreen) {
                        loadingScreen.style.display = 'none';
                    }
                    
                    // Display website content with fade-in animation
                    if (websiteContent) {
                        websiteContent.style.display = 'block';
                        websiteContent.style.opacity = '0';
                        websiteContent.style.transition = 'opacity 0.8s ease';
                        
                        // Trigger fade-in
                        setTimeout(function() {
                            websiteContent.style.opacity = '1';
                        }, 50);
                    }
                    
                    // Re-enable scrolling
                    document.body.style.overflow = 'auto';
                    
                                        
                }, 400); // Start revealing content during dissolve
                
            }, flipDuration); // Wait for flip to complete
            
        }, sandFallDuration); // Wait for sand to finish falling
        
    } catch (error) {
        console.error('Loading screen initialization failed:', error);
        // Fallback: immediately show content if loading screen fails
        const loadingScreen = document.getElementById('loading-screen');
        const websiteContent = document.getElementById('website-content');
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (websiteContent) {
            websiteContent.style.display = 'block';
            websiteContent.style.opacity = '1';
        }
        document.body.style.overflow = 'auto';
    }
})();

// ========== HERO TYPING ANIMATION ==========
(function initializeHeroTypingAnimation() {
    try {
        const phrases = [
            "I'm a Frontend Developer",
            "I'm a UI/UX Designer",
            "I'm an AI Enthusiast",
            "I'm an IT Support Specialist"
        ];

        const typedText = document.getElementById("typedText");
        
        if (!typedText) {
                        return;
        }
        
        let phraseIndex = 0;
        let charIndex = 0;
        let deleting = false;

        const typingSpeed = 60;
        const pauseAfterType = 1400;
        const pauseAfterDelete = 300;

        function typeHero() {
            const current = phrases[phraseIndex];
            if (!deleting) {
                typedText.textContent = current.slice(0, ++charIndex);
                if (charIndex === current.length) {
                    deleting = true;
                    setTimeout(typeHero, pauseAfterType);
                } else {
                    setTimeout(typeHero, typingSpeed);
                }
            } else {
                typedText.textContent = current.slice(0, --charIndex);
                if (charIndex === 0) {
                    deleting = false;
                    phraseIndex = (phraseIndex + 1) % phrases.length;
                    setTimeout(typeHero, pauseAfterDelete);
                } else {
                    setTimeout(typeHero, typingSpeed / 2);
                }
            }
        }

        // Start typing after a short delay
        setTimeout(typeHero, 500);
        
    } catch (error) {
        console.error('Hero typing animation failed:', error);
    }
})();
