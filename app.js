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
