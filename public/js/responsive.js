// Responsive Design Enhancements
// Mobile-specific functionality and responsive behavior

document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation enhancements
    enhanceMobileNavigation();
    
    // Touch-friendly interactions
    enhanceTouchInteractions();
    
    // Responsive table handling
    enhanceResponsiveTables();
    
    // Mobile form enhancements
    enhanceMobileForms();
    
    // Responsive image handling
    enhanceResponsiveImages();
    
    // Mobile-specific event listeners
    addMobileEventListeners();
    
    // Responsive utility functions
    addResponsiveUtilities();
});

// Mobile Navigation Enhancements
function enhanceMobileNavigation() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navbarToggler.contains(e.target) && !navbarCollapse.contains(e.target)) {
                if (navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                }
            }
        });
        
        // Close mobile menu when clicking on a link
        const navLinks = navbarCollapse.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navbarToggler.click();
                }
            });
        });
    }
    
    // Admin sidebar mobile handling
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && window.innerWidth <= 768) {
        // Add mobile sidebar toggle functionality
        const sidebarToggle = document.createElement('button');
        sidebarToggle.className = 'btn btn-primary d-md-none position-fixed';
        sidebarToggle.style.cssText = 'top: 10px; left: 10px; z-index: 1050; border-radius: 50%; width: 50px; height: 50px;';
        sidebarToggle.innerHTML = '<i class="bi bi-list"></i>';
        
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
        
        document.body.appendChild(sidebarToggle);
        
        // Hide sidebar by default on mobile
        sidebar.classList.remove('show');
    }
}

// Touch-friendly Interactions
function enhanceTouchInteractions() {
    // Add touch feedback to buttons
    const buttons = document.querySelectorAll('.btn, .action-btn, .nav-link');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Enhanced carousel touch support
    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach(carousel => {
        let startX = 0;
        let endX = 0;
        
        carousel.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
        });
        
        carousel.addEventListener('touchend', function(e) {
            endX = e.changedTouches[0].clientX;
            handleSwipe(carousel, startX, endX);
        });
    });
}

// Handle carousel swipe gestures
function handleSwipe(carousel, startX, endX) {
    const threshold = 50;
    const diff = startX - endX;
    
    if (Math.abs(diff) > threshold) {
        if (diff > 0) {
            // Swipe left - next slide
            const nextButton = carousel.querySelector('.carousel-control-next');
            if (nextButton) nextButton.click();
        } else {
            // Swipe right - previous slide
            const prevButton = carousel.querySelector('.carousel-control-prev');
            if (prevButton) prevButton.click();
        }
    }
}

// Responsive Table Enhancements
function enhanceResponsiveTables() {
    const tables = document.querySelectorAll('.table');
    
    tables.forEach(table => {
        if (window.innerWidth <= 768) {
            // Add horizontal scroll wrapper
            if (!table.parentElement.classList.contains('table-responsive')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-responsive';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
            
            // Add mobile-friendly table styling
            table.classList.add('table-sm');
        }
    });
}

// Mobile Form Enhancements
function enhanceMobileForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // Add mobile-friendly input styling
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            // Prevent zoom on iOS
            if (input.type === 'text' || input.type === 'email' || input.type === 'password') {
                input.style.fontSize = '16px';
            }
            
            // Add touch-friendly padding
            input.style.padding = '12px 16px';
        });
        
        // Enhance form validation for mobile
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('is-invalid');
                    
                    // Show mobile-friendly error message
                    showMobileError(field, 'This field is required');
                } else {
                    field.classList.remove('is-invalid');
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showMobileNotification('Please fill in all required fields', 'error');
            }
        });
    });
}

// Show mobile-friendly error messages
function showMobileError(field, message) {
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.mobile-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Create new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'mobile-error text-danger mt-1';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

// Responsive Image Enhancements
function enhanceResponsiveImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // Add lazy loading for better mobile performance
        if (!img.loading) {
            img.loading = 'lazy';
        }
        
        // Add responsive image classes
        if (!img.classList.contains('img-fluid')) {
            img.classList.add('img-fluid');
        }
        
        // Handle image loading errors
        img.addEventListener('error', function() {
            this.style.display = 'none';
            console.log('Image failed to load:', this.src);
        });
    });
}

// Mobile-specific Event Listeners
function addMobileEventListeners() {
    // Handle orientation change
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            // Recalculate responsive elements
            enhanceResponsiveTables();
            enhanceResponsiveImages();
        }, 100);
    });
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Recalculate responsive elements
            enhanceResponsiveTables();
            enhanceResponsiveImages();
        }, 250);
    });
    
    // Handle mobile keyboard events
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            // Scroll to input on mobile
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        });
    });
}

// Responsive Utility Functions
function addResponsiveUtilities() {
    // Add responsive utility functions to window object
    window.responsiveUtils = {
        // Check if device is mobile
        isMobile: function() {
            return window.innerWidth <= 768;
        },
        
        // Check if device is tablet
        isTablet: function() {
            return window.innerWidth > 768 && window.innerWidth <= 1024;
        },
        
        // Check if device is desktop
        isDesktop: function() {
            return window.innerWidth > 1024;
        },
        
        // Get current breakpoint
        getBreakpoint: function() {
            if (window.innerWidth <= 576) return 'xs';
            if (window.innerWidth <= 768) return 'sm';
            if (window.innerWidth <= 992) return 'md';
            if (window.innerWidth <= 1200) return 'lg';
            return 'xl';
        },
        
        // Show mobile notification
        showNotification: function(message, type = 'info') {
            showMobileNotification(message, type);
        },
        
        // Hide mobile keyboard
        hideKeyboard: function() {
            document.activeElement.blur();
        }
    };
}

// Mobile Notification System
function showMobileNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.mobile-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `mobile-notification alert alert-${type === 'error' ? 'danger' : type} position-fixed`;
    notification.style.cssText = `
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        max-width: 90%;
        width: auto;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-size: 0.9rem;
    `;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Enhanced Mobile Form Validation
function validateMobileForm(form) {
    const errors = [];
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            errors.push(`${field.name || field.id} is required`);
            field.classList.add('is-invalid');
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    // Email validation
    const emailFields = form.querySelectorAll('input[type="email"]');
    emailFields.forEach(field => {
        if (field.value && !isValidEmail(field.value)) {
            errors.push('Please enter a valid email address');
            field.classList.add('is-invalid');
        }
    });
    
    // Phone validation
    const phoneFields = form.querySelectorAll('input[type="tel"]');
    phoneFields.forEach(field => {
        if (field.value && !isValidPhone(field.value)) {
            errors.push('Please enter a valid phone number');
            field.classList.add('is-invalid');
        }
    });
    
    return errors;
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation helper
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Mobile-friendly Modal Enhancements
function enhanceMobileModals() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        // Add mobile-specific modal behavior
        modal.addEventListener('show.bs.modal', function() {
            if (window.innerWidth <= 768) {
                // Adjust modal for mobile
                const modalDialog = this.querySelector('.modal-dialog');
                if (modalDialog) {
                    modalDialog.style.margin = '1rem';
                    modalDialog.style.maxWidth = 'calc(100% - 2rem)';
                }
            }
        });
    });
}

// Initialize mobile enhancements when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        enhanceMobileModals();
    });
} else {
    enhanceMobileModals();
}

// Export functions for use in other scripts
window.mobileEnhancements = {
    enhanceMobileNavigation,
    enhanceTouchInteractions,
    enhanceResponsiveTables,
    enhanceMobileForms,
    enhanceResponsiveImages,
    showMobileNotification,
    validateMobileForm,
    isValidEmail,
    isValidPhone
}; 