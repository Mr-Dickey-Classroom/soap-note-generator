/**
 * Region module: hip. Findings, sections, correlated-test groups, conditions,
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

const HP_FINDINGS = [
 ['rf_deform','rf',null,'Shortened, rotated leg or suspected hip dislocation or fracture'],
 ['rf_nv','rf',null,'Distal pulse, sensation, or sciatic nerve deficit after hip trauma'],
 ['rf_infect','rf',null,'Fever with a painful hip or refusal to bear weight (possible septic joint)'],
 ['rf_testicular','rf',null,'Testicular or scrotal pain or swelling (possible torsion)'],
 ['rf_hernia','rf',null,'Painful groin bulge that won\u2019t reduce'],
 ['rf_systemic','rf',null,'Constant night pain, unexplained weight loss, or a mass'],
 ['h_immature','h','Athlete and mechanism','Skeletally immature (open growth plates)'],
 ['h_kicking','h','Athlete and mechanism','Kicking sport (soccer, football kicker)'],
 ['h_sprint','h','Athlete and mechanism','Sprinting or explosive starts'],
 ['h_cutting','h','Athlete and mechanism','Cutting, pivoting, or deep-flexion sport (hockey, catcher, dance)'],
 ['h_runner','h','Athlete and mechanism','Distance running or recent jump in running volume'],
 ['h_contact','h','Athlete and mechanism','Contact or collision sport'],
 ['h_acute','h','Athlete and mechanism','Acute onset with a specific moment'],
 ['h_insidious','h','Athlete and mechanism','Insidious or gradual onset'],
 ['h_mech_kick','h','Athlete and mechanism','Injured while kicking or at a sprint start'],
 ['h_mech_ham','h','Athlete and mechanism','Forced hip flexion with the knee straight (high kick, split, slip)'],
 ['h_mech_splits','h','Athlete and mechanism','Forced abduction or a slide into a split'],
 ['h_mech_direct','h','Athlete and mechanism','Direct blow to the iliac crest or lateral hip'],
 ['h_pop','h','Athlete and mechanism','Felt or heard a pop'],
 ['h_loc_groin','h','Pain location','Deep anterior groin (C-sign)'],
 ['h_loc_adductor','h','Pain location','Medial groin, adductor origin'],
 ['h_loc_inguinal','h','Pain location','Inguinal canal or lower abdominal wall'],
 ['h_loc_pubic','h','Pain location','Pubic symphysis'],
 ['h_loc_lat','h','Pain location','Lateral hip over the greater trochanter'],
 ['h_loc_buttock','h','Pain location','Buttock or ischial tuberosity'],
 ['h_loc_knee','h','Pain location','Thigh or knee pain'],
 ['h_click','h','Symptoms','Clicking, catching, or locking in the hip'],
 ['h_snap','h','Symptoms','Snapping sensation'],
 ['h_sitting','h','Symptoms','Pain with prolonged sitting'],
 ['h_sidelying','h','Symptoms','Pain lying on the affected side'],
 ['h_cough','h','Symptoms','Pain with coughing, sneezing, or sit-ups'],
 ['h_wb_pain','h','Symptoms','Pain with weight bearing that builds with each run'],
 ['h_night','h','Symptoms','Night pain or pain at rest'],
 ['h_limp','h','Symptoms','Limp noticed by the athlete, coach, or parent'],
 ['h_restrict','h','Symptoms','Low energy availability or menstrual irregularity (RED-S risk)'],
 ['h_back','h','Symptoms','Low back pain'],
 ['h_hipsport','h','Athlete and mechanism','End-range hip sport (dance, gymnastics, cheer, martial arts, figure skating)'],
 ['h_giveway_hip','h','Symptoms','Hip apprehension or giving way in extension and external rotation'],
 ['h_laxity','h','Symptoms','Generalized hypermobility (Beighton 4 or more)'],
 ['h_numb_lat','h','Symptoms','Burning or numbness on the lateral thigh'],
 ['h_tightbelt','h','Symptoms','Tight belts, hip pads, or equipment over the front of the hip'],
 ['o_limp','o',null,'Antalgic or Trendelenburg gait'],
 ['o_extrot','o',null,'Leg held in external rotation'],
 ['o_ecchym','o',null,'Ecchymosis'],
 ['o_snap_visible','o',null,'Visible lateral snapping with hip motion'],
 ['p_asis','p','Apophyses','ASIS (sartorius origin)'],
 ['p_aiis','p','Apophyses','AIIS (rectus femoris origin)'],
 ['p_ischial','p','Apophyses','Ischial tuberosity'],
 ['p_crest','p','Apophyses','Iliac crest'],
 ['p_adductor','p','Groin','Adductor longus origin'],
 ['p_pubic','p','Groin','Pubic symphysis'],
 ['p_inguinal','p','Groin','Inguinal canal / superficial ring'],
 ['p_psoas','p','Groin','Iliopsoas (below the inguinal ligament)'],
 ['p_gt','p','Lateral and posterior','Greater trochanter'],
 ['p_prox_ham','p','Lateral and posterior','Proximal hamstring tendon'],
 ['r_nwb','r','Function','Unable to bear weight'],
 ['r_slr_active','r','Function','Unable to actively straight-leg raise'],
 ['r_ir_loss','r','ROM','Hip IR limited vs. uninvolved side'],
 ['r_flex_loss','r','ROM','Hip flexion limited'],
 ['r_drehmann','r','ROM','Hip rolls into ER with passive hip flexion (Drehmann sign)'],
 ['r_res_add','r','Resisted tests','Resisted adduction reproduces groin pain'],
 ['r_res_flex','r','Resisted tests','Resisted hip flexion reproduces pain'],
 ['r_res_abd','r','Resisted tests','Resisted abduction painful or weak'],
 ['r_res_ham','r','Resisted tests','Resisted knee flexion / hip extension reproduces buttock pain'],
 ['r_res_situp','r','Resisted tests','Resisted sit-up reproduces inguinal pain'],
 ['t_fadir','t','Intra-articular','FADIR (anterior impingement)'],
 ['t_faber','t','Intra-articular','FABER (Patrick)','Positive = groin pain (hip) or posterior pain (SI joint)'],
 ['t_scour','t','Intra-articular','Scour'],
 ['t_logroll','t','Intra-articular','Log roll'],
 ['t_abheer','t','Microinstability','AB-HEER (abduction-hyperextension-external rotation)','Positive = anterior hip pain that eases with a posteriorly directed force on the greater trochanter'],
 ['t_heer','t','Microinstability','HEER (hyperextension-external rotation)','Positive = anterior hip pain in hyperextension and ER'],
 ['t_prone_inst','t','Microinstability','Prone instability test','Positive = anterior pain with an anterior force on the greater trochanter in prone ER'],
 ['t_dial_hip','t','Microinstability','Hip dial test','Positive = leg rolls well past 45\u00b0 from vertical with little or no recoil'],
 ['t_squeeze','t','Groin','Adductor squeeze test','Positive = groin pain'],
 ['t_thomas','t','Muscle length','Thomas test','Positive = hip lifts off the table or pain'],
 ['t_ely','t','Muscle length',"Ely's test"],
 ['t_ober','t','Muscle length','Ober'],
 ['t_bks','t','Hamstring','Bent-knee stretch'],
 ['t_puranen','t','Hamstring','Puranen-Orava'],
 ['t_sls30','t','Lateral hip','Single-leg stance for 30 seconds','Positive = lateral hip pain'],
 ['t_red','t','Lateral hip','Resisted external derotation'],
 ['t_snap_int','t','Snapping','Iliopsoas snapping maneuver (flexed-abducted-ER to extension)'],
 ['t_hop','t','Stress fracture','Single-leg hop','Positive = groin or thigh pain'],
 ['t_fulcrum','t','Stress fracture','Fulcrum test (femoral shaft)'],
 ['n_derm','n','Neuro','Dermatomal sensory deficit'],
 ['n_myo','n','Neuro','Myotomal weakness'],
 ['n_reflex','n','Neuro','Diminished patellar or Achilles reflex'],
 ['n_lfcn_sens','n','Nerve entrapment','Sensory change in the lateral thigh (LFCN distribution)'],
 ['t_tinel_lfcn','n','Nerve entrapment','Tinel just medial to the ASIS (LFCN)'],
 ['t_pelviccomp','n','Nerve entrapment','Pelvic compression test','Side-lying lateral compression for 45 s; positive = symptom relief'],
 ['t_slr','n','Lumbar screen','Straight leg raise'],
];
const HP_SECTIONS = [
 {id:'rf', title:'Red flag screen', kind:'check', intro:'Groin pain has non-musculoskeletal causes. Any checked item moves emergency action to the top of the report.'},
 {id:'h', title:'History', kind:'check', intro:'Check only what the athlete reported. Age and pain location sort most of the hip and groin differential.'},
 {id:'o', title:'Observation', kind:'check', intro:'Check what you saw.'},
 {id:'p', title:'Palpation', kind:'tri', pos:'Tender', neg:'Not tender', intro:'In adolescents, palpate each apophysis.'},
 {id:'r', title:'Function, ROM, and resisted tests', kind:'tri', pos:'Present', neg:'Absent', intro:'Record present, absent, or not assessed.'},
 {id:'t', title:'Special tests', kind:'tri', pos:'Positive', neg:'Negative', intro:'Tap "Evidence" on any test to see its accuracy for each condition it informs.'},
 {id:'n', title:'Neuro and lumbar screen', kind:'tri', pos:'Positive', neg:'Negative', intro:'Hip, groin, and buttock pain can be referred from the lumbar spine.'},
];
const HP_GROUPS = {
  t_fadir:'ia', t_faber:'ia', t_scour:'ia', t_logroll:'ia',
  t_sls30:'gt', t_red:'gt',
  t_abheer:'mi', t_heer:'mi', t_prone_inst:'mi',
  t_bks:'ham', t_puranen:'ham', r_res_ham:'ham',
  t_pelviccomp:'lfcn', t_tinel_lfcn:'lfcn', n_lfcn_sens:'lfcn',
  n_derm:'neuro', n_myo:'neuro', n_reflex:'neuro'
};
const HP_CONDITIONS = [
 {id:'fai', name:'Femoroacetabular impingement / labral tear', prior:-1.0, miss:'normal',
  ev:{ h_loc_groin:X(3), h_click:X(2.5), h_sitting:X(2), h_cutting:X(1.3), h_insidious:X(1.3), h_immature:X(.8), h_acute:X(.8),
   r_ir_loss:X(2,.6), r_flex_loss:X(1.5), t_fadir:T(1.2,.3,'REIM15'), t_faber:X(1.5,.7), t_scour:X(2,.6), t_logroll:X(3,.9) },
  plan:'FADIR is highly sensitive but nonspecific: a negative test helps rule out intra-articular pathology; a positive one mostly says the hip is irritable. Persistent mechanical symptoms warrant physician referral and imaging.'},
 {id:'hipmi', name:'Hip microinstability', prior:-1.5, miss:'normal',
  ev:{ h_giveway_hip:X(4), h_laxity:X(3), h_hipsport:X(2), h_loc_groin:X(1.5), h_insidious:X(1.3), h_click:X(1.3),
   t_abheer:SS(.806,.894,'HOPPE17'), t_heer:SS(.71,.851,'HOPPE17'), t_prone_inst:SS(.339,.979,'HOPPE17'), t_dial_hip:X(3,.7), t_fadir:X(1.1) },
  plan:'Often coexists with FAI, labral tears, and borderline dysplasia, so a positive impingement test doesn\u2019t exclude it. Refer for radiographs (acetabular coverage) and MRI arthrogram when suspicion persists. Management centers on dynamic stabilization: deep hip rotators, gluteals, and avoiding end-range extension-ER loading.'},
 {id:'adductor', name:'Adductor-related groin pain / adductor strain', prior:-0.3, miss:'normal',
  ev:{ h_kicking:X(2), h_cutting:X(1.5), h_mech_splits:X(3), h_loc_adductor:X(4), h_acute:X(1.3), p_adductor:X(4,.3), r_res_add:X(3,.3), t_squeeze:X(3,.5) },
  plan:'Doha definition: adductor tenderness plus pain on resisted adduction. Progressive adductor strengthening (Copenhagen adduction) is both treatment and prevention.'},
 {id:'iliopsoas', name:'Iliopsoas-related groin pain', prior:-1.0, miss:'normal',
  ev:{ h_loc_groin:X(1.5), h_kicking:X(1.5), h_snap:X(1.3), p_psoas:X(3,.5), r_res_flex:X(2.5,.6), t_thomas:X(2,.7) },
  plan:'Doha definition: iliopsoas tenderness, more likely with pain on resisted hip flexion or stretch.'},
 {id:'rectus', name:'Rectus femoris strain', prior:-0.8, miss:'normal',
  ev:{ h_sprint:X(2), h_kicking:X(2.5), h_mech_kick:X(3), h_acute:X(1.5), h_immature:X(.6), p_aiis:X(1.5), r_res_flex:X(2.5,.6), t_ely:X(2.5,.6) },
  plan:'In adolescents, the same mechanism more often avulses the AIIS apophysis; palpate it.'},
 {id:'avulsion', name:'Apophyseal avulsion fracture (ASIS, AIIS, ischial tuberosity)', prior:-1.8, miss:'high',
  ev:{ h_immature:X(4), h_pop:X(3), h_mech_kick:X(3), h_acute:X(2), h_sprint:X(1.5), h_mech_ham:X(2),
   p_asis:X(3,.7), p_aiis:X(3,.7), p_ischial:X(3,.7), r_slr_active:X(3), o_ecchym:X(2), o_limp:X(1.5), r_nwb:X(2) },
  plan:'Refer for radiographs. Most are managed with protected weight bearing and graded return; displaced ischial avulsions (roughly 2 cm or more) may need surgery.'},
 {id:'apophysitis', name:'Pelvic apophysitis', prior:-1.5, miss:'normal',
  ev:{ h_immature:X(4), h_insidious:X(2), h_runner:X(1.5), h_kicking:X(1.5), h_acute:X(.5), p_crest:X(2,.7), p_asis:X(2,.7), p_aiis:X(2,.7), p_ischial:X(2,.7) },
  plan:'Overuse traction at an open apophysis. Load management; a sudden increase in pain suggests avulsion.'},
 {id:'hamstring', name:'Proximal hamstring strain or tendinopathy', prior:-0.7, miss:'normal',
  ev:{ h_sprint:X(2.5), h_mech_ham:X(3), h_loc_buttock:X(3), h_sitting:X(1.5), h_immature:X(.8), p_prox_ham:X(3,.4), r_res_ham:X(3,.4),
   t_bks:T(5,.25,'CACC12'), t_puranen:T(3.5,.35,'CACC12') },
  plan:'Stretching-type injuries (high kick, split) take longer to recover than sprinting-type. In immature athletes, rule out ischial avulsion.'},
 {id:'gtps', name:'Greater trochanteric pain syndrome (gluteal tendinopathy)', prior:-1.8, miss:'normal',
  ev:{ h_loc_lat:X(4), h_runner:X(1.5), h_insidious:X(1.5), h_sidelying:X(2), h_immature:X(.5), p_gt:X(3,.2),
   t_sls30:T(5,.3,'LEQ08'), t_red:T(5,.3,'LEQ08'), r_res_abd:X(2,.7), t_ober:X(1.3) },
  plan:'Less common in adolescents. Load management avoiding sustained hip adduction, and progressive gluteal loading.'},
 {id:'snapping', name:'Snapping hip (coxa saltans)', prior:-1.2, miss:'normal',
  ev:{ h_snap:X(5), o_snap_visible:X(6), t_snap_int:X(5,.5), t_ober:X(1.5), h_loc_lat:X(1.3), h_loc_groin:X(1.2) },
  plan:'External (ITB over the trochanter, often visible) vs. internal (iliopsoas, audible clunk). Painless snapping needs no treatment; painful snapping or catching deep in the groin suggests an intra-articular cause.'},
 {id:'scfe', name:'Slipped capital femoral epiphysis (SCFE)', prior:-3.0, miss:'high',
  ev:{ h_immature:X(3), h_limp:X(2), o_limp:X(2), h_loc_knee:X(2), h_loc_groin:X(1.5), h_insidious:X(1.5), r_ir_loss:X(5,.3), r_drehmann:X(8,.8), o_extrot:X(3) },
  plan:'Stop weight bearing (crutches) and refer the same day for AP and frog-leg lateral radiographs of both hips.'},
 {id:'stressfx', name:'Femoral neck or shaft stress fracture', prior:-2.5, miss:'high',
  ev:{ h_runner:X(3), h_insidious:X(1.5), h_wb_pain:X(3), h_night:X(2), h_restrict:X(3), h_loc_groin:X(2), t_hop:X(4,.3), r_ir_loss:X(1.5), t_fulcrum:X(2,.8) },
  plan:'Stop running, protect weight bearing, and refer promptly for MRI. Tension-side femoral neck fractures can displace. Screen for low energy availability (RED-S).'},
 {id:'inguinal', name:'Inguinal-related groin pain (athletic pubalgia)', prior:-1.5, miss:'normal',
  ev:{ h_loc_inguinal:X(4), h_cough:X(3), h_kicking:X(1.5), h_insidious:X(1.5), h_immature:X(.6), p_inguinal:X(3,.5), r_res_situp:X(3,.5) },
  plan:'Doha definition: inguinal canal pain and tenderness without a palpable hernia, more likely with pain on resisted abdominal testing or Valsalva. Refer persistent cases.'},
 {id:'pubic', name:'Pubic-related groin pain (osteitis pubis)', prior:-1.8, miss:'normal',
  ev:{ h_loc_pubic:X(4), h_kicking:X(1.5), h_insidious:X(1.5), p_pubic:X(4,.3), t_squeeze:X(1.5), r_res_add:X(1.3) },
  plan:'Doha definition: local pubic symphysis and adjacent bone tenderness. Relative rest and progressive loading; recovery is often slow.'},
 {id:'pointer', name:'Iliac crest contusion (hip pointer)', prior:-0.3, miss:'normal',
  ev:{ h_mech_direct:X(5), h_contact:X(2), h_acute:X(1.5), p_crest:X(3,.2), o_ecchym:X(2) },
  plan:'Ice, protection, and padding for return. In immature athletes, severe crest pain or weakness after a blow or sudden contraction can be an apophyseal avulsion: radiograph.'},
 {id:'meralgia', name:'Meralgia paresthetica (LFCN entrapment)', prior:-2.0, miss:'normal',
  ev:{ h_numb_lat:X(6), h_tightbelt:X(3), h_back:X(.7), n_lfcn_sens:X(4,.5), t_pelviccomp:T(5,.2,'NOUR07'), t_tinel_lfcn:X(3,.6), n_myo:X(.3), n_reflex:X(.5) },
  plan:'Sensory only: any weakness or reflex change points to the lumbar spine instead. Refit equipment and belts.'},
 {id:'lumbarref', name:'Referred lumbar or SI joint pain', prior:-1.5, miss:'normal',
  ev:{ h_back:X(4), h_loc_buttock:X(1.5), n_derm:X(3,.6), n_myo:X(3,.6), n_reflex:X(3,.7), t_slr:X(2,.4), r_ir_loss:X(.6), t_fadir:X(.8) },
  plan:'Switch to the lumbar module for the full screen.'},
 {id:'hipfx', name:'Hip fracture or dislocation', prior:-4.0, miss:'high',
  ev:{ rf_deform:X(CAP), r_nwb:X(4,.3), o_extrot:X(3), h_acute:X(1.5), h_contact:X(1.5) },
  plan:'EMS per the EAP. Posterior dislocation is an emergency for the femoral head blood supply and the sciatic nerve.'},
];
const HP_GATES = {
  avulsion:[['h_immature','h_pop'],['h_immature','h_acute','h_mech_kick'],['h_immature','h_mech_ham'],['r_slr_active']],
  scfe:[['h_immature','h_limp'],['h_immature','h_loc_knee'],['h_immature','h_insidious','h_loc_groin'],['r_drehmann'],['o_extrot']],
  stressfx:[['h_runner','h_insidious'],['h_night'],['h_restrict'],['h_wb_pain']],
  hipfx:[['rf_deform'],['r_nwb','h_acute']],
};
for (const [k,v] of Object.entries(HP_GATES)) HP_CONDITIONS.find(c => c.id === k).gate = v;
const HP_CLUSTERS = [
 {id:'doha', name:'Doha groin pain classification (Weir 2015)', cond:['adductor','iliopsoas','inguinal','pubic','fai'], items:['p_adductor','r_res_add','p_psoas','r_res_flex','p_inguinal','r_res_situp','p_pubic','t_fadir'],
  read(pos, tested, n){
   const ent = [];
   if (isChecked('p_adductor') && isChecked('r_res_add')) ent.push('adductor-related');
   if (isChecked('p_psoas') && (isChecked('r_res_flex') || isChecked('t_thomas'))) ent.push('iliopsoas-related');
   if (isChecked('p_inguinal') && (isChecked('r_res_situp') || isChecked('h_cough'))) ent.push('inguinal-related');
   if (isChecked('p_pubic')) ent.push('pubic-related');
   if (isChecked('t_fadir') || isChecked('h_click')) ent.push('hip-related (consider intra-articular)');
   if (ent.length) return {tone:'warn', text:`Entities met: ${ent.join(', ')}. More than one can coexist; name each one in the assessment.`};
   return null;
  }},
 {id:'mi', name:'Microinstability tests (Hoppe 2017)', cond:['hipmi'], items:['t_abheer','t_heer','t_prone_inst'],
  read(pos, tested, n){
   if (isChecked('t_prone_inst')) return {tone:'warn', text:'Positive prone instability test: specificity about 98%, a strong rule-in finding.'};
   if (isChecked('t_abheer') && isChecked('t_heer')) return {tone:'warn', text:'AB-HEER and HEER both positive: supports microinstability (AB-HEER sensitivity about 81%, specificity about 89%).'};
   if (state.t_abheer === 'neg') return {tone:'good', text:'Negative AB-HEER (\u2212LR about 0.22) argues against microinstability. Derived from a single-center arthroscopy cohort, so apply with some caution.'};
   return null;
  }},
 {id:'gt', name:'Lateral hip tests (Lequesne 2008)', cond:['gtps'], items:['p_gt','t_sls30','t_red'],
  read(pos, tested, n){
   if (state.p_gt === 'neg') return {tone:'good', text:'No trochanteric tenderness: gluteal tendinopathy unlikely.'};
   if (isChecked('t_sls30') && isChecked('t_red')) return {tone:'warn', text:'Both provocation tests positive. Highly specific in Lequesne\u2019s study; later studies found lower accuracy, so combine with palpation.'};
   return null;
  }},
 {id:'sfx', name:'Stress fracture screen', cond:['stressfx'], items:['t_hop','h_wb_pain','h_night'],
  read(pos, tested, n){
   if (isChecked('t_hop') || isChecked('h_night')) return {tone:'bad', text:'Painful hop or night pain in a runner: stop running, protect weight bearing, and refer promptly for MRI.'};
   return null;
  }},
];
function hipInsights(A){
  const out = [];
  const {cand} = A;
  if (isChecked('h_immature') && (isChecked('h_pop') || isChecked('h_mech_kick') || isChecked('h_mech_ham')) && !['p_asis','p_aiis','p_ischial'].every(isAssessed))
    out.push({tone:'bad', h:'Palpate every apophysis', p:'A pop while kicking or sprinting in a skeletally immature athlete is an avulsion fracture until proven otherwise. Palpate the ASIS, AIIS, and ischial tuberosity, then radiograph if any is tender.'});
  if (cand.has('scfe') && !['r_ir_loss','r_drehmann'].every(isAssessed))
    out.push({tone:'bad', h:'Rule out SCFE', p:'An adolescent with a limp, or groin, thigh, or knee pain, needs hip IR and the Drehmann sign checked. If either is positive, no weight bearing until radiographs.'});
  if (cand.has('stressfx') && !isAssessed('t_hop'))
    out.push({tone:'warn', h:'Screen for a femoral stress fracture', p:'Run the single-leg hop and ask about energy availability and menstrual history. Night pain or a painful hop means no running until imaged.'});
  const groin = ['h_loc_groin','h_loc_adductor','h_loc_inguinal','h_loc_pubic'].some(isChecked);
  if (groin && !['p_adductor','p_psoas','p_inguinal','p_pubic'].every(isAssessed))
    out.push({tone:'warn', h:'Work through the Doha entities', p:'Groin pain often has more than one source. Palpate the adductor origin, iliopsoas, inguinal canal, and pubic symphysis, and pair each with its resisted test.'});
  if (['h_laxity','h_giveway_hip','h_hipsport'].some(isChecked) && ['h_loc_groin','h_giveway_hip','h_click'].some(isChecked) && !['t_abheer','t_heer','t_prone_inst'].every(isAssessed))
    out.push({tone:'warn', h:'Screen for microinstability', p:'Hypermobility, end-range hip sports, or apprehension in extension and ER: run AB-HEER, HEER, and the prone instability test in that order, comparing sides. Record a Beighton score.'});
  if (cand.has('hipmi') && cand.has('fai'))
    out.push({tone:'warn', h:'Microinstability and impingement can coexist', p:'A positive FADIR doesn\u2019t rule out microinstability. Name both if both are supported; it changes rehab emphasis.'});
  if (isChecked('t_fadir') && !['t_scour','r_ir_loss'].some(isChecked))
    out.push({tone:'warn', h:'A positive FADIR alone is nonspecific', p:'It is very sensitive but not specific. Look for mechanical symptoms, IR loss, and a positive scour before calling it intra-articular.'});
  if ((isChecked('h_numb_lat') || isChecked('n_lfcn_sens')) && !['n_myo','n_reflex'].every(isAssessed))
    out.push({tone:'warn', h:'Confirm it\u2019s sensory only', p:'Meralgia paresthetica has no motor or reflex changes. Weakness or a reflex change points to the lumbar spine.'});
  if (isChecked('h_back') && !['n_derm','n_myo','t_slr'].every(isAssessed))
    out.push({tone:'warn', h:'Back pain with hip pain', p:'Complete the neuro and lumbar screen before settling on a hip diagnosis.'});
  if (isChecked('h_mech_direct') && isChecked('h_immature') && isChecked('p_crest'))
    out.push({tone:'warn', h:'Crest tenderness in an immature athlete', p:'Most are contusions, but severe pain or weakness with trunk motion can be an iliac crest apophyseal avulsion. Radiograph if in doubt.'});
  if (['h_loc_groin','h_loc_inguinal'].some(isChecked) && !state.rf_screened && !isChecked('rf_testicular'))
    out.push({tone:'warn', h:'Screen for non-musculoskeletal groin pain', p:'Ask about testicular or scrotal pain and check for a hernia bulge. Testicular torsion can present as groin pain.'});
  return out;
}

/** Region definition (same shape as the prototype's REG.hip). */
export const HIP = {label:'Hip and groin', noun:'hip', findings:HP_FINDINGS, sections:HP_SECTIONS, groups:HP_GROUPS, conditions:HP_CONDITIONS, clusters:HP_CLUSTERS, insights:hipInsights,
  screen:{name:'Neuro and lumbar screen', slots:[['n_derm','n_lfcn_sens'],['n_myo'],['n_reflex'],['t_slr']]},
  example:{primary:'rectus', state:{
    rf_screened:true, h_immature:true, h_kicking:true, h_sprint:true, h_acute:true, h_pop:true, h_mech_kick:true, h_loc_groin:true,
    p_aiis:'pos', r_res_flex:'pos', t_thomas:'pos', r_slr_active:'neg'}}};
export default HIP;
