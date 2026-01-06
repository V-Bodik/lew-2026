/**
 * submit.js — posts to a Google Apps Script web-app endpoint.
 * You will paste your endpoint URL into SCRIPT_URL below.
 */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwVOiWdvWTwPVEX2Tdkbpl-q6h_A7iEUNgdLgnb3GhUF8yiSDH1JxAcLXduZNxBQmsY/exec";


function $(sel){ return document.querySelector(sel); }

function setNotice(type, msg){
  const el = $("#formNotice");
  el.className = "notice " + (type || "");
  el.textContent = msg;
  el.hidden = false;
}

function serialize(form){
  const data = new FormData(form);
  // Basic sanity: trim key fields
  ["name","email","title","affiliation","paper_link"].forEach(k=>{
    if (data.has(k)){
      const v = (data.get(k) || "").toString().trim();
      data.set(k, v);
    }
  });
  return data;
}

async function handleSubmit(e){
  e.preventDefault();
  const form = e.target;

  // Honeypot anti-spam: should stay empty
  const trap = form.querySelector('input[name="website"]');
  if (trap && trap.value){
    setNotice("error","Submission blocked.");
    return;
  }

  if (!SCRIPT_URL || SCRIPT_URL.includes("PASTE_YOUR")){
    setNotice("error","Submission endpoint not configured yet. Please try email submission (submit1.html) for now.");
    return;
  }

  const btn = $("#submitBtn");
  btn.disabled = true;
  btn.textContent = "Submitting…";

  try{
    const resp = await fetch(SCRIPT_URL, { method:"POST", body: serialize(form) });
    const text = await resp.text();

    if (resp.ok){
      setNotice("success","Thanks — your submission was received. A confirmation email may be sent depending on our configuration.");
      form.reset();
    } else {
      setNotice("error","Submission failed. Please try again, or use email submission (submit1.html).");
      console.error(text);
    }
  } catch(err){
    console.error(err);
    setNotice("error","Network error while submitting. Please try again, or use email submission (submit1.html).");
  } finally {
    btn.disabled = false;
    btn.textContent = "Submit";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const form = $("#submissionForm");
  if (form) form.addEventListener("submit", handleSubmit);
});
