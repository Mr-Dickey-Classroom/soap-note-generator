/**
 * Region module: cervical. Findings, sections, correlated-test groups, conditions,
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

const CX_FINDINGS = [
 ['rf_cord','rf',null,'Bilateral or four-limb numbness, weakness, or transient paralysis'],
 ['rf_midline','rf',null,'Severe midline neck pain or deformity after contact'],
 ['rf_loc','rf',null,'Loss of consciousness or altered mental status'],
 ['rf_cad','rf',null,'Dizziness, double vision, slurred speech, trouble swallowing, drop attacks, or nystagmus'],
 ['rf_bowel','rf',null,'New bowel or bladder dysfunction'],
 ['rf_systemic','rf',null,'Fever, unexplained weight loss, or constant night pain'],
 ['h_contact','h','Athlete and mechanism','Contact or collision sport'],
 ['h_acute','h','Athlete and mechanism','Acute onset with a specific traumatic moment'],
 ['h_insidious','h','Athlete and mechanism','Insidious or gradual onset'],
 ['h_dangerous','h','Athlete and mechanism','Axial load (head-down contact, spearing), diving, or fall from height'],
 ['h_mech_lat','h','Athlete and mechanism','Lateral flexion with shoulder depression'],
 ['h_mech_whip','h','Athlete and mechanism','Acceleration-deceleration (whiplash) mechanism'],
 ['h_wokeup','h','Athlete and mechanism','Woke up with it or sudden onset with a small movement'],
 ['h_posture','h','Athlete and mechanism','Sustained postures (screens, studying)'],
 ['h_delayed','h','Athlete and mechanism','Pain began hours after the event, not immediately'],
 ['h_unilat_neck','h','Symptoms','Unilateral neck pain'],
 ['h_radiate','h','Symptoms','Arm pain below the elbow'],
 ['h_paresth_arm','h','Symptoms','Numbness or tingling in one arm'],
 ['h_bilat','h','Symptoms','Symptoms in both arms (or arms and legs)'],
 ['h_burning','h','Symptoms','Burning or dead arm after contact, resolving in seconds to minutes'],
 ['h_headache','h','Symptoms','Headache that starts in the neck'],
 ['h_headcontact','h','Symptoms','Head contact or concussion symptoms'],
 ['h_gait','h','Symptoms','Clumsy hands, gait change, or loss of dexterity'],
 ['h_lhermitte','h','Symptoms','Electric shock down the spine with neck flexion'],
 ['o_posture','o',null,'Forward head posture'],
 ['o_guard','o',null,'Protective posture; head held stiffly'],
 ['o_tilt','o',null,'Torticollis (head tilted and rotated)'],
 ['p_midline','p',null,'Midline (spinous process) tenderness'],
 ['p_paraspinal','p',null,'Paraspinal or upper trapezius tenderness'],
 ['p_facet','p',null,'Unilateral articular pillar tenderness'],
 ['p_upper','p',null,'Suboccipital / upper cervical (C1\u2013C2) tenderness reproducing headache'],
 ['r_rot45','r','ROM','Unable to actively rotate 45\u00b0 to both sides'],
 ['n_rot60','r','ROM','Rotation under 60\u00b0 toward the involved side'],
 ['r_extrot_pain','r','ROM','Extension-rotation (quadrant) reproduces local pain'],
 ['r_romloss','r','ROM','General painful loss of motion'],
 ['t_spurling','t','Radiculopathy',"Spurling's A"],
 ['t_distract','t','Radiculopathy','Cervical distraction','Positive = symptom relief'],
 ['t_ultta','t','Radiculopathy','ULTT A (median nerve bias)'],
 ['t_sba','t','Radiculopathy','Shoulder abduction relief sign','Positive = arm symptoms ease with the hand on the head'],
 ['t_bpst','t','Brachial plexus','Brachial plexus stretch (neck away, shoulder depressed)'],
 ['t_frt','t','Upper cervical','Cervical flexion-rotation test','Positive = rotation under about 32\u00b0 or a 10\u00b0 side-to-side difference'],
 ['t_hoffmann','t','Cord signs',"Hoffmann's sign"],
 ['t_babinski','t','Cord signs','Babinski sign'],
 ['t_invsup','t','Cord signs','Inverted supinator sign'],
 ['n_gait','n','Neuro','Gait deviation (wide-based, ataxic, or spastic)'],
 ['n_derm','n','Neuro','Dermatomal sensory deficit'],
 ['n_myo','n','Neuro','Myotomal weakness'],
 ['n_reflex','n','Neuro','Diminished deep tendon reflex'],
 ['n_hyperreflex','n','Neuro','Hyperreflexia or clonus'],
];
const CX_SECTIONS = [
 {id:'rf', title:'Red flag screen', kind:'check', intro:'This tool is not for on-field decisions. Any suspected spine injury follows the EAP and NATA spine-injured athlete guidance.'},
 {id:'h', title:'History', kind:'check', intro:'Check only what the athlete reported.'},
 {id:'o', title:'Observation', kind:'check', intro:'Check what you saw.'},
 {id:'p', title:'Palpation', kind:'tri', pos:'Tender', neg:'Not tender', intro:'Midline tenderness matters most; record it either way.'},
 {id:'r', title:'ROM', kind:'tri', pos:'Present', neg:'Absent', intro:'Assess active ROM only after fracture risk has been cleared.'},
 {id:'t', title:'Special tests', kind:'tri', pos:'Positive', neg:'Negative', intro:'Provocative tests only after fracture and instability have been cleared.'},
 {id:'n', title:'Neuro screen', kind:'tri', pos:'Positive', neg:'Negative', intro:'Upper and lower motor neuron signs both matter.'},
];
const CX_GROUPS = { t_hoffmann:'umn', t_babinski:'umn', t_invsup:'umn', n_hyperreflex:'umn', n_derm:'neuro', n_myo:'neuro', n_reflex:'neuro' };
const CX_CONDITIONS = [
 {id:'mech', name:'Mechanical neck pain (strain / sprain)', prior:0.3, miss:'normal',
  ev:{ h_acute:X(1.3), h_mech_whip:X(2), h_posture:X(2), h_insidious:X(1.2), p_paraspinal:X(3,.4), r_romloss:X(2), p_midline:X(.4), h_radiate:X(.5), n_derm:X(.6), h_bilat:X(.2) },
  plan:'Diagnosis of exclusion once fracture, neurologic, and vascular causes are cleared. Early motion, deep neck flexor and scapular work.'},
 {id:'cxfx', name:'Cervical fracture or instability', prior:-2.5, miss:'high',
  ev:{ rf_midline:X(CAP), h_dangerous:X(4), p_midline:X(3,.3), r_rot45:X(3,.3), h_bilat:X(4), h_paresth_arm:X(1.5), h_delayed:X(.5), n_myo:X(2) },
  plan:'Any suspicion means spinal motion restriction and EMS transport per the EAP and NATA spine-injured athlete guidance. Apply the Canadian C-Spine Rule only in an alert, stable athlete.'},
 {id:'stinger', name:'Brachial plexus neurapraxia (stinger / burner)', prior:-0.7, miss:'high',
  ev:{ h_burning:X(6), h_mech_lat:X(3), h_contact:X(2), h_acute:X(1.5), h_paresth_arm:X(2), h_bilat:X(.2), n_myo:X(2.5,.7), t_bpst:X(3,.6), t_spurling:X(1.5,.8), p_midline:X(.5) },
  plan:'Unilateral and transient only. No return while strength or symptoms are abnormal or neck motion is painful. Recurrent stingers, symptoms beyond 24 hours, or neck pain warrant physician evaluation and imaging.'},
 {id:'radic', name:'Cervical radiculopathy', prior:-1.2, miss:'high',
  ev:{ h_radiate:X(3), h_paresth_arm:X(2.5), h_unilat_neck:X(1.3), n_derm:X(3,.6), n_myo:X(3,.6), n_reflex:X(3,.7),
   t_spurling:SS(.50,.86,'WAIN03'), t_distract:SS(.44,.90,'WAIN03'), t_ultta:SS(.97,.22,'WAIN03'), n_rot60:SS(.89,.49,'WAIN03'), t_sba:X(3,.8) },
  plan:'Map the deficit to a root: C5 deltoid and biceps reflex, C6 wrist extensors and brachioradialis reflex, C7 triceps, C8 finger flexors and ulnar hand. Progressive weakness warrants prompt referral.'},
 {id:'cord', name:'Cervical cord neurapraxia / myelopathy', prior:-3.0, miss:'high',
  ev:{ h_bilat:X(8), h_lhermitte:X(4), h_gait:X(4), n_gait:X(4,.7), t_hoffmann:X(3,.7), t_babinski:X(5,.8), t_invsup:X(3,.7), n_hyperreflex:X(4,.6) },
  plan:'Bilateral or four-limb symptoms after contact, even if transient, are a cord injury until proven otherwise: EAP, spinal motion restriction, and physician evaluation with MRI before any return.'},
 {id:'facet', name:'Cervical facet joint pain / acute wry neck', prior:-0.8, miss:'normal',
  ev:{ h_unilat_neck:X(2.5), h_wokeup:X(2.5), o_tilt:X(2), p_facet:X(3,.5), r_extrot_pain:X(3,.5), h_radiate:X(.5), h_paresth_arm:X(.6) },
  plan:'Pain-free motion, gentle mobilization, and time. Arm symptoms shift the picture toward radiculopathy.'},
 {id:'cgh', name:'Cervicogenic headache', prior:-1.2, miss:'normal',
  ev:{ h_headache:X(4), h_unilat_neck:X(1.3), p_upper:X(3,.5), t_frt:T(5,.2,'HALL08'), h_headcontact:X(.6), o_posture:X(1.3) },
  plan:'If there was any head contact, run the concussion protocol first. Cervicogenic headache often coexists with concussion and responds to upper cervical and deep neck flexor treatment.'},
 {id:'cad', name:'Cervical arterial dysfunction (dissection)', prior:-4.0, miss:'high',
  ev:{ rf_cad:X(CAP), h_headache:X(1.5), h_acute:X(1.5), h_mech_whip:X(1.3) },
  plan:'Neck pain with neurologic or brainstem symptoms after trauma or manipulation: emergency referral.'},
];
const CX_GATES = {
  cxfx:[['h_dangerous'],['p_midline'],['h_bilat'],['h_contact','h_acute']],
  stinger:[['h_contact','h_burning'],['h_contact','h_paresth_arm'],['h_mech_lat']],
  radic:[['h_radiate'],['h_paresth_arm']],
  cord:[['h_bilat'],['h_gait'],['h_lhermitte'],['n_hyperreflex']],
  cad:[['rf_cad']],
};
for (const [k,v] of Object.entries(CX_GATES)) CX_CONDITIONS.find(c => c.id === k).gate = v;
const CX_CLUSTERS = [
 {id:'ccr', name:'Canadian C-Spine Rule (Stiell 2001)', cond:['cxfx','stinger','mech','cord'], items:['h_dangerous','h_paresth_arm','p_midline','r_rot45'],
  read(pos, tested, n){
   if (isChecked('h_dangerous') || isChecked('h_paresth_arm') || isChecked('h_bilat')) return {tone:'bad', text:'High-risk factor present (dangerous mechanism or extremity paresthesias): imaging indicated. Maintain spinal motion restriction per the EAP.'};
   if (isChecked('p_midline')) return {tone:'bad', text:'Midline tenderness: the rule cannot clear this athlete. Imaging indicated.'};
   if (isChecked('r_rot45')) return {tone:'bad', text:'Unable to rotate 45\u00b0 both ways: imaging indicated.'};
   if (state.p_midline === 'neg' && state.r_rot45 === 'neg') return {tone:'good', text:'No high-risk factors, no midline tenderness, and able to rotate 45\u00b0 both ways: imaging not required (sensitivity about 99%, Stiell 2001). Derived in alert, stable adults 16 and older; apply with judgment in younger athletes.'};
   return null;
  }},
 {id:'wain', name:'Cervical radiculopathy cluster (Wainner 2003)', cond:['radic','stinger'], items:['t_ultta','t_spurling','t_distract','n_rot60'],
  read(pos, tested, n){
   if (pos === 4) return {tone:'bad', text:'4 of 4 positive: +LR about 30.'};
   if (pos === 3) return {tone:'warn', text:'3 of 4 positive: +LR about 6.'};
   if (state.t_ultta === 'neg') return {tone:'good', text:'Negative ULTT A (sensitivity about 97%) makes radiculopathy unlikely.'};
   return null;
  }},
 {id:'cook', name:'Myelopathy cluster (Cook 2010)', cond:['cord'], items:['n_gait','t_hoffmann','t_invsup','t_babinski'],
  read(pos, tested, n){
   if (pos >= 3) return {tone:'bad', text:`${pos} positive: 3 or more of the cluster gives +LR about 30. Refer urgently.`};
   if (tested === n && pos === 0) return {tone:'good', text:'All negative: myelopathy unlikely (1 or fewer positive, \u2212LR about 0.18). The fifth item, age over 45, doesn\u2019t apply to high school athletes.'};
   return null;
  }},
];
function cervicalInsights(A){
  const out = [];
  const {cand} = A;
  if (isChecked('h_bilat'))
    out.push({tone:'bad', h:'Bilateral symptoms are not a stinger', p:'Symptoms in both arms, or arms and legs, point to the cord. Spinal motion restriction per the EAP; no return without physician clearance and imaging.'});
  if (isChecked('h_headcontact'))
    out.push({tone:'bad', h:'Head contact: concussion first', p:'Run the concussion protocol (SCAT6) before attributing symptoms to the neck. Cervical and concussion symptoms overlap and often coexist.'});
  if (cand.has('stinger') && !['n_myo','p_midline','r_rot45'].every(isAssessed))
    out.push({tone:'warn', h:'Before any stinger return', p:'Document midline non-tenderness, full pain-free neck ROM, and full C5\u2013C6 strength (deltoid, biceps, spinati) compared with the other side.'});
  if (isChecked('n_myo') && cand.has('radic'))
    out.push({tone:'warn', h:'Name the root', p:'Record which myotome is weak (C5 deltoid, C6 wrist extensors, C7 triceps, C8 finger flexors) so progression can be tracked.'});
  if (isChecked('h_contact') && isChecked('h_acute') && !['p_midline','r_rot45'].every(isAssessed))
    out.push({tone:'bad', h:'Clear the spine before provocative testing', p:'Document midline tenderness and the ability to rotate 45\u00b0 both ways (Canadian C-Spine Rule) before Spurling or ROM testing.'});
  return out;
}

/** Region definition (same shape as the prototype's REG.cervical). */
export const CERVICAL = {label:'Cervical spine', noun:'cervical spine', findings:CX_FINDINGS, sections:CX_SECTIONS, groups:CX_GROUPS, conditions:CX_CONDITIONS, clusters:CX_CLUSTERS, insights:cervicalInsights,
  screen:{name:'Neuro screen (LMN and UMN)', slots:[['n_derm'],['n_myo'],['n_reflex'],['t_hoffmann','n_hyperreflex']]},
  example:{primary:'stinger', state:{
    rf_screened:true, h_contact:true, h_acute:true, h_mech_lat:true, h_burning:true,
    p_midline:'neg', r_rot45:'neg', n_myo:'neg', n_derm:'neg'}}};
export default CERVICAL;
