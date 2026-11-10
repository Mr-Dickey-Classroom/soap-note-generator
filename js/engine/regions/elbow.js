/**
 * Region module: elbow. Findings, sections, correlated-test groups, conditions,
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

const EL_FINDINGS = [
 ['rf_deform','rf',null,'Gross deformity or suspected elbow dislocation'],
 ['rf_nv','rf',null,'Diminished radial pulse, poor hand perfusion, or new nerve deficit (AIN, radial, ulnar)'],
 ['rf_compart','rf',null,'Forearm pain out of proportion, pain with passive finger stretch, or tense forearm'],
 ['rf_infect','rf',null,'Red, hot, swollen elbow or olecranon bursa with fever or spreading redness'],
 ['h_immature','h','Athlete and mechanism','Skeletally immature (open growth plates)'],
 ['h_thrower','h','Athlete and mechanism','Overhead throwing sport (pitcher, catcher, QB, javelin)'],
 ['h_pitchvol','h','Athlete and mechanism','High pitch counts, year-round throwing, or multiple teams'],
 ['h_armweight','h','Athlete and mechanism','Weight bearing on the arms (gymnastics, cheer, wrestling)'],
 ['h_acute','h','Athlete and mechanism','Acute onset with a specific traumatic moment'],
 ['h_insidious','h','Athlete and mechanism','Insidious or gradual onset'],
 ['h_foosh','h','Athlete and mechanism','Fall on an outstretched hand'],
 ['h_pop_throw','h','Athlete and mechanism','Felt a pop on the medial elbow while throwing'],
 ['h_eccentric','h','Athlete and mechanism','Sudden forced extension of a flexed, loaded elbow'],
 ['h_direct','h','Athlete and mechanism','Direct blow or fall onto the point of the elbow'],
 ['h_loc_med','h','Pain location','Medial, during late cocking or acceleration'],
 ['h_loc_lat','h','Pain location','Lateral elbow'],
 ['h_loc_post','h','Pain location','Posterior, at ball release or follow-through'],
 ['h_loc_ant','h','Pain location','Anterior elbow (antecubital fossa)'],
 ['h_velocity','h','Symptoms','Loss of throwing velocity or control'],
 ['h_lockcatch','h','Symptoms','Locking or catching'],
 ['h_grip','h','Symptoms','Pain with gripping or lifting'],
 ['h_ulnar_par','h','Symptoms','Tingling in the 4th and 5th fingers'],
 ['h_neck','h','Symptoms','Neck pain, or arm symptoms that change with neck position'],
 ['o_swelling','o',null,'Swelling or effusion'],
 ['o_olec_bursa','o',null,'Fluctuant swelling over the olecranon'],
 ['o_biceps_contour','o',null,'Loss of the distal biceps contour'],
 ['p_medepi','p','Medial','Medial epicondyle'],
 ['p_ucl','p','Medial','UCL, just distal to the medial epicondyle (sublime tubercle)'],
 ['p_flexorigin','p','Medial','Common flexor-pronator origin'],
 ['p_latepi','p','Lateral','Lateral epicondyle / ECRB origin'],
 ['p_radiocap','p','Lateral','Radiocapitellar joint / posterolateral soft spot'],
 ['p_radhead','p','Lateral','Radial head'],
 ['p_olec','p','Posterior','Olecranon tip'],
 ['p_postmed','p','Posterior','Posteromedial olecranon'],
 ['p_supracond','p','Posterior','Distal humerus / supracondylar region'],
 ['p_biceps','p','Anterior','Distal biceps tendon'],
 ['r_extfull','r','Function','Unable to fully extend the elbow (elbow extension test)'],
 ['r_extloss','r','Function','Chronic loss of terminal extension vs. uninvolved side'],
 ['r_resflex','r','Function','Resisted wrist flexion or pronation reproduces medial pain'],
 ['r_grip','r','Function','Painful or weak grip'],
 ['r_supweak','r','Function','Supination or flexion weakness'],
 ['t_mvst','t','Medial ligament','Moving valgus stress test'],
 ['t_milk','t','Medial ligament','Milking maneuver'],
 ['t_valgus30','t','Medial ligament','Valgus stress at 20\u201330\u00b0'],
 ['t_varus','t','Lateral','Varus stress'],
 ['t_cozen','t','Lateral',"Cozen's"],
 ['t_mill','t','Lateral',"Mill's"],
 ['t_maudsley','t','Lateral',"Maudsley's (resisted 3rd finger extension)"],
 ['t_arc','t','Lateral','Active radiocapitellar compression','Positive = lateral pain with forearm pronation-supination under axial load'],
 ['t_veo','t','Posterior','Valgus extension overload test','Positive = posteromedial pain as the elbow is snapped into extension under valgus'],
 ['t_hook','t','Anterior','Hook test (distal biceps)','Positive = no intact cord-like tendon to hook'],
 ['t_tinel_cub','t','Ulnar nerve','Tinel at the cubital tunnel'],
 ['t_flexpress','t','Ulnar nerve','Elbow flexion-pressure test','Full flexion with pressure over the cubital tunnel for up to 60 s'],
 ['t_froment','t','Ulnar nerve',"Froment's sign"],
 ['n_pulse','n','Vascular','Radial pulse diminished'],
 ['n_derm','n','Neuro','Dermatomal or peripheral nerve sensory deficit'],
 ['n_myo','n','Neuro','Myotomal weakness'],
 ['n_reflex','n','Neuro','Diminished deep tendon reflex'],
 ['n_cxreprod','n','Neuro','Cervical AROM reproduces arm symptoms'],
];
const EL_SECTIONS = [
 {id:'rf', title:'Red flag screen', kind:'check', intro:'Screen before stress testing. Any checked item moves emergency action to the top of the report.'},
 {id:'h', title:'History', kind:'check', intro:'Check only what the athlete reported. In throwers, the throwing phase that hurts localizes the structure.'},
 {id:'o', title:'Observation', kind:'check', intro:'Check what you saw.'},
 {id:'p', title:'Palpation', kind:'tri', pos:'Tender', neg:'Not tender', intro:'Negatives count.'},
 {id:'r', title:'Function, ROM, and strength', kind:'tri', pos:'Present', neg:'Absent', intro:'Record present, absent, or not assessed.'},
 {id:'t', title:'Special tests', kind:'tri', pos:'Positive', neg:'Negative', intro:'Tap "Evidence" on any test to see its accuracy for each condition it informs.'},
 {id:'n', title:'Neurovascular and cervical screen', kind:'tri', pos:'Positive', neg:'Negative', intro:'Document distal pulse and nerve function on every acute elbow injury.'},
];
const EL_GROUPS = {
  t_mvst:'ucl', t_milk:'ucl', t_valgus30:'ucl',
  t_cozen:'lat', t_mill:'lat', t_maudsley:'lat', p_latepi:'lat',
  t_tinel_cub:'uln', t_flexpress:'uln',
  n_derm:'neuro', n_myo:'neuro', n_reflex:'neuro'
};
const EL_CONDITIONS = [
 {id:'ucl', name:'UCL sprain / medial elbow instability', prior:-1.0, miss:'high',
  ev:{ h_thrower:X(2.5), h_pop_throw:X(5), h_loc_med:X(3), h_velocity:X(1.5), h_pitchvol:X(1.5), h_immature:X(.6),
   p_ucl:X(3,.3), t_mvst:T(4,.1,'ODRI05'), t_milk:X(3,.6), t_valgus30:SS(.66,.60,'ODRI05') },
  plan:'Refer throwers with a positive moving valgus stress test or a pop with medial pain for physician evaluation and imaging (MRI arthrogram). In skeletally immature throwers, the medial epicondyle apophysis usually fails before the UCL.'},
 {id:'medapo', name:'Medial epicondyle apophysitis (Little League elbow)', prior:-1.0, miss:'normal',
  ev:{ h_immature:X(4), h_thrower:X(2), h_pitchvol:X(2), h_insidious:X(1.5), h_loc_med:X(2), p_medepi:X(4,.2), r_resflex:X(1.5) },
  plan:'Rest from throwing, then a graded return with pitch-count and rest-day limits. Refer for radiographs if pain is severe or persists.'},
 {id:'medepifx', name:'Medial epicondyle avulsion fracture', prior:-2.5, miss:'high',
  ev:{ h_immature:X(3), h_acute:X(2), h_pop_throw:X(3), h_foosh:X(1.5), p_medepi:X(3,.3), o_swelling:X(2), n_derm:X(1.3) },
  plan:'Same-day radiographs (compare sides). Check ulnar nerve function; a fragment can be entrapped after elbow dislocation.'},
 {id:'medepi', name:'Medial epicondylalgia (flexor-pronator)', prior:-1.8, miss:'normal',
  ev:{ h_insidious:X(1.5), h_loc_med:X(1.5), h_immature:X(.5), p_flexorigin:X(3,.4), r_resflex:X(3,.5), h_grip:X(1.5) },
  plan:'Load management and progressive flexor-pronator strengthening. In throwers, the flexor-pronator mass also protects the UCL; test it.'},
 {id:'latepi', name:'Lateral epicondylalgia', prior:-1.2, miss:'normal',
  ev:{ h_insidious:X(1.5), h_loc_lat:X(2), h_grip:X(2.5), p_latepi:X(3,.3), t_cozen:X(3,.4), t_mill:X(2.5,.5), t_maudsley:X(2,.6), r_grip:X(2,.6), h_immature:X(.5) },
  plan:'Less common in adolescents: in a young thrower or gymnast with lateral pain, rule out capitellar OCD first. Load management and progressive wrist extensor loading.'},
 {id:'ocd', name:'Capitellar osteochondritis dissecans', prior:-2.0, miss:'high',
  ev:{ h_immature:X(2.5), h_thrower:X(1.5), h_armweight:X(3), h_loc_lat:X(2.5), h_lockcatch:X(3), h_insidious:X(1.5), o_swelling:X(1.5),
   p_radiocap:X(3,.5), r_extloss:X(3,.6), t_arc:X(3,.5) },
  plan:'Refer for radiographs and MRI. Loss of extension or mechanical symptoms suggests an unstable lesion. Panner\u2019s disease is the benign, younger (under 10) version.'},
 {id:'veo', name:'Valgus extension overload / posteromedial impingement', prior:-1.8, miss:'normal',
  ev:{ h_thrower:X(2.5), h_loc_post:X(3), h_insidious:X(1.3), p_postmed:X(3,.5), t_veo:X(4,.5), r_extloss:X(1.5) },
  plan:'Often coexists with UCL attenuation; examine the UCL. Posteromedial osteophytes and loose bodies are common in older throwers.'},
 {id:'olecstress', name:'Olecranon stress fracture / apophysitis', prior:-2.2, miss:'high',
  ev:{ h_thrower:X(2), h_armweight:X(1.5), h_loc_post:X(2.5), h_insidious:X(1.5), h_immature:X(1.3), p_olec:X(4,.3), r_extfull:X(1.3) },
  plan:'Point tenderness at the olecranon in a thrower warrants radiographs, and MRI or CT if negative.'},
 {id:'ulnar', name:'Ulnar neuritis / cubital tunnel syndrome', prior:-1.2, miss:'normal',
  ev:{ h_ulnar_par:X(4), h_thrower:X(1.3), h_loc_med:X(1.3), t_tinel_cub:T(4,.4,'NOVAK94'), t_flexpress:T(5,.2,'NOVAK94'), t_froment:X(3,.8), n_derm:X(2,.7), h_neck:X(.6), n_cxreprod:X(.6) },
  plan:'Check for ulnar nerve subluxation with flexion. Intrinsic weakness or persistent symptoms warrant referral for electrodiagnostics. Differentiate from C8 radiculopathy and thoracic outlet syndrome.'},
 {id:'bicrup', name:'Distal biceps tendon rupture', prior:-3.0, miss:'high',
  ev:{ h_eccentric:X(5), h_loc_ant:X(2), o_biceps_contour:X(5), p_biceps:X(2), r_supweak:X(3,.5), t_hook:T(10,.1,'ODRI07'), h_immature:X(.3) },
  plan:'Rare in adolescents. Refer promptly; surgical repair is time-sensitive.'},
 {id:'fx', name:'Fracture (supracondylar, radial head or neck, olecranon)', prior:-1.5, miss:'high',
  ev:{ rf_deform:X(CAP), h_acute:X(1.5), h_foosh:X(2), h_direct:X(2), o_swelling:X(2), r_extfull:SS(.97,.60,'APPEL08'), p_radhead:X(2.5,.6), p_supracond:X(3,.5), p_olec:X(1.5) },
  plan:'An athlete who can fully extend the elbow is unlikely to have a fracture (Appelboam 2008); one who can\u2019t needs radiographs. Document distal neurovascular status.'},
 {id:'bursitis', name:'Olecranon bursitis', prior:-1.2, miss:'normal',
  ev:{ o_olec_bursa:X(10), h_direct:X(2), h_armweight:X(1.5), rf_infect:X(3) },
  plan:'Compression and padding. Redness, warmth, fever, or a break in the skin suggests septic bursitis: same-day referral.'},
 {id:'radic', name:'Cervical radiculopathy / referred', prior:-2.0, miss:'high',
  ev:{ h_neck:X(4), n_cxreprod:X(3,.6), n_derm:X(3,.6), n_myo:X(3,.6), n_reflex:X(3,.7), h_ulnar_par:X(1.5) },
  plan:'Map the deficit to a root (C6 lateral forearm and thumb, C7 middle finger and triceps, C8 ulnar hand) and switch to the cervical module for the full screen.'},
];
const EL_GATES = {
  ucl:[['h_thrower','h_loc_med'],['h_pop_throw'],['p_ucl']],
  medepifx:[['h_immature','h_acute'],['h_immature','h_pop_throw']],
  ocd:[['h_immature','h_loc_lat'],['h_lockcatch'],['h_armweight','h_loc_lat']],
  olecstress:[['h_thrower','h_loc_post'],['h_armweight','h_loc_post']],
  bicrup:[['h_eccentric'],['o_biceps_contour']],
  fx:[['h_acute']],
  radic:[['h_neck'],['h_ulnar_par']],
};
for (const [k,v] of Object.entries(EL_GATES)) EL_CONDITIONS.find(c => c.id === k).gate = v;
const EL_CLUSTERS = [
 {id:'eet', name:'Elbow extension test (Appelboam 2008)', cond:['fx'], items:['r_extfull'],
  read(pos, tested, n){
   if (pos) return {tone:'warn', text:'Unable to fully extend: radiographs indicated.'};
   if (tested) return {tone:'good', text:'Full extension: fracture unlikely (sensitivity about 97% in adults; slightly lower in children, so stay alert for supracondylar and medial epicondyle injuries).'};
   return null;
  }},
 {id:'cub', name:'Cubital tunnel provocation (Novak 1994)', cond:['ulnar'], items:['t_flexpress','t_tinel_cub'],
  read(pos, tested, n){
   if (isChecked('t_flexpress')) return {tone:'warn', text:'Positive flexion-pressure test: the most accurate of the cubital tunnel provocative tests in Novak\u2019s study.'};
   if (state.t_flexpress === 'neg') return {tone:'good', text:'Negative flexion-pressure test: cubital tunnel syndrome less likely.'};
   return null;
  }},
];
function elbowInsights(A){
  const out = [];
  const {cand} = A;
  if (isChecked('h_immature') && isChecked('h_thrower') && isChecked('h_loc_med') && !isAssessed('p_medepi'))
    out.push({tone:'warn', h:'Young thrower with medial pain', p:'Palpate the medial epicondyle. With open growth plates, the apophysis usually fails before the UCL.'});
  if (isChecked('h_loc_lat') && isChecked('h_immature') && (isChecked('h_thrower') || isChecked('h_armweight')) && !['p_radiocap','r_extloss'].every(isAssessed))
    out.push({tone:'bad', h:'Lateral pain in a young thrower or gymnast', p:'Capitellar OCD before lateral epicondylalgia. Palpate the radiocapitellar joint, check terminal extension, and run the active radiocapitellar compression test.'});
  if (isChecked('h_acute') && !isAssessed('r_extfull'))
    out.push({tone:'bad', h:'Run the elbow extension test', p:'Full active extension makes a fracture unlikely; inability to extend means radiographs.'});
  if (isChecked('h_ulnar_par') && !['n_cxreprod','n_derm'].every(isAssessed))
    out.push({tone:'warn', h:'Ulnar-side tingling: localize it', p:'Cubital tunnel, C8 radiculopathy, and thoracic outlet all send symptoms to the 4th and 5th fingers. Check the neck and the medial forearm (C8 dermatome vs. ulnar nerve).'});
  if (cand.has('ucl') && !isAssessed('t_mvst'))
    out.push({tone:'warn', h:'Moving valgus stress test', p:'The most sensitive clinical UCL test (O\u2019Driscoll 2005). Pain between about 70\u00b0 and 120\u00b0 as the elbow is extended under valgus reproduces the throwing arc.'});
  if (isChecked('o_olec_bursa') && !isAssessed('rf_infect') && !state.rf_screened)
    out.push({tone:'warn', h:'Olecranon bursa swelling', p:'Screen for infection: warmth, redness, fever, or a skin break.'});
  return out;
}

/** Region definition (same shape as the prototype's REG.elbow). */
export const ELBOW = {label:'Elbow', noun:'elbow', findings:EL_FINDINGS, sections:EL_SECTIONS, groups:EL_GROUPS, conditions:EL_CONDITIONS, clusters:EL_CLUSTERS, insights:elbowInsights,
  screen:{name:'Neurovascular and cervical screen', slots:[['n_pulse'],['n_derm'],['n_myo'],['n_cxreprod']]},
  example:{primary:'ucl', state:{
    rf_screened:true, h_immature:true, h_thrower:true, h_pitchvol:true, h_insidious:true, h_loc_med:true,
    p_medepi:'pos', p_ucl:'neg', r_resflex:'pos', t_valgus30:'pos', n_derm:'neg'}}};
export default ELBOW;
