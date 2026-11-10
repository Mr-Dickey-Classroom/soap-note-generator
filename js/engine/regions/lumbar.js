/**
 * Region module: lumbar. Findings, sections, correlated-test groups, conditions,
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

const LX_FINDINGS = [
 ['rf_cauda','rf',null,'Saddle numbness, new bowel or bladder dysfunction, or bilateral or progressive leg weakness'],
 ['rf_fracture','rf',null,'High-energy trauma with midline tenderness, deformity, or step-off'],
 ['rf_systemic','rf',null,'Fever, unexplained weight loss, constant night pain, or history of cancer'],
 ['rf_renal','rf',null,'Blow to the flank with blood in the urine'],
 ['h_immature','h','Athlete and mechanism','Adolescent or skeletally immature'],
 ['h_extsport','h','Athlete and mechanism','Repetitive extension sport (gymnastics, linemen, diving, dance, pitching, cheer)'],
 ['h_contact','h','Athlete and mechanism','Contact or collision sport'],
 ['h_acute','h','Athlete and mechanism','Acute onset with a specific moment'],
 ['h_insidious','h','Athlete and mechanism','Insidious or gradual onset'],
 ['h_lift','h','Athlete and mechanism','Lifting or twisting mechanism'],
 ['h_ext_worse','h','Symptoms','Worse with extension or arching (back walkovers, blocking)'],
 ['h_flex_worse','h','Symptoms','Worse with sitting, bending, coughing, or sneezing'],
 ['h_leg','h','Symptoms','Leg pain below the knee'],
 ['h_paresth_leg','h','Symptoms','Numbness or tingling in the leg or foot'],
 ['h_buttock','h','Symptoms','Unilateral buttock or PSIS-region pain below L5'],
 ['h_sit_buttock','h','Symptoms','Buttock pain with prolonged sitting'],
 ['h_morning','h','Symptoms','Morning stiffness over 30 minutes that improves with activity'],
 ['h_night2','h','Symptoms','Wakes in the second half of the night with back pain'],
 ['h_long','h','Symptoms','Symptoms lasting more than 2\u20133 weeks'],
 ['o_lordosis','o',null,'Increased lumbar lordosis'],
 ['o_shift','o',null,'Lateral shift'],
 ['o_guard','o',null,'Guarded, stiff movement'],
 ['p_midline','p',null,'Midline (spinous process) tenderness'],
 ['p_stepoff','p',null,'Palpable step-off'],
 ['p_paraspinal','p',null,'Paraspinal muscles'],
 ['p_psis','p',null,'Within 1 cm of the PSIS (Fortin finger test)'],
 ['p_piriformis','p',null,'Piriformis / deep gluteal region'],
 ['r_extpain','r','ROM','Extension reproduces the pain'],
 ['r_flexpain','r','ROM','Flexion reproduces the pain'],
 ['r_extrot_pain','r','ROM','Extension-rotation (quadrant) reproduces local pain'],
 ['r_central','r','ROM','Symptoms centralize with repeated movements'],
 ['r_hamstring','r','ROM','Hamstring tightness (popliteal angle) vs. expected'],
 ['r_romloss','r','ROM','General painful loss of motion'],
 ['t_slr','t','Neural tension','Straight leg raise','Positive = leg symptoms between about 30\u00b0 and 70\u00b0'],
 ['t_cslr','t','Neural tension','Crossed straight leg raise'],
 ['t_slump','t','Neural tension','Slump'],
 ['t_fnst','t','Neural tension','Femoral nerve tension (prone knee bend)'],
 ['t_slse','t','Pars','Single-leg stance extension (stork)'],
 ['t_sij_distract','t','Sacroiliac','Distraction'],
 ['t_sij_thigh','t','Sacroiliac','Thigh thrust'],
 ['t_sij_compress','t','Sacroiliac','Compression'],
 ['t_sij_sacral','t','Sacroiliac','Sacral thrust'],
 ['t_gaenslen','t','Sacroiliac',"Gaenslen's"],
 ['t_fair','t','Deep gluteal','FAIR (flexion, adduction, internal rotation)'],
 ['n_derm','n','Neuro','Dermatomal sensory deficit'],
 ['n_myo','n','Neuro','Myotomal weakness (heel walk, toe walk, great toe extension)'],
 ['n_reflex','n','Neuro','Diminished patellar or Achilles reflex'],
];
const LX_SECTIONS = [
 {id:'rf', title:'Red flag screen', kind:'check', intro:'Any checked item moves emergency action to the top of the report.'},
 {id:'h', title:'History', kind:'check', intro:'Check only what the athlete reported. In adolescents, duration and extension pain carry the most weight.'},
 {id:'o', title:'Observation', kind:'check', intro:'Check what you saw.'},
 {id:'p', title:'Palpation', kind:'tri', pos:'Tender', neg:'Not tender', intro:'Negatives count.'},
 {id:'r', title:'ROM', kind:'tri', pos:'Present', neg:'Absent', intro:'Record present, absent, or not assessed.'},
 {id:'t', title:'Special tests', kind:'tri', pos:'Positive', neg:'Negative', intro:'Tap "Evidence" on any test to see its accuracy for each condition it informs.'},
 {id:'n', title:'Neuro screen', kind:'tri', pos:'Positive', neg:'Negative', intro:'L4 (knee reflex, tibialis anterior), L5 (great toe extension, heel walk), S1 (Achilles reflex, toe walk).'},
];
const LX_GROUPS = {
  t_slr:'nt', t_slump:'nt', t_cslr:'nt',
  t_sij_distract:'sij', t_sij_thigh:'sij', t_sij_compress:'sij', t_sij_sacral:'sij', t_gaenslen:'sij', p_psis:'sij',
  r_extpain:'ext', t_slse:'ext', r_extrot_pain:'ext',
  n_derm:'neuro', n_myo:'neuro', n_reflex:'neuro'
};
const LX_CONDITIONS = [
 {id:'mech', name:'Mechanical low back pain (strain / nonspecific)', prior:0.3, miss:'normal',
  ev:{ h_acute:X(1.5), h_lift:X(2), p_paraspinal:X(3,.4), r_flexpain:X(1.5), r_romloss:X(1.5), h_leg:X(.5), n_derm:X(.6), h_immature:X(.7), h_long:X(.6) },
  plan:'Most adult back pain is nonspecific; adolescent athletes with persistent pain have a structural cause far more often. Keep that in mind before settling here.'},
 {id:'lysis', name:'Spondylolysis (pars stress injury)', prior:-0.7, miss:'high',
  ev:{ h_immature:X(2), h_extsport:X(3), h_ext_worse:X(2.5), h_insidious:X(1.3), h_long:X(2), r_extpain:X(3,.4), t_slse:T(1.5,.8,'MASCI06'), p_midline:X(1.5), o_lordosis:X(1.5), r_hamstring:X(1.5), h_flex_worse:X(.6) },
  plan:'No clinical test reliably confirms or excludes a pars injury. An adolescent athlete with extension-related pain lasting more than 2\u20133 weeks warrants physician referral for imaging (the physician chooses MRI or other modalities). Stop extension-loading activity meanwhile.'},
 {id:'listhesis', name:'Spondylolisthesis', prior:-2.2, miss:'high',
  ev:{ p_stepoff:X(6,.8), h_immature:X(1.3), h_extsport:X(2), r_hamstring:X(2), h_leg:X(1.3), o_lordosis:X(1.5) },
  plan:'Refer for standing lateral radiographs; progression is most likely during the adolescent growth spurt.'},
 {id:'disc', name:'Disc herniation with radiculopathy', prior:-0.8, miss:'high',
  ev:{ h_leg:X(3), h_paresth_leg:X(2.5), h_flex_worse:X(2), o_shift:X(2), r_central:X(1.5), n_derm:X(3,.6), n_myo:X(3,.6), n_reflex:X(3,.7),
   t_slr:SS(.91,.26,'DEV00'), t_cslr:SS(.29,.88,'DEV00'), t_slump:SS(.84,.83,'MAJ08'), t_fnst:X(3,.8) },
  plan:'Progressive weakness or any cauda equina feature: urgent referral. Otherwise, directional preference exercise if symptoms centralize, with physician referral if symptoms persist.'},
 {id:'sij', name:'Sacroiliac joint pain', prior:-1.2, miss:'normal',
  ev:{ h_buttock:X(3), p_psis:X(3,.5), h_leg:X(.7), r_central:X(.5), t_sij_distract:X(2.5,.5), t_sij_thigh:X(2.5,.4), t_sij_compress:X(2,.6), t_sij_sacral:X(2,.6), t_gaenslen:X(1.5,.7) },
  plan:'Use the provocation cluster rather than single tests, and only after ruling out a lumbar source (no centralization with repeated movements).'},
 {id:'facet', name:'Lumbar facet / extension-related pain', prior:-1.5, miss:'normal',
  ev:{ r_extrot_pain:X(3,.5), h_ext_worse:X(1.5), p_paraspinal:X(1.3), h_immature:X(.6), h_leg:X(.6) },
  plan:'In adolescents, treat extension pain as a pars injury until proven otherwise; facet pain is more of an adult diagnosis.'},
 {id:'piri', name:'Deep gluteal / piriformis syndrome', prior:-2.0, miss:'normal',
  ev:{ h_sit_buttock:X(3), h_buttock:X(1.5), p_piriformis:X(3,.5), t_fair:X(3,.6), t_slr:X(1.2), n_derm:X(.8), p_psis:X(.8) },
  plan:'A diagnosis of exclusion after lumbar radiculopathy and SI joint pain.'},
 {id:'axspa', name:'Inflammatory back pain (axial spondyloarthritis)', prior:-3.0, miss:'normal',
  ev:{ h_morning:X(4), h_night2:X(3), h_insidious:X(1.5), h_long:X(2), h_buttock:X(1.3), h_acute:X(.5) },
  plan:'Often begins in the late teens. Morning stiffness that improves with activity and second-half-of-night waking warrant physician referral for evaluation.'},
 {id:'lxfx', name:'Vertebral fracture', prior:-3.0, miss:'high',
  ev:{ rf_fracture:X(CAP), h_contact:X(1.5), h_acute:X(1.5), p_midline:X(2,.5), p_stepoff:X(2) },
  plan:'Spinal motion restriction and EMS per the EAP when high-energy trauma meets midline tenderness or neurologic findings.'},
 {id:'cauda', name:'Cauda equina syndrome', prior:-5.0, miss:'high',
  ev:{ rf_cauda:X(CAP), h_leg:X(1.5), n_myo:X(2) },
  plan:'Emergency department the same day.'},
];
const LX_GATES = {
  lysis:[['h_immature'],['h_extsport'],['h_ext_worse'],['r_extpain']],
  listhesis:[['p_stepoff'],['h_immature','h_long','h_extsport']],
  disc:[['h_leg'],['h_paresth_leg'],['h_flex_worse']],
  lxfx:[['rf_fracture'],['h_contact','h_acute']],
  cauda:[['rf_cauda']],
};
for (const [k,v] of Object.entries(LX_GATES)) LX_CONDITIONS.find(c => c.id === k).gate = v;
const LX_CLUSTERS = [
 {id:'las', name:'Sacroiliac provocation cluster (Laslett 2005)', cond:['sij'], items:['t_sij_distract','t_sij_thigh','t_sij_compress','t_sij_sacral','t_gaenslen'],
  read(pos, tested, n){
   if (pos >= 3) return {tone:'warn', text:`${pos} positive: 3 or more of the provocation tests supports SI joint pain (sensitivity about 90%, specificity about 78%).`};
   if (tested === n && pos === 0) return {tone:'good', text:'All negative: SI joint pain unlikely.'};
   if (tested >= 3 && pos <= 1) return {tone:'good', text:`${pos} of ${tested} positive: SI joint pain less likely.`};
   return null;
  }},
 {id:'nt', name:'Neural tension (Devill\u00e9 2000; Majlesi 2008)', cond:['disc'], items:['t_slr','t_slump','t_cslr'],
  read(pos, tested, n){
   if (isChecked('t_cslr')) return {tone:'bad', text:'Positive crossed SLR: specific (about 88%) for disc herniation.'};
   if (isChecked('t_slump') && isChecked('t_slr')) return {tone:'warn', text:'SLR and slump both positive: supports radiculopathy from disc herniation.'};
   if (state.t_slr === 'neg' && state.t_slump === 'neg') return {tone:'good', text:'SLR and slump both negative: disc herniation with radiculopathy unlikely (SLR sensitivity about 91%).'};
   return null;
  }},
 {id:'pars', name:'Pars screen (no validated clinical test)', cond:['lysis','listhesis'], items:['r_extpain','t_slse','h_extsport'],
  read(pos, tested, n){
   return {tone:'warn', text:'The stork test and extension pain are neither sensitive nor specific enough to rule a pars injury in or out (Masci 2006). Duration, age, and sport drive the referral decision.'};
  }},
];
function lumbarInsights(A){
  const out = [];
  const {cand, mine} = A;
  if (isChecked('h_immature') && (isChecked('h_ext_worse') || isChecked('r_extpain') || isChecked('h_extsport')))
    out.push({tone:'bad', h:'Adolescent with extension-related pain', p:'Spondylolysis until proven otherwise. With pain beyond 2\u20133 weeks, refer for imaging and hold extension-loading activity.'});
  if (isChecked('t_slse') && !isChecked('h_long'))
    out.push({tone:'warn', h:'A positive stork test doesn\u2019t confirm a pars injury', p:'Its accuracy is poor (Masci 2006). Duration and age matter more.'});
  if (['h_leg','h_paresth_leg'].some(isChecked) && !['n_derm','n_myo','n_reflex'].every(isAssessed))
    out.push({tone:'bad', h:'Leg symptoms need a full neuro screen', p:'Test L4, L5, and S1: dermatomes, myotomes (heel walk, great toe extension, toe walk), and knee and ankle reflexes.'});
  if (['h_leg','h_paresth_leg'].some(isChecked) && !['t_slr','t_slump'].some(isAssessed))
    out.push({tone:'warn', h:'Add neural tension tests', p:'A negative SLR (sensitivity about 91%) makes disc herniation with radiculopathy unlikely; slump adds specificity.'});
  if (isChecked('r_central'))
    out.push({tone:'good', h:'Symptoms centralize', p:'Centralization suggests a discogenic source with a directional preference and a favorable prognosis. It argues against SI joint pain.'});
  if (['h_morning','h_night2'].some(isChecked))
    out.push({tone:'warn', h:'Inflammatory pattern', p:'Morning stiffness that improves with activity and second-half-of-night waking suggest axial spondyloarthritis; consider physician referral.'});
  if ((mine.has('mech') || A.results[0].c.id === 'mech') && isChecked('h_immature') && isChecked('h_long'))
    out.push({tone:'warn', h:'Persistent back pain in an adolescent', p:'Nonspecific back pain is less likely in adolescent athletes with pain beyond a few weeks; look harder for a structural cause.'});
  return out;
}

/** Region definition (same shape as the prototype's REG.lumbar). */
export const LUMBAR = {label:'Lumbar spine', noun:'lumbar spine', findings:LX_FINDINGS, sections:LX_SECTIONS, groups:LX_GROUPS, conditions:LX_CONDITIONS, clusters:LX_CLUSTERS, insights:lumbarInsights,
  screen:{name:'Neuro screen (L4\u2013S1)', slots:[['n_derm'],['n_myo'],['n_reflex'],['t_slr','t_slump']]},
  example:{primary:'mech', state:{
    rf_screened:true, h_immature:true, h_extsport:true, h_insidious:true, h_long:true,
    r_extpain:'pos', p_paraspinal:'pos', t_slse:'pos', t_slr:'neg', n_derm:'neg', n_myo:'neg', n_reflex:'neg'}}};
export default LUMBAR;
