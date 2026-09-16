/* ============================================================
   ANIRUDDH RAO — PORTFOLIO SCRIPT
   ------------------------------------------------------------
   1.  Layout switch   (vertical / horizontal)
   2.  Theme switch    (light / dark)
   3.  Colour switch   (10 accents)
   4.  Arrow-key nav   (horizontal mode)
   5.  Nav link smooth scroll
   6.  Contact form validation + submission
   ============================================================ */

(function () {
  'use strict';

  /* ------------------------------------------------------------
     DIAGNOSTIC — you should see this line in the F12 console
     ------------------------------------------------------------ */
  console.log('%c[Portfolio] script.js loaded ✓',
    'color:#0f0;font-weight:bold');


  /* ============================================================
     SMALL HELPERS
     ============================================================ */
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $$(sel, root) {
    return Array.prototype.slice.call(
      (root || document).querySelectorAll(sel)
    );
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }


  /* ============================================================
     BOOT
     ============================================================ */
  ready(function () {
    console.log('[Portfolio] DOM ready — binding controls…');

    try { initLayout(); console.log('[Portfolio] ✓ layout bound'); }
    catch (e) { console.error('[Portfolio] layout init failed:', e); }

    try { initTheme();  console.log('[Portfolio] ✓ theme bound'); }
    catch (e) { console.error('[Portfolio] theme init failed:', e); }

    try { initColor();  console.log('[Portfolio] ✓ colour bound'); }
    catch (e) { console.error('[Portfolio] colour init failed:', e); }

    try { initNav();    console.log('[Portfolio] ✓ nav bound'); }
    catch (e) { console.error('[Portfolio] nav init failed:', e); }

    try { initForm();   console.log('[Portfolio] ✓ form bound'); }
    catch (e) { console.error('[Portfolio] form init failed:', e); }

    console.log('%c[Portfolio] all systems ready ✓',
      'color:#0f0;font-weight:bold');
  });


  /* ============================================================
     1. LAYOUT  (vertical / horizontal)
     ============================================================ */
  function initLayout() {
    var html = document.documentElement;
    var page = $('#page');
    var hint = $('#scrollHint');

    // Restore saved layout
    var saved = readPref('layout', 'vertical');
    if (saved !== 'vertical' && saved !== 'horizontal') saved = 'vertical';
    applyLayout(saved, false);

    // Bind buttons
    $$('#layoutControl button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyLayout(btn.getAttribute('data-layout'), true);
      });
    });

    function applyLayout(layout, save) {
      if (layout !== 'vertical' && layout !== 'horizontal') return;

      html.setAttribute('data-layout', layout);

      // Active state
      $$('#layoutControl button').forEach(function (b) {
        b.classList.toggle(
          'active',
          b.getAttribute('data-layout') === layout
        );
      });

      // Hint text
      if (hint) {
        hint.textContent = layout === 'horizontal'
          ? 'Scroll sideways to explore'
          : 'Scroll down to explore';
      }

      // Reset scroll position
      if (page) {
        try { page.scrollTo({ left: 0, top: 0, behavior: 'auto' }); }
        catch (e) { page.scrollLeft = 0; page.scrollTop = 0; }
      }

      if (save) writePref('layout', layout);
      console.log('[Portfolio] layout →', layout);
    }
  }


  /* ============================================================
     2. THEME  (light / dark)
     ------------------------------------------------------------
     Reads `data-set-theme` from the buttons (falls back to
     `data-theme` if you haven't renamed them yet).
     ============================================================ */
  function initTheme() {
    var html = document.documentElement;

    function themeOf(btn) {
      return btn.getAttribute('data-set-theme')
          || btn.getAttribute('data-theme');
    }

    var saved = readPref('theme', 'dark');
    if (saved !== 'dark' && saved !== 'light') saved = 'dark';
    applyTheme(saved, false);

    $$('#themeControl button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyTheme(themeOf(btn), true);
      });
    });

    function applyTheme(theme, save) {
      if (theme !== 'dark' && theme !== 'light') return;

      html.setAttribute('data-theme', theme);

      $$('#themeControl button').forEach(function (b) {
        b.classList.toggle('active', themeOf(b) === theme);
      });

      if (save) writePref('theme', theme);
      console.log('[Portfolio] theme →', theme);
    }
  }


  /* ============================================================
     3. COLOUR  (10 accents)
     ============================================================ */
  function initColor() {
    var html = document.documentElement;
    var VALID = ['blue', 'purple', 'green', 'red', 'orange',
                 'yellow', 'pink', 'cyan', 'teal', 'indigo'];

    var saved = readPref('color', 'blue');
    if (VALID.indexOf(saved) === -1) saved = 'blue';
    applyColor(saved, false);

    $$('#colorControl button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyColor(btn.getAttribute('data-color'), true);
      });
    });

    function applyColor(color, save) {
      if (VALID.indexOf(color) === -1) return;

      html.setAttribute('data-color', color);

      $$('#colorControl button').forEach(function (b) {
        b.classList.toggle(
          'active',
          b.getAttribute('data-color') === color
        );
      });

      if (save) writePref('color', color);
      console.log('[Portfolio] colour →', color);
    }
  }


  /* ============================================================
     4. NAV LINKS + ARROW-KEY NAVIGATION
     ============================================================ */
  function initNav() {
    // Smooth scroll on any in-page link
    $$('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href');
        if (!href || href === '#') return;

        var target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        try {
          target.scrollIntoView({
            behavior: 'smooth', block: 'start', inline: 'start'
          });
        } catch (err) {
          target.scrollIntoView();
        }
      });
    });

    // Arrow keys in horizontal mode
    document.addEventListener('keydown', function (e) {
      var html = document.documentElement;
      if (html.getAttribute('data-layout') !== 'horizontal') return;

      // Don't hijack arrows inside form fields
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();

      var page = $('#page');
      var panels = $$('.panel');
      if (!page || !panels.length) return;

      var dir = e.key === 'ArrowRight' ? 1 : -1;
      var pr = page.getBoundingClientRect();
      var best = 0;
      var bestDist = Infinity;

      panels.forEach(function (p, i) {
        var r = p.getBoundingClientRect();
        var d = Math.abs(r.left - pr.left);
        if (d < bestDist) { bestDist = d; best = i; }
      });

      var next = Math.max(0, Math.min(panels.length - 1, best + dir));
      panels[next].scrollIntoView({
        behavior: 'smooth', block: 'start', inline: 'start'
      });
    });
  }


  /* ============================================================
     5. CONTACT FORM
     ============================================================ */
  function initForm() {
    var form = $('#contactForm');
    if (!form) return;

    var nameEl    = $('#name');
    var emailEl   = $('#email');
    var subjectEl = $('#subject');
    var messageEl = $('#message');

    var nameErr    = $('#nameError');
    var emailErr   = $('#emailError');
    var subjectErr = $('#subjectError');
    var messageErr = $('#messageError');

    var submitBtn = $('#submitBtn');
    var statusEl  = $('#formStatus');

    /* ---- Field-level error helpers ---- */
    function showErr(field, errEl, msg) {
      field.classList.add('invalid');
      errEl.textContent = msg;
    }

    function clearErr(field, errEl) {
      field.classList.remove('invalid');
      errEl.textContent = '';
    }

    function clearAll() {
      clearErr(nameEl, nameErr);
      clearErr(emailEl, emailErr);
      clearErr(subjectEl, subjectErr);
      clearErr(messageEl, messageErr);
      statusEl.textContent = '';
      statusEl.className = 'form-status';
    }

    function setStatus(msg, type) {
      statusEl.textContent = msg;
      statusEl.className = 'form-status ' + (type || '');
    }

    /* ---- Validators ---- */
    function validateName() {
      var v = nameEl.value.trim();
      if (!v)             { showErr(nameEl, nameErr, 'Please enter your name.'); return false; }
      if (v.length < 2)   { showErr(nameEl, nameErr, 'Name is too short.');     return false; }
      if (v.length > 80)  { showErr(nameEl, nameErr, 'Name is too long.');      return false; }
      clearErr(nameEl, nameErr); return true;
    }

    function validateEmail() {
      var v = emailEl.value.trim();
      if (!v) { showErr(emailEl, emailErr, 'Please enter your email.'); return false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        showErr(emailEl, emailErr, 'Please enter a valid email address.');
        return false;
      }
      clearErr(emailEl, emailErr); return true;
    }

    function validateSubject() {
      var v = subjectEl.value.trim();
      if (!v)             { showErr(subjectEl, subjectErr, 'Please enter a subject.');   return false; }
      if (v.length < 3)   { showErr(subjectEl, subjectErr, 'Subject is too short.');     return false; }
      if (v.length > 120) { showErr(subjectEl, subjectErr, 'Subject is too long.');      return false; }
      clearErr(subjectEl, subjectErr); return true;
    }

    function validateMessage() {
      var v = messageEl.value.trim();
      if (!v)             { showErr(messageEl, messageErr, 'Please write a message.');         return false; }
      if (v.length < 10)  { showErr(messageEl, messageErr, 'Message must be 10+ characters.'); return false; }
      if (v.length > 2000){ showErr(messageEl, messageErr, 'Message is too long.');            return false; }
      clearErr(messageEl, messageErr); return true;
    }

    /* ---- Clear error on typing ---- */
    [
      [nameEl,    nameErr],
      [emailEl,   emailErr],
      [subjectEl, subjectErr],
      [messageEl, messageErr]
    ].forEach(function (pair) {
      pair[0].addEventListener('input', function () {
        clearErr(pair[0], pair[1]);
        statusEl.textContent = '';
        statusEl.className = 'form-status';
      });
    });

    /* ---- Submit ---- */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearAll();

      var allOk = [
        validateName(),
        validateEmail(),
        validateSubject(),
        validateMessage()
      ].every(Boolean);

      if (!allOk) {
        setStatus('Please fix the highlighted fields.', 'error');
        var firstBad = form.querySelector('.invalid');
        if (firstBad) firstBad.focus();
        return;
      }

      var data = {
        name:    nameEl.value.trim(),
        email:   emailEl.value.trim(),
        subject: subjectEl.value.trim(),
        message: messageEl.value.trim()
      };

      submitBtn.disabled    = true;
      submitBtn.textContent = 'Sending…';
      setStatus('Sending your message…', '');

      /* Try the FormSubmit AJAX endpoint first */
      fetch('https://formsubmit.co/ajax/aniruddhrao012005@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept':       'application/json'
        },
        body: JSON.stringify({
          name:      data.name,
          email:     data.email,
          subject:   data.subject,
          message:   data.message,
          _subject:  '[Portfolio] ' + data.subject,
          _template: 'table',
          _captcha:  'false'
        })
      })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (json) {
        if (json.success === false || json.success === 'false') {
          throw new Error(json.message || 'Send failed');
        }
        console.log('[Portfolio] form sent ✓');
        setStatus('Thanks ' + data.name + '! Your message has been sent. ✓', 'success');
        form.reset();
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Send Message';
      })
      .catch(function (err) {
        console.warn('[Portfolio] AJAX failed, using native form POST:', err);

        /* Fallback: let the browser do a real POST to FormSubmit.
           form.submit() bypasses the submit event, so we don't loop. */
        setStatus('Opening secure send page…', '');
        HTMLFormElement.prototype.submit.call(form);

        /* If the fallback also didn't navigate (rare), restore the button */
        setTimeout(function () {
          submitBtn.disabled    = false;
          submitBtn.textContent = 'Send Message';
        }, 2000);
      });
    });
  }


  /* ============================================================
     PREFERENCE STORAGE
     ============================================================ */
  function readPref(key, fallback) {
    try {
      var prefs = JSON.parse(localStorage.getItem('portfolio-prefs') || '{}');
      return prefs[key] || fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writePref(key, value) {
    try {
      var prefs = JSON.parse(localStorage.getItem('portfolio-prefs') || '{}');
      prefs[key] = value;
      localStorage.setItem('portfolio-prefs', JSON.stringify(prefs));
    } catch (e) { /* storage disabled — ignore */ }
  }

})();