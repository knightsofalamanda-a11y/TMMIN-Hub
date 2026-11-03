# Abnormality Response Hub | TMMIN

Prototype for **Solution 2: Standardized Abnormality Response** (M3C MTI Consulting × AKTI 2026, case PT Toyota Motor Manufacturing Indonesia).

How it connects to the other solutions:

- **Solution 1 → 2:** AI integrated with SCADA detects a defect or abnormality and sends an alert code. The alert code opens the matching SOP path, manual book tutorial, and response targets in this hub.
- **Solution 3 → 2:** when a line change is validated in the digital twin simulation, the affected manual book pages are updated and a refresher is assigned before the change goes live.

## What is inside

| Page | What it does |
|---|---|
| Overview | Connected-solutions panel with live counts, role-based response guide, severity at a glance |
| SOP Swimlane | Interactive cross-functional SOP (6 lanes × 8 phases), filter the path by severity S1–S4, click a step for detail |
| Manual Book | One tutorial per alert code, 6 types (EQ, QD, MT, PR, SF, AI): signs, do / never, step-by-step checklist, who to call, version |
| Live Alerts (S1) | Alert inbox fed by Solution 1 (AI + SCADA). Each alert shows the AI evidence, suggested severity and a live acknowledge clock. *Acknowledge and respond* opens the Response Workspace with the SOP path, manual book page and targets; *False alarm* sends a label back to Solution 1 |
| Line Change Sync (S3) | Change packages from the Solution 3 digital twin. Workflow: received → impact reviewed (diff of manual book edits) → manual published (version bump) → refresher → go-live released back to Solution 3 |
| Severity & Response Targets | Target matrix (acknowledge, TL on site, support, containment, restore), 5-question severity check, automatic escalation ladder |
| Response Workspace | Live case opened from a Solution 1 alert, or a practice case. Live clock (1×, 10×, 60×), milestones, target breaches and auto-escalation |
| Training & Quiz | 8 scenario questions, pass mark 6/8 |
| Response Log & KPIs | Time to acknowledge, time to restore, share within target, CSV export |

## Run locally

No build step. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Publish on GitHub Pages

1. Create a new repository and upload all files in this folder (keep the folder structure).
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, then **Save**.
4. The site is live at `https://<your-username>.github.io/<repo-name>/` after a minute or two.

## Structure

```
index.html
assets/
  css/base.css   shared look of the Smart Factory Platform (Solution 1)
  css/hub.css    hub-specific styles (swimlane, tutorials, simulator)
  js/data.js     all content: lanes, steps, severity targets, tutorials, quiz
  js/app.js      rendering and interactions
.nojekyll
```

To change any target, tutorial, or SOP step, edit `assets/js/data.js` only.

## Notes

- Response targets are **team-proposed** and are calibrated during the pilot (body welding and sealer).
- Solution 1 alerts and Solution 3 packages are **simulated** in the browser (a new alert arrives about every 45 s). In production they come through the platform API.
- Incident data is **simulated** for demonstration and is not actual TMMIN data.
- Demo progress (simulator runs, quiz score, selected role) is stored in the browser only. Use *Reset demo data* in the sidebar to clear it.
- Charts load Chart.js and the Inter font from public CDNs, so an internet connection is needed for those.
