/**
 * Premium SEO Theme - Main JavaScript
 * Vanilla JavaScript (No jQuery) - Modular & Performance-Optimized
 */

(function() {
  'use strict';

  // ==================================
  // UTILITY FUNCTIONS
  // ==================================

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  const throttle = (func, limit = 300) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  /**
   * Safely parse and insert HTML to prevent XSS attacks
   * @param {string} html - HTML string to parse
   * @returns {DocumentFragment} - Safe DOM fragment
   */
  const safeParseHTML = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const fragment = document.createDocumentFragment();
    fragment.append(...doc.body.childNodes);
    return fragment;
  };

  /**
   * Format money/currency consistently across the theme
   * @param {number} cents - Amount in cents
   * @param {string} format - Optional custom format
   * @returns {string} - Formatted currency string
   */
  const formatMoney = (cents, format) => {
    // Use Shopify's built-in formatter if available
    if (typeof Shopify !== 'undefined' && Shopify.formatMoney) {
      return Shopify.formatMoney(cents, format || window.theme?.moneyFormat);
    }

    // Fallback to Intl.NumberFormat
    const formatter = new Intl.NumberFormat(
      window.theme?.locale || document.documentElement.lang || 'en',
      {
        style: 'currency',
        currency: window.Shopify?.currency?.active || window.theme?.currency || 'EUR'
      }
    );
    return formatter.format(cents / 100);
  };

  /**
   * Create a focus trap for modals and drawers
   * @param {HTMLElement} container - The container element
   * @returns {Object} - Object with activate/deactivate methods
   */
  const createFocusTrap = (container) => {
    const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    let previousActiveElement = null;

    const handleKeydown = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = container.querySelectorAll(focusableSelector);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    return {
      activate() {
        previousActiveElement = document.activeElement;
        container.addEventListener('keydown', handleKeydown);
        // Focus first focusable element
        const firstFocusable = container.querySelector(focusableSelector);
        if (firstFocusable) setTimeout(() => firstFocusable.focus(), 100);
      },
      deactivate() {
        container.removeEventListener('keydown', handleKeydown);
        if (previousActiveElement) previousActiveElement.focus();
      }
    };
  };

  /**
   * Validate and sanitize numeric input
   * @param {string|number} value - Value to validate
   * @param {number} min - Minimum allowed value
   * @param {number} max - Maximum allowed value
   * @returns {number|null} - Validated number or null
   */
  const validateNumber = (value, min = 0, max = 999) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < min || num > max) {
      return null;
    }
    return num;
  };

  // ==================================
  // CART MODULE (Ajax Cart)
  // ==================================

  const Cart = {
    init() {
      this.bindEvents();
      this.updateCartCount();
    },

    bindEvents() {
      // Add to cart buttons
      $$('[data-add-to-cart]').forEach(btn => {
        btn.addEventListener('click', (e) => this.addToCart(e));
      });

      // Upsell add buttons (event delegation for dynamically loaded content)
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-upsell-add]');
        if (btn) {
          e.preventDefault();
          this.addUpsellToCart(btn);
        }
      });

      // Cart drawer toggle - use querySelectorAll to get all toggle buttons
      const cartToggles = $$('[data-cart-toggle]');
      cartToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleDrawer();
        });
      });

      // Close cart drawer
      $$('[data-cart-close]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.closeDrawer();
        });
      });

      // Close drawer when clicking overlay
      const overlay = $('.overlay');
      if (overlay) {
        overlay.addEventListener('click', () => this.closeDrawer());
      }

      // Update quantity
      $$('[data-cart-quantity]').forEach(input => {
        input.addEventListener('change', (e) => this.updateQuantity(e));
      });

      // Quantity minus buttons
      $$('[data-cart-quantity-minus]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const line = e.currentTarget.dataset.line;
          const input = document.querySelector(`[data-cart-quantity][data-line="${line}"]`);
          if (input) {
            const currentQty = parseInt(input.value) || 1;
            const newQty = currentQty > 1 ? currentQty - 1 : 0;
            // Simulate event for updateQuantity
            this.updateQuantity({
              currentTarget: {
                value: newQty,
                dataset: { line }
              }
            });
          }
        });
      });

      // Quantity plus buttons
      $$('[data-cart-quantity-plus]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const line = e.currentTarget.dataset.line;
          const input = document.querySelector(`[data-cart-quantity][data-line="${line}"]`);
          if (input) {
            const currentQty = parseInt(input.value) || 1;
            // Simulate event for updateQuantity
            this.updateQuantity({
              currentTarget: {
                value: currentQty + 1,
                dataset: { line }
              }
            });
          }
        });
      });

      // Remove item
      $$('[data-cart-remove]').forEach(btn => {
        btn.addEventListener('click', (e) => this.removeItem(e));
      });
    },

    async addToCart(e) {
      e.preventDefault();
      const btn = e.currentTarget;
      const form = btn.closest('form');
      const formData = new FormData(form);

      btn.classList.add('loading');
      btn.disabled = true;

      try {
        const response = await fetch(window.theme.routes.cart_add_url, {
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          },
          body: formData
        });

        if (!response.ok) {
          // Try to parse error message from JSON response
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.message || errorData.description || 'Failed to add to cart');
          }
          throw new Error('Failed to add to cart');
        }

        const data = await response.json();
        this.updateCartCount();
        this.showNotification(window.theme.strings.add_to_cart);
        this.openDrawer();
        await this.refreshDrawer();
      } catch (error) {
        console.error('Cart Error:', error);
        const errorMessage = error.message || window.theme.strings.cart_error || 'Error adding to cart';
        this.showNotification(errorMessage, 'error');
      } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
      }
    },

    async addUpsellToCart(btn) {
      const variantId = btn.dataset.variantId;
      if (!variantId || btn.classList.contains('added') || btn.classList.contains('loading')) return;

      btn.classList.add('loading');
      btn.disabled = true;

      try {
        const response = await fetch((window.Shopify?.routes?.root || '/') + 'cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            items: [{
              id: parseInt(variantId),
              quantity: 1
            }]
          })
        });

        if (!response.ok) throw new Error('Failed to add product');

        btn.classList.remove('loading');
        btn.classList.add('added');
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

        this.updateCartCount();
        await this.refreshDrawer();

      } catch (error) {
        console.error('Upsell add error:', error);
        btn.classList.remove('loading');
        btn.disabled = false;
      }
    },

    async updateQuantity(e) {
      const input = e.currentTarget;
      const line = validateNumber(input.dataset.line, 1, 999);
      const quantity = validateNumber(input.value, 0, 999);

      // Validate inputs
      if (line === null) {
        console.error('Invalid line number');
        this.showNotification('Invalid cart item', 'error');
        return;
      }

      if (quantity === null) {
        console.error('Invalid quantity');
        this.showNotification('Invalid quantity. Please enter a number between 0 and 999', 'error');
        input.value = 1; // Reset to safe default
        return;
      }

      try {
        const response = await fetch(window.theme.routes.cart_change_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ line, quantity })
        });

        if (!response.ok) {
          // Try to parse error message from JSON response
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.description || 'Failed to update cart');
          }
          throw new Error('Failed to update cart');
        }

        await this.refreshDrawer();
        this.updateCartCount();
      } catch (error) {
        console.error('Cart Update Error:', error);
        const errorMessage = error.message || window.theme.strings.cart_error || 'Error updating cart';
        this.showNotification(errorMessage, 'error');
      }
    },

    async removeItem(e) {
      e.preventDefault();
      const btn = e.currentTarget;
      const line = btn.dataset.line;

      try {
        await this.updateQuantity({ currentTarget: { value: 0, dataset: { line } } });
      } catch (error) {
        console.error('Cart Remove Error:', error);
      }
    },

    async refreshDrawer() {
      try {
        // Fetch the cart drawer HTML
        const response = await fetch('/cart?view=drawer');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();
        const drawer = $('.cart-drawer');
        const drawerBody = drawer ? drawer.querySelector('.drawer__body') : null;

        if (drawerBody) {
          // Save scroll position to prevent jump
          const scrollPos = drawerBody.scrollTop;

          // Parse the HTML and extract ONLY the cart-drawer-content
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;

          // Find the specific cart drawer content element (not header/footer)
          const cartContent = tempDiv.querySelector('[data-cart-drawer-content]');

          // Also handle empty cart case
          const emptyCart = tempDiv.querySelector('.cart-empty');

          // Clear and replace drawer body content
          drawerBody.innerHTML = '';

          if (cartContent) {
            drawerBody.appendChild(cartContent.cloneNode(true));
          } else if (emptyCart) {
            drawerBody.appendChild(emptyCart.cloneNode(true));
          }

          // Restore scroll position
          requestAnimationFrame(() => {
            drawerBody.scrollTop = scrollPos;
          });

          this.bindEvents(); // Re-bind events
          this.updateCartCount(); // Update cart count in header
        }
      } catch (error) {
        console.error('Cart Refresh Error:', error);
        this.showNotification(window.theme.strings.cart_error || 'Error updating cart', 'error');
      }
    },

    async updateCartCount() {
      try {
        const response = await fetch('/cart.js');
        const cart = await response.json();
        const count = cart.item_count;

        $$('[data-cart-count]').forEach(el => {
          el.textContent = count;
          el.style.display = count > 0 ? 'flex' : 'none';
        });
      } catch (error) {
        console.error('Cart Count Error:', error);
      }
    },

    toggleDrawer() {
      const drawer = $('[data-cart-drawer]');
      const overlay = $('.overlay');
      if (drawer && overlay) {
        const isActive = drawer.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = isActive ? 'hidden' : '';
      } else {
        console.error('Cart drawer or overlay not found', { drawer, overlay });
      }
    },

    openDrawer() {
      const drawer = $('[data-cart-drawer]');
      const overlay = $('.overlay');
      if (drawer && overlay) {
        drawer.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    },

    closeDrawer() {
      const drawer = $('[data-cart-drawer]');
      const overlay = $('.overlay');
      if (drawer && overlay) {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    },

    showNotification(message, type = 'success') {
      // Create notification element
      const notification = document.createElement('div');
      notification.className = `notification notification--${type}`;
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: ${type === 'error' ? 'var(--color-error)' : 'var(--color-success)'};
        color: white;
        border-radius: var(--radius-md);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
      `;

      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }
  };

  // ==================================
  // MOBILE NAVIGATION
  // ==================================

  const MobileNav = {
    init() {
      this.mobileMenuToggles = $$('[data-mobile-menu-toggle]');
      this.mobileMenu = $('[data-mobile-menu]');
      this.overlay = $('.overlay');

      if (this.mobileMenuToggles.length > 0) {
        this.mobileMenuToggles.forEach(toggle => {
          toggle.addEventListener('click', () => this.toggleMenu());
        });
      }

      // Handle dropdown toggles on mobile
      this.initDropdowns();

      // Close menu when clicking overlay (menu has higher z-index so won't be affected)
      if (this.overlay) {
        this.overlay.addEventListener('click', () => this.closeAll());
      }
    },

    initDropdowns() {
      // Only on mobile: prevent navigation and toggle dropdown when clicking on parent links with children
      const dropdownItems = $$('.nav-item.has-dropdown');

      dropdownItems.forEach(navItem => {
        const link = navItem.querySelector('.nav-link');

        if (link) {
          link.addEventListener('click', (e) => {
            // Only prevent navigation and toggle on mobile (screen width < 768px)
            if (window.innerWidth < 768) {
              e.preventDefault();
              e.stopPropagation();
              navItem.classList.toggle('expanded');
            }
            // On desktop, let the link work normally
          });
        }
      });
    },

    toggleMenu() {
      this.mobileMenu?.classList.toggle('active');
      this.overlay?.classList.toggle('active');
      document.body.style.overflow = this.mobileMenu?.classList.contains('active') ? 'hidden' : '';
    },

    closeAll() {
      this.mobileMenu?.classList.remove('active');
      $('.cart-drawer')?.classList.remove('active');
      this.overlay?.classList.remove('active');
      document.body.style.overflow = '';
      // Close all expanded dropdowns
      $$('.nav-item.expanded').forEach(item => item.classList.remove('expanded'));
    }
  };

  // ==================================
  // SEARCH (Predictive)
  // ==================================

  const Search = {
    init() {
      this.searchInput = $('[data-search-input]');
      this.searchResults = $('[data-search-results]');

      if (this.searchInput) {
        this.searchInput.addEventListener('input', debounce((e) => this.performSearch(e.target.value), 300));
      }
    },

    async performSearch(query) {
      if (query.length < 2) {
        this.hideResults();
        return;
      }

      try {
        const response = await fetch(`${window.theme.routes.predictive_search_url}?q=${encodeURIComponent(query)}&resources[type]=product,article&resources[limit]=5`);
        const data = await response.json();
        this.displayResults(data);
      } catch (error) {
        console.error('Search Error:', error);
      }
    },

    displayResults(data) {
      if (!this.searchResults) return;

      // Clear previous results safely
      this.searchResults.replaceChildren();

      if (data.resources.results.products?.length > 0) {
        // Create search section container
        const section = document.createElement('div');
        section.className = 'search-section';

        const heading = document.createElement('h3');
        heading.textContent = 'Products';
        section.appendChild(heading);

        const list = document.createElement('ul');

        data.resources.results.products.forEach(product => {
          const li = document.createElement('li');
          li.className = 'search-item';

          const link = document.createElement('a');
          link.href = product.url;

          // Add product image if available
          if (product.featured_image) {
            const img = document.createElement('img');
            img.src = product.featured_image.url;
            img.alt = product.title || '';
            img.width = 50;
            link.appendChild(img);
          }

          // Add product title
          const titleSpan = document.createElement('span');
          titleSpan.textContent = product.title;
          link.appendChild(titleSpan);

          // Add product price
          const priceSpan = document.createElement('span');
          priceSpan.className = 'price';
          priceSpan.textContent = product.price;
          link.appendChild(priceSpan);

          li.appendChild(link);
          list.appendChild(li);
        });

        section.appendChild(list);
        this.searchResults.appendChild(section);
      } else {
        // No results found
        const noResults = document.createElement('p');
        noResults.textContent = 'No results found';
        this.searchResults.appendChild(noResults);
      }

      this.searchResults.style.display = 'block';
    },

    hideResults() {
      if (this.searchResults) {
        this.searchResults.style.display = 'none';
      }
    }
  };

  // ==================================
  // STICKY HEADER
  // ==================================

  const StickyHeader = {
    init() {
      this.header = $('[data-sticky-header]');
      if (!this.header) return;

      this.headerHeight = this.header.offsetHeight;
      this.scrollThreshold = 100;
      this.lastScroll = 0;

      window.addEventListener('scroll', throttle(() => this.handleScroll(), 100));
    },

    handleScroll() {
      const currentScroll = window.pageYOffset;

      if (currentScroll > this.scrollThreshold) {
        this.header.classList.add('sticky');

        // Hide on scroll down, show on scroll up
        if (currentScroll > this.lastScroll) {
          this.header.classList.add('hidden');
        } else {
          this.header.classList.remove('hidden');
        }
      } else {
        this.header.classList.remove('sticky', 'hidden');
      }

      this.lastScroll = currentScroll;
    }
  };

  // ==================================
  // BACK TO TOP BUTTON
  // ==================================

  const BackToTop = {
    init() {
      this.btn = $('#back-to-top');
      if (!this.btn) return;

      window.addEventListener('scroll', throttle(() => this.handleScroll(), 100));
      this.btn.addEventListener('click', () => this.scrollToTop());
    },

    handleScroll() {
      if (window.pageYOffset > 300) {
        this.btn.style.display = 'flex';
      } else {
        this.btn.style.display = 'none';
      }
    },

    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // ==================================
  // PRODUCT VARIANTS
  // ==================================

  const ProductVariants = {
    init() {
      this.variantSelects = $$('[data-variant-select]');

      this.variantSelects.forEach(select => {
        select.addEventListener('change', (e) => this.handleVariantChange(e));
      });
    },

    handleVariantChange(e) {
      const select = e.currentTarget;
      const form = select.closest('form');
      const selectedOptions = [...form.querySelectorAll('[data-variant-select]')].map(s => s.value);

      // Find matching variant
      const variants = JSON.parse($('[data-product-variants]', form)?.textContent || '[]');
      const matchedVariant = variants.find(variant => {
        return variant.options.every((option, index) => option === selectedOptions[index]);
      });

      if (matchedVariant) {
        this.updateVariantInfo(form, matchedVariant);
      }
    },

    updateVariantInfo(form, variant) {
      // Update price
      const priceEl = $('[data-product-price]', form);
      if (priceEl && variant.price) {
        priceEl.textContent = this.formatMoney(variant.price);
      }

      // Update compare at price
      const compareEl = $('[data-product-compare-price]', form);
      if (compareEl) {
        if (variant.compare_at_price > variant.price) {
          compareEl.textContent = this.formatMoney(variant.compare_at_price);
          compareEl.style.display = 'inline';
        } else {
          compareEl.style.display = 'none';
        }
      }

      // Update availability
      const availabilityEl = $('[data-product-availability]', form);
      const submitBtn = $('[data-add-to-cart]', form);

      if (variant.available) {
        if (availabilityEl) availabilityEl.textContent = window.theme.strings.in_stock || 'In Stock';
        if (submitBtn) {
          submitBtn.removeAttribute('disabled');
          submitBtn.textContent = window.theme.strings.add_to_cart || 'Add to Cart';
        }
      } else {
        if (availabilityEl) availabilityEl.textContent = window.theme.strings.sold_out || 'Sold Out';
        if (submitBtn) {
          submitBtn.setAttribute('disabled', 'disabled');
          submitBtn.textContent = window.theme.strings.sold_out || 'Sold Out';
        }
      }

      // Update variant ID input
      const variantIdInput = $('[name="id"]', form);
      if (variantIdInput) {
        variantIdInput.value = variant.id;
      }

      // Update featured image
      if (variant.featured_image) {
        const mainImage = $('[data-product-main-image]');
        if (mainImage) {
          mainImage.src = variant.featured_image.src;
          mainImage.alt = variant.featured_image.alt || variant.name;
        }
      }
    },

    formatMoney(cents) {
      return (cents / 100).toLocaleString(window.theme.locale || 'en', {
        style: 'currency',
        currency: window.theme.currency || 'USD'
      });
    }
  };

  // ==================================
  // LAZY LOADING IMAGES
  // ==================================

  const LazyLoad = {
    init() {
      const images = $$('img[loading="lazy"]');

      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src || img.src;
              imageObserver.unobserve(img);
            }
          });
        });

        images.forEach(img => imageObserver.observe(img));
      }
    }
  };

  // ==================================
  // ACCORDION (FAQ, Product Tabs)
  // ==================================

  const Accordion = {
    init() {
      $$('[data-accordion-trigger]').forEach(trigger => {
        trigger.addEventListener('click', () => this.toggle(trigger));
      });
    },

    toggle(trigger) {
      const content = trigger.nextElementSibling;
      const isOpen = trigger.classList.contains('active');

      // Close all in same group
      const group = trigger.closest('[data-accordion-group]');
      if (group) {
        $$('[data-accordion-trigger]', group).forEach(t => {
          t.classList.remove('active');
          t.nextElementSibling.style.maxHeight = null;
        });
      }

      if (!isOpen) {
        trigger.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    }
  };

  // ==================================
  // WISHLIST (LocalStorage)
  // ==================================
  // NOTE: Wishlist functionality is now handled by snippets/wishlist.liquid
  // which provides a more complete implementation with modal UI, toast notifications,
  // and full product data storage. This code is kept here commented for reference.

  /*
  const Wishlist = {
    init() {
      this.wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      this.bindEvents();
      this.updateUI();
    },

    bindEvents() {
      $$('[data-wishlist-toggle]').forEach(btn => {
        btn.addEventListener('click', (e) => this.toggle(e));
      });
    },

    toggle(e) {
      e.preventDefault();
      const btn = e.currentTarget;
      const productId = btn.dataset.productId;

      if (this.wishlist.includes(productId)) {
        this.remove(productId);
      } else {
        this.add(productId);
      }

      this.updateUI();
    },

    add(productId) {
      if (!this.wishlist.includes(productId)) {
        this.wishlist.push(productId);
        this.save();
      }
    },

    remove(productId) {
      this.wishlist = this.wishlist.filter(id => id !== productId);
      this.save();
    },

    save() {
      localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
    },

    updateUI() {
      $$('[data-wishlist-toggle]').forEach(btn => {
        const productId = btn.dataset.productId;
        if (this.wishlist.includes(productId)) {
          btn.classList.add('active');
          btn.setAttribute('aria-label', 'Remove from wishlist');
        } else {
          btn.classList.remove('active');
          btn.setAttribute('aria-label', 'Add to wishlist');
        }
      });

      // Update wishlist count
      $$('[data-wishlist-count]').forEach(el => {
        el.textContent = this.wishlist.length;
      });
    }
  };
  */

  // ==================================
  // RECENTLY VIEWED (LocalStorage)
  // ==================================

  const RecentlyViewed = {
    init() {
      this.maxItems = 10;
      this.recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');

      // Track current product
      const productId = $('[data-product-id]')?.dataset.productId;
      if (productId) {
        this.add(productId);
      }
    },

    add(productId) {
      // Remove if already exists
      this.recentlyViewed = this.recentlyViewed.filter(id => id !== productId);

      // Add to beginning
      this.recentlyViewed.unshift(productId);

      // Limit to max items
      if (this.recentlyViewed.length > this.maxItems) {
        this.recentlyViewed = this.recentlyViewed.slice(0, this.maxItems);
      }

      localStorage.setItem('recentlyViewed', JSON.stringify(this.recentlyViewed));
    }
  };

  // ==================================
  // LANGUAGE SELECTOR
  // ==================================

  const LanguageSelector = {
    init() {
      const toggle = $('[data-language-toggle]');
      const selector = $('.language-selector');

      if (!toggle || !selector) return;

      // Toggle dropdown
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        selector.classList.toggle('active');
      });

      // Handle language selection
      const options = $$('.language-selector__option');
      options.forEach(option => {
        option.addEventListener('click', (e) => {
          e.preventDefault();
          const langCode = option.dataset.language;
          const langName = option.dataset.languageName;

          // Create form to submit language change
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = '/localization';

          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'locale_code';
          input.value = langCode;

          const redirectInput = document.createElement('input');
          redirectInput.type = 'hidden';
          redirectInput.name = 'return_to';
          redirectInput.value = window.location.pathname;

          form.appendChild(input);
          form.appendChild(redirectInput);
          document.body.appendChild(form);
          form.submit();
        });
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!selector.contains(e.target)) {
          selector.classList.remove('active');
        }
      });

      // Close on escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && selector.classList.contains('active')) {
          selector.classList.remove('active');
        }
      });
    }
  };

  // ==================================
  // EXPOSE UTILITIES GLOBALLY
  // ==================================

  // Make utilities available to snippets and external scripts
  window.theme = window.theme || {};
  window.theme.utils = {
    formatMoney,
    createFocusTrap,
    safeParseHTML,
    debounce,
    throttle,
    validateNumber
  };

  // Expose Cart globally for external scripts (upsells, etc.)
  window.Cart = Cart;

  // ==================================
  // INITIALIZATION
  // ==================================

  document.addEventListener('DOMContentLoaded', () => {
    Cart.init();
    MobileNav.init();
    Search.init();
    LanguageSelector.init();
    StickyHeader.init();
    BackToTop.init();
    ProductVariants.init();
    LazyLoad.init();
    Accordion.init();
    // Product Gallery Zoom is handled by snippets/product-gallery.liquid
    // Wishlist.init(); // Now handled by snippets/wishlist.liquid
    RecentlyViewed.init();
  });

})();
