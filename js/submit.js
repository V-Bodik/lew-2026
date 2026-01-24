const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzzIaT5fujEhfBE4pKsDC2w4hqDYLpPLDz0YztQMxXoff1OWnmPLxaC7MJg0hLCtSX1/exec";

function $(sel){ return document.querySelector(sel); }

function setNotice(type, msg){
  const el = $("#formNotice");
  el.className = "notice " + (type || "");
  el.textContent = msg;
  el.hidden = false;
}

function serialize(form){
  const data = new FormData(form);
  ["title","abstract","authors","presenting_author","accessibility"].forEach(k=>{
    if (data.has(k)){
      const v = (data.get(k) || "").toString().trim();
      data.set(k, v);
    }
  });
  return data;
}

function collectAuthors(){
  const rows = document.querySelectorAll(".author-row");
  const entries = [];

  for (const row of rows){
    const name = (row.querySelector('input[name^="author_name_"]')?.value || "").trim();
    const affiliation = (row.querySelector('input[name^="author_affiliation_"]')?.value || "").trim();
    const email = (row.querySelector('input[name^="author_email_"]')?.value || "").trim();
    const any = name || affiliation || email;
    if (!any) continue;
    if (!(name && affiliation && email)){
      return { error: "Please complete all author fields or leave the row blank." };
    }
    entries.push(name + " - " + affiliation + " - " + email);
  }

  if (!entries.length){
    return { error: "Please add at least one author." };
  }

  const authorsField = $("#authors");
  if (authorsField) authorsField.value = entries.join("; ");
  return { ok: true };
}

function addAuthorRow(){
  const list = $("#authorsList");
  if (!list) return;
  const count = list.querySelectorAll(".author-row").length;
  if (count >= 10){
    setNotice("error","You can add up to 10 authors.");
    return;
  }

  const idx = count + 1;
  const row = document.createElement("div");
  row.className = "author-row";
  row.style.display = "grid";
  row.style.gap = "12px";
  row.style.gridTemplateColumns = "repeat(auto-fit, minmax(220px, 1fr))";
  row.style.marginTop = "12px";
  row.innerHTML = "" +
    '<div class="field">' +
      '<label for="author_name_' + idx + '">Author</label>' +
      '<input id="author_name_' + idx + '" name="author_name_' + idx + '" placeholder="Author name"/>' +
    '</div>' +
    '<div class="field">' +
      '<label for="author_affiliation_' + idx + '">Affiliation</label>' +
      '<input id="author_affiliation_' + idx + '" name="author_affiliation_' + idx + '" placeholder="Affiliation"/>' +
    '</div>' +
    '<div class="field">' +
      '<label for="author_email_' + idx + '">Email address</label>' +
      '<input id="author_email_' + idx + '" name="author_email_' + idx + '" placeholder="author@example.com" type="email"/>' +
    '</div>';
  list.appendChild(row);
}

async function handleSubmit(e){
  e.preventDefault();
  const form = e.target;

  const trap = form.querySelector('input[name="website"]');
  if (trap && trap.value){
    setNotice("error","Submission blocked.");
    return;
  }

  const authorCheck = collectAuthors();
  if (authorCheck.error){
    setNotice("error", authorCheck.error);
    return;
  }

  if (!SCRIPT_URL || SCRIPT_URL.includes("PASTE_YOUR")){
    setNotice("error","Submission endpoint not configured yet. Please contact lew2026@uwa.edu.au.");
    return;
  }

  const btn = $("#submitBtn");
  btn.disabled = true;
  btn.textContent = "Submitting...";

  try{
    const resp = await fetch(SCRIPT_URL, { method:"POST", body: serialize(form) });
    const text = await resp.text();

    if (resp.ok){
      setNotice("success","Thanks - your submission was received. A confirmation email will be sent.");
      form.reset();
    } else {
      setNotice("error","Submission failed. Please try again or contact lew2026@uwa.edu.au.");
      console.error(text);
    }
  } catch(err){
    console.error(err);
    setNotice("error","Network error while submitting. Please try again or contact lew2026@uwa.edu.au.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Submit";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const form = $("#submissionForm");
  if (form) form.addEventListener("submit", handleSubmit);
  const addBtn = $("#addAuthorBtn");
  if (addBtn) addBtn.addEventListener("click", addAuthorRow);
});
