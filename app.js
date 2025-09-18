// Futuristic PowerPoint-style JavaScript - Fixed Version
class PresentationApp {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 15;
        this.isAutoPlay = false;
        this.autoPlayTimer = null;
        this.autoPlayInterval = 5; // seconds
        this.autoPlayCountdown = this.autoPlayInterval;
        
        this.init();
    }

    init() {
        this.createSlideIndicators();
        this.bindEvents();
        this.updateUI();
        this.startAnimations();
    }

    createSlideIndicators() {
        const indicatorsContainer = document.getElementById('slideIndicators');
        indicatorsContainer.innerHTML = '';

        for (let i = 1; i <= this.totalSlides; i++) {
            const indicator = document.createElement('div');
            indicator.className = `indicator ${i === 1 ? 'active' : ''}`;
            indicator.setAttribute('data-slide', i);
            
            // Fix: Properly bind the slide number
            indicator.addEventListener('click', (e) => {
                e.stopPropagation();
                const slideNum = parseInt(indicator.getAttribute('data-slide'));
                this.goToSlide(slideNum);
            });
            
            indicatorsContainer.appendChild(indicator);
        }
    }

    bindEvents() {
        // Navigation buttons
        document.getElementById('prevBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.previousSlide();
        });
        
        document.getElementById('nextBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.nextSlide();
        });
        
        // Fullscreen toggle - Fix: Ensure it works properly
        document.getElementById('fullscreenBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFullscreen();
        });
        
        // Auto-play toggle
        document.getElementById('autoplayBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleAutoPlay();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Click navigation on slides - Fix: Better event handling
        document.addEventListener('click', (e) => {
            // Don't navigate if clicking on controls
            if (e.target.closest('.nav-controls, .slide-indicators, .autoplay-controls, .fullscreen-btn, .slide-counter')) {
                return;
            }
            this.handleSlideClick(e);
        });
        
        // Prevent context menu
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Handle fullscreen change
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());
    }

    handleKeydown(e) {
        switch (e.key) {
            case 'ArrowRight':
            case ' ':
            case 'PageDown':
                e.preventDefault();
                this.nextSlide();
                break;
            case 'ArrowLeft':
            case 'PageUp':
                e.preventDefault();
                this.previousSlide();
                break;
            case 'Home':
                e.preventDefault();
                this.goToSlide(1);
                break;
            case 'End':
                e.preventDefault();
                this.goToSlide(this.totalSlides);
                break;
            case 'F11':
                e.preventDefault();
                this.toggleFullscreen();
                break;
            case 'Escape':
                if (this.isAutoPlay) {
                    this.toggleAutoPlay();
                }
                break;
            case 'p':
            case 'P':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.toggleAutoPlay();
                }
                break;
            case 'f':
            case 'F':
                if (e.ctrlKey || e.altKey) {
                    e.preventDefault();
                    this.toggleFullscreen();
                }
                break;
        }
    }

    handleSlideClick(e) {
        const rect = window.innerWidth;
        const clickX = e.clientX;
        
        // Click on left half = previous, right half = next
        if (clickX < rect / 2) {
            this.previousSlide();
        } else {
            this.nextSlide();
        }
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.goToSlide(this.currentSlide + 1);
        } else {
            // Loop back to first slide
            this.goToSlide(1);
        }
    }

    previousSlide() {
        if (this.currentSlide > 1) {
            this.goToSlide(this.currentSlide - 1);
        } else {
            // Loop to last slide
            this.goToSlide(this.totalSlides);
        }
    }

    goToSlide(slideNumber) {
        // Fix: Better validation and handling
        const targetSlideNumber = parseInt(slideNumber);
        
        if (isNaN(targetSlideNumber) || targetSlideNumber < 1 || targetSlideNumber > this.totalSlides || targetSlideNumber === this.currentSlide) {
            return;
        }

        const currentSlideEl = document.querySelector('.slide.active');
        const targetSlideEl = document.querySelector(`[data-slide="${targetSlideNumber}"]`);

        if (!targetSlideEl) {
            console.warn(`Slide ${targetSlideNumber} not found`);
            return;
        }

        // Update current slide first
        const oldSlide = this.currentSlide;
        this.currentSlide = targetSlideNumber;

        // Remove active class from current slide
        if (currentSlideEl) {
            currentSlideEl.classList.remove('active');
            currentSlideEl.classList.add('prev');
        }

        // Add active class to target slide
        targetSlideEl.classList.remove('prev');
        targetSlideEl.classList.add('active');

        // Clean up prev class after transition
        setTimeout(() => {
            const prevSlides = document.querySelectorAll('.slide.prev');
            prevSlides.forEach(slide => slide.classList.remove('prev'));
        }, 600);

        this.updateUI();
        this.restartSlideAnimations();

        // Reset auto-play timer if active
        if (this.isAutoPlay) {
            this.resetAutoPlayTimer();
        }

        console.log(`Navigated from slide ${oldSlide} to slide ${this.currentSlide}`);
    }

    updateUI() {
        // Update slide counter
        document.getElementById('currentSlide').textContent = this.currentSlide;
        document.getElementById('totalSlides').textContent = this.totalSlides;

        // Update progress bar
        const progressPercentage = (this.currentSlide / this.totalSlides) * 100;
        document.getElementById('progressFill').style.width = `${progressPercentage}%`;

        // Fix: Update slide indicators properly
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            const slideNum = index + 1;
            if (slideNum === this.currentSlide) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });

        // Update navigation buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        // Enable all buttons (we're allowing looping)
        prevBtn.disabled = false;
        nextBtn.disabled = false;

        // Update button opacity for visual feedback
        prevBtn.style.opacity = this.currentSlide === 1 ? '0.6' : '1';
        nextBtn.style.opacity = this.currentSlide === this.totalSlides ? '0.6' : '1';
    }

    restartSlideAnimations() {
        const currentSlideEl = document.querySelector('.slide.active');
        if (!currentSlideEl) return;

        // Remove and re-add animation classes to restart animations
        const animatedElements = currentSlideEl.querySelectorAll('[class*="animate"], .bullet-list li, .tech-item, .feature-item, .command-item, .metric-item');
        
        animatedElements.forEach(el => {
            el.style.animation = 'none';
            el.offsetHeight; // Trigger reflow
            el.style.animation = null;
        });
    }

    toggleFullscreen() {
        try {
            const doc = document;
            const elem = document.documentElement;
            
            if (!doc.fullscreenElement && !doc.webkitFullscreenElement && !doc.mozFullScreenElement && !doc.msFullscreenElement) {
                // Enter fullscreen
                if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                } else if (elem.webkitRequestFullscreen) {
                    elem.webkitRequestFullscreen();
                } else if (elem.mozRequestFullScreen) {
                    elem.mozRequestFullScreen();
                } else if (elem.msRequestFullscreen) {
                    elem.msRequestFullscreen();
                }
            } else {
                // Exit fullscreen
                if (doc.exitFullscreen) {
                    doc.exitFullscreen();
                } else if (doc.webkitExitFullscreen) {
                    doc.webkitExitFullscreen();
                } else if (doc.mozCancelFullScreen) {
                    doc.mozCancelFullScreen();
                } else if (doc.msExitFullscreen) {
                    doc.msExitFullscreen();
                }
            }
        } catch (error) {
            console.log('Fullscreen not supported or blocked');
            // Show a message to user
            this.showNotification('Fullscreen mode not available. Try F11 key or browser fullscreen option.');
        }
    }

    handleFullscreenChange() {
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || 
                           document.mozFullScreenElement || document.msFullscreenElement;
        
        if (isFullscreen) {
            fullscreenBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                </svg>
            `;
            fullscreenBtn.title = 'Exit Fullscreen (ESC)';
        } else {
            fullscreenBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
            `;
            fullscreenBtn.title = 'Enter Fullscreen (F11)';
        }
    }

    showNotification(message) {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: rgba(0, 255, 255, 0.9);
            color: #000;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-family: 'Roboto', sans-serif;
            max-width: 300px;
            box-shadow: 0 4px 20px rgba(0, 255, 255, 0.3);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    toggleAutoPlay() {
        this.isAutoPlay = !this.isAutoPlay;
        const autoplayBtn = document.getElementById('autoplayBtn');
        
        if (this.isAutoPlay) {
            this.startAutoPlay();
            autoplayBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
            `;
            autoplayBtn.title = 'Pause Auto-play (ESC)';
            this.showNotification('Auto-play started. Press ESC to stop.');
        } else {
            this.stopAutoPlay();
            autoplayBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            `;
            autoplayBtn.title = 'Start Auto-play (Ctrl+P)';
        }
    }

    startAutoPlay() {
        this.resetAutoPlayTimer();
        this.autoPlayTimer = setInterval(() => {
            this.autoPlayCountdown--;
            document.getElementById('autoplayTimer').textContent = this.autoPlayCountdown;
            
            if (this.autoPlayCountdown <= 0) {
                this.nextSlide();
                this.resetAutoPlayTimer();
            }
        }, 1000);
    }

    stopAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
        document.getElementById('autoplayTimer').textContent = '';
    }

    resetAutoPlayTimer() {
        this.autoPlayCountdown = this.autoPlayInterval;
        document.getElementById('autoplayTimer').textContent = this.autoPlayCountdown;
    }

    startAnimations() {
        // Add entrance animations to elements
        setTimeout(() => {
            const animatedElements = document.querySelectorAll('.slide.active .slide-content > *');
            animatedElements.forEach((el, index) => {
                el.style.animationDelay = `${index * 0.1}s`;
            });
        }, 100);
    }

    // Presentation utilities
    getCurrentSlideData() {
        return {
            current: this.currentSlide,
            total: this.totalSlides,
            progress: (this.currentSlide / this.totalSlides) * 100,
            isAutoPlay: this.isAutoPlay
        };
    }

    // Additional interactive features
    addSlideTransitionEffects() {
        const slides = document.querySelectorAll('.slide');
        
        slides.forEach((slide, index) => {
            slide.addEventListener('transitionend', (e) => {
                if (e.target === slide && slide.classList.contains('active')) {
                    // Slide transition completed
                    this.onSlideTransitionComplete(index + 1);
                }
            });
        });
    }

    onSlideTransitionComplete(slideNumber) {
        // Custom logic for specific slides
        switch (slideNumber) {
            case 1:
                this.animateTitleSlide();
                break;
            case 6:
                this.animateArchitectureFlow();
                break;
            case 11:
                this.animateMetrics();
                break;
        }
    }

    animateTitleSlide() {
        const mainTitle = document.querySelector('.main-title');
        if (mainTitle) {
            mainTitle.style.animation = 'glow 2s ease-in-out infinite alternate';
        }
    }

    animateArchitectureFlow() {
        const flowItems = document.querySelectorAll('.flow-item');
        const arrows = document.querySelectorAll('.flow-arrow');
        
        flowItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.animation = 'pulse 1s ease-in-out';
            }, index * 500);
        });
        
        arrows.forEach((arrow, index) => {
            setTimeout(() => {
                arrow.style.animation = 'bounce 1s ease-in-out infinite';
            }, (index + 0.5) * 500);
        });
    }

    animateMetrics() {
        const metricItems = document.querySelectorAll('.metric-item h3');
        
        metricItems.forEach((metric, index) => {
            setTimeout(() => {
                this.animateNumber(metric);
            }, index * 200);
        });
    }

    animateNumber(element) {
        const text = element.textContent;
        const number = parseFloat(text.replace(/[^\d.]/g, ''));
        
        if (!isNaN(number)) {
            let current = 0;
            const increment = number / 30;
            const timer = setInterval(() => {
                current += increment;
                if (current >= number) {
                    current = number;
                    clearInterval(timer);
                }
                element.textContent = text.replace(number.toString(), Math.round(current).toString());
            }, 50);
        }
    }

    // Touch/swipe support for mobile
    addTouchSupport() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next slide
                this.nextSlide();
            } else {
                // Swipe right - previous slide
                this.previousSlide();
            }
        }
    }

    // Print functionality
    printPresentation() {
        window.print();
    }
}

// Global variables to prevent conflicts
let touchStartX = 0;
let touchEndX = 0;

// Initialize presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const presentation = new PresentationApp();
    
    // Add touch support
    presentation.addTouchSupport();
    presentation.addSlideTransitionEffects();
    
    // Global presentation object for debugging/external control
    window.presentation = presentation;
    
    // Add keyboard shortcut for printing
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            presentation.printPresentation();
        }
    });
    
    // Add visual feedback for interactions
    document.addEventListener('click', (e) => {
        if (e.target.closest('button, .indicator')) {
            createRippleEffect(e);
        }
    });
    
    // Show loading complete message with instructions
    console.log('🚀 JARVIS Presentation loaded successfully!');
    console.log('📋 Controls:');
    console.log('   - Arrow keys or click to navigate');
    console.log('   - Space bar for next slide');
    console.log('   - Click slide indicators (dots) for specific slides');
    console.log('   - F11 or fullscreen button for fullscreen mode');
    console.log('   - Ctrl+P for auto-play toggle');
    console.log('   - ESC to stop auto-play');
    console.log('   - Ctrl+P to print presentation');
    
    // Show welcome notification
    setTimeout(() => {
        presentation.showNotification('Welcome! Use arrow keys or click to navigate. F11 for fullscreen.');
    }, 1000);
});

// Utility function for button ripple effect
function createRippleEffect(event) {
    const button = event.target.closest('button, .indicator');
    if (!button) return;
    
    const ripple = document.createElement('div');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(0, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s linear;
        left: ${event.clientX - rect.left - size / 2}px;
        top: ${event.clientY - rect.top - size / 2}px;
        width: ${size}px;
        height: ${size}px;
        pointer-events: none;
        z-index: 1000;
    `;
    
    // Add ripple animation keyframes if not exists
    if (!document.querySelector('#ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add smooth scrolling for better UX
document.documentElement.style.scrollBehavior = 'smooth';

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log(`⚡ Presentation loaded in ${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`);
        }, 0);
    });
}