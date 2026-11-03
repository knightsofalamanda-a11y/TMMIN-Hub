# Abnormality Response Hub | TMMIN

Prototype for **Solution 2: Standardized Abnormality Response** (M3C MTI Consulting × AKTI 2026, case PT Toyota Motor Manufacturing Indonesia).

The hub sits on top of the Integrated Smart Factory Platform (Solution 1). The platform detects abnormalities and timestamps every step; the hub tells each person what to do, how fast, and who to call.

## What is inside

| Page | What it does |
|---|---|
| Overview | Role-based response guide, problem link, severity at a glance |
| SOP Swimlane | Interactive cross-functional SOP (6 lanes × 8 phases), filter the path by severity S1–S4, click a step for detail |
| Abnormality Tutorials | 6 abnormality types (EQ, QD, MT, PR, SF, AI): signs, do / never, step-by-step checklist, who to call |
| Severity & Response Targets | Target matrix (acknowledge, TL on site, support, containment, restore), 5-question severity check, automatic escalation ladder |
| Response Simulator | Run a practice case with a live clock (1×, 10×, 60×), mark milestones, see target breaches and auto-escalation |
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
- Incident data is **simulated** for demonstration and is not actual TMMIN data.
- Demo progress (simulator runs, quiz score, selected role) is stored in the browser only. Use *Reset demo data* in the sidebar to clear it.
- Charts load Chart.js and the Inter font from public CDNs, so an internet connection is needed for those.
