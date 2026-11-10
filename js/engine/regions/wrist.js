/**
 * Region module: wrist. Findings, sections, correlated-test groups, conditions,
 * history gates, clusters, and insights.
 * Ported verbatim from reference/soap-note-generator-v8.html. Do not edit
 * likelihood ratios, priors, thresholds, labels, clusters, gates, or insight
 * text here: list concerns in docs/QUESTIONS.md instead.
 * tests/engine-source.spec.js compares this data and every function's source
 * text against the prototype.
 */
/* eslint-disable no-unused-vars */
import { CAP, SS, X, T } from '../evidence.js';
import { state, isChecked, isAssessed } from '../context.js';

const WR_FINDINGS = [
 ['rf_open','rf',null,'Open wound over a suspected fracture or exposed bone'],
 ['rf_deform','rf',null,'Gross deformity or suspected dislocation'],
 ['rf_nv','rf',null,'Pale or cold hand, absent radial pulse, or progressive numbness'],
 ['rf_compart','rf',null,'Forearm or hand pain out of proportion, or a tense compartment'],
 ['rf_bite','rf',null,'Wound over the knuckle from a tooth (fight bite)'],
 ['rf_infect','rf',null,'Spreading redness, a finger held flexed with pain on passive extension, or fever'],
 ['h_immature','h','Athlete and mechanism','Skeletally immature (open growth plates)'],
 ['h_acute','h','Athlete and mechanism','Acute onset with a specific moment'],
 ['h_insidious','h','Athlete and mechanism','Insidious or gradual onset'],
 ['h_foosh','h','Athlete and mechanism','Fall on an outstretched hand'],
 ['h_axial','h','Athlete and mechanism','Axial load to a finger (jammed on a ball)'],
 ['h_thumb_force','h','Athlete and mechanism','Forced thumb abduction or extension (fall on a planted thumb, ski pole, ball)'],
 ['h_punch','h','Athlete and mechanism','Punched an object or opponent'],
 ['h_gymnast','h','Athlete and mechanism','Weight bearing on the hands (gymnastics, cheer, tumbling, blocking)'],
 ['h_batgrip','h','Athlete and mechanism','Bat, stick, club, or racquet grip'],
 ['h_cyclist','h','Athlete and mechanism','Prolonged weight on the handlebars'],
 ['h_repet','h','Athlete and mechanism','Repetitive gripping, wringing, or wrist loading'],
 ['h_jersey','h','Athlete and mechanism','Finger forcibly extended while gripping (jersey, mat, rope)'],
 ['h_loc_radial','h','Pain location','Radial wrist or base of the thumb'],
 ['h_loc_ulnar','h','Pain location','Ulnar wrist'],
 ['h_loc_dorsal','h','Pain location','Dorsal central wrist'],
 ['h_loc_palm_ulnar','h','Pain location','Ulnar palm (hypothenar)'],
 ['h_loc_finger','h','Pain location','A single finger or the thumb'],
 ['h_click_wrist','h','Symptoms','Clicking or clunking with forearm rotation or gripping'],
 ['h_weakgrip','h','Symptoms','Weak or painful grip'],
 ['h_numb_median','h','Symptoms','Numbness in the thumb, index, and middle fingers, or at night'],
 ['h_numb_ulnar','h','Symptoms','Numbness in the ring and small fingers'],
 ['h_cant_extend','h','Symptoms','Cannot straighten the fingertip'],
 ['h_cant_flex','h','Symptoms','Cannot bend the fingertip'],
 ['h_wb_pain','h','Symptoms','Dorsal wrist pain with weight bearing that builds over weeks'],
 ['o_deform_finger','o',null,'Finger deformity or dislocation'],
 ['o_mallet','o',null,'Fingertip droops at the DIP'],
 ['o_rotation','o',null,'Rotational malalignment of a finger in composite flexion'],
 ['o_swelling','o',null,'Swelling'],
 ['o_ecchym','o',null,'Ecchymosis'],
 ['o_ganglion','o',null,'Visible dorsal or volar lump'],
 ['o_atrophy_thenar','o',null,'Thenar atrophy'],
 ['p_snuffbox','p','Radial','Anatomic snuffbox','Sensitive but not specific for scaphoid fracture'],
 ['p_scaph_tub','p','Radial','Scaphoid tubercle (volar)'],
 ['p_1st_comp','p','Radial','First dorsal compartment / radial styloid'],
 ['p_ucl_thumb','p','Radial','Ulnar side of the thumb MCP'],
 ['p_distal_radius','p','Dorsal','Distal radius or distal radial physis'],
 ['p_sl','p','Dorsal','Scapholunate interval (just distal to Lister\u2019s tubercle)'],
 ['p_ulnar_fovea','p','Ulnar','Ulnar fovea (between ulnar styloid and FCU)'],
 ['p_hamate','p','Ulnar','Hook of the hamate (hypothenar)'],
 ['p_mc','p','Hand and fingers','Metacarpal shaft or neck'],
 ['p_finger_joint','p','Hand and fingers','PIP or DIP joint'],
 ['p_fdp','p','Hand and fingers','Volar finger / FDP insertion'],
 ['r_grip_weak','r','Function','Grip weakness vs. uninvolved side'],
 ['r_extload','r','Function','Pain with loaded wrist extension (push-up or handstand position)'],
 ['r_sup_pain','r','Function','Pain with resisted or end-range forearm rotation'],
 ['r_dip_flex','r','Function','Cannot flex the DIP in isolation'],
 ['r_dip_ext','r','Function','Extensor lag at the DIP'],
 ['r_pip_ext','r','Function','Cannot extend the PIP against resistance'],
 ['r_rom_loss','r','Function','Painful loss of wrist motion'],
 ['t_axial_thumb','t','Scaphoid','Longitudinal thumb compression'],
 ['t_watson','t','Carpal ligaments','Watson scaphoid shift','Positive = pain or a clunk as pressure is released'],
 ['t_ulnar_stress','t','Ulnar wrist','Ulnocarpal stress test','Ulnar deviation with axial load through forearm rotation'],
 ['t_press','t','Ulnar wrist','Press test (push up from a chair)'],
 ['t_druj','t','Ulnar wrist','DRUJ ballottement / piano key'],
 ['t_fovea','t','Ulnar wrist','Ulnar fovea sign'],
 ['t_hook_pull','t','Ulnar wrist','Hook of hamate pull test','Resisted flexion of the ring and small fingers with the wrist in ulnar deviation'],
 ['t_ucl30','t','Thumb','Thumb UCL valgus stress at 30\u00b0'],
 ['t_ucl0','t','Thumb','Thumb UCL valgus stress at 0\u00b0'],
 ['t_finkelstein','t','Thumb','Finkelstein / Eichhoff'],
 ['t_what','t','Thumb','WHAT test (wrist hyperflexion and abduction of the thumb)'],
 ['t_elson','t','Fingers','Elson test (central slip)'],
 ['t_phalen','t','Nerve',"Phalen's"],
 ['t_tinel_median','t','Nerve','Tinel at the carpal tunnel'],
 ['t_durkan','t','Nerve','Carpal compression (Durkan)'],
 ['t_tinel_guyon','t','Nerve','Tinel at Guyon\u2019s canal'],
 ['t_allen','t','Nerve','Allen test (vascular)'],
 ['n_median_sens','n','Neuro','Median sensory change (thumb, index, middle)'],
 ['n_ulnar_sens','n','Neuro','Ulnar sensory change (ring, small)'],
 ['n_radial_sens','n','Neuro','Radial sensory change (dorsal first web space)'],
 ['n_thenar','n','Neuro','Thenar weakness (thumb palmar abduction)'],
 ['n_intrinsic','n','Neuro','Interosseous weakness (finger abduction)'],
];
const WR_SECTIONS = [
 {id:'rf', title:'Red flag screen', kind:'check', intro:'Any checked item moves emergency action to the top of the report.'},
 {id:'h', title:'History', kind:'check', intro:'Check only what the athlete reported. Mechanism and exact location sort most of the wrist and hand differential.'},
 {id:'o', title:'Observation', kind:'check', intro:'Check what you saw. Always check finger rotation in composite flexion.'},
 {id:'p', title:'Palpation', kind:'tri', pos:'Tender', neg:'Not tender', intro:'Palpate by zone. Negatives count, especially the snuffbox and scaphoid tubercle.'},
 {id:'r', title:'Function, ROM, and strength', kind:'tri', pos:'Present', neg:'Absent', intro:'Test each tendon in isolation.'},
 {id:'t', title:'Special tests', kind:'tri', pos:'Positive', neg:'Negative', intro:'Tap "Evidence" on any test to see its accuracy for each condition it informs.'},
 {id:'n', title:'Neurovascular screen', kind:'tri', pos:'Positive', neg:'Negative', intro:'Median, ulnar, and radial sensation, plus thenar and interosseous strength.'},
];
const WR_GROUPS = {
  p_snuffbox:'scaph', p_scaph_tub:'scaph', t_axial_thumb:'scaph',
  t_fovea:'tfcc', p_ulnar_fovea:'tfcc', t_ulnar_stress:'tfcc', t_press:'tfcc',
  t_phalen:'ctn', t_tinel_median:'ctn', t_durkan:'ctn',
  t_ucl30:'ucl', t_ucl0:'ucl',
  t_finkelstein:'dq', t_what:'dq',
  n_median_sens:'neuro', n_ulnar_sens:'neuro', n_radial_sens:'neuro'
};
const WR_CONDITIONS = [
 {id:'wristsprain', name:'Wrist sprain (nonspecific)', prior:0.3, miss:'normal',
  ev:{ h_foosh:X(2), h_acute:X(1.5), o_swelling:X(1.3), r_rom_loss:X(1.5), p_snuffbox:X(.5), p_sl:X(.7), p_distal_radius:X(.5), h_wb_pain:X(.6) },
  plan:'A diagnosis of exclusion after scaphoid, distal radius, scapholunate, and TFCC injury have been ruled out. Re-evaluate at 10\u201314 days if pain persists.'},
 {id:'scaphoid', name:'Scaphoid fracture', prior:-1.5, miss:'high',
  ev:{ h_foosh:X(3), h_acute:X(1.5), h_loc_radial:X(2.5), p_snuffbox:X(1.6,.2), p_scaph_tub:X(2.5,.25), t_axial_thumb:X(1.6,.35), r_grip_weak:X(1.5), o_swelling:X(1.3) },
  plan:'Snuffbox tenderness is sensitive but not specific: most tender snuffboxes are not fractures, but a non-tender one makes a fracture unlikely. Any tenderness after a FOOSH gets thumb spica immobilization and radiographs; initial films are often negative, so re-image or advance imaging at 10\u201314 days. Missed scaphoid fractures go to nonunion and avascular necrosis.'},
 {id:'radiusfx', name:'Distal radius fracture (including physeal)', prior:-1.2, miss:'high',
  ev:{ rf_deform:X(CAP), h_foosh:X(3), h_acute:X(1.5), h_immature:X(1.5), p_distal_radius:X(3,.3), o_swelling:X(2), o_ecchym:X(1.5), r_rom_loss:X(1.5) },
  plan:'Radiographs and immobilization. In skeletally immature athletes, tenderness over the distal radial physis after a fall is a Salter-Harris injury until proven otherwise, even with normal films.'},
 {id:'gymnastwrist', name:'Distal radial physeal stress injury (gymnast wrist)', prior:-1.5, miss:'high',
  ev:{ h_immature:X(4), h_gymnast:X(3.5), h_insidious:X(2), h_wb_pain:X(3), h_loc_dorsal:X(1.5), p_distal_radius:X(3,.3), r_extload:X(3,.4), h_acute:X(.5) },
  plan:'Chronic dorsal wrist pain with weight bearing in a skeletally immature gymnast. Refer for radiographs (physeal widening). Untreated, it can cause growth arrest and positive ulnar variance. Rest from weight bearing is the treatment.'},
 {id:'sl', name:'Scapholunate ligament injury', prior:-2.0, miss:'high',
  ev:{ h_foosh:X(2.5), h_loc_dorsal:X(2.5), h_click_wrist:X(2), p_sl:X(3,.3), t_watson:X(2.5,.5), r_grip_weak:X(1.5), o_swelling:X(1.3) },
  plan:'Dorsal wrist pain and tenderness at the scapholunate interval after a FOOSH, with normal scaphoid findings. Missed injuries progress to carpal collapse; refer for radiographs including a clenched-fist view.'},
 {id:'tfcc', name:'TFCC injury', prior:-1.3, miss:'normal',
  ev:{ h_loc_ulnar:X(3.5), h_foosh:X(1.5), h_batgrip:X(1.5), h_click_wrist:X(2), h_weakgrip:X(1.5), p_ulnar_fovea:X(3,.3),
   t_fovea:T(5,.2,'TAY07'), t_ulnar_stress:X(3,.4), t_press:X(2.5,.5), t_druj:X(2,.7), r_sup_pain:X(2,.6) },
  plan:'Ulnar-sided wrist pain with a positive fovea sign suggests a foveal TFCC tear or ulnotriquetral ligament injury. Check DRUJ stability; instability or a failed trial of immobilization warrants referral.'},
 {id:'hamate', name:'Hook of hamate fracture', prior:-2.5, miss:'high',
  ev:{ h_batgrip:X(4), h_loc_palm_ulnar:X(4), h_weakgrip:X(2), h_numb_ulnar:X(1.5), p_hamate:X(4,.25), t_hook_pull:X(4,.5), h_acute:X(1.3) },
  plan:'Classic in bat, stick, and club sports; often missed because standard radiographs miss it (carpal tunnel view or CT). Nonunion is common, so refer any athlete with point tenderness over the hook.'},
 {id:'thumbucl', name:'Thumb UCL injury (skier\u2019s / gamekeeper\u2019s thumb)', prior:-1.0, miss:'high',
  ev:{ h_thumb_force:X(5), h_acute:X(1.5), h_loc_finger:X(1.5), p_ucl_thumb:X(3,.3), t_ucl30:X(5,.3), t_ucl0:X(3), o_swelling:X(1.5), r_grip_weak:X(1.5) },
  plan:'Gross laxity (over about 30\u00b0, or a clear side-to-side difference) suggests a complete tear and a possible Stener lesion, which will not heal without surgery. Radiograph before stressing to rule out an avulsion fracture, and refer complete tears.'},
 {id:'dequervain', name:'De Quervain tenosynovitis', prior:-1.5, miss:'normal',
  ev:{ h_repet:X(2.5), h_insidious:X(1.5), h_loc_radial:X(3), p_1st_comp:X(3,.3), t_finkelstein:X(3,.3), t_what:X(2.5,.5), p_snuffbox:X(1.2) },
  plan:'Thumb spica splinting, load modification, and eccentric loading. Distinguish from a scaphoid fracture by mechanism and by tenderness sitting over the first compartment rather than in the snuffbox.'},
 {id:'mallet', name:'Mallet finger (terminal extensor injury)', prior:-0.8, miss:'normal',
  ev:{ h_axial:X(3), h_cant_extend:X(4), o_mallet:X(8), r_dip_ext:X(6,.2), p_finger_joint:X(1.5), h_loc_finger:X(2) },
  plan:'Continuous DIP extension splinting for 6\u20138 weeks, without letting the joint drop during splint changes. Radiograph: a large bony mallet or volar subluxation needs referral.'},
 {id:'jersey', name:'Jersey finger (FDP avulsion)', prior:-2.0, miss:'high',
  ev:{ h_jersey:X(6), h_cant_flex:X(4), r_dip_flex:X(6,.15), p_fdp:X(3,.5), o_swelling:X(1.3), h_loc_finger:X(2) },
  plan:'Surgical, and time-sensitive: the tendon retracts. Refer within days, not weeks. Ring finger is most common.'},
 {id:'centralslip', name:'Central slip injury (boutonni\u00e8re)', prior:-2.0, miss:'high',
  ev:{ h_axial:X(2.5), p_finger_joint:X(2), r_pip_ext:X(4,.3), t_elson:X(5,.3), o_swelling:X(1.5), h_loc_finger:X(2) },
  plan:'Easy to miss early, because the deformity develops over days to weeks. Tenderness over the dorsal PIP after a jam plus a positive Elson test means PIP extension splinting and referral.'},
 {id:'volarplate', name:'PIP sprain / volar plate injury', prior:0, miss:'normal',
  ev:{ h_axial:X(3), h_loc_finger:X(2), p_finger_joint:X(2.5,.4), o_swelling:X(2), r_pip_ext:X(.7), t_elson:X(.5) },
  plan:'Buddy taping and early motion once fracture and central slip injury are excluded. Swelling and stiffness persist for months; warn the athlete.'},
 {id:'metacarpalfx', name:'Metacarpal or phalangeal fracture', prior:-0.8, miss:'high',
  ev:{ h_punch:X(4), h_axial:X(1.5), h_acute:X(1.5), p_mc:X(3,.3), o_rotation:X(8), o_ecchym:X(2), o_swelling:X(1.5), o_deform_finger:X(3) },
  plan:'Always check rotation in composite flexion: any scissoring needs referral regardless of what the film shows. Boxer\u2019s fractures tolerate angulation; rotation they do not.'},
 {id:'cts', name:'Carpal tunnel syndrome', prior:-2.0, miss:'normal',
  ev:{ h_numb_median:X(4), h_repet:X(1.5), h_insidious:X(1.5), o_atrophy_thenar:X(5), n_median_sens:X(3,.5), n_thenar:X(3,.7),
   t_phalen:X(2.5,.45), t_tinel_median:X(2,.65), t_durkan:X(3,.45), n_ulnar_sens:X(.6) },
  plan:'Uncommon in high school athletes: consider cervical radiculopathy and thoracic outlet syndrome first. Thenar atrophy or constant numbness warrants referral for electrodiagnostics.'},
 {id:'guyon', name:'Ulnar nerve compression at Guyon\u2019s canal (handlebar palsy)', prior:-2.5, miss:'normal',
  ev:{ h_numb_ulnar:X(4), h_cyclist:X(4), h_loc_palm_ulnar:X(2), n_ulnar_sens:X(3,.5), n_intrinsic:X(3,.7), t_tinel_guyon:X(3,.5), p_hamate:X(1.5), n_median_sens:X(.6) },
  plan:'Usually resolves with padded gloves, grip changes, and position changes. Persistent weakness needs referral; check for a hook of hamate fracture or a ganglion as the cause.'},
 {id:'ganglion', name:'Ganglion cyst', prior:-1.5, miss:'normal',
  ev:{ o_ganglion:X(8), h_insidious:X(1.5), h_loc_dorsal:X(1.5), p_sl:X(1.3) },
  plan:'Usually harmless and often self-resolving. Refer if it limits motion, causes nerve symptoms, or the diagnosis is unclear.'},
];
const WR_GATES = {
  scaphoid:[['h_foosh'],['p_snuffbox'],['p_scaph_tub'],['h_loc_radial','h_acute']],
  radiusfx:[['h_foosh'],['h_acute','p_distal_radius'],['rf_deform']],
  gymnastwrist:[['h_gymnast','h_wb_pain'],['h_immature','h_wb_pain'],['h_gymnast','h_insidious']],
  sl:[['h_foosh'],['p_sl'],['h_loc_dorsal','h_acute']],
  hamate:[['h_batgrip'],['h_loc_palm_ulnar'],['p_hamate']],
  thumbucl:[['h_thumb_force'],['p_ucl_thumb']],
  jersey:[['h_jersey'],['h_cant_flex'],['r_dip_flex']],
  centralslip:[['h_axial','h_loc_finger'],['r_pip_ext']],
  metacarpalfx:[['h_punch'],['h_acute','o_swelling'],['o_rotation'],['h_axial']],
};
for (const [k,v] of Object.entries(WR_GATES)) WR_CONDITIONS.find(c => c.id === k).gate = v;
const WR_CLUSTERS = [
 {id:'scaph', name:'Clinical scaphoid screen', cond:['scaphoid'], items:['p_snuffbox','p_scaph_tub','t_axial_thumb'],
  read(pos, tested, n){
   if (pos >= 2) return {tone:'bad', text:`${pos} of 3 positive: treat as a scaphoid fracture until imaging says otherwise. Thumb spica, radiographs now, and repeat imaging at 10\u201314 days if films are negative.`};
   if (pos === 1) return {tone:'warn', text:'One of three positive. These tests are sensitive and not specific, so a single positive still warrants immobilization and radiographs after a FOOSH.'};
   if (tested === n) return {tone:'good', text:'All three negative: scaphoid fracture unlikely (snuffbox and tubercle tenderness are sensitive).'};
   return null;
  }},
 {id:'ext', name:'Finger extensor and flexor integrity', cond:['mallet','jersey','centralslip','volarplate'], items:['r_dip_ext','r_dip_flex','r_pip_ext','t_elson'],
  read(pos, tested, n){
   const hits = [];
   if (isChecked('r_dip_ext')) hits.push('DIP extensor lag (mallet)');
   if (isChecked('r_dip_flex')) hits.push('no isolated DIP flexion (FDP avulsion: refer within days)');
   if (isChecked('r_pip_ext') || isChecked('t_elson')) hits.push('PIP extension deficit (central slip)');
   if (hits.length) return {tone:'bad', text:`Tendon findings: ${hits.join('; ')}.`};
   if (tested === n) return {tone:'good', text:'Isolated tendon testing normal: no mallet, FDP avulsion, or central slip injury.'};
   return null;
  }},
];
function wristInsights(A){
  const out = [];
  const {cand} = A;
  if (isChecked('h_foosh') && !['p_snuffbox','p_scaph_tub','p_distal_radius','p_sl'].every(isAssessed))
    out.push({tone:'bad', h:'Palpate the four FOOSH zones', p:'Snuffbox, scaphoid tubercle, distal radius (and physis in immature athletes), and the scapholunate interval. Each points to a different injury, and three of the four are costly to miss.'});
  if ((isChecked('p_snuffbox') || isChecked('p_scaph_tub')) && isChecked('h_foosh'))
    out.push({tone:'bad', h:'Treat as a scaphoid fracture', p:'Thumb spica immobilization and radiographs now. Normal initial films do not clear it: re-image at 10\u201314 days or refer for advanced imaging. Missed scaphoid fractures go to nonunion.'});
  if (isChecked('h_loc_finger') && !['r_dip_ext','r_dip_flex','r_pip_ext'].every(isAssessed))
    out.push({tone:'bad', h:'Test each tendon in isolation', p:'Block the joints and check DIP extension, isolated DIP flexion, and PIP extension against resistance before calling a finger injury a jam.'});
  if (isChecked('o_swelling') && isChecked('h_loc_finger') && !isAssessed('o_rotation') && !isChecked('o_rotation'))
    out.push({tone:'warn', h:'Check rotation', p:'Look at the fingers in composite flexion. Any scissoring means a rotated fracture and a referral, whatever the film shows.'});
  if (isChecked('h_immature') && isChecked('h_gymnast') && !isAssessed('p_distal_radius'))
    out.push({tone:'bad', h:'Young gymnast with wrist pain', p:'Palpate the distal radial physis. Chronic dorsal pain with weight bearing is a physeal stress injury until proven otherwise, and growth arrest is the consequence of missing it.'});
  if (isChecked('h_loc_ulnar') && !['p_ulnar_fovea','p_hamate'].every(isAssessed))
    out.push({tone:'warn', h:'Ulnar wrist pain: separate the zones', p:'The fovea (TFCC) and the hook of the hamate sit close together and are managed very differently. Palpate both, and check DRUJ stability.'});
  if (isChecked('h_thumb_force') && !isAssessed('t_ucl30'))
    out.push({tone:'warn', h:'Stress the thumb UCL', p:'Test at 30\u00b0 and at 0\u00b0, comparing sides, after radiographs have ruled out an avulsion. Gross laxity suggests a Stener lesion, which needs surgery.'});
  if (isChecked('h_numb_median') && !['n_median_sens','n_thenar'].every(isAssessed))
    out.push({tone:'warn', h:'Map the numbness', p:'Median distribution points to the carpal tunnel, ulnar to Guyon\u2019s canal or the cubital tunnel, and a dermatomal pattern with neck symptoms to the cervical spine.'});
  return out;
}

/** Region definition (same shape as the prototype's REG.wrist). */
export const WRIST = {label:'Wrist and hand', noun:'wrist/hand', findings:WR_FINDINGS, sections:WR_SECTIONS, groups:WR_GROUPS, conditions:WR_CONDITIONS, clusters:WR_CLUSTERS, insights:wristInsights,
  screen:{name:'Neurovascular screen', slots:[['n_median_sens'],['n_ulnar_sens'],['n_radial_sens'],['n_thenar','n_intrinsic']]},
  example:{primary:'wristsprain', state:{
    rf_screened:true, h_acute:true, h_foosh:true, h_loc_radial:true, o_swelling:true,
    p_snuffbox:'pos', p_distal_radius:'neg', p_sl:'neg', r_grip_weak:'pos', r_rom_loss:'pos',
    n_median_sens:'neg', n_ulnar_sens:'neg'}}};
export default WRIST;
