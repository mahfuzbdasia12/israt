// Midnight Kinetic - Global Interactions

document.addEventListener('DOMContentLoaded', () => {
    // 1. Smooth scrolling for internal anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                const navLinks = document.querySelector('.nav-links');
                if (navLinks && navLinks.classList.contains('mobile-active')) {
                    navLinks.classList.remove('mobile-active');
                }
            }
        });
    });

    // Mobile Navigation Menu Toggle
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const navLinksElement = document.querySelector('.nav-links');

    if (mobileNavToggle && navLinksElement) {
        mobileNavToggle.addEventListener('click', () => {
            navLinksElement.classList.toggle('mobile-active');
            const icon = mobileNavToggle.querySelector('.material-symbols-outlined');
            if (icon) {
                if (navLinksElement.classList.contains('mobile-active')) {
                    icon.innerText = 'close';
                } else {
                    icon.innerText = 'menu';
                }
            }
        });
    }

    // 2. Portfolio Item Filtering
    const tabBtns = document.querySelectorAll('.portfolio-tabs .tab-btn');
    const portfolioCards = document.querySelectorAll('.portfolio-grid .portfolio-card');

    if (tabBtns.length > 0 && portfolioCards.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                tabBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');

                const category = btn.getAttribute('data-category');

                // Filter cards
                portfolioCards.forEach(card => {
                    const cardCat = card.getAttribute('data-category');
                    if (category === 'all' || cardCat === category) {
                        card.style.display = 'block';
                        // Add fade-in animation
                        card.classList.add('fade-in');
                    } else {
                        card.style.display = 'none';
                        card.classList.remove('fade-in');
                    }
                });
            });
        });
    }

    // 3. Contact Form Submission Validation and Feedback
    const contactForm = document.getElementById('agencyContactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Basic form fields retrieval
            const name = contactForm.querySelector('input[type="text"]').value.trim();
            const email = contactForm.querySelector('input[type="email"]').value.trim();
            const message = contactForm.querySelector('textarea').value.trim();
            
            if (!name || !email || !message) {
                showToast('Please fill out all required fields.', 'error');
                return;
            }

            // Mock success feedback
            showToast('Message sent successfully! Our dedicated team will reach out shortly.', 'success');
            contactForm.reset();
        });
    }

    // 4. Newsletter Subscription Form Handling
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            if (emailInput && emailInput.value.trim()) {
                showToast('Thank you for subscribing to our SEO newsletter!', 'success');
                emailInput.value = '';
            } else {
                showToast('Please enter a valid email address.', 'error');
            }
        });
    }

    // Toast Notification Creator
    function showToast(message, type = 'success') {
        // Remove existing toast if any
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.style.position = 'fixed';
        toast.style.bottom = '24px';
        toast.style.right = '24px';
        toast.style.padding = '16px 24px';
        toast.style.borderRadius = '8px';
        toast.style.zIndex = '1000';
        toast.style.fontWeight = '500';
        toast.style.fontSize = '14px';
        toast.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
        toast.style.transition = 'all 0.3s ease';
        
        if (type === 'success') {
            toast.style.background = '#1a1a1a';
            toast.style.color = '#6adab4';
            toast.style.borderLeft = '4px solid #6adab4';
        } else {
            toast.style.background = '#1a1a1a';
            toast.style.color = '#ffb4ab';
            toast.style.borderLeft = '4px solid #ffb4ab';
        }

        toast.innerText = message;
        document.body.appendChild(toast);

        // Auto remove toast
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 4000);
    }

    // 5. Dynamic blog posts loader — loads posts listed in posts/posts.json
    async function loadBlogPosts() {
        const track = document.getElementById('blogScrollTrack');
        if (!track) return;

        const emptyState = document.getElementById('blogEmptyState');
        if (emptyState) {
            emptyState.remove();
        }
        track.innerHTML = '<style>#blogScrollTrack::-webkit-scrollbar{display:none;}</style>';

        try {
            const res = await fetch('posts/posts.json', { cache: 'no-store' });
            if (!res.ok) {
                throw new Error('Failed to load posts index');
            }
            const posts = await res.json();
            if (!Array.isArray(posts) || posts.length === 0) {
                track.innerHTML = '<div class="glass-card card-inner p-6" style="min-width:340px; max-width:340px; flex-shrink:0;"><p class="text-muted" style="font-size: 14px; line-height:1.75; margin:0;">No blog posts were found in <code>posts/posts.json</code>. Add a new post entry there and the post will appear here.</p></div>';
                return;
            }

            posts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

            function escapeHtml(s) {
                return String(s)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
            }

            posts.forEach(post => {
                const card = document.createElement('div');
                card.className = 'glass-card card-inner p-6';
                card.style.minWidth = '340px';
                card.style.maxWidth = '340px';
                card.style.flexShrink = '0';

                card.innerHTML = `
                    <div class="overflow-hidden rounded-xl aspect-video" style="margin-bottom: 20px;">
                        <img style="width:100%;height:100%;object-fit:cover;" src="${post.image}" alt="${escapeHtml(post.title)}" />
                    </div>
                    <div class="flex justify-between items-center" style="margin-bottom: 14px;">
                        <span class="text-primary text-label-caps" style="font-size: 11px;">${escapeHtml(post.category || 'News')}</span>
                        <span class="text-muted" style="font-size: 12px;">${escapeHtml(post.readTime || '')}</span>
                    </div>
                    <h3 class="text-secondary" style="font-size: 18px; font-weight: 700; margin-bottom: 10px; line-height:1.4;">
                        <a href="${post.url}" style="color:inherit; text-decoration:none;">${escapeHtml(post.title)}</a>
                    </h3>
                    <p class="text-muted" style="font-size: 13px; line-height:1.6;">${escapeHtml(post.excerpt)}</p>
                `;

                track.appendChild(card);
            });
        } catch (err) {
            console.error('Error loading blog posts:', err);
            track.innerHTML = '<div class="glass-card card-inner p-6" style="min-width:340px; max-width:340px; flex-shrink:0;"><p class="text-muted" style="font-size: 14px; line-height:1.75; margin:0;">Could not load blog posts. Make sure <code>posts/posts.json</code> exists and the site is opened through HTTP.</p></div>';
        }
    }

    // call loader after DOM ready
    loadBlogPosts();
});
