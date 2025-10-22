// DOM Elements - Cached for performance
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const filterBtns = document.querySelectorAll('.filter-btn');
const blogGrid = document.getElementById('blogGrid');
const blogCards = document.querySelectorAll('.blog-card');
const sortSelect = document.getElementById('sortSelect');
const viewButtons = document.querySelectorAll('.view-btn');
const navbar = document.querySelector('.navbar');
const sections = document.querySelectorAll('section[id]');

// Throttle function for performance
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
    }
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Mobile Navigation Toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling for navigation links (only for same-page anchors)
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        // Check if it's an anchor link on the same page
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetSection = document.querySelector(href);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
        // For external page links, let the browser handle navigation normally
    });
});

// Blog Filter Functionality (only on blog page)
if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            blogCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                    card.style.animation = 'fadeIn 0.3s ease-in';
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
}

// Sorting functionality
function parseDateString(dateStr) {
    // Expect format DD/MM/YYYY
    const parts = dateStr.split('/');
    if (parts.length !== 3) return 0;
    const [day, month, year] = parts.map(Number);
    return new Date(year, month - 1, day).getTime();
}

function getReadMinutes(text) {
    // "8 phút đọc" -> 8
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
}

function sortCards(criteria) {
    if (!blogGrid) return;
    const cards = Array.from(blogGrid.querySelectorAll('.blog-card'));

    const sorted = cards.sort((a, b) => {
        if (criteria === 'newest' || criteria === 'oldest') {
            const aDate = parseDateString(a.querySelector('.blog-date').textContent.trim());
            const bDate = parseDateString(b.querySelector('.blog-date').textContent.trim());
            return criteria === 'newest' ? bDate - aDate : aDate - bDate;
        }
        if (criteria === 'shortest' || criteria === 'longest') {
            const aMin = getReadMinutes(a.querySelector('.blog-read-time').textContent.trim());
            const bMin = getReadMinutes(b.querySelector('.blog-read-time').textContent.trim());
            return criteria === 'shortest' ? aMin - bMin : bMin - aMin;
        }
        return 0;
    });

    // Re-append in new order
    sorted.forEach(card => blogGrid.appendChild(card));
}

if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
        sortCards(e.target.value);
    });
}

// View toggle (grid/list)
if (viewButtons.length > 0 && blogGrid) {
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            viewButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const view = btn.getAttribute('data-view');
            if (view === 'list') {
                blogGrid.classList.add('list-view');
            } else {
                blogGrid.classList.remove('list-view');
            }
        });
    });
}

// Optimized navbar scroll effect with throttling
const handleNavbarScroll = throttle(() => {
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
}, 16); // ~60fps

// Only add scroll listener if navbar exists
if (navbar) {
    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
}

// Optimized active navigation link highlighting (only for pages with sections)
const handleNavHighlight = throttle(() => {
    if (sections.length === 0) return; // Skip if no sections on current page
    
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}, 100);

// Only add scroll listener if sections exist
if (sections.length > 0) {
    window.addEventListener('scroll', handleNavHighlight, { passive: true });
}

// Optimized Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            // Unobserve after animation to improve performance
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for animation - reduced scope and only on CV page
const animatedElements = document.querySelectorAll('.cv-section-item, .timeline-item, .skill-item');
if (animatedElements.length > 0) {
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// Optimized skill bars animation
const skillBars = document.querySelectorAll('.skill-progress');
if (skillBars.length > 0) {
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillBar = entry.target;
                const width = skillBar.getAttribute('data-width');
                requestAnimationFrame(() => {
                    skillBar.style.width = width;
                });
                // Unobserve after animation
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    skillBars.forEach(bar => {
        skillObserver.observe(bar);
    });
}

// Optimized blog card hover effects with CSS transforms
if (blogCards.length > 0) {
    blogCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translate3d(0, -5px, 0)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translate3d(0, 0, 0)';
        });
    });
}

// Removed typing effect for better performance - static text is faster
// Navigate to detail page when clicking anywhere on a blog card
if (blogCards.length > 0) {
    blogCards.forEach(card => {
        const link = card.querySelector('.blog-link');
        if (!link) return;

        // Visual cue for interactivity
        card.style.cursor = 'pointer';

        // Click handler
        card.addEventListener('click', (e) => {
            // If the click originated from an interactive element with its own href, let it proceed
            const target = e.target;
            if (target.closest && target.closest('a')) return;
            window.location.href = link.getAttribute('href');
        });

        // Keyboard accessibility: allow Enter to activate
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.keyCode === 13) {
                window.location.href = link.getAttribute('href');
            }
        });
    });
}

// Optimized search functionality with debouncing (only on blog page)
function createSearchBox() {
    const sectionHeader = document.querySelector('.section-header');
    if (!sectionHeader || blogCards.length === 0) return; // Only create on blog page
    
    const searchHTML = `
        <div class="search-container" style="margin-bottom: 2rem; text-align: center;">
            <input type="text" id="searchInput" placeholder="Tìm kiếm bài viết..." 
                   style="padding: 12px 20px; border: 2px solid #E2E8F0; border-radius: 25px; 
                          width: 300px; max-width: 100%; font-size: 16px; outline: none;
                          transition: border-color 0.3s ease;">
        </div>
    `;
    
    sectionHeader.insertAdjacentHTML('afterend', searchHTML);
    
    const searchInput = document.getElementById('searchInput');
    
    // Debounced search function
    const debouncedSearch = debounce((searchTerm) => {
        blogCards.forEach(card => {
            const title = card.querySelector('.blog-title').textContent.toLowerCase();
            const excerpt = card.querySelector('.blog-excerpt').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || excerpt.includes(searchTerm)) {
                card.classList.remove('hidden');
                card.style.animation = 'fadeIn 0.3s ease-in';
            } else {
                card.classList.add('hidden');
            }
        });
    }, 300);
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        debouncedSearch(searchTerm);
    });
}

// Initialize search box
createSearchBox();

// Optimized back to top button
function createBackToTopButton() {
    const backToTopHTML = `
        <button id="backToTop" style="
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: #4F46E5;
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        ">
            <i class="fas fa-arrow-up"></i>
        </button>
    `;
    
    document.body.insertAdjacentHTML('beforeend', backToTopHTML);
    
    const backToTopBtn = document.getElementById('backToTop');
    
    // Throttled scroll handler for back to top button
    const handleBackToTop = throttle(() => {
        if (window.scrollY > 300) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.visibility = 'visible';
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.visibility = 'hidden';
        }
    }, 100);
    
    window.addEventListener('scroll', handleBackToTop, { passive: true });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize back to top button
createBackToTopButton();

// Optimized loading animation
window.addEventListener('load', () => {
    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });
});

// Performance monitoring
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`⚡ Trang web tải trong ${Math.round(loadTime)}ms`);
});

// Error handling
window.addEventListener('error', (e) => {
    console.error('❌ Lỗi:', e.error);
});

// Optimized console welcome message
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🚀 DevBlog - Optimized for Performance!');
}

// QR Code Generation for Credly Certificates
function generateQRCode() {
    const qrContainer = document.getElementById('qrcode');
    if (!qrContainer) return;
    
    const credlyUrl = 'https://www.credly.com/users/2207-nguy-n-minh-nh-t';
    
    // Check if QRCode library is loaded
    if (typeof QRCode === 'undefined') {
        console.error('QRCode library not loaded');
        // Fallback to image
        qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(credlyUrl)}" alt="QR Code - Credly Certificates" style="width: 150px; height: 150px; border-radius: 8px; border: 2px solid rgba(255, 255, 255, 0.3); background: white; padding: 5px;" />`;
        return;
    }
    
    try {
        QRCode.toCanvas(qrContainer, credlyUrl, {
            width: 150,
            height: 150,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            margin: 2,
            errorCorrectionLevel: 'M'
        }, function (error) {
            if (error) {
                console.error('QR Code generation error:', error);
                // Fallback to image
                qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(credlyUrl)}" alt="QR Code - Credly Certificates" style="width: 150px; height: 150px; border-radius: 8px; border: 2px solid rgba(255, 255, 255, 0.3); background: white; padding: 5px;" />`;
            }
        });
    } catch (error) {
        console.error('QR Code generation error:', error);
        // Fallback to image
        qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(credlyUrl)}" alt="QR Code - Credly Certificates" style="width: 150px; height: 150px; border-radius: 8px; border: 2px solid rgba(255, 255, 255, 0.3); background: white; padding: 5px;" />`;
    }
}

// Initialize QR Code when page loads
document.addEventListener('DOMContentLoaded', generateQRCode);

// Add click functionality to QR Code
document.addEventListener('DOMContentLoaded', function() {
    const qrContainer = document.getElementById('qrcode');
    if (!qrContainer) return;
    
    const credlyUrl = 'https://www.credly.com/users/2207-nguy-n-minh-nh-t';
    
    // Add click event to QR code container
    qrContainer.style.cursor = 'pointer';
    qrContainer.title = 'Click để mở link Credly';
    
    qrContainer.addEventListener('click', function() {
        window.open(credlyUrl, '_blank');
    });
    
    // Add hover effect
    qrContainer.addEventListener('mouseenter', function() {
        qrContainer.style.transform = 'scale(1.05)';
        qrContainer.style.transition = 'transform 0.2s ease';
    });
    
    qrContainer.addEventListener('mouseleave', function() {
        qrContainer.style.transform = 'scale(1)';
    });
});