/* Ammara Girls Academy — public website.
   Supabase: same project as the academy app. The anon key below is the
   PUBLIC anon key (same one the app uses) — it can only do what RLS allows.
   No service_role key, no passwords anywhere in this file. */

var SUPABASE_URL = "https://pugauvspwwqlxampopgj.supabase.co";
var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1Z2F1dnNwd3dxbHhhbXBvcGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU2OTE3NjYsImV4cCI6MjExMTI2Nzc2Nn0.CN1XTww0-nAoXt-Lg9QsTYmyWTpuc2w_vQU98mmjwQ0";

function sbHeaders(extra) {
  var h = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": "Bearer " + SUPABASE_ANON_KEY,
    "Content-Type": "application/json"
  };
  if (extra) {
    Object.keys(extra).forEach(function (k) { h[k] = extra[k]; });
  }
  return h;
}

function $(id) { return document.getElementById(id); }

function escHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function setErr(inputId, errId, msg) {
  var input = $(inputId);
  var err = $(errId);
  if (input) input.classList.toggle("invalid", !!msg);
  if (err) err.textContent = msg || "";
}

function phoneOk(v) {
  var digits = (v || "").replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

/* ---------- Mobile nav ---------- */
(function () {
  var toggle = $("nav-toggle");
  var nav = $("main-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
})();


/* ---------- Modals: Status Check + Admin Login (opened from the menu) ---------- */
(function () {
  var nav = $("main-nav");
  var toggle = $("nav-toggle");
  function closeNav() {
    if (nav) nav.classList.remove("open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }
  function openModal(id) {
    var m = $(id);
    if (!m) return;
    closeNav();
    m.classList.add("open");
    document.body.classList.add("modal-open");
  }
  function closeModal(m) {
    m.classList.remove("open");
    if (!document.querySelector(".modal.open")) document.body.classList.remove("modal-open");
  }
  document.querySelectorAll("[data-modal]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      openModal(el.getAttribute("data-modal"));
    });
  });
  document.querySelectorAll(".modal").forEach(function (m) {
    m.addEventListener("click", function (e) {
      if (e.target === m) closeModal(m);
    });
    m.querySelectorAll("[data-close-modal]").forEach(function (btn) {
      btn.addEventListener("click", function () { closeModal(m); });
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal.open").forEach(function (m) { closeModal(m); });
    }
  });
})();

/* ---------- Notices (live from Supabase) ---------- */
(function loadNotices() {
  var list = $("notices-list");
  if (!list) return;
  fetch(SUPABASE_URL + "/rest/v1/notices?select=id,title,body,date&order=date.desc&limit=6", {
    headers: sbHeaders()
  })
    .then(function (res) {
      if (!res.ok) throw new Error("notices fetch failed: " + res.status);
      return res.json();
    })
    .then(function (rows) {
      list.innerHTML = "";
      if (!rows || rows.length === 0) {
        var empty = document.createElement("p");
        empty.className = "notices-state";
        empty.textContent = "No notices yet — check back soon.";
        list.appendChild(empty);
        return;
      }
      rows.forEach(function (n) {
        var card = document.createElement("article");
        card.className = "notice-card";
        var d = document.createElement("div");
        d.className = "notice-date";
        var dt = n.date ? new Date(n.date + "T00:00:00") : null;
        d.textContent = dt && !isNaN(dt.getTime())
          ? dt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
          : (n.date || "");
        var h = document.createElement("h3");
        h.textContent = n.title || "";
        var b = document.createElement("p");
        b.textContent = n.body || "";
        card.appendChild(d);
        card.appendChild(h);
        card.appendChild(b);
        list.appendChild(card);
      });
    })
    .catch(function () {
      list.innerHTML = "";
      var p = document.createElement("p");
      p.className = "notices-state";
      p.textContent = "No notices yet — check back soon.";
      list.appendChild(p);
    });
})();

/* ---------- Admission form ---------- */
(function () {
  var form = $("admission-form");
  if (!form) return;
  var submitBtn = $("admission-submit");
  var msg = $("admission-msg");
  var success = $("admission-success");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    msg.textContent = "";
    msg.className = "form-msg";

    var studentName = $("student-name").value.trim();
    var fatherName = $("father-name").value.trim();
    var dob = $("dob").value || null;
    var gender = $("gender").value;
    var classApplying = $("class-applying").value;
    var prevSchool = $("previous-school").value.trim() || null;
    var phone = $("guardian-phone").value.trim();
    var address = $("address").value.trim() || null;

    var ok = true;
    if (!studentName) { setErr("student-name", "err-student-name", "Please enter the student's name."); ok = false; }
    else setErr("student-name", "err-student-name", "");
    if (!fatherName) { setErr("father-name", "err-father-name", "Please enter the father / guardian name."); ok = false; }
    else setErr("father-name", "err-father-name", "");
    if (!classApplying) { setErr("class-applying", "err-class-applying", "Please choose a class."); ok = false; }
    else setErr("class-applying", "err-class-applying", "");
    if (!phone) { setErr("guardian-phone", "err-guardian-phone", "Please enter the guardian phone number."); ok = false; }
    else if (!phoneOk(phone)) { setErr("guardian-phone", "err-guardian-phone", "Please enter a valid phone number."); ok = false; }
    else setErr("guardian-phone", "err-guardian-phone", "");
    if (!ok) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";

    fetch(SUPABASE_URL + "/rest/v1/website_enquiries", {
      method: "POST",
      headers: sbHeaders({ "Prefer": "return=minimal" }),
      body: JSON.stringify({
        type: "admission",
        student_name: studentName,
        father_name: fatherName,
        dob: dob,
        gender: gender,
        class_applying: classApplying,
        previous_school: prevSchool,
        guardian_phone: phone,
        address: address,
        message: null,
        status: "pending"
      })
    })
      .then(function (res) {
        if (!res.ok) throw new Error("submit failed: " + res.status);
        form.classList.add("hidden");
        success.classList.remove("hidden");
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      })
      .catch(function () {
        msg.textContent = "Could not send the application — please try again, or visit the academy office in Sakhi Sarwar.";
        msg.classList.add("error");
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Application";
      });
  });

  $("admission-again").addEventListener("click", function () {
    form.reset();
    success.classList.add("hidden");
    form.classList.remove("hidden");
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Application";
  });
})();

/* ---------- Contact form ---------- */
(function () {
  var form = $("contact-form");
  if (!form) return;
  var submitBtn = $("contact-submit");
  var msg = $("contact-msg");
  var success = $("contact-success");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    msg.textContent = "";
    msg.className = "form-msg";

    var name = $("contact-name").value.trim();
    var phone = $("contact-phone").value.trim();
    var message = $("contact-message").value.trim();

    var ok = true;
    if (!name) { setErr("contact-name", "err-contact-name", "Please enter your name."); ok = false; }
    else setErr("contact-name", "err-contact-name", "");
    if (!phone) { setErr("contact-phone", "err-contact-phone", "Please enter your phone number."); ok = false; }
    else if (!phoneOk(phone)) { setErr("contact-phone", "err-contact-phone", "Please enter a valid phone number."); ok = false; }
    else setErr("contact-phone", "err-contact-phone", "");
    if (!message) { setErr("contact-message", "err-contact-message", "Please write a message."); ok = false; }
    else setErr("contact-message", "err-contact-message", "");
    if (!ok) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    fetch(SUPABASE_URL + "/rest/v1/website_enquiries", {
      method: "POST",
      headers: sbHeaders({ "Prefer": "return=minimal" }),
      body: JSON.stringify({
        type: "contact",
        student_name: name,
        father_name: null,
        dob: null,
        gender: null,
        class_applying: null,
        previous_school: null,
        guardian_phone: phone,
        address: null,
        message: message,
        status: "pending"
      })
    })
      .then(function (res) {
        if (!res.ok) throw new Error("submit failed: " + res.status);
        form.classList.add("hidden");
        success.classList.remove("hidden");
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      })
      .catch(function () {
        msg.textContent = "Could not send the message — please try again, or visit the academy office in Sakhi Sarwar.";
        msg.classList.add("error");
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      });
  });

  $("contact-again").addEventListener("click", function () {
    form.reset();
    success.classList.add("hidden");
    form.classList.remove("hidden");
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Message";
  });
})();

/* ---------- Admission buttons: reveal the form, scroll to it, flash it, focus it ----------
   The form stays hidden until a button is pressed (hero, header, nav or the
   section's own "Fill the Admission Form" button). */
(function () {
  function revealForm() {
    var card = $("admission-form-card");
    var wrap = $("admission-open-wrap");
    if (card) card.classList.remove("hidden");
    if (wrap) wrap.classList.add("hidden");
  }
  function flashAndFocus() {
    var card = $("admission-form-card");
    var form = $("admission-form");
    if (card) {
      card.classList.remove("flash");
      void card.offsetWidth; /* restart the animation */
      card.classList.add("flash");
    }
    if (form && !form.classList.contains("hidden")) {
      var first = $("student-name");
      if (first) first.focus({ preventScroll: true });
    }
  }
  var links = document.querySelectorAll('a[href="#admissions"]');
  links.forEach(function (a) {
    a.addEventListener("click", function () {
      revealForm();
      setTimeout(flashAndFocus, 650);
    });
  });
  var openBtn = $("admission-open-btn");
  if (openBtn) {
    openBtn.addEventListener("click", function () {
      revealForm();
      flashAndFocus();
    });
  }
})();

/* ---------- Role ID status check (same student_login RPC as the app) ---------- */
(function () {
  var form = $("status-form");
  if (!form) return;
  var input = $("role-id-input");
  var msg = $("status-msg");
  var result = $("status-result");
  var btn = $("status-submit");

  function renderStatus(d) {
    var fee = d.fee_balance > 0
      ? '<span class="fee-due">Balance due: Rs ' + escHtml(d.fee_balance) + '</span>'
      : '<span class="fee-paid">Fee paid in full</span>';
    var attCls = d.attendance === "Present" ? "pill-present"
      : d.attendance === "Absent" ? "pill-absent" : "pill-notmarked";
    var html = '<div class="status-head"><div><h3>' + escHtml(d.name) + '</h3>'
      + '<p>Class ' + escHtml(d.grade) + ' &bull; ' + escHtml(d.admission_no) + '</p></div>'
      + '<span class="status-pill ' + attCls + '">' + escHtml(d.attendance) + ' today</span></div>'
      + '<div class="status-rows">'
      + '<div class="status-row"><span>Fee total</span><strong>Rs ' + escHtml(d.fee_total) + '</strong></div>'
      + '<div class="status-row"><span>Fee paid</span><strong>Rs ' + escHtml(d.fee_paid) + '</strong></div>'
      + '<div class="status-row"><span>Fee balance</span>' + fee + '</div>'
      + '</div>';
    html += '<h4>Published results</h4>';
    if (d.assessments && d.assessments.length) {
      html += '<ul class="status-list">';
      d.assessments.forEach(function (a) {
        var sc = (a.score === null || a.score === undefined || a.score === "")
          ? "&mdash;" : escHtml(a.score) + " / " + escHtml(a.max_score);
        html += '<li><span>' + escHtml(a.title) + (a.subject ? ' &bull; ' + escHtml(a.subject) : '')
          + '</span><strong>' + sc + '</strong></li>';
      });
      html += '</ul>';
    } else {
      html += '<p class="status-empty">No published results yet.</p>';
    }
    if (d.activities && d.activities.length) {
      html += '<h4>Class activities</h4><ul class="status-list">';
      d.activities.forEach(function (a) {
        html += '<li><span>' + escHtml(a.title) + (a.body ? ' &mdash; ' + escHtml(a.body) : '')
          + '</span><strong>' + escHtml(a.date || "") + '</strong></li>';
      });
      html += '</ul>';
    }
    if (d.notices && d.notices.length) {
      html += '<h4>Latest notices</h4><ul class="status-list">';
      d.notices.forEach(function (n) {
        html += '<li><span>' + escHtml(n.title) + '</span><strong>' + escHtml(n.date || "") + '</strong></li>';
      });
      html += '</ul>';
    }
    html += '<button type="button" class="btn btn-outline-navy" id="status-again">Check another Role ID</button>';
    result.innerHTML = html;
    result.classList.remove("hidden");
    $("status-again").addEventListener("click", function () {
      result.classList.add("hidden");
      result.innerHTML = "";
      form.reset();
      input.focus();
    });
    result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var roleId = input.value.trim().toUpperCase();
    if (!roleId) { setErr("role-id-input", "err-role-id", "Please enter the Role ID."); return; }
    setErr("role-id-input", "err-role-id", "");
    msg.textContent = "";
    msg.className = "form-msg";
    result.classList.add("hidden");
    result.innerHTML = "";
    btn.disabled = true;
    btn.textContent = "Checking\u2026";
    fetch(SUPABASE_URL + "/rest/v1/rpc/student_login", {
      method: "POST",
      headers: sbHeaders(),
      body: JSON.stringify({ p_role_id: roleId })
    })
      .then(function (res) {
        if (!res.ok) throw new Error("status failed: " + res.status);
        return res.json();
      })
      .then(function (d) {
        btn.disabled = false;
        btn.textContent = "Check Status";
        if (!d || !d.ok) {
          msg.textContent = "Role ID not found \u2014 please check it and try again.";
          msg.classList.add("error");
          return;
        }
        renderStatus(d);
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = "Check Status";
        msg.textContent = "Could not check the status \u2014 please try again.";
        msg.classList.add("error");
      });
  });
})();

/* ---------- Admin login (Supabase Auth; admin-only via is_admin) ----------
   The login uses the SAME admin email + password as the academy app.
   The token lives only in sessionStorage (cleared on logout / tab close).
   Applications are readable ONLY after the is_admin() check passes, so a
   teacher/parent login sees nothing here. */
(function () {
  var form = $("admin-login-form");
  if (!form) return;
  var panel = $("admin-panel");
  var listEl = $("admin-list");
  var listMsg = $("admin-list-msg");
  var countEl = $("admin-count");
  var loginMsg = $("admin-login-msg");
  var loginBtn = $("admin-login-btn");
  var TOKEN_KEY = "aga_admin_token";
  var EMAIL_KEY = "aga_admin_email";

  function authHeaders(token) {
    return {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    };
  }

  function waNumber(raw) {
    var digits = (raw || "").replace(/\D/g, "");
    if (digits.length === 11 && digits.charAt(0) === "0") return "92" + digits.slice(1);
    if (digits.length === 10 && digits.charAt(0) === "3") return "92" + digits;
    return digits;
  }

  function fmtDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function renderEnquiries(rows) {
    var pending = rows.filter(function (r) { return r.status === "pending"; }).length;
    countEl.textContent = rows.length + " application" + (rows.length === 1 ? "" : "s")
      + " \u2014 " + pending + " new";
    if (!rows.length) {
      listEl.innerHTML = "";
      listMsg.textContent = "No applications yet.";
      listMsg.className = "form-msg info";
      return;
    }
    listMsg.textContent = "";
    listMsg.className = "form-msg";
    var html = "";
    rows.forEach(function (r) {
      var isAdmission = r.type === "admission";
      var waText = isAdmission
        ? "Assalam-o-Alaikum! Ammara Girls Academy ko " + (r.student_name || "aap ke bache")
          + " ki admission application mil gayi hai. Class: " + (r.class_applying || "")
          + ". Hamari team jald aap se rabta karegi. Shukriya! - Ammara Girls Academy, Sakhi Sarwar"
        : "Assalam-o-Alaikum! Ammara Girls Academy ko aap ka message mil gaya hai."
          + " Hamari team jald aap se rabta karegi. Shukriya! - Ammara Girls Academy, Sakhi Sarwar";
      var num = waNumber(r.guardian_phone);
      var meta = (isAdmission ? "Class " + (r.class_applying || "\u2014") + " \u2022 " : "")
        + (r.father_name ? "Father: " + r.father_name + " \u2022 " : "")
        + (r.guardian_phone ? r.guardian_phone + " \u2022 " : "")
        + fmtDate(r.created_at);
      html += '<article class="enquiry-card"><div class="enquiry-head"><h3>' + escHtml(r.student_name || "(No name)") + '</h3>'
        + '<span class="enquiry-pills"><span class="type-pill ' + (isAdmission ? "type-admission" : "type-contact") + '">'
        + (isAdmission ? "Admission" : "Message") + '</span>'
        + '<span class="status-pill-sm ' + (r.status === "pending" ? "status-pending" : "status-other") + '">'
        + escHtml(r.status || "") + '</span></span></div>'
        + '<p class="enquiry-meta">' + escHtml(meta) + '</p>';
      if (!isAdmission && r.message) {
        html += '<p class="enquiry-msg">' + escHtml(r.message) + '</p>';
      }
      html += '<div class="enquiry-actions">';
      if (num) {
        html += '<a class="btn btn-whatsapp btn-sm" target="_blank" rel="noopener" href="https://wa.me/' + num
          + '?text=' + encodeURIComponent(waText) + '">WhatsApp ' + (isAdmission ? "Admission" : "Reply") + '</a>';
      } else {
        html += '<span class="btn btn-whatsapp btn-sm disabled">No phone number</span>';
      }
      html += '</div></article>';
    });
    listEl.innerHTML = html;
  }

  function showPanel() {
    form.classList.add("hidden");
    panel.classList.remove("hidden");
    loadEnquiries();
  }

  function showLogin() {
    panel.classList.add("hidden");
    form.classList.remove("hidden");
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EMAIL_KEY);
  }

  function loadEnquiries() {
    var token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) { showLogin(); return; }
    listMsg.textContent = "Loading applications\u2026";
    listMsg.className = "form-msg info";
    fetch(SUPABASE_URL + "/rest/v1/website_enquiries?select=id,type,student_name,father_name,class_applying,guardian_phone,message,status,created_at&order=created_at.desc&limit=50", {
      headers: authHeaders(token)
    })
      .then(function (res) {
        if (!res.ok) throw new Error("load failed: " + res.status);
        return res.json();
      })
      .then(function (rows) { renderEnquiries(rows || []); })
      .catch(function () {
        listMsg.textContent = "Could not load applications \u2014 please log in again.";
        listMsg.className = "form-msg error";
      });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = $("admin-email").value.trim();
    var pw = $("admin-password").value;
    var ok = true;
    if (!email) { setErr("admin-email", "err-admin-email", "Please enter the admin email."); ok = false; }
    else setErr("admin-email", "err-admin-email", "");
    if (!pw) { setErr("admin-password", "err-admin-password", "Please enter the password."); ok = false; }
    else setErr("admin-password", "err-admin-password", "");
    if (!ok) return;
    loginMsg.textContent = "";
    loginMsg.className = "form-msg";
    loginBtn.disabled = true;
    loginBtn.textContent = "Signing in\u2026";
    fetch(SUPABASE_URL + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: sbHeaders(),
      body: JSON.stringify({ email: email, password: pw })
    })
      .then(function (res) {
        if (!res.ok) throw new Error("login failed: " + res.status);
        return res.json();
      })
      .then(function (d) {
        if (!d || !d.access_token) throw new Error("no token");
        var token = d.access_token;
        return fetch(SUPABASE_URL + "/rest/v1/rpc/is_admin", {
          method: "POST",
          headers: authHeaders(token),
          body: "{}"
        })
          .then(function (res) {
            if (!res.ok) throw new Error("admin check failed");
            return res.json();
          })
          .then(function (isAdmin) {
            loginBtn.disabled = false;
            loginBtn.textContent = "Log in";
            if (isAdmin !== true) {
              loginMsg.textContent = "This account is not an admin account.";
              loginMsg.classList.add("error");
              return;
            }
            sessionStorage.setItem(TOKEN_KEY, token);
            sessionStorage.setItem(EMAIL_KEY, email);
            showPanel();
          })
          .catch(function (err) {
            loginBtn.disabled = false;
            loginBtn.textContent = "Log in";
            if (err && err.message === "admin check failed") {
              loginMsg.textContent = "Could not verify the admin account \u2014 please try again.";
            } else {
              loginMsg.textContent = "Wrong email or password \u2014 please try again.";
            }
            loginMsg.classList.add("error");
          });
      })
      .catch(function () {
        loginBtn.disabled = false;
        loginBtn.textContent = "Log in";
        loginMsg.textContent = "Wrong email or password \u2014 please try again.";
        loginMsg.classList.add("error");
      });
  });

  $("admin-logout").addEventListener("click", function () { showLogin(); });
  $("admin-refresh").addEventListener("click", function () { loadEnquiries(); });

  /* Resume a session in this tab (verified as admin again first). */
  (function () {
    var token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) return;
    fetch(SUPABASE_URL + "/rest/v1/rpc/is_admin", {
      method: "POST",
      headers: authHeaders(token),
      body: "{}"
    })
      .then(function (res) {
        if (!res.ok) throw new Error("session check failed");
        return res.json();
      })
      .then(function (isAdmin) { if (isAdmin === true) showPanel(); })
      .catch(function () { /* stay on the login form */ });
  })();
})();
