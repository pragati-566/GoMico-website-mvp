/* ============================================================
   GoMico — app.js
   All JavaScript extracted and organized for production.
   Includes: mobile menu, modals, form validation, reveal
   animations, and Motion library hero effects.
   Form submission is handled by pure HTML FormSubmit action.
   ============================================================ */

// ──────────────────────────────────────────────────────
// 2. MOBILE MENU (hamburger toggle)
// ──────────────────────────────────────────────────────

const menuBtn = document.querySelector("#menuBtn");
const mobileMenu = document.querySelector("#mobileMenu");

// Toggle the mobile nav open/closed
menuBtn?.addEventListener("click", () => {
  const isOpen = menuBtn.getAttribute("aria-expanded") === "true";
  menuBtn.setAttribute("aria-expanded", String(!isOpen));
  mobileMenu.classList.toggle("hidden");
});

// Close the menu when a nav link is tapped
document.querySelectorAll("#mobileMenu a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.add("hidden");
    menuBtn.setAttribute("aria-expanded", "false");
  });
});

// ──────────────────────────────────────────────────────
// 3. MODAL OPEN / CLOSE
// ──────────────────────────────────────────────────────

const callbackModal = document.querySelector("#callbackModal");
const termsModal = document.querySelector("#termsModal");
const callbackForm = document.querySelector("#callbackForm");
const callbackStatus = document.querySelector("#callbackStatus");
let lastFocusedElement = null;

/**
 * Opens a modal dialog.
 * @param {HTMLElement} modal - The modal element to open.
 */
function openModal(modal) {
  if (!modal) return;
  lastFocusedElement = document.activeElement;

  // Reset the success message when opening callback modal
  if (modal === callbackModal) {
    callbackStatus?.classList.add("hidden");
    clearFormErrors();
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.classList.add("overflow-hidden");

  // Move focus into the modal
  const firstField = modal.querySelector(
    "input, select, textarea, button:not([data-close-modal])"
  );
  firstField?.focus();
}

/**
 * Closes a modal dialog.
 * @param {HTMLElement} modal - The modal element to close.
 */
function closeModal(modal) {
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");

  // Only unlock scrolling if no modals are still open
  if (!document.querySelector("#callbackModal.flex, #termsModal.flex")) {
    document.body.classList.remove("overflow-hidden");
  }

  // Restore focus to the element that opened the modal
  lastFocusedElement?.focus?.();
}

// Attach open triggers
document.querySelectorAll("[data-open-callback]").forEach((button) => {
  button.addEventListener("click", () => openModal(callbackModal));
});
document.querySelectorAll("[data-open-terms]").forEach((button) => {
  button.addEventListener("click", () => openModal(termsModal));
});

// Attach close triggers (× buttons)
document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () =>
    closeModal(button.closest("[role='dialog']"))
  );
});

// Close on backdrop click
[callbackModal, termsModal].forEach((modal) => {
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal(modal);
  });
});

// Close on Escape key
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeModal(
    document.querySelector("#callbackModal.flex, #termsModal.flex")
  );
});

// ──────────────────────────────────────────────────────
// 4. TOAST NOTIFICATIONS (success / error popups)
// ──────────────────────────────────────────────────────

/**
 * Shows a toast notification at the top-right of the screen.
 * @param {"success"|"error"} type - Toast type.
 * @param {string} message - Text to display.
 */
function showToast(type, message) {
  // Remove any existing toast first
  document.querySelector(".toast")?.remove();

  const icons = {
    success: `<svg class="toast__icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`,
    error: `<svg class="toast__icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,
  };

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.setAttribute("role", "alert");
  toast.innerHTML = `${icons[type]}<span>${message}</span>`;
  document.body.appendChild(toast);

  // Trigger show animation on next frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("show"));
  });

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 450);
  }, 5000);
}

// ──────────────────────────────────────────────────────
// 5. FORM VALIDATION
// ──────────────────────────────────────────────────────

/**
 * Clears all inline validation error messages from the form.
 */
function clearFormErrors() {
  document.querySelectorAll(".field-error").forEach((el) => {
    el.classList.remove("field-error");
  });
  document.querySelectorAll(".field-error-msg").forEach((el) => el.remove());
}

/**
 * Shows an inline error message below a form field.
 * @param {HTMLElement} field - The input element.
 * @param {string} message - Error message text.
 */
function showFieldError(field, message) {
  field.classList.add("field-error");
  const msg = document.createElement("p");
  msg.className = "field-error-msg";
  msg.textContent = message;
  field.parentElement.appendChild(msg);
}

/**
 * Validates the callback form fields.
 * @returns {boolean} True if form is valid.
 */
function validateCallbackForm() {
  clearFormErrors();
  let isValid = true;

  const nameField = callbackForm.querySelector('[name="name"]');
  const phoneField = callbackForm.querySelector('[name="phone"]');

  // Name: must be at least 2 characters
  if (!nameField.value.trim() || nameField.value.trim().length < 2) {
    showFieldError(nameField, "Please enter your name (at least 2 characters).");
    isValid = false;
  }

  // Phone: must be 8+ digits
  const phoneDigits = phoneField.value.replace(/[^0-9]/g, "");
  if (phoneDigits.length < 8) {
    showFieldError(phoneField, "Please enter a valid phone number.");
    isValid = false;
  }

  return isValid;
}

// ──────────────────────────────────────────────────────
// 6. FORM SUBMISSION
//    Handled by pure HTML form action to FormSubmit.co.
//    Client-side validation runs before the browser submits.
// ──────────────────────────────────────────────────────

callbackForm?.addEventListener("submit", (event) => {
  // Run client-side validation; block submit if invalid
  if (!validateCallbackForm()) {
    event.preventDefault();
    return;
  }
  // If valid, the browser submits the form normally via the HTML action attribute
});

// ──────────────────────────────────────────────────────
// 7. SCROLL REVEAL ANIMATIONS
// ──────────────────────────────────────────────────────

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

/**
 * Sets up the IntersectionObserver for .reveal elements.
 * Elements fade in when they scroll into view.
 */
function initRevealObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        } else {
          entry.target.classList.remove("is-visible");
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.16 }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

// ──────────────────────────────────────────────────────
// 8. HERO ANIMATIONS (Motion library)
// ──────────────────────────────────────────────────────

if (prefersReducedMotion) {
  // Skip all animations if user prefers reduced motion
  document
    .querySelectorAll(".reveal")
    .forEach((el) => el.classList.add("is-visible"));
} else {
  initRevealObserver();

  // Dynamically import the Motion library for hero animations
  import("https://cdn.jsdelivr.net/npm/motion@11.11.13/+esm")
    .then(({ animate, scroll }) => {
      // Header fade-in
      animate(
        "header",
        { opacity: [0, 1], y: [-12, 0] },
        { duration: 0.65, easing: [0.22, 1, 0.36, 1] }
      );

      // Hero image slide-in
      animate(
        ".hero-visual img",
        { opacity: [0, 1], x: [48, 0], scale: [0.96, 1] },
        { duration: 1, delay: 0.18, easing: [0.22, 1, 0.36, 1] }
      );

      // Hero badge pop-in
      animate(
        ".hero-badge",
        { opacity: [0, 1], y: [18, 0], scale: [0.94, 1] },
        { duration: 0.72, delay: 0.48, easing: [0.22, 1, 0.36, 1] }
      );

      // Parallax scroll on hero image
      const heroVisual = document.querySelector(".hero-visual");
      if (heroVisual) {
        scroll(
          animate(".hero-visual img", { y: [0, 34] }, { easing: "linear" }),
          {
            target: heroVisual,
            offset: ["start start", "end start"],
          }
        );
      }
    })
    .catch(() => {
      // Graceful fallback: animations just won't play
    });
}
