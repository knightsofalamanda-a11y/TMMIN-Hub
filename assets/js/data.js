/* =========================================================
   Abnormality Response Hub | TMMIN — content and demo data
   Solution 2: Standardized Abnormality Response
   All response targets are team-proposed and are calibrated during the pilot.
   All incident figures are simulated for UI demonstration only.
   ========================================================= */

const ICONS = {
  operator: '<svg viewBox="0 0 24 24"><circle cx="12" cy="7" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg>',
  tl: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20v-1.5a6 6 0 0 1 12 0V20M15.5 14.2A5 5 0 0 1 21 19v1"/></svg>',
  gl: '<svg viewBox="0 0 24 24"><path d="M12 3v18M5 8l7-5 7 5"/><path d="M7 21h10M8 13h8"/></svg>',
  support: '<svg viewBox="0 0 24 24"><path d="M14.7 6.3a4 4 0 0 0-5.2 5.2L3.8 17.2a1.6 1.6 0 0 0 2.3 2.3l5.7-5.7a4 4 0 0 0 5.2-5.2l-2.6 2.6-2.2-.6-.6-2.2z"/></svg>',
  platform: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4M7 12l3-3 2 2 4-4"/></svg>',
  mgmt: '<svg viewBox="0 0 24 24"><path d="M3 20h18"/><path d="M6 20v-6M11 20V9M16 20v-9M21 4l-5 5-4-3-8 6"/></svg>',
  alert: '<svg viewBox="0 0 24 24"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M9 7h6"/></svg>',
  flow: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="5" rx="1"/><rect x="14" y="16" width="7" height="5" rx="1"/><path d="M6.5 8v5a2 2 0 0 0 2 2H14"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12-7.5z"/></svg>',
  ladder: '<svg viewBox="0 0 24 24"><path d="M7 3v18M17 3v18M7 7h10M7 12h10M7 17h10"/></svg>',
  quiz: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7M12 17h.01"/></svg>',
  log: '<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>',
  refresh: '<svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 0 0-14.6-4.5L4 8"/><path d="M4 3v5h5"/><path d="M4 13a8 8 0 0 0 14.6 4.5L20 16"/><path d="M20 21v-5h-5"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>'
};

/* Swimlane lanes. Selectable roles are the people lanes; the platform lane is Solution 1. */
const LANES = {
  operator: { name: 'Line Operator', short: 'Operator', color: '#315A78', tint: '#EAF0F5', pick: true,
    positions: 'Line Operator, Multi-skill Operator', focus: 'First to notice. Acknowledge, stop when needed, call, and follow the tutorial while waiting.' },
  tl: { name: 'Team Leader', short: 'Team Leader', color: '#27856B', tint: '#E6F2EE', pick: true,
    positions: 'Team Leader (Hancho)', focus: 'First responder on the line. Confirm severity, contain, and fix within standard.' },
  gl: { name: 'Group Leader / Supervisor', short: 'Group Leader', color: '#B87A1A', tint: '#FAF1E3', pick: true,
    positions: 'Group Leader (Kumicho), Section Supervisor', focus: 'Escalation owner. Calls support, protects downstream, and closes the kaizen loop.' },
  support: { name: 'Maintenance, Quality and Engineering', short: 'Support', color: '#3C4043', tint: '#EEEFF1', pick: true,
    positions: 'Maintenance Technician, Quality Inspector, Process Engineer', focus: 'Specialist response. Diagnose, repair, and verify product quality before restart.' },
  platform: { name: 'Smart Factory Platform (Solution 1)', short: 'Platform', color: '#6B7A90', tint: '#EEF1F5', pick: false,
    positions: 'SCADA data, AI alerts, timestamps', focus: 'Detects, timestamps every step, and escalates automatically when a target is missed.' },
  mgmt: { name: 'Plant Management', short: 'Management', color: '#EB0A1E', tint: '#FDEDEE', pick: true,
    positions: 'Plant Manager, Operations Manager', focus: 'Notified on critical cases and target breaches. Reviews trends and approves countermeasures.' }
};
const LANE_ORDER = ['platform', 'operator', 'tl', 'gl', 'support', 'mgmt'];
const PHASES = ['Detect', 'Respond', 'Assess', 'Contain', 'Fix', 'Verify', 'Restart', 'Learn'];

/* Severity levels and team-proposed response targets (minutes from first alert). */
const SEVERITY = {
  S1: { name: 'Critical', color: '#D93025', tint: '#FCE8E6', badge: 'b-red',
    def: 'Risk to people, full line stop, or a defect that may have passed to the next process or customer.',
    examples: ['Injury risk, fire, leak, or electrical hazard', 'Main conveyor or welding cell stops the whole line', 'Missing weld or sealer found after the car left the station'],
    t: { ack: 1, tl: 1, support: 5, contain: 10, restore: 30 },
    escalate: [['0 min', 'Group Leader and Section Manager notified at once'], ['30 min', 'Plant Manager notified if not restored'], ['24 h', 'Incident report and countermeasure review']] },
  S2: { name: 'Major', color: '#C26A00', tint: '#FDF0E1', badge: 'b-amber',
    def: 'A station stops or a defect repeats in the same shift, causing output loss, but nothing has passed downstream.',
    examples: ['Robot fault stops one station', 'Same sealer gap found on 2 or more units in a shift', 'Wrong part at the line side with less than 30 minutes of stock'],
    t: { ack: 1, tl: 3, support: 10, contain: 15, restore: 60 },
    escalate: [['15 min', 'Group Leader takes over if not contained'], ['60 min', 'Section Manager notified if not restored'], ['End of shift', 'Countermeasure recorded']] },
  S3: { name: 'Minor', color: '#315A78', tint: '#E6EEF4', badge: 'b-blue',
    def: 'Handled within the cycle without stopping the line. Product is not affected or is corrected at the station.',
    examples: ['Parameter drifts near its limit and is corrected', 'Single cosmetic defect repaired in station', 'Late material delivery recovered within cycle'],
    t: { ack: 2, tl: 5, support: 30, contain: 30, restore: 240 },
    escalate: [['4 h', 'Group Leader reviews if still open'], ['End of shift', 'Recorded in shift report']] },
  S4: { name: 'Observation', color: '#5F6368', tint: '#EEF0F2', badge: '',
    def: 'Near miss, suspected false alarm, or a weak signal that needs follow-up but no immediate action on the line.',
    examples: ['AI alert that the operator judges as a false alarm', 'Unusual noise with all parameters normal', 'Near miss with no contact'],
    t: { ack: 5, tl: 30, support: null, contain: null, restore: 480 },
    escalate: [['End of shift', 'Logged and labelled in the platform'], ['Next day', 'Reviewed in the daily line meeting']] }
};
const MILESTONES = [
  ['ack', 'Alert acknowledged', 'operator'],
  ['tl', 'Team Leader on site', 'tl'],
  ['support', 'Support on site', 'support'],
  ['contain', 'Containment in place', 'tl'],
  ['restore', 'Line restored', 'operator']
];

/* Swimlane steps. col = phase index (0-based). paths = severities that pass through the step. */
const STEPS = [
  { id: 'P1', lane: 'platform', col: 0, title: 'Detect and alert', paths: ['S1','S2','S3','S4'],
    desc: 'Solution 1 (AI integrated with SCADA) detects a defect or abnormality, for example a sealer gap from AI vision or a weld current outside its limit. It sends an alert code to the station screen and the Team Leader watch, and the response clock starts. From here, Solution 2 takes over.',
    out: 'Alert code and timestamp from Solution 1' },
  { id: 'O1', lane: 'operator', col: 0, title: 'Notice and pull Andon', paths: ['S1','S2','S3','S4'],
    desc: 'If the operator sees it first, pull the Andon cord or press the station button. Manual detection starts the same clock.',
    out: 'Andon call' },
  { id: 'O2', lane: 'operator', col: 1, title: 'Acknowledge, Stop, Call, Wait', paths: ['S1','S2','S3','S4'],
    desc: 'Acknowledge the alert on the screen. Stop if there is any risk to people or product. Open the Hub tutorial for the alert code and follow the safe first actions while waiting.',
    out: 'Acknowledged alert', decision: false },
  { id: 'T1', lane: 'tl', col: 1, title: 'Go to the line', paths: ['S1','S2','S3','S4'],
    desc: 'Arrive at the station within the target for the severity shown on the alert. For S4, check during the next round.',
    out: 'TL on site' },
  { id: 'T2', lane: 'tl', col: 2, title: 'Confirm severity', paths: ['S1','S2','S3','S4'],
    desc: 'Use the five-question severity check. Confirm or change the level in the platform so the right targets and escalation apply.',
    out: 'Confirmed S1 to S4', decision: true, q: 'Fixable by TL with standard?' },
  { id: 'G1', lane: 'gl', col: 2, title: 'Escalate and coordinate', paths: ['S1','S2'],
    desc: 'Call the right support team, inform the next process, and move people if the line stops. Takes over when the TL cannot fix within standard.',
    out: 'Support called' },
  { id: 'M1', lane: 'mgmt', col: 2, title: 'Receive critical notice', paths: ['S1'],
    desc: 'Section Manager is notified at once for S1 and for any target breach. Plant Manager is notified if an S1 is not restored in 30 minutes.',
    out: 'Management aware' },
  { id: 'T3', lane: 'tl', col: 3, title: 'Contain', paths: ['S1','S2','S3'],
    desc: 'Isolate suspect units with red tags, hold the last good unit as reference, and apply the temporary countermeasure from the tutorial.',
    out: 'Suspect units held' },
  { id: 'SP1', lane: 'support', col: 3, title: 'Respond on site', paths: ['S1','S2'],
    desc: 'Maintenance, Quality, or Engineering arrives within target with the alert history and AI root cause hints already on the tablet.',
    out: 'Specialist on site' },
  { id: 'T4', lane: 'tl', col: 4, title: 'Fix with standard', paths: ['S3'],
    desc: 'For S3, the TL applies the fix in the work instruction linked to the alert code, then asks the operator to run a check unit.',
    out: 'Standard fix done' },
  { id: 'SP2', lane: 'support', col: 4, title: 'Diagnose and repair', paths: ['S1','S2'],
    desc: 'Confirm the root cause using the 5 Why template and the platform data, repair, and record parts and actions used.',
    out: 'Repair record' },
  { id: 'SP3', lane: 'support', col: 5, title: 'Verify quality', paths: ['S1','S2'],
    desc: 'Quality checks the first unit after repair and decides on the held units: release, rework, or scrap.',
    out: 'Quality release' },
  { id: 'O3', lane: 'operator', col: 6, title: 'Restart and first-unit check', paths: ['S1','S2','S3'],
    desc: 'Restart on the TL signal and check the first unit against the standard before normal running.',
    out: 'Line running' },
  { id: 'T5', lane: 'tl', col: 6, title: 'Close the alert', paths: ['S1','S2','S3','S4'],
    desc: 'Close the alert in the platform with cause, action, and label. For S4, label it as confirmed or false alarm so the AI learns.',
    out: 'Closed and labelled alert' },
  { id: 'P2', lane: 'platform', col: 1, span: 6, title: 'Track every step against target', paths: ['S1','S2','S3','S4'],
    desc: 'Each milestone is timestamped. When a target is missed, the platform escalates one level up automatically. No one needs to make a phone call to escalate.',
    out: 'Response timeline', track: true },
  { id: 'P3', lane: 'platform', col: 7, title: 'Log and analyze', paths: ['S1','S2','S3','S4'],
    desc: 'Response times, causes, and labels feed the dashboard: time to acknowledge, time to restore, repeat abnormalities, and false alarm rate.',
    out: 'Response KPIs' },
  { id: 'G2', lane: 'gl', col: 7, title: 'Countermeasure and update manual book', paths: ['S1','S2','S3','S4'],
    desc: 'Record the permanent countermeasure. If the manual book missed something, update the tutorial so the next shift learns from this case. Line changes validated in Solution 3 simulation also update the manual book here.',
    out: 'Updated manual book' },
  { id: 'M2', lane: 'mgmt', col: 7, title: 'Weekly review', paths: ['S1','S2'],
    desc: 'Review breaches and repeat cases, approve countermeasures that need budget, and track the response KPIs.',
    out: 'Approved countermeasures' }
];

/* Abnormality tutorial library */
const LIBRARY = [
  { code: 'EQ', ver: '1.0', upd: null, name: 'Equipment stop or breakdown', sev: 'S1 or S2', lanes: ['operator','tl','support'],
    summary: 'A machine, robot, jig, or conveyor stops, faults, or behaves abnormally.',
    signs: ['Robot or PLC fault code on the HMI', 'Conveyor stops or runs at the wrong speed', 'Unusual noise, smell, smoke, or vibration', 'Repeated small stops at the same station'],
    dos: ['Press the station stop if anything moves unsafely', 'Acknowledge the alert and note the fault code', 'Keep the area as it is for the technician', 'Move people away from moving parts'],
    donts: ['Do not reset a fault more than once without the TL', 'Do not reach into a cell that is not locked out', 'Do not bypass interlocks or light curtains'],
    steps: [['Make it safe', 'Stop the station. If there is smoke, sparks, or a leak, treat it as S1 and call the Group Leader at once.'], ['Acknowledge', 'Tap the alert on the station screen. The Team Leader receives the fault code and the clock is visible to everyone.'], ['Record what you saw', 'Choose the closest symptom in the Hub form: stopped, slow, noise, or repeated stop. Add a photo if safe.'], ['Wait for the TL', 'The TL checks if the fault is in the standard reset list. Only listed faults may be reset by the TL.'], ['Hand over to Maintenance', 'If not in the reset list, Maintenance arrives within target, applies lockout, and repairs.'], ['Restart and check', 'Run one unit, check it against the standard, then resume normal running.']],
    call: 'Team Leader, then Maintenance through the Group Leader', example: 'Welding robot R3 stops with a servo fault code in the body welding area.' },
  { code: 'QD', ver: '1.0', upd: null, name: 'Quality defect', sev: 'S1 to S3', lanes: ['operator','tl','support'],
    summary: 'A unit does not meet the quality standard: a missing or weak weld, sealer gap, dent, or dirt.',
    signs: ['AI vision flags a sealer gap or missing weld', 'Operator finds a defect during the check', 'Same defect on more than one unit', 'Downstream process returns a unit'],
    dos: ['Stop at the fixed position if the defect will pass on', 'Red tag the unit and hold the last good unit', 'Check the 3 units before and after', 'Take a photo of the defect'],
    donts: ['Do not let a suspect unit move on without a tag', 'Do not repair before the TL confirms the cause', 'Do not mix held and good units'],
    steps: [['Stop it moving on', 'If the unit will leave the station, stop at the fixed position. A defect that has already moved downstream is S1.'], ['Tag and hold', 'Put a red tag on the unit. Hold the last good unit as the reference.'], ['Check neighbours', 'Check the 3 units before and the 3 after. Two or more defects in one shift make it S2.'], ['TL confirms', 'The TL compares with the quality standard and confirms the severity in the platform.'], ['Quality decides', 'Quality decides release, rework, or scrap for every held unit.'], ['Close with cause', 'The TL closes the alert with the cause so the AI vision model learns.']],
    call: 'Team Leader, then Quality Inspector', example: 'AI vision detects a sealer bead gap on the roof joint of two units in one hour.' },
  { code: 'MT', ver: '1.0', upd: null, name: 'Material issue', sev: 'S2 or S3', lanes: ['operator','tl','gl'],
    summary: 'A part is missing, wrong, damaged, or about to run out at the line side.',
    signs: ['Line-side stock below the minimum mark', 'Part number does not match the build sheet', 'Damaged packaging or parts', 'Kanban not replenished on time'],
    dos: ['Check the part number against the build sheet', 'Set wrong or damaged parts aside with a tag', 'Tell the TL how many units the stock can cover'],
    donts: ['Do not use a part that looks similar but has a different number', 'Do not take parts from another line without the TL'],
    steps: [['Confirm the gap', 'Check the part number and count the remaining stock. Note how many units it covers.'], ['Acknowledge and call', 'Acknowledge the alert. Less than 30 minutes of cover is S2.'], ['TL checks supply', 'The TL checks the platform for the delivery status and calls logistics.'], ['Protect the build', 'If a wrong part was fitted, treat it as a quality defect and follow the QD tutorial.'], ['Restore stock', 'Logistics refills. The operator confirms the right part number before use.']],
    call: 'Team Leader, then Logistics through the Group Leader', example: 'Wrong bracket variant delivered for the HEV model with 20 minutes of correct stock left.' },
  { code: 'PR', ver: '1.0', upd: null, name: 'Process parameter out of range', sev: 'S2 or S3', lanes: ['operator','tl','support'],
    summary: 'A process value goes outside its limit: weld current, torque, sealer pressure, or temperature.',
    signs: ['Parameter shown in amber or red on the screen', 'Trend moving toward the limit', 'Torque tool rejects a fastening', 'Sealer bead thinner than the sample'],
    dos: ['Acknowledge and note the value shown', 'Check if the last units were made outside the limit', 'Follow the parameter card for the allowed adjustment'],
    donts: ['Do not change a setting that is not on the parameter card', 'Do not ignore an amber warning that repeats'],
    steps: [['Read the value', 'Acknowledge the alert and note the value and the limit shown.'], ['Check recent units', 'If any unit was made outside the limit, hold it and follow the QD tutorial.'], ['Allowed adjustment', 'The TL may make the adjustment listed on the parameter card, then watch the next 3 units.'], ['Call Engineering', 'If it drifts again or is not on the card, Process Engineering is called. This becomes S2.'], ['Close and label', 'Close the alert with the cause so the drift pattern is used for prediction.']],
    call: 'Team Leader, then Process Engineering', example: 'Spot weld current drops below the lower limit on gun 4 for 3 consecutive units.' },
  { code: 'SF', ver: '1.0', upd: null, name: 'Safety', sev: 'Always S1 if people are at risk', lanes: ['operator','tl','gl','mgmt'],
    summary: 'Any situation that can injure people: contact with moving parts, fire, leak, electrical, or fall.',
    signs: ['Someone is hurt or nearly hurt', 'Smoke, fire, chemical, or oil leak', 'Guard, interlock, or light curtain not working', 'Blocked walkway or exit'],
    dos: ['Stop the line with the emergency stop', 'Move people to a safe place', 'Call the Group Leader at once', 'Give first aid only if trained'],
    donts: ['Do not restart until the Group Leader says it is safe', 'Do not move an injured person unless there is danger'],
    steps: [['Stop and protect', 'Use the emergency stop and keep people away from the hazard.'], ['Call', 'Pull Andon and call the Group Leader. Safety is always S1 when people are at risk.'], ['Secure the area', 'The GL secures the area and calls the safety officer.'], ['Report', 'A near miss with no contact is logged as S4 so the pattern is visible.'], ['Restart only when safe', 'The GL approves restart after the hazard is removed.']],
    call: 'Group Leader and safety officer at once', example: 'Light curtain at the sealer station does not stop the robot during a test.' },
  { code: 'AI', ver: '1.0', upd: null, name: 'System or AI alert', sev: 'S3 or S4', lanes: ['operator','tl','platform'],
    summary: 'The platform raises an alert that looks wrong, a sensor stops sending data, or a screen freezes.',
    signs: ['Alert with no visible problem on the line', 'Sensor value frozen or missing', 'Screen or tablet not responding', 'Many alerts at the same time'],
    dos: ['Still acknowledge every alert', 'Check the line visually before judging it false', 'Label it as false alarm with a short reason'],
    donts: ['Do not ignore or mute alerts', 'Do not switch off a sensor or screen yourself'],
    steps: [['Acknowledge anyway', 'Every alert is acknowledged. An ignored alert is the problem this hub is built to remove.'], ['Look at the line', 'Check the station visually. If anything is abnormal, follow the matching tutorial instead.'], ['Label it', 'If nothing is wrong, label it as false alarm and choose a reason. This trains the AI.'], ['Report system faults', 'Frozen data or screens are reported to the TL, who logs it for the system team.'], ['Review', 'False alarms are reviewed in the daily meeting so thresholds can be tuned.']],
    call: 'Team Leader, then the platform team for system faults', example: 'AI vision flags a dent but the panel is clean. A reflection from new lighting is suspected.' }
];

/* How the three solutions connect */
const SOLUTIONS = [
  { n: 'Solution 1', name: 'AI integrated with SCADA', role: 'Detects' },
  { n: 'Solution 2', name: 'Standardized Abnormality Response', role: 'Responds' },
  { n: 'Solution 3', name: 'Digital twin simulation', role: 'Changes the line' }
];

/* ---------- Solution 1 → 2: alert stream ----------
   Each template is one kind of detection the AI on SCADA data can raise.
   sev = severity suggested by Solution 1; the Team Leader confirms it. */
const AI_ALERT_TEMPLATES = [
  { code: 'QD', src: 'AI vision', station: 'Sealer · roof rear joint', line: 'Sealer', msg: 'Sealer bead gap detected', metric: 'Gap 4.2 mm, limit 2.0 mm', conf: 94, sev: 'S2' },
  { code: 'PR', src: 'SCADA limit', station: 'Body Welding 2 · gun 4', line: 'Body Welding 2', msg: 'Weld current below lower limit on 3 spots in a row', metric: '8.1 kA, window 8.5 to 10.5 kA', conf: 99, sev: 'S2' },
  { code: 'EQ', src: 'Predictive AI', station: 'Body Welding 1 · robot R3', line: 'Body Welding 1', msg: 'Servo vibration trend predicts a fault within 2 hours', metric: '7.8 mm/s, alert at 7.0', conf: 81, sev: 'S3' },
  { code: 'QD', src: 'AI vision', station: 'Paint · inspection booth', line: 'Paint', msg: 'Possible dent on left rear door', metric: 'Defect score 0.62', conf: 58, sev: 'S4' },
  { code: 'MT', src: 'SCADA + kanban', station: 'Assembly 1 · line side', line: 'Assembly 1', msg: 'HEV bracket stock below minimum', metric: 'Covers 22 min of production', conf: 97, sev: 'S2' },
  { code: 'SF', src: 'Safety PLC', station: 'Sealer · light curtain', line: 'Sealer', msg: 'Light curtain muting fault', metric: 'Interlock signal lost for 2.1 s', conf: 99, sev: 'S1' },
  { code: 'AI', src: 'Platform health', station: 'Paint · camera 2', line: 'Paint', msg: 'Camera feed frozen, AI vision paused', metric: 'No frames for 45 s', conf: 100, sev: 'S3' },
  { code: 'QD', src: 'AI vision', station: 'Body Welding 1 · underbody', line: 'Body Welding 1', msg: 'Spot weld missing on underbody panel', metric: '1 of 42 spots not found', conf: 91, sev: 'S1' }
];

/* ---------- Solution 3 → 2: line change packages ----------
   A package arrives when Solution 3 has validated a line change in the digital twin.
   changes are applied to the manual book when the package is published. */
const PKG_STAGES = ['Received', 'Impact reviewed', 'Manual published', 'Refresher', 'Go-live released'];
const PKG_BASE = [
  { id: 'LC-034', title: 'Welding gun 4 moved for the BEV underbody variant', area: 'Body Welding 2', daysAgo: 0, stage: 0, people: 24, trained: 0,
    sim: [['Cycle time', '58.0 s', '57.4 s'], ['Gun 4 reach', '92%', '100%'], ['Weld current window', '8.5 to 10.5 kA', '8.8 to 10.2 kA']],
    note: 'Digital twin confirmed reach and cycle time. The new position needs a narrower weld current window.',
    changes: [
      { code: 'PR', type: 'step', idx: 2, title: 'Allowed adjustment', text: 'For gun 4 after LC-034, the allowed current window is 8.8 to 10.2 kA. The TL may adjust only inside this window, then watch the next 3 units.' },
      { code: 'PR', type: 'sign', text: 'Gun 4 current near the new 8.8 kA lower limit' },
      { code: 'EQ', type: 'step', idx: 4, title: 'Hand over to Maintenance', text: 'Maintenance checks the gun 4 position against the LC-034 jig drawing first, then applies lockout and repairs.' }
    ] },
  { id: 'LC-031', title: 'Sealer robot path changed for the new HEV roof variant', area: 'Sealer', daysAgo: 6, stage: 4, people: 24, trained: 24,
    sim: [['Cycle time', '61.2 s', '60.5 s'], ['Bead length at rear corner', '100%', '96%']],
    note: 'Digital twin showed a shorter bead at the rear corner under the new path, so a check point was added.',
    changes: [
      { code: 'QD', type: 'step', idx: 2, title: 'Check neighbours', text: 'Check the 3 units before and the 3 after, including the roof rear joint added in LC-031. Two or more defects in one shift make it S2.' },
      { code: 'QD', type: 'sign', text: 'AI vision flags a short bead at the roof rear corner' }
    ] },
  { id: 'LC-028', title: 'Main conveyor speed raised for the higher production mix', area: 'Assembly 1', daysAgo: 14, stage: 4, people: 24, trained: 24,
    sim: [['Line speed', '4.6 m/min', '5.0 m/min'], ['Buffer after a 3 min stop', 'OK', 'OK']],
    note: 'Digital twin checked buffer stock and stop recovery at the new speed. Response targets stay the same.',
    changes: [
      { code: 'EQ', type: 'step', idx: 3, title: 'Wait for the TL', text: 'The TL checks if the fault is in the standard reset list. Since LC-028, conveyor overload and speed-sync faults are also on the list.' }
    ] }
];
/* Packages Solution 3 can send next (demo) */
const PKG_NEXT = [
  { id: 'LC-036', title: 'Line-side buffer moved for the BEV battery tray', area: 'Assembly 1', people: 18,
    sim: [['Walking distance per cycle', '14 m', '9 m'], ['Minimum stock cover', '30 min', '20 min']],
    note: 'Digital twin shortened walking distance but reduced the safe stock cover to 20 minutes.',
    changes: [
      { code: 'MT', type: 'step', idx: 1, title: 'Acknowledge and call', text: 'Acknowledge the alert. For the BEV battery tray after LC-036, less than 20 minutes of cover is S2.' },
      { code: 'MT', type: 'sign', text: 'Battery tray kanban card not returned within 10 minutes' }
    ] },
  { id: 'LC-037', title: 'Sealer nozzle changed to a wider type', area: 'Sealer', people: 20,
    sim: [['Bead width', '6 mm', '8 mm'], ['Sealer use per unit', '410 g', '455 g']],
    note: 'Digital twin validated coverage. The visual standard for a good bead changes.',
    changes: [
      { code: 'QD', type: 'step', idx: 3, title: 'TL confirms', text: 'The TL compares with the quality standard (8 mm bead after LC-037) and confirms the severity in the platform.' },
      { code: 'PR', type: 'sign', text: 'Sealer pressure below the new nozzle setting' }
    ] }
];

/* Severity check: answer in order, first yes decides */
const SEV_CHECK = [
  { q: 'Is anyone at risk of injury, or is there fire, smoke, or a leak?', yes: 'S1' },
  { q: 'Has a defective unit possibly passed to the next process or customer, or has the whole line stopped?', yes: 'S1' },
  { q: 'Has a station stopped, or has the same defect appeared on 2 or more units this shift?', yes: 'S2' },
  { q: 'Does it need action on the line now: a defect, a stop, or a value outside its limit?', no: 'S4' },
  { q: 'Can it be fixed at the station within the cycle, without stopping the line?', yes: 'S3', no: 'S2' }
];

/* Training quiz */
const QUIZ = [
  { q: 'An AI alert appears but you see nothing wrong on the line. What do you do first?',
    o: ['Ignore it, it is probably a false alarm', 'Acknowledge it, check the line, then label it', 'Mute the station screen', 'Wait until the TL notices'], a: 1,
    e: 'Every alert is acknowledged. If nothing is wrong, label it as a false alarm so the AI learns.' },
  { q: 'A missing weld is found on a car that already left your station. Which severity?',
    o: ['S1 Critical', 'S2 Major', 'S3 Minor', 'S4 Observation'], a: 0,
    e: 'A defect that may have passed downstream is S1. Containment must reach the units already moved on.' },
  { q: 'What is the proposed target for a Team Leader to arrive on an S2 abnormality?',
    o: ['Within 1 minute', 'Within 3 minutes', 'Within 15 minutes', 'By the end of the shift'], a: 1,
    e: 'S2 targets: acknowledge 1 min, TL on site 3 min, support 10 min, containment 15 min, restore 60 min.' },
  { q: 'The same sealer gap appears on 2 units in one shift. Which severity applies?',
    o: ['S4, it is only cosmetic', 'S3, fix it in station', 'S2, it is a repeat defect', 'No alert needed'], a: 2,
    e: 'A repeat defect in the same shift is S2 even if each one is small.' },
  { q: 'A robot fault can be reset. How many times may the operator reset it alone?',
    o: ['As many as needed', 'Once, then call the TL', 'Never, only Maintenance may touch it', 'Three times'], a: 1,
    e: 'One reset is allowed. A repeat fault needs the TL, who checks the standard reset list.' },
  { q: 'An S1 is not restored after 30 minutes. Who is notified automatically?',
    o: ['No one, the TL decides', 'The operator on the next shift', 'The Plant Manager', 'Logistics'], a: 2,
    e: 'The platform escalates an S1 to the Plant Manager when it is not restored within 30 minutes.' },
  { q: 'What happens to the tutorial after a new type of abnormality is solved?',
    o: ['Nothing, it is a one-off', 'The Group Leader updates it with the countermeasure', 'It is deleted', 'Only Engineering may read it'], a: 1,
    e: 'Closing the kaizen loop: the GL records the countermeasure and updates the tutorial for the next shift.' },
  { q: 'Torque is out of range and the change is not on the parameter card. What does the TL do?',
    o: ['Adjust the setting anyway', 'Keep running and watch', 'Call Process Engineering and treat it as S2', 'Switch off the torque tool'], a: 2,
    e: 'Only adjustments on the parameter card are allowed. Anything else goes to Engineering as S2.' }
];

/* Simulated response log for the demo dashboard */
function seedLog() {
  const lines = ['Body Welding 1', 'Body Welding 2', 'Sealer', 'Paint', 'Assembly 1', 'Assembly 2'];
  const codes = ['EQ', 'QD', 'MT', 'PR', 'AI', 'QD', 'EQ', 'AI', 'PR', 'MT'];
  const sevs = ['S2', 'S3', 'S3', 'S2', 'S4', 'S1', 'S3', 'S4', 'S3', 'S2'];
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const out = [];
  for (let i = 0; i < 36; i++) {
    const sev = sevs[i % sevs.length];
    const t = SEVERITY[sev].t;
    const f = 0.45 + rnd() * 0.9;
    const ack = Math.max(0.3, +(t.ack * (0.4 + rnd() * 1.1)).toFixed(1));
    const restore = Math.round(t.restore * f);
    const d = new Date(); d.setHours(7, 0, 0, 0); d.setDate(d.getDate() - Math.floor(i / 5)); d.setMinutes(Math.floor(rnd() * 900));
    out.push({ id: 'AB-' + String(1240 - i), time: d.toISOString(), line: lines[Math.floor(rnd() * lines.length)], code: codes[i % codes.length], sev,
      ack, restore, within: ack <= t.ack && restore <= t.restore, status: i < 2 ? 'Open' : 'Closed' });
  }
  return out;
}
