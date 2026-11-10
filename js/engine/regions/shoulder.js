/**
 * Region module: shoulder. Findings, sections, correlated-test groups, conditions,
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

/* ============================================================
   FINDINGS: [id, section, subgroup, label, hint]
   ============================================================ */
const SH_FINDINGS = [
 // Red flags
 ['rf_deform','rf',null,'Visible deformity, bony crepitus, or suspected fracture'],
 ['rf_disloc','rf',null,'Suspected unreduced dislocation (squared-off contour, locked position)'],
 ['rf_nv','rf',null,'Neurovascular compromise: pulse, color, temperature, or sensation'],
 ['rf_cspine','rf',null,'Bilateral arm symptoms, midline neck pain, or limited neck ROM after contact'],
 ['rf_sc','rf',null,'Posterior SC injury signs: dysphagia, dyspnea, voice change, venous congestion'],
 ['rf_cardiac','rf',null,'Shoulder or arm pain with exertional chest pain, dyspnea, or diaphoresis'],
 ['rf_kehr','rf',null,'Left shoulder pain after abdominal or flank trauma (Kehr\u2019s sign)'],
 ['rf_systemic','rf',null,'Fever, hot swollen joint, unexplained mass, or unrelenting night pain with systemic signs'],
 ['rf_vtos','rf',null,'Arm swelling, cyanosis, or distended shoulder or chest wall veins (possible effort thrombosis)'],
 ['rf_atos','rf',null,'Hand pallor or coldness, digital ulcers, or arm claudication (possible arterial compromise)'],
 // History
 ['h_overhead','h','Athlete and mechanism','Overhead or throwing sport'],
 ['h_contact','h','Athlete and mechanism','Contact or collision sport'],
 ['h_immature','h','Athlete and mechanism','Skeletally immature (roughly under 16)'],
 ['h_acute','h','Athlete and mechanism','Acute onset with a specific traumatic moment'],
 ['h_insidious','h','Athlete and mechanism','Insidious or gradual onset'],
 ['h_repetitive','h','Athlete and mechanism','Recent jump in overhead or throwing volume'],
 ['h_mech_abder','h','Athlete and mechanism','Forced abduction and external rotation (arm cocked)'],
 ['h_mech_post','h','Athlete and mechanism','Posterior force on a flexed, adducted arm (blocking, bench, fall forward)'],
 ['h_mech_point','h','Athlete and mechanism','Fall or blow onto the point of the shoulder'],
 ['h_mech_traction','h','Athlete and mechanism','Sudden traction or eccentric load on the arm'],
 ['h_mech_foosh','h','Athlete and mechanism','Fall on an outstretched hand'],
 ['h_loc_antlat','h','Pain location','Anterolateral or lateral deltoid region'],
 ['h_loc_ant','h','Pain location','Anterior, over the bicipital groove'],
 ['h_loc_top','h','Pain location','Top of the shoulder (AC region)'],
 ['h_loc_deep','h','Pain location','Deep inside, poorly localized'],
 ['h_loc_post','h','Pain location','Posterior shoulder'],
 ['h_loc_lathum','h','Pain location','Lateral proximal humerus in a thrower'],
 ['h_overheadpain','h','Symptoms','Pain with overhead activity'],
 ['h_night','h','Symptoms','Night pain or can\u2019t lie on the shoulder'],
 ['h_click','h','Symptoms','Clicking, catching, or locking'],
 ['h_slip','h','Symptoms','Shoulder "slips out" or dead-arm episodes'],
 ['h_prevdisloc','h','Symptoms','Previous dislocation or subluxation'],
 ['h_weak','h','Symptoms','Reports weakness or can\u2019t lift the arm'],
 ['h_pop','h','Symptoms','Felt or heard a pop with immediate weakness'],
 ['h_stiff','h','Symptoms','Progressive global stiffness'],
 ['h_throwvel','h','Symptoms','Loss of throwing velocity or control'],
 ['h_laxity','h','Symptoms','Generalized hypermobility (e.g., Beighton 4 or more)'],
 ['h_neck','h','Symptoms','Neck pain or stiffness'],
 ['h_radiate','h','Symptoms','Symptoms radiate below the elbow'],
 ['h_paresth','h','Symptoms','Numbness or tingling in the arm or hand'],
 ['h_paresth_overhead','h','Symptoms','Arm symptoms worse with arms overhead or carrying loads'],
 ['h_ulnar','h','Symptoms','Tingling mainly in the 4th and 5th fingers'],
 ['h_fatigue_overhead','h','Symptoms','Arm heaviness or fatigue with sustained overhead use'],
 // Observation
 ['o_posture','o',null,'Forward head and rounded shoulders'],
 ['o_dyskin','o',null,'Scapular dyskinesis on repeated flexion or abduction'],
 ['o_winging_med','o',null,'Medial scapular winging'],
 ['o_atrophy_is','o',null,'Supraspinatus or infraspinatus fossa atrophy'],
 ['o_step','o',null,'AC step-off or prominent distal clavicle'],
 ['o_popeye','o',null,'Popeye deformity of the biceps'],
 ['o_swelling','o',null,'Swelling or ecchymosis'],
 ['o_guard','o',null,'Guarding, arm held to the side'],
 // Palpation
 ['p_groove','p',null,'Bicipital groove'],
 ['p_ac','p',null,'AC joint'],
 ['p_gt','p',null,'Greater tuberosity / supraspinatus insertion'],
 ['p_postjl','p',null,'Posterior joint line'],
 ['p_physis','p',null,'Lateral proximal humerus (physis)'],
 ['p_scalene','p',null,'Scalenes / supraclavicular fossa, reproducing arm symptoms'],
 ['p_pecmin','p',null,'Pec minor below the coracoid, reproducing arm symptoms'],
 // ROM and strength
 ['r_arc','r','ROM','Painful arc, roughly 60\u2013120\u00b0 abduction'],
 ['r_arc_high','r','ROM','Pain at end-range elevation, roughly 170\u2013180\u00b0'],
 ['r_painlim','r','ROM','Pain-limited AROM without a capsular pattern'],
 ['r_lag','r','ROM','Active ROM short of passive ROM'],
 ['r_erloss','r','ROM','Passive ER markedly restricted (capsular pattern)'],
 ['r_gird','r','ROM','IR deficit over 20\u00b0 vs. uninvolved side'],
 ['r_erweak','r','Strength','Resisted ER weakness'],
 ['r_abdweak','r','Strength','Resisted abduction weakness'],
 ['r_irweak','r','Strength','Resisted IR weakness'],
 ['r_peclen','r','Thoracic outlet mobility','Pec minor length shortened (supine, posterior acromion raised from table)'],
 ['r_firstrib','r','Thoracic outlet mobility','First rib elevated or hypomobile on springing'],
 // Special tests
 ['t_hk','t','Impingement and rotator cuff','Hawkins-Kennedy'],
 ['t_neer','t','Impingement and rotator cuff','Neer'],
 ['t_empty','t','Impingement and rotator cuff','Empty can (Jobe)','Positive = pain or weakness'],
 ['t_full','t','Impingement and rotator cuff','Full can','Positive = weakness'],
 ['t_droparm','t','Impingement and rotator cuff','Drop arm'],
 ['t_erlag','t','Impingement and rotator cuff','External rotation lag sign'],
 ['t_belly','t','Subscapularis','Belly press'],
 ['t_bearhug','t','Subscapularis','Bear hug'],
 ['t_liftoff','t','Subscapularis','Lift-off'],
 ['t_speed','t','Biceps and labrum',"Speed's"],
 ['t_yerg','t','Biceps and labrum',"Yergason's"],
 ['t_upper','t','Biceps and labrum','Uppercut'],
 ['t_obrien_deep','t','Biceps and labrum',"O'Brien active compression: deep pain or click",'Pain felt "inside" the joint'],
 ['t_dls','t','Biceps and labrum','Modified dynamic labral shear'],
 ['t_bl2','t','Biceps and labrum','Biceps load II'],
 ['t_crank','t','Biceps and labrum','Crank'],
 ['t_appre','t','Instability','Anterior apprehension','Positive = apprehension, not pain alone'],
 ['t_reloc','t','Instability','Relocation','Positive = relief of apprehension'],
 ['t_surprise','t','Instability','Surprise / anterior release'],
 ['t_loadshift','t','Instability','Load and shift'],
 ['t_sulcus','t','Instability','Sulcus sign'],
 ['t_jerk','t','Instability','Jerk test'],
 ['t_kim','t','Instability','Kim test'],
 ['t_porcellini','t','Instability','Porcellini','Positive = pain reduced when the humeral head is stabilized posteriorly (second maneuver)'],
 ['t_crossbody','t','AC joint','Cross-body adduction'],
 ['t_acresist','t','AC joint','AC resisted extension'],
 ['t_obrien_ac','t','AC joint',"O'Brien active compression: pain on top of shoulder"],
 ['t_sat','t','Scapula','Scapular assistance test'],
 ['t_srt','t','Scapula','Scapular retraction test'],
 ['t_adson','t','Thoracic outlet','Adson'],
 ['t_roos','t','Thoracic outlet','Roos / EAST'],
 ['t_wright','t','Thoracic outlet','Wright hyperabduction','Positive = symptom reproduction; pulse change alone is common in asymptomatic people'],
 ['t_costoclav','t','Thoracic outlet','Costoclavicular maneuver (military brace)'],
 ['t_supraclav','t','Thoracic outlet','Supraclavicular pressure (Morley)'],
 ['t_allen','t','Thoracic outlet','Allen maneuver'],
 ['t_cyriax','t','Thoracic outlet','Cyriax release test','Positive = symptom change (release phenomenon) during sustained passive shoulder girdle elevation'],
 ['t_crlf','t','Thoracic outlet','Cervical rotation-lateral flexion test (first rib)','Positive = lateral flexion blocked after full rotation away'],
 // Neuro and cervical
 ['n_derm','n','Neuro screen','Dermatomal sensory deficit'],
 ['n_myo','n','Neuro screen','Myotomal weakness'],
 ['n_reflex','n','Neuro screen','Diminished deep tendon reflex'],
 ['n_cxreprod','n','Cervical screen','Cervical AROM reproduces arm symptoms'],
 ['n_rot60','n','Cervical screen','Cervical rotation under 60\u00b0 toward involved side'],
 ['t_spurling','n','Cervical screen',"Spurling's A"],
 ['t_distract','n','Cervical screen','Cervical distraction','Positive = symptom relief'],
 ['t_ultta','n','Cervical screen','ULTT A (median nerve bias)'],
 ['n_pulse_asym','n','Vascular screen with provocation','Radial pulse asymmetry, compared bilaterally'],
 ['n_color','n','Vascular screen with provocation','Color, temperature, or capillary refill change'],
 ['n_spo2','n','Vascular screen with provocation','SpO\u2082 drop on the involved hand (pulse oximeter)'],
];


const SH_SECTIONS = [
 {id:'rf', title:'Red flag screen', kind:'check', intro:'Screen before provocative testing. Any checked item moves emergency action to the top of the report.'},
 {id:'h', title:'History', kind:'check', intro:'Check only what the athlete reported.'},
 {id:'o', title:'Observation', kind:'check', intro:'Check what you saw.'},
 {id:'p', title:'Palpation', kind:'tri', pos:'Tender', neg:'Not tender', intro:'Leave a site at "Not done" if you didn\u2019t palpate it. Negatives count as evidence.'},
 {id:'r', title:'ROM and strength', kind:'tri', pos:'Present', neg:'Absent', intro:'Record present, absent, or not assessed.'},
 {id:'t', title:'Special tests', kind:'tri', pos:'Positive', neg:'Negative', intro:'Tap "Evidence" on any test to see its accuracy for each condition it informs.'},
 {id:'n', title:'Neuro and cervical screen', kind:'tri', pos:'Positive', neg:'Negative', intro:'Shoulder pain is often referred. A documented negative screen is part of a complete evaluation.'},
];

/* Correlated tests: after the strongest in a group, others count at half weight */
const SH_GROUPS = {
  t_hk:'imp', t_neer:'imp',
  t_empty:'supra', t_full:'supra', r_abdweak:'supra',
  t_speed:'bic', t_yerg:'bic', t_upper:'bic', p_groove:'bic',
  t_obrien_deep:'lab', t_dls:'lab', t_bl2:'lab', t_crank:'lab',
  t_appre:'ant', t_reloc:'ant', t_surprise:'ant',
  t_jerk:'post', t_kim:'post', t_porcellini:'post',
  t_belly:'sub', t_bearhug:'sub', t_liftoff:'sub', r_irweak:'sub',
  t_adson:'tos', t_roos:'tos', t_wright:'tos', t_costoclav:'tos', t_supraclav:'tos', t_allen:'tos',
  t_crlf:'rib', r_firstrib:'rib', p_pecmin:'pm', r_peclen:'pm',
  n_pulse_asym:'vasc', n_color:'vasc', n_spo2:'vasc',
  t_sat:'scap', t_srt:'scap',
  n_derm:'neuro', n_myo:'neuro', n_reflex:'neuro'
};

/* ============================================================
   CONDITIONS
   prior: log-odds offset for a high school athlete population
          (0 common, about -0.7 uncommon, -1.5 or lower rare)
   miss:  'high' = costly to miss; kept in play on any support
   confirm: findings that must be positive before "Strong" is allowed
   ============================================================ */
const SH_CONDITIONS = [
 {id:'sais', name:'Subacromial pain / rotator cuff tendinopathy', prior:0, miss:'normal',
  ev:{
   h_overhead:X(1.5), h_insidious:X(1.5), h_repetitive:X(1.5), h_overheadpain:X(2), h_loc_antlat:X(2), h_night:X(1.3),
   o_posture:X(1.3), o_dyskin:X(1.3), p_gt:X(1.5,0.8),
   r_arc:SS(.75,.67,'MICH09'), t_hk:SS(.63,.62,'MICH09'), t_neer:SS(.81,.54,'MICH09'),
   t_empty:SS(.50,.87,'MICH09'), r_erweak:SS(.56,.87,'MICH09'), t_droparm:SS(.27,.88,'PARK05'),
   h_radiate:X(.6), h_paresth:X(.7), r_erloss:X(.5)
  },
  plan:'Clinical diagnosis; no imaging needed without red flags or failed conservative care. Address scapular control, posterior capsule, and load management.'},
 {id:'ftrct', name:'Full-thickness rotator cuff tear', prior:-2.0, miss:'high', confirm:['t_erlag','o_atrophy_is'],
  ev:{
   h_pop:X(3), h_weak:X(2), h_acute:X(1.5), h_immature:X(.3), o_atrophy_is:X(2.5), r_lag:X(3,.6),
   r_arc:X(2,.5), t_droparm:SS(.35,.88,'PARK05'), r_erweak:SS(.42,.90,'PARK05'),
   t_erlag:X(7,.5), t_full:SS(.77,.74,'ITOI99'), t_empty:SS(.77,.68,'ITOI99'), r_abdweak:X(2,.5)
  },
  plan:'Rare in adolescents; weakness is usually pain inhibition. If weakness persists once pain is controlled, or the ER lag sign is positive, refer for imaging.'},
 {id:'subscap', name:'Subscapularis tear or tendinopathy', prior:-1.5, miss:'normal',
  ev:{ t_belly:SS(.40,.98,'BARTH06'), t_bearhug:SS(.60,.92,'BARTH06'), t_liftoff:X(CAP,.82), r_irweak:X(3,.6), h_mech_abder:X(1.3), h_loc_ant:X(1.5) },
  plan:'Positive belly press or bear hug after trauma warrants physician referral.'},
 {id:'biceps', name:'Proximal biceps tendinopathy', prior:-0.3, miss:'normal',
  ev:{
   h_loc_ant:X(2), h_overhead:X(1.3), h_repetitive:X(1.3),
   p_groove:SS(.53,.54,'KIB09'), t_speed:SS(.54,.81,'KIB09'), t_upper:SS(.73,.78,'KIB09'), t_yerg:SS(.43,.79,'HOLT04')
  },
  plan:'Frequently coexists with subacromial pain and SLAP lesions; document which drives the presentation.'},
 {id:'slap', name:'SLAP / superior labral lesion', prior:-0.7, miss:'high', link:'biceps', confirm:['t_dls','t_bl2'],
  ev:{
   h_overhead:X(1.5), h_mech_traction:X(2.5), h_click:X(2), h_loc_deep:X(2), h_throwvel:X(1.5), h_slip:X(1.3), h_overheadpain:X(1.3),
   r_gird:X(1.5), t_obrien_deep:X(1.3,.8), t_dls:SS(.72,.98,'KIB09'), t_bl2:X(5,.3), t_crank:X(1.5,.8), t_speed:X(1.5,.8), t_upper:X(1.8,.6)
  },
  plan:'No single clinical test is accurate enough to confirm a SLAP lesion (Hegedus 2012). A strong pattern with mechanical symptoms warrants referral; MR arthrogram is the usual confirmation.'},
 {id:'antinst', name:'Anterior instability / Bankart lesion', prior:-0.3, miss:'high', confirm:['t_appre','t_reloc','t_surprise','h_prevdisloc'],
  ev:{
   h_mech_abder:X(4), h_slip:X(3), h_prevdisloc:X(5), h_contact:X(1.5), h_laxity:X(1.3),
   t_appre:SS(.72,.96,'FARB06'), t_reloc:SS(.81,.92,'FARB06'), t_surprise:SS(.64,.99,'LO04'), t_loadshift:X(3,.6)
  },
  plan:'First-time dislocation in a young contact athlete carries high recurrence risk; refer for physician evaluation and imaging before return to play.'},
 {id:'postinst', name:'Posterior instability / posterior labrum', prior:-1.2, miss:'high', confirm:['t_jerk','t_kim'],
  ev:{ h_mech_post:X(4), h_loc_post:X(2), p_postjl:X(2), h_contact:X(1.3), h_click:X(1.3),
   t_jerk:SS(.73,.98,'KIM04'), t_kim:SS(.80,.94,'KIM05'), t_loadshift:X(2,.7),
   t_porcellini:{p:CAP, n:0.2, s:'MOREY16', se:1.0, sp:.993, capped:true}, t_crank:X(1.3,.9) },
  plan:'Common and under-recognized in linemen and weightlifters. Painful jerk test predicts poorer response to nonoperative care; refer.'},
 {id:'mdi', name:'Multidirectional instability', prior:-1.2, miss:'normal',
  ev:{ h_laxity:X(4), h_insidious:X(1.3), h_slip:X(1.5), t_sulcus:X(4,.5), t_loadshift:X(2,.6), t_appre:X(1.5,.8) },
  plan:'Usually managed with prolonged dynamic stabilization rehab. Check other joints for hypermobility.'},
 {id:'acj', name:'AC joint sprain / separation', prior:0, miss:'normal',
  ev:{ h_mech_point:X(5), h_contact:X(1.5), h_loc_top:X(3), o_step:X(6), p_ac:SS(.96,.10,'WALT04'), r_arc_high:X(2.5),
   t_crossbody:SS(.77,.79,'CHRON04'), t_acresist:SS(.72,.85,'CHRON04'), t_obrien_ac:SS(.41,.95,'CHRON04') },
  plan:'Grade by Rockwood; visible deformity (type III and above) or suspected fracture needs radiographs. In lifters with insidious AC pain, consider distal clavicle osteolysis.'},
 {id:'intimp', name:'Internal impingement / GIRD (overhead athlete)', prior:-0.7, miss:'normal',
  ev:{ h_overhead:X(2.5), h_loc_post:X(2.5), h_throwvel:X(1.5), r_gird:X(3.5,.5), t_reloc:X(1.5,.8) },
  plan:'Compare total arc of motion, not IR alone. Address posterior capsule, thoracic mobility, scapular control, and throwing workload.'},
 {id:'scapdys', name:'Scapular dyskinesis (contributing factor)', prior:0, miss:'normal',
  ev:{ o_dyskin:X(4), o_posture:X(1.5), t_sat:X(3,.5), t_srt:X(3,.5), h_overhead:X(1.2) },
  plan:'Rarely a stand-alone diagnosis. A positive SAT or SRT means scapular correction changes symptoms or strength; build that into the plan.'},
 {id:'radic', name:'Cervical radiculopathy (referred)', prior:-1.2, miss:'high',
  ev:{ h_neck:X(2), h_radiate:X(3), h_paresth:X(2.5), n_derm:X(3,.6), n_myo:X(3,.6), n_reflex:X(3,.7), n_cxreprod:X(3,.6),
   t_spurling:SS(.50,.86,'WAIN03'), t_distract:SS(.44,.90,'WAIN03'), t_ultta:SS(.97,.22,'WAIN03'), n_rot60:SS(.89,.49,'WAIN03') },
  plan:'Progressive neuro deficit or myelopathic signs need prompt physician referral.'},
 {id:'stinger', name:'Brachial plexus neurapraxia (stinger / burner)', prior:-0.7, miss:'high',
  ev:{ h_contact:X(2.5), h_acute:X(2), h_paresth:X(3), h_radiate:X(2), n_myo:X(2.5,.7), n_derm:X(2), h_neck:X(1.2), t_spurling:X(1.5,.8) },
  plan:'Unilateral and transient only. Bilateral symptoms, neck pain, or limited cervical ROM is a cervical spine injury until proven otherwise. No return while strength or symptoms are abnormal; recurrent stingers need physician evaluation.'},
 {id:'tos', name:'Thoracic outlet syndrome (neurogenic)', prior:-1.5, miss:'normal',
  ev:{ h_paresth_overhead:X(4), h_paresth:X(2), h_ulnar:X(2), h_fatigue_overhead:X(2), p_scalene:X(3), p_pecmin:X(1.5), o_posture:X(1.3),
   t_adson:SS(.79,.76,'GILL01'), t_roos:SS(.84,.30,'GILL01'), t_wright:X(1.5,.6), t_costoclav:X(2,.6), t_supraclav:X(2.5,.6), t_allen:X(1.3,.8),
   t_cyriax:X(3,.6), t_crlf:X(2,.7), r_firstrib:X(2,.7), t_ultta:X(1.5,.5), n_derm:X(.6), n_reflex:X(.6), t_spurling:X(.7) },
  plan:'No single test or validated cluster confirms neurogenic TOS; provocative tests are frequently positive in asymptomatic people, so judge symptom reproduction across positions rather than pulse change. Localize the space (interscalene, costoclavicular, subcoracoid) to direct treatment, rule out cervical radiculopathy, and refer when symptoms persist or progress for physician evaluation and electrodiagnostics.'},
 {id:'pecmin', name:'Pectoralis minor syndrome (subcoracoid compression)', prior:-1.8, miss:'normal',
  ev:{ p_pecmin:X(4,.4), r_peclen:X(2.5,.6), t_wright:X(3,.6), o_posture:X(1.5), h_paresth_overhead:X(2), h_paresth:X(1.5), p_scalene:X(.8) },
  plan:'Often coexists with neurogenic TOS. Pec minor lengthening, scapular posterior tilt and upward rotation work, and posture; physician referral for persistent symptoms.'},
 {id:'vtos', name:'Vascular TOS (venous or arterial)', prior:-3.0, miss:'high',
  ev:{ rf_vtos:X(CAP), rf_atos:X(CAP), n_color:X(4,.7), n_spo2:X(4,.7), n_pulse_asym:X(2,.8), h_fatigue_overhead:X(1.5), t_adson:X(1.5), t_allen:X(1.5) },
  plan:'Rare but serious. Arm swelling or cyanosis after repetitive overhead exertion suggests effort thrombosis (Paget-Schroetter): same-day physician or emergency evaluation. Pallor, coldness, or digital ischemia suggests arterial compromise: urgent referral. Duplex ultrasound is the usual first test.'},
 {id:'lls', name:'Little League shoulder (proximal humeral epiphysiolysis)', prior:-2.0, miss:'high',
  ev:{ h_immature:X(5), h_overhead:X(2.5), h_loc_lathum:X(5), p_physis:X(5,.5), h_repetitive:X(2), h_throwvel:X(1.3) },
  plan:'Refer for bilateral comparison radiographs. Rest from throwing, then graded return with pitch-count limits.'},
 {id:'sspn', name:'Suprascapular neuropathy', prior:-2.0, miss:'normal',
  ev:{ o_atrophy_is:X(5), r_erweak:X(2.5,.7), h_overhead:X(1.5), h_loc_post:X(1.5), h_insidious:X(1.3), r_abdweak:X(1.5) },
  plan:'Isolated infraspinatus atrophy in an overhead athlete (volleyball servers, pitchers) warrants EMG and imaging referral.'},
 {id:'ltn', name:'Long thoracic nerve palsy', prior:-2.0, miss:'normal',
  ev:{ o_winging_med:X(8), h_mech_traction:X(1.5), h_contact:X(1.2) },
  plan:'Medial winging with weak serratus anterior; refer for EMG. Distinguish from lateral winging (trapezius / spinal accessory).'},
 {id:'bicrup', name:'Proximal biceps long head rupture', prior:-2.0, miss:'normal',
  ev:{ o_popeye:X(CAP), h_pop:X(3), o_swelling:X(1.5), h_loc_ant:X(1.5) },
  plan:'Refer. In a young athlete, look for associated rotator cuff or SLAP pathology.'},
 {id:'fx', name:'Clavicle or proximal humerus fracture', prior:-1.2, miss:'high',
  ev:{ rf_deform:X(CAP), h_mech_foosh:X(2), h_mech_point:X(2), o_swelling:X(2), o_guard:X(2), h_acute:X(1.5) },
  plan:'Immobilize and refer for radiographs. Check distal neurovascular status and document it.'},
];


/* Clinical prediction rules and validated combinations */
const SH_CLUSTERS = [
 {id:'mich', name:'Subacromial impingement cluster (Michener 2009)', cond:['sais'], items:['t_hk','t_neer','r_arc','t_empty','r_erweak'],
  read(pos, tested, n){
   if (pos >= 3) return {tone:'good', text:`${pos} of 5 positive. Three or more positive: +LR about 2.9. Supports subacromial pain.`};
   if (tested === n) return {tone:'warn', text:`${pos} of 5 positive. Two or fewer positive: \u2212LR about 0.34. Argues against subacromial pain.`};
   return null;
  }},
 {id:'park_sais', name:'Impingement triad (Park 2005)', cond:['sais'], items:['t_hk','r_arc','r_erweak'],
  read(pos, tested, n){
   if (pos === 3) return {tone:'good', text:'All three positive: post-test probability about 95% in the derivation cohort (adult clinic patients).'};
   return null;
  }},
 {id:'park_ft', name:'Full-thickness tear triad (Park 2005)', cond:['ftrct'], items:['r_arc','t_droparm','r_erweak'],
  read(pos, tested, n){
   if (pos === 3) return {tone:'warn', text:'All three positive: about 91% post-test probability in an adult cohort. Full-thickness tears are uncommon in adolescents, so probability here is lower; pain inhibition can mimic this pattern. Confirm with the ER lag sign after pain control.'};
   return null;
  }},
 {id:'wain', name:'Cervical radiculopathy cluster (Wainner 2003)', cond:['radic','stinger','tos'], items:['t_ultta','t_spurling','t_distract','n_rot60'],
  read(pos, tested, n){
   if (pos === 4) return {tone:'bad', text:'4 of 4 positive: +LR about 30. Post-test probability about 90% in the derivation cohort. Refer.'};
   if (pos === 3) return {tone:'warn', text:'3 of 4 positive: +LR about 6. Post-test probability about 65%.'};
   if (state.t_ultta === 'neg') return {tone:'good', text:'Negative ULTT A (sensitivity about 97%) makes cervical radiculopathy unlikely.'};
   return null;
  }},
 {id:'farb', name:'Anterior instability: apprehension plus relocation (Farber 2006)', cond:['antinst'], items:['t_appre','t_reloc'],
  read(pos, tested, n){
   if (pos === 2) return {tone:'bad', text:'Both positive (apprehension as the response): strongly supports anterior instability.'};
   if (tested === 2 && pos === 0) return {tone:'good', text:'Both negative: anterior instability is unlikely (relocation \u2212LR about 0.2).'};
   return null;
  }},
 {id:'tosbat', name:'TOS provocative battery (no validated cluster)', cond:['tos','pecmin','vtos'], items:['t_adson','t_roos','t_wright','t_costoclav','t_supraclav','t_cyriax'],
  read(pos, tested, n){
   if (pos >= 3) return {tone:'warn', text:`${pos} of ${tested} tested positions reproduce symptoms. Consistent reproduction across several positions supports neurogenic TOS; combining tests raises specificity (Gillard 2001). Pulse change without symptoms does not count.`};
   if (tested >= 4 && pos <= 1) return {tone:'good', text:`${pos} of ${tested} positive: neurogenic TOS less likely. Recheck the cervical spine and peripheral entrapment sites.`};
   return null;
  }},
 {id:'chron', name:'AC joint combination (Chronopoulos 2004)', cond:['acj'], items:['t_crossbody','t_acresist','t_obrien_ac'],
  read(pos, tested, n){
   if (pos === 3) return {tone:'good', text:'All three positive: specificity about 97% for AC joint pathology.'};
   if (tested === 3 && pos === 0) return {tone:'good', text:'All three negative: AC joint is an unlikely pain source.'};
   return null;
  }},
 {id:'kim', name:'Posterior labrum: jerk plus Kim (Kim 2005)', cond:['postinst'], items:['t_jerk','t_kim'],
  read(pos, tested, n){
   if (pos >= 1) return {tone:'bad', text:`${pos} of 2 positive. Either test positive supports a posterior-inferior labral lesion; the pair together was reported at about 97% sensitivity.`};
   if (tested === 2) return {tone:'good', text:'Both negative: posterior-inferior labral lesion unlikely.'};
   return null;
  }},
];

/* History gates: a costly-to-miss condition is only expected to be tested
   when something in the history, mechanism, or exam points to it (OR of AND-groups). */
const SH_GATES = {
  ftrct:[['h_pop'],['h_weak'],['o_atrophy_is']],
  slap:[['h_mech_traction'],['h_click'],['h_loc_deep'],['h_throwvel']],
  antinst:[['h_mech_abder'],['h_slip'],['h_prevdisloc']],
  postinst:[['h_mech_post'],['h_loc_post']],
  radic:[['h_neck'],['h_radiate'],['h_paresth']],
  stinger:[['h_contact','h_paresth'],['h_contact','h_radiate']],
  lls:[['h_immature','h_overhead'],['h_loc_lathum']],
  vtos:[['rf_vtos'],['rf_atos'],['n_color'],['n_spo2'],['h_fatigue_overhead','h_paresth_overhead']],
  fx:[['h_mech_foosh'],['h_mech_point'],['h_acute','o_guard']],
};

for (const [k,v] of Object.entries(SH_GATES)) SH_CONDITIONS.find(c => c.id === k).gate = v;

function shoulderInsights(A){
  const out = [];
  const {R, dx, mine, cand} = A;
  if (isChecked('t_droparm') && !isAssessed('t_erlag'))
    out.push({tone:'warn', h:'Explain the positive drop arm', p:'Drop arm is one of the few specific cuff findings you entered. In a high school athlete a full-thickness tear is uncommon, and pain inhibition often produces the same result. Re-test after pain modulation and add the ER lag sign; persistent weakness or a positive lag sign warrants imaging referral.'});
  if ((isChecked('t_hk') || isChecked('t_neer')) && !isChecked('r_arc') && !isChecked('t_empty') && !isChecked('r_erweak'))
    out.push({tone:'warn', h:'Hawkins-Kennedy and Neer are sensitive, not specific', p:'On their own, positives mostly tell you the subacromial space is irritable. Painful arc and resisted ER carry more diagnostic weight.'});
  if ((mine.has('biceps') || cand.has('biceps')) && !['t_speed','t_upper','t_yerg','p_groove'].some(isAssessed))
    out.push({tone:'bad', h:'Biceps diagnosis without biceps tests', p:'No biceps-specific findings were entered. Add bicipital groove palpation, uppercut (the most accurate of the group in Kibler 2009), and Speed\u2019s.'});
  if (mine.has('biceps') && R.sais.band.pts >= 85)
    out.push({tone:'warn', h:'Biceps and subacromial pain travel together', p:'The findings strongly support subacromial pain. If biceps findings are also positive, document both and decide which is driving function.'});
  if (cand.has('slap') && !['t_dls','t_bl2'].some(isAssessed))
    out.push({tone:'warn', h:'Rule out a superior labral lesion', p:'With biceps involvement or overhead mechanics in play, add the modified dynamic labral shear and biceps load II. No single test confirms SLAP; a consistent history (traction mechanism, deep pain, mechanical symptoms) plus positive tests justifies referral.'});
  const postT = ['t_jerk','t_kim','t_porcellini'];
  if (postT.some(isChecked) && postT.some(f => state[f] === 'neg'))
    out.push({tone:'warn', h:'Posterior labral tests disagree', p:'Jerk and Kim are the best-validated pair (Kim 2005); Porcellini\u2019s near-perfect accuracy comes from a single developer study. Kim targets the posteroinferior labrum, so a negative Kim with a positive Porcellini can reflect a more posterior or posterosuperior lesion, or a false positive. ' + (isAssessed('t_jerk') ? 'Weigh history (posterior load mechanism, posterior pain) and posterior joint line tenderness; persistent symptoms justify MR arthrogram referral.' : 'Run the jerk test to break the tie, and grade posterior translation with load and shift.')});
  if (cand.has('tos') || cand.has('pecmin') || mine.has('tos') || mine.has('pecmin')){
    const spaces = {Interscalene:['t_adson','p_scalene','t_supraclav'], Costoclavicular:['t_costoclav','t_crlf','r_firstrib'], Subcoracoid:['t_wright','p_pecmin','r_peclen']};
    const summary = Object.entries(spaces).map(([k,v]) => `${k}: ${v.filter(isChecked).length} positive, ${v.filter(f => !isAssessed(f)).length} not tested`).join('. ');
    out.push({tone:'warn', h:'Localize the compression', p:`${summary}. The space with the most symptom reproduction directs treatment (scalene work, first rib mobilization, or pec minor lengthening).`});
    if (!['n_derm','n_myo','n_reflex','t_spurling'].every(isAssessed))
      out.push({tone:'warn', h:'Rule out the neck', p:'Cervical radiculopathy is the main TOS mimic. Complete the neuro screen and the Wainner cluster.'});
    if (isChecked('t_adson') && !['n_color','n_spo2'].some(isAssessed) && !['h_paresth','h_paresth_overhead'].some(isChecked))
      out.push({tone:'warn', h:'Pulse change is not a diagnosis', p:'A diminished pulse on Adson is common in asymptomatic people. Count a test positive for neurogenic TOS only when it reproduces the athlete\u2019s symptoms; use a pulse oximeter and bilateral comparison for the vascular question.'});
  }
  if (isChecked('o_posture') && !['t_sat','t_srt'].some(isAssessed))
    out.push({tone:'warn', h:'Posture noted but not tested', p:'Run the scapular assistance and scapular retraction tests. If correcting the scapula changes pain or strength, scapular control belongs in the diagnosis and the plan.'});
  if (['h_paresth','h_radiate'].some(isChecked) && !['n_derm','n_myo','n_reflex'].every(isAssessed))
    out.push({tone:'bad', h:'Arm symptoms without a complete neuro screen', p:'Complete dermatomes, myotomes, and reflexes, then the cervical screen.'});
  if (isChecked('h_immature') && isChecked('h_overhead') && !isAssessed('p_physis'))
    out.push({tone:'warn', h:'Skeletally immature thrower', p:'Palpate the lateral proximal humerus. Tenderness there points to Little League shoulder and needs comparison radiographs.'});
  if (isChecked('h_contact') && isChecked('h_paresth') && !isAssessed('n_myo'))
    out.push({tone:'bad', h:'Possible stinger', p:'Test C5\u2013C6 myotomes (deltoid, biceps, spinati) and confirm symptoms are unilateral and resolved before any return.'});
  return out;
}

/** Region definition (same shape as the prototype's REG.shoulder). */
export const SHOULDER = {label:'Shoulder', noun:'shoulder', findings:SH_FINDINGS, sections:SH_SECTIONS, groups:SH_GROUPS, conditions:SH_CONDITIONS, clusters:SH_CLUSTERS, insights:shoulderInsights,
    screen:{name:'Neuro and cervical screen', slots:[['n_derm'],['n_myo'],['n_reflex'],['n_cxreprod','t_spurling']]},
    example:{primary:'biceps', state:{
      rf_screened:true, h_overheadpain:true, o_posture:true,
      r_arc:'pos', r_painlim:'pos', r_erweak:'pos', r_abdweak:'pos',
      t_hk:'pos', t_neer:'pos', t_empty:'pos', t_full:'pos', t_droparm:'pos',
      n_derm:'neg', n_myo:'neg', n_reflex:'neg'}}};
export default SHOULDER;
