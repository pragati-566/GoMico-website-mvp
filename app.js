/* ============================================================
   GoMico — app.js
   All JavaScript extracted and organized for production.
   Includes: mobile menu, modals, form validation, AJAX
   submission, success modal, reveal animations, and
   Motion library hero effects.
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
const successModal = document.querySelector("#successModal");
const callbackForm = document.querySelector("#callbackForm");
const submitBtn = document.querySelector("#callbackSubmitBtn");
let lastFocusedElement = null;
let successAutoCloseTimer = null;
let successCountdownInterval = null;

/**
 * Opens a modal dialog.
 * @param {HTMLElement} modal - The modal element to open.
 */
function openModal(modal) {
  if (!modal) return;
  lastFocusedElement = document.activeElement;

  // Reset the form when opening callback modal
  if (modal === callbackModal) {
    clearFormErrors();
    resetSubmitButton();
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

  // Clear success modal timers
  if (modal === successModal) {
    clearTimeout(successAutoCloseTimer);
    clearInterval(successCountdownInterval);
  }

  // Only unlock scrolling if no modals are still open
  if (
    !document.querySelector(
      "#callbackModal.flex, #termsModal.flex, #successModal.flex"
    )
  ) {
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

// Success modal close button
document.querySelector("#successCloseBtn")?.addEventListener("click", () => {
  closeModal(successModal);
});

// Close on backdrop click
[callbackModal, termsModal, successModal].forEach((modal) => {
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal(modal);
  });
});

// Close on Escape key
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeModal(
    document.querySelector(
      "#successModal.flex, #callbackModal.flex, #termsModal.flex"
    )
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
  let firstErrorField = null;

  const nameField = callbackForm.querySelector('[name="name"]');
  const phoneField = callbackForm.querySelector('[name="phone"]');
  const reasonField = callbackForm.querySelector('[name="reason"]');

  // Name: required, min 2 characters, letters and spaces only
  const nameValue = nameField.value.trim();
  if (!nameValue || nameValue.length < 2 || !/^[A-Za-z\s]+$/.test(nameValue)) {
    showFieldError(nameField, "Please enter a valid name.");
    isValid = false;
    if (!firstErrorField) firstErrorField = nameField;
  }

  // Phone: required, exactly 10 digits
  const phoneDigits = phoneField.value.replace(/[^0-9]/g, "");
  if (phoneDigits.length !== 10) {
    showFieldError(
      phoneField,
      "Please enter a valid 10-digit phone number."
    );
    isValid = false;
    if (!firstErrorField) firstErrorField = phoneField;
  }

  // Reason: must be selected (not the disabled placeholder)
  if (!reasonField.value) {
    showFieldError(reasonField, "Please select a reason for callback.");
    isValid = false;
    if (!firstErrorField) firstErrorField = reasonField;
  }

  // Focus first invalid field
  if (firstErrorField) {
    firstErrorField.focus();
  }

  return isValid;
}

// ──────────────────────────────────────────────────────
// 5b. PHONE INPUT — allow only numeric input
// ──────────────────────────────────────────────────────

const phoneInput = document.querySelector("#callbackPhone");

// Block non-numeric keys at keydown level (allows Backspace, Delete, Tab, arrows, etc.)
phoneInput?.addEventListener("keydown", (e) => {
  const allowedKeys = [
    "Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight",
    "ArrowUp", "ArrowDown", "Home", "End"
  ];
  // Allow control combos (Ctrl+A, Ctrl+C, Ctrl+V, etc.)
  if (e.ctrlKey || e.metaKey || allowedKeys.includes(e.key)) return;
  // Block if not a digit
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
    return;
  }
  // Block if already 10 digits and nothing is selected
  const selectionLength = phoneInput.selectionEnd - phoneInput.selectionStart;
  if (phoneInput.value.length >= 10 && selectionLength === 0) {
    e.preventDefault();
  }
});

// Sanitize on input (catches paste, autofill, etc.) and enforce 10-digit cap
phoneInput?.addEventListener("input", () => {
  let sanitized = phoneInput.value.replace(/[^0-9]/g, "");
  if (sanitized.length > 10) {
    sanitized = sanitized.slice(0, 10);
  }
  phoneInput.value = sanitized;
});

// ──────────────────────────────────────────────────────
// 6. FORM SUBMISSION (AJAX via FormSubmit.co)
//    No redirects — success modal shown on same page.
// ──────────────────────────────────────────────────────

/** Tracks whether a submission is in progress */
let isSubmitting = false;

/**
 * Resets the submit button to its default state.
 */
function resetSubmitButton() {
  if (!submitBtn) return;
  submitBtn.disabled = false;
  submitBtn.classList.remove("btn-loading");
  submitBtn.textContent = "Submit request";
}

/**
 * Sets the submit button to a loading/disabled state.
 */
function setSubmitLoading() {
  if (!submitBtn) return;
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting…";
  submitBtn.classList.add("btn-loading");
}

/**
 * Opens the success modal with auto-close countdown.
 */
function showSuccessModal() {
  // Close the callback modal first
  closeModal(callbackModal);

  // Open the success modal
  openModal(successModal);

  // Start countdown
  let countdown = 5;
  const countdownEl = document.querySelector("#successCountdown");
  if (countdownEl) countdownEl.textContent = countdown;

  successCountdownInterval = setInterval(() => {
    countdown--;
    if (countdownEl) countdownEl.textContent = countdown;
    if (countdown <= 0) {
      clearInterval(successCountdownInterval);
    }
  }, 1000);

  // Auto-close after 5 seconds
  successAutoCloseTimer = setTimeout(() => {
    clearInterval(successCountdownInterval);
    closeModal(successModal);
  }, 5000);
}

callbackForm?.addEventListener("submit", async (event) => {
  event.preventDefault(); // Always prevent default — we handle everything via AJAX

  // Prevent multiple submissions
  if (isSubmitting) return;

  // Run client-side validation
  if (!validateCallbackForm()) {
    return;
  }

  isSubmitting = true;
  setSubmitLoading();

  // Gather form data
  const formData = new FormData(callbackForm);

  try {
    const response = await fetch(
      "https://formsubmit.co/ajax/gomico.official@gmail.com",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          phone: formData.get("phone"),
          reason: formData.get("reason"),
          _subject: "New Callback Request from GoMico Website",
          _captcha: "false",
          _template: "table",
        }),
      }
    );

    if (response.ok) {
      // Success: reset form, show success modal
      callbackForm.reset();
      resetSubmitButton();
      showSuccessModal();
    } else {
      throw new Error("Server returned an error");
    }
  } catch (error) {
    // Network or server error
    resetSubmitButton();
    showToast(
      "error",
      "Something went wrong. Please try again or contact us via WhatsApp."
    );
  } finally {
    isSubmitting = false;
  }
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
