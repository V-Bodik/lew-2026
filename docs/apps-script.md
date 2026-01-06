# Google Apps Script submission backend (recommended)

This site is static (GitHub Pages), so the “real” submission happens via a Google Apps Script web app endpoint.

## What you get
- A normal-looking HTML form (`submit.html`)
- When submitted, it POSTs to your Apps Script endpoint
- Apps Script writes a row to a Google Sheet **and** can send confirmation/notification emails

## Step-by-step (do this later, not now)

### 1) Create the Google Sheet
- Create a new Google Sheet called: `LEW 2026 submissions`
- In the first row, put these headers (exactly):
  - Timestamp
  - Name
  - Email
  - Affiliation
  - Coauthors
  - Title
  - Abstract
  - PaperLink
  - Keywords
  - UserAgent
  - IP (optional)

### 2) Open Apps Script
- In the Sheet: Extensions → Apps Script
- Delete any default code and paste the script from `apps-script.gs` below.

### 3) Deploy as a Web App
- Deploy → New deployment
- Select type: **Web app**
- Execute as: **Me**
- Who has access: **Anyone** (or “Anyone with the link”)
- Click Deploy and copy the **Web app URL**

### 4) Paste URL into the site
- Open `js/submit.js`
- Replace:
  `PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE`
  with your web app URL.

### 5) (Optional but recommended) Turn on email notifications
- In Apps Script: set the `RECIPIENTS` list to include:
  - your personal email (Gmail)
  - your future `@uwa.edu.au` mailbox (placeholder is ok)
- You can also CC yourself on every submission.

---

## apps-script.gs (copy/paste)

```javascript
const SHEET_NAME = "Form Responses 1"; // change to your sheet tab name if needed
const RECIPIENTS = [
  "YOUR_PERSONAL_EMAIL@gmail.com",
  "lew2026@uwa.edu.au" // placeholder
];
const SEND_CONFIRMATION_TO_AUTHOR = true;

function doPost(e) {
  try {
    const data = e.parameter || {};
    // basic honeypot check
    if (data.website && data.website.trim() !== "") {
      return ContentService.createTextOutput("Blocked").setMimeType(ContentService.MimeType.TEXT);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];

    const row = [
      new Date(),
      safe(data.name),
      safe(data.email),
      safe(data.affiliation),
      safe(data.coauthors),
      safe(data.title),
      safe(data.abstract),
      safe(data.paper_link),
      safe(data.keywords),
      safe(data.user_agent),
      safe(data.ip)
    ];
    sh.appendRow(row);

    // Notify organisers
    const subject = "[LEW 2026] New submission: " + safe(data.title);
    const body =
      "New submission received:\n\n" +
      "Name: " + safe(data.name) + "\n" +
      "Email: " + safe(data.email) + "\n" +
      "Affiliation: " + safe(data.affiliation) + "\n" +
      "Coauthors: " + safe(data.coauthors) + "\n\n" +
      "Title: " + safe(data.title) + "\n\n" +
      "Paper link: " + safe(data.paper_link) + "\n\n" +
      "Abstract:\n" + safe(data.abstract) + "\n\n" +
      "Keywords: " + safe(data.keywords) + "\n";

    MailApp.sendEmail({
      to: RECIPIENTS.join(","),
      subject,
      body
    });

    if (SEND_CONFIRMATION_TO_AUTHOR && data.email) {
      MailApp.sendEmail({
        to: safe(data.email),
        subject: "[LEW 2026] Submission received",
        body:
          "Thanks — we received your submission.\n\n" +
          "Title: " + safe(data.title) + "\n" +
          "Paper link: " + safe(data.paper_link) + "\n\n" +
          "If you need to update anything, reply to this email."
      });
    }

    return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("ERROR: " + err).setMimeType(ContentService.MimeType.TEXT);
  }
}

function safe(v){
  return (v || "").toString().trim();
}
```

### 6) Extra hardening (optional)
- Add simple rate-limiting with `CacheService` (e.g., block repeated posts from same email for 60 seconds)
- Validate `paper_link` must start with `http`
- Add a required checkbox “I agree my details will be shared with reviewers” (if you want)
