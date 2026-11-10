/**
 * Region module: knee. Findings, sections, correlated-test groups, conditions,
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

const KN_FINDINGS = [
 ['rf_deform','rf',null,'Gross deformity or suspected tibiofemoral dislocation'],
 ['rf_nv','rf',null,'Diminished pedal pulses, cool or pale foot, or new foot drop after knee injury'],
 ['rf_locked','rf',null,'Locked knee: cannot fully extend (possible displaced meniscal fragment)'],
 ['rf_infect','rf',null,'Hot, red, swollen knee with fever or no injury (possible septic joint)'],
 ['rf_compart','rf',null,'Pain out of proportion, pain with passive stretch, or a tense leg compartment'],
 ['rf_dvt','rf',null,'Calf pain, swelling, and warmth, especially after immobilization'],
 ['rf_tumor','rf',null,'Unexplained night pain, constitutional symptoms, or a mass around the knee'],
 ['h_immature','h','Athlete and mechanism','Skeletally immature (open growth plates)'],
 ['h_cutting','h','Athlete and mechanism','Court or field sport with cutting and pivoting'],
 ['h_jumping','h','Athlete and mechanism','Jumping sport (basketball, volleyball, high jump)'],
 ['h_runner','h','Athlete and mechanism','Recent jump in running volume or downhill running'],
 ['h_acute','h','Athlete and mechanism','Acute onset with a specific traumatic moment'],
 ['h_insidious','h','Athlete and mechanism','Insidious or gradual onset'],
 ['h_mech_pivot','h','Athlete and mechanism','Non-contact deceleration, pivot, or awkward landing'],
 ['h_mech_valgus','h','Athlete and mechanism','Valgus blow or contact to the lateral knee'],
 ['h_mech_varus','h','Athlete and mechanism','Varus force or blow to the medial knee'],
 ['h_mech_dash','h','Athlete and mechanism','Blow to the anterior tibia or fall onto a flexed knee'],
 ['h_mech_hyperext','h','Athlete and mechanism','Hyperextension'],
 ['h_mech_twist_flex','h','Athlete and mechanism','Twisting on a flexed, weight-bearing knee'],
 ['h_mech_patella','h','Athlete and mechanism','Twist with the knee near extension; kneecap shifted'],
 ['h_loc_ant','h','Pain location','Diffuse anterior or peripatellar'],
 ['h_loc_infpole','h','Pain location','Inferior pole of the patella'],
 ['h_loc_tubercle','h','Pain location','Tibial tubercle'],
 ['h_loc_med_jl','h','Pain location','Medial joint line'],
 ['h_loc_lat_jl','h','Pain location','Lateral joint line'],
 ['h_loc_lat_epi','h','Pain location','Lateral femoral epicondyle, worse running downhill'],
 ['h_loc_pes','h','Pain location','Anteromedial, just below the joint line'],
 ['h_loc_post','h','Pain location','Posterior knee'],
 ['h_thigh','h','Pain location','Also groin, hip, or anterior thigh pain'],
 ['h_pop','h','Symptoms','Felt or heard a pop'],
 ['h_swell_fast','h','Symptoms','Swelling within about 2 hours'],
 ['h_swell_slow','h','Symptoms','Swelling developing over 12\u201324 hours'],
 ['h_couldnt','h','Symptoms','Could not continue playing'],
 ['h_giveway','h','Symptoms','Giving way or instability'],
 ['h_catch','h','Symptoms','Catching or locking episodes'],
 ['h_kneecap_out','h','Symptoms','Felt the kneecap slip out or dislocate'],
 ['h_prev_patella','h','Symptoms','Previous patellar dislocation or subluxation'],
 ['h_stairs','h','Symptoms','Pain with stairs, squatting, or prolonged sitting'],
 ['o_limp','o',null,'Antalgic gait or limp'],
 ['o_tubercle_prom','o',null,'Prominent tibial tubercle'],
 ['o_jsign','o',null,'J-sign during active extension'],
 ['o_quad_atrophy','o',null,'Quadriceps atrophy'],
 ['p_patella','p','Ottawa rule sites','Isolated patellar tenderness'],
 ['p_fibhead','p','Ottawa rule sites','Fibular head'],
 ['p_effusion','p','Joint','Effusion (stroke test or ballottement)'],
 ['p_medjl','p','Joint','Medial joint line'],
 ['p_latjl','p','Joint','Lateral joint line'],
 ['p_medfem','p','Joint','Medial femoral condyle with the knee flexed'],
 ['p_mcl','p','Ligaments and retinaculum','MCL'],
 ['p_lcl','p','Ligaments and retinaculum','LCL'],
 ['p_mpfl','p','Ligaments and retinaculum','Medial retinaculum / MPFL (adductor tubercle)'],
 ['p_plica','p','Ligaments and retinaculum','Medial plica band'],
 ['p_infpole','p','Tendons and apophyses','Inferior pole of the patella / proximal patellar tendon'],
 ['p_tubercle','p','Tendons and apophyses','Tibial tubercle'],
 ['p_latepi','p','Tendons and apophyses','ITB at the lateral femoral epicondyle'],
 ['p_pes','p','Tendons and apophyses','Pes anserine'],
 ['r_nwb','r','Function','Unable to bear weight 4 steps, immediately and now'],
 ['r_flex90','r','Function','Unable to flex to 90\u00b0'],
 ['r_extlag','r','Function','Cannot straight-leg raise or has an extensor lag'],
 ['r_extblock','r','Function','Lacks full extension with a springy block'],
 ['r_squat','r','Function','Pain with squatting'],
 ['r_sldecline','r','Function','Single-leg decline squat reproduces inferior pole pain'],
 ['r_hyperext_pain','r','Function','Pain with forced passive hyperextension'],
 ['r_flex_pain','r','Function','Pain with maximal passive flexion'],
 ['r_hipir','r','Hip screen','Hip IR limited or painful vs. uninvolved side'],
 ['r_drehmann','r','Hip screen','Hip rolls into ER with passive hip flexion (Drehmann sign)'],
 ['t_lachman','t','ACL','Lachman'],
 ['t_pivot','t','ACL','Pivot shift'],
 ['t_antdrawer','t','ACL','Anterior drawer'],
 ['t_lever','t','ACL','Lever sign (Lelli)'],
 ['t_postdrawer','t','PCL','Posterior drawer'],
 ['t_sag','t','PCL','Posterior sag sign'],
 ['t_qat','t','PCL','Quadriceps active test'],
 ['t_valgus30','t','Collaterals and posterolateral corner','Valgus stress at 30\u00b0'],
 ['t_valgus0','t','Collaterals and posterolateral corner','Valgus stress at 0\u00b0','Laxity in full extension implies combined injury'],
 ['t_varus30','t','Collaterals and posterolateral corner','Varus stress at 30\u00b0'],
 ['t_varus0','t','Collaterals and posterolateral corner','Varus stress at 0\u00b0','Laxity in full extension implies combined injury'],
 ['t_dial','t','Collaterals and posterolateral corner','Dial test','Positive = more than 10\u00b0 side-to-side ER difference'],
 ['t_errecurv','t','Collaterals and posterolateral corner','External rotation recurvatum'],
 ['t_mcmurray','t','Meniscus','McMurray','Positive = pain or click at the joint line'],
 ['t_thessaly','t','Meniscus','Thessaly at 20\u00b0'],
 ['t_apley','t','Meniscus','Apley compression'],
 ['t_patappre','t','Patellofemoral','Moving patellar apprehension'],
 ['t_glide','t','Patellofemoral','Lateral patellar glide, excessive'],
 ['t_pattilt','t','Patellofemoral','Patellar tilt'],
 ['t_clarke','t','Patellofemoral',"Clarke's (patellar grind)"],
 ['t_mpp','t','Other','Mediopatellar plica test'],
 ['t_noble','t','Other','Noble compression'],
 ['t_ober','t','Other','Ober'],
 ['t_wilson','t','Other','Wilson'],
 ['n_pulse','n','Vascular','Dorsalis pedis or posterior tibial pulse diminished'],
 ['n_derm','n','Neuro','Dermatomal or peripheral nerve sensory deficit'],
 ['n_myo','n','Neuro','Myotomal weakness'],
 ['n_dfweak','n','Neuro','Weak dorsiflexion or toe extension (peroneal nerve)'],
];

const KN_SECTIONS = [
 {id:'rf', title:'Red flag screen', kind:'check', intro:'Screen before stress testing. Any checked item moves emergency action to the top of the report.'},
 {id:'h', title:'History', kind:'check', intro:'Check only what the athlete reported. Mechanism and swelling timeline do most of the differential work.'},
 {id:'o', title:'Observation', kind:'check', intro:'Check what you saw.'},
 {id:'p', title:'Palpation', kind:'tri', pos:'Tender', neg:'Not tender', intro:'For effusion, "Tender" means present. Negatives count, especially at the Ottawa rule sites.'},
 {id:'r', title:'Function, ROM, and hip screen', kind:'tri', pos:'Present', neg:'Absent', intro:'Record present, absent, or not assessed.'},
 {id:'t', title:'Special tests', kind:'tri', pos:'Positive', neg:'Negative', intro:'Tap "Evidence" on any test to see its accuracy for each condition it informs.'},
 {id:'n', title:'Neurovascular screen', kind:'tri', pos:'Positive', neg:'Negative', intro:'Document distal pulses and peroneal nerve function on every acute knee injury.'},
];

const KN_GROUPS = {
  t_lachman:'acl', t_antdrawer:'acl', t_lever:'acl', t_pivot:'acl',
  t_postdrawer:'pcl', t_sag:'pcl', t_qat:'pcl',
  t_mcmurray:'men', t_thessaly:'men', t_apley:'men', r_hyperext_pain:'menrom', r_flex_pain:'menrom',
  t_valgus30:'val', t_valgus0:'val', t_varus30:'var', t_varus0:'var', t_dial:'plc', t_errecurv:'plc',
  p_infpole:'pt', r_sldecline:'pt', t_clarke:'pf', t_pattilt:'pf', r_hipir:'hip', r_drehmann:'hip',
  n_derm:'neuro', n_myo:'neuro'
};

const KN_CONDITIONS = [
 {id:'acl', name:'ACL tear', prior:-0.5, miss:'high', confirm:['t_lachman','t_pivot','t_lever','t_antdrawer'],
  ev:{ h_mech_pivot:X(3), h_pop:X(3), h_swell_fast:X(3), h_couldnt:X(1.5), h_giveway:X(2), h_cutting:X(1.3), p_effusion:X(2,.4),
   t_lachman:SS(.85,.94,'BENJ06'), t_pivot:SS(.24,.98,'BENJ06'), t_antdrawer:SS(.55,.92,'BENJ06'), t_lever:T(5,.4,'LELLI16') },
  plan:'Refer for physician evaluation and MRI. In skeletally immature athletes, a tibial spine avulsion can mimic ACL rupture; radiographs first. Look for associated MCL, meniscal, and posterolateral corner injury.'},
 {id:'pcl', name:'PCL tear', prior:-1.8, miss:'high', confirm:['t_postdrawer','t_sag','t_qat'],
  ev:{ h_mech_dash:X(5), h_mech_hyperext:X(2), h_loc_post:X(1.5), h_swell_slow:X(1.3),
   t_postdrawer:SS(.90,.99,'RUB94'), t_sag:SS(.79,1.0,'RUB94'), t_qat:SS(.54,.97,'RUB94') },
  plan:'Check the tibial step-off before the anterior drawer, or a sagging tibia returning forward reads as a false-positive anterior drawer. Screen the posterolateral corner (dial test at 30\u00b0 and 90\u00b0) and refer.'},
 {id:'mcl', name:'MCL sprain', prior:0, miss:'normal',
  ev:{ h_mech_valgus:X(4), h_loc_med_jl:X(1.5), p_mcl:X(3,.3), t_valgus30:X(5,.2), t_valgus0:X(2), h_acute:X(1.3) },
  plan:'Grade by laxity at 30\u00b0. Laxity at 0\u00b0 means combined cruciate or capsular injury. Distinguish from a medial meniscus tear (MCL tenderness above or below the joint line vs. at it).'},
 {id:'plc', name:'LCL / posterolateral corner injury', prior:-2.0, miss:'high',
  ev:{ h_mech_varus:X(5), h_mech_hyperext:X(2), p_lcl:X(3,.5), p_fibhead:X(1.5), t_varus30:X(5,.5), t_varus0:X(3), t_dial:X(5,.6), t_errecurv:X(4,.8), n_dfweak:X(2), h_giveway:X(1.3) },
  plan:'Missed posterolateral corner injuries cause cruciate reconstruction failure. Check peroneal nerve function; refer for MRI.'},
 {id:'medmen', name:'Medial meniscus tear', prior:-0.5, miss:'normal',
  ev:{ h_mech_twist_flex:X(3), h_catch:X(2.5), h_swell_slow:X(2), h_loc_med_jl:X(2), h_loc_lat_jl:X(.5), p_medjl:SS(.63,.77,'HEG07'),
   t_mcmurray:SS(.70,.71,'HEG07'), t_thessaly:T(3,.4,'KARA05'), t_apley:X(2,.6), r_hyperext_pain:X(2,.7), r_flex_pain:X(2,.7), r_extblock:X(4), p_effusion:X(1.5,.7) },
  plan:'Mechanical symptoms or a block to extension warrant referral. Otherwise, a trial of rehab is reasonable for many degenerative-pattern tears, but acute tears in young athletes are often repairable, so refer early rather than late.'},
 {id:'latmen', name:'Lateral meniscus tear', prior:-0.9, miss:'normal',
  ev:{ h_mech_twist_flex:X(3), h_catch:X(2.5), h_swell_slow:X(2), h_loc_lat_jl:X(2), h_loc_med_jl:X(.5), p_latjl:SS(.63,.77,'HEG07'),
   t_mcmurray:SS(.70,.71,'HEG07'), t_thessaly:T(3,.4,'KARA05'), t_apley:X(2,.6), r_hyperext_pain:X(2,.7), r_flex_pain:X(2,.7), r_extblock:X(4), p_effusion:X(1.5,.7), h_mech_pivot:X(1.3) },
  plan:'Often accompanies acute ACL tears. Same referral logic as medial tears; consider a discoid meniscus in a younger athlete with snapping and lateral pain.'},
 {id:'patinst', name:'Patellar dislocation / instability', prior:-0.8, miss:'high',
  ev:{ h_kneecap_out:X(8), h_prev_patella:X(4), h_mech_patella:X(3), h_swell_fast:X(2), p_mpfl:X(3,.4), t_patappre:T(5,.2,'AHMAD09'), o_jsign:X(2), p_effusion:X(1.5), t_glide:X(2,.7) },
  plan:'A first-time dislocation with hemarthrosis needs radiographs for an osteochondral fragment; refer. Recurrent instability warrants orthopedic evaluation.'},
 {id:'pfps', name:'Patellofemoral pain', prior:0.3, miss:'normal',
  ev:{ h_insidious:X(1.5), h_stairs:X(3), h_loc_ant:X(3), h_runner:X(1.3), h_immature:X(1.2), h_acute:X(.5),
   r_squat:SS(.91,.50,'NUNES13'), t_pattilt:SS(.43,.92,'NUNES13'), t_clarke:X(1.3,.9), p_effusion:X(.5) },
  plan:'A diagnosis of exclusion: anterior knee pain with squatting, stairs, or sitting, and no effusion or structural findings. Hip and knee strengthening, load management.'},
 {id:'pattend', name:'Patellar tendinopathy (jumper\u2019s knee)', prior:-0.7, miss:'normal',
  ev:{ h_jumping:X(3), h_loc_infpole:X(4), h_insidious:X(1.5), h_immature:X(.5), p_infpole:X(2,.3), r_sldecline:X(4,.3) },
  plan:'Tenderness alone is common in asymptomatic jumping athletes; pain with loading (decline squat) matters more. Progressive tendon loading and jump-volume management.'},
 {id:'osgood', name:'Osgood-Schlatter disease', prior:-0.8, miss:'normal',
  ev:{ h_immature:X(4), h_loc_tubercle:X(5), p_tubercle:X(4,.2), o_tubercle_prom:X(3), h_jumping:X(1.5), h_runner:X(1.3), h_insidious:X(1.5) },
  plan:'Self-limiting; manage load and quad/hip flexibility. Acute pain and inability to extend after a jump suggests a tibial tubercle avulsion fracture instead.'},
 {id:'slj', name:'Sinding-Larsen-Johansson syndrome', prior:-1.8, miss:'normal',
  ev:{ h_immature:X(4), h_loc_infpole:X(3), p_infpole:X(3,.3), h_jumping:X(1.5), h_insidious:X(1.3) },
  plan:'The inferior-pole equivalent of Osgood-Schlatter in younger adolescents. Load management.'},
 {id:'itbs', name:'Iliotibial band syndrome', prior:-1.0, miss:'normal',
  ev:{ h_runner:X(2.5), h_loc_lat_epi:X(5), h_insidious:X(1.3), p_latepi:X(3,.3), t_noble:X(3,.6), t_ober:X(1.5,.8) },
  plan:'Training error is the usual driver. Hip abductor strength and running volume.'},
 {id:'pes', name:'Pes anserine bursitis / tendinopathy', prior:-1.8, miss:'normal',
  ev:{ h_loc_pes:X(5), p_pes:X(4,.3), h_runner:X(1.3), h_insidious:X(1.3), p_medjl:X(.7) },
  plan:'Distinguish from medial meniscus tear: tenderness sits below the joint line.'},
 {id:'plica', name:'Medial plica syndrome', prior:-2.0, miss:'normal',
  ev:{ t_mpp:T(5,.3,'KIMSJ04'), p_plica:X(3,.5), h_catch:X(1.3), h_loc_ant:X(1.5), h_insidious:X(1.3) },
  plan:'Usually responds to load management and quad work; persistent mechanical symptoms warrant referral.'},
 {id:'ocd', name:'Osteochondritis dissecans', prior:-2.0, miss:'high',
  ev:{ h_immature:X(2), h_insidious:X(1.5), h_catch:X(2), p_effusion:X(2), p_medfem:X(3,.6), t_wilson:X(2,.9), h_jumping:X(1.2) },
  plan:'Refer for radiographs including a tunnel (notch) view, then MRI. Wilson\u2019s test misses most lesions, so a negative result does not clear it.'},
 {id:'fx', name:'Fracture (patella, tibial plateau, physeal) or osteochondral fracture', prior:-1.2, miss:'high',
  ev:{ rf_deform:X(CAP), p_patella:X(2.5,.5), p_fibhead:X(2,.7), r_flex90:X(2.5,.6), r_nwb:X(3,.5), h_swell_fast:X(1.5), h_acute:X(1.3) },
  plan:'Apply the Ottawa knee rule. In skeletally immature athletes, physeal injuries of the distal femur and proximal tibia can masquerade as ligament sprains; tenderness at the physis warrants radiographs.'},
 {id:'ext', name:'Extensor mechanism disruption (tendon rupture or tubercle avulsion)', prior:-2.5, miss:'high',
  ev:{ r_extlag:X(8,.1), h_pop:X(2), h_jumping:X(2), p_tubercle:X(2), h_immature:X(1.5), p_effusion:X(1.5) },
  plan:'Inability to straight-leg raise after a jump or landing needs same-day referral. In adolescents, a tibial tubercle avulsion fracture is more likely than a tendon rupture.'},
 {id:'scfe', name:'Referred hip pathology (SCFE)', prior:-3.0, miss:'high',
  ev:{ h_thigh:X(3), h_immature:X(3), o_limp:X(2), h_insidious:X(1.5), r_hipir:X(6,.3), r_drehmann:X(8,.8), p_medjl:X(.6), p_effusion:X(.4) },
  plan:'Knee pain with a limp in an adolescent is the hip until proven otherwise. Stop weight bearing (crutches) and refer the same day for AP and frog-leg lateral radiographs of both hips.'},
];

const KN_GATES = {
  acl:[['h_mech_pivot'],['h_pop'],['h_swell_fast'],['h_giveway'],['h_mech_hyperext'],['h_mech_valgus']],
  pcl:[['h_mech_dash'],['h_mech_hyperext'],['h_loc_post','h_acute']],
  plc:[['h_mech_varus'],['h_mech_hyperext'],['n_dfweak']],
  patinst:[['h_kneecap_out'],['h_prev_patella'],['h_mech_patella'],['o_jsign']],
  ocd:[['h_immature','h_catch'],['h_immature','p_effusion','h_insidious'],['p_medfem']],
  fx:[['h_acute']],
  ext:[['r_extlag'],['h_pop','h_jumping']],
  scfe:[['h_immature','h_thigh'],['h_immature','h_insidious','o_limp'],['r_hipir'],['r_drehmann']],
};
for (const [k,v] of Object.entries(KN_GATES)) KN_CONDITIONS.find(c => c.id === k).gate = v;

const KN_CLUSTERS = [
 {id:'ottk', name:'Ottawa knee rule (Stiell 1995)', cond:['fx','acl','mcl','pcl','plc','medmen','latmen','patinst','ext'], items:['p_patella','p_fibhead','r_flex90','r_nwb'],
  read(pos, tested, n){
   if (pos >= 1) return {tone:'warn', text:`${pos} criterion positive: knee radiographs indicated. Specificity is modest, so most positives are not fractures. Applies to acute injuries.`};
   if (tested === n) return {tone:'good', text:'All criteria negative: fracture very unlikely (pooled sensitivity about 99%, Bachmann 2004). Pediatric validation is more limited; stay alert for physeal injury in younger athletes.'};
   return null;
  }},
 {id:'aclx', name:'ACL laxity tests (Benjaminse 2006)', cond:['acl'], items:['t_lachman','t_pivot','t_antdrawer'],
  read(pos, tested, n){
   if (isChecked('t_pivot')) return {tone:'bad', text:'Positive pivot shift: highly specific (about 98%). Strongly supports ACL rupture.'};
   if (isChecked('t_lachman')) return {tone:'bad', text:'Positive Lachman: sensitivity about 85%, specificity about 94%. Supports ACL rupture.'};
   if (state.t_lachman === 'neg') return {tone:'good', text:'Negative Lachman (\u2212LR about 0.16) argues against ACL rupture, unless guarding or a tense effusion limited the exam.'};
   return null;
  }},
 {id:'pclx', name:'PCL exam (Rubinstein 1994)', cond:['pcl'], items:['t_postdrawer','t_sag','t_qat'],
  read(pos, tested, n){
   if (pos >= 1) return {tone:'bad', text:`${pos} positive. Posterior drawer and sag sign are highly specific; supports PCL injury.`};
   if (state.t_postdrawer === 'neg') return {tone:'good', text:'Negative posterior drawer (sensitivity about 90%) makes a PCL tear unlikely.'};
   return null;
  }},
 {id:'lowery', name:'Meniscal composite (Lowery 2006)', cond:['medmen','latmen'], items:['h_catch','r_hyperext_pain','r_flex_pain','t_mcmurray','p_medjl','p_latjl'],
  read(pos, tested, n){
   const jlt = isChecked('p_medjl') || isChecked('p_latjl');
   const count = ['h_catch','r_hyperext_pain','r_flex_pain','t_mcmurray'].filter(isChecked).length + (jlt ? 1 : 0);
   if (count === 5) return {tone:'bad', text:'All five positive (catching/locking history, pain with forced hyperextension, pain with maximal flexion, McMurray, joint line tenderness): specificity about 99%, +LR about 11.'};
   return {tone:'warn', text:`${count} of 5 composite findings positive. The composite is designed to rule in when all five are present; fewer positives are less informative.`};
  }},
];

function kneeInsights(A){
  const out = [];
  const {mine, cand} = A;
  const ott = ['p_patella','p_fibhead','r_flex90','r_nwb'];
  if (isChecked('h_acute') && !ott.every(isAssessed))
    out.push({tone:'bad', h:'Complete the Ottawa knee rule', p:'For an acute injury, document isolated patellar tenderness, fibular head tenderness, ability to flex to 90\u00b0, and ability to bear weight four steps.'});
  if (isChecked('h_swell_fast') && !['t_lachman','t_patappre'].every(isAssessed))
    out.push({tone:'bad', h:'Rapid swelling means hemarthrosis', p:'Swelling within about 2 hours points first to ACL rupture, then patellar dislocation, osteochondral fracture, and peripheral meniscal tear. Run Lachman and the moving patellar apprehension test.'});
  if (['t_valgus0','t_varus0'].some(isChecked))
    out.push({tone:'bad', h:'Laxity in full extension', p:'Collateral laxity at 0\u00b0 implies combined cruciate or capsular injury, and a spontaneously reduced knee dislocation is possible. Check and document pedal pulses and peroneal nerve function, and refer urgently.'});
  if ((isChecked('h_mech_varus') || isChecked('t_varus30') || isChecked('p_lcl')) && !isAssessed('t_dial'))
    out.push({tone:'warn', h:'Screen the posterolateral corner', p:'Add the dial test at 30\u00b0 and 90\u00b0 and external rotation recurvatum. Missed posterolateral corner injuries undermine cruciate reconstruction.'});
  if (cand.has('acl') && isAssessed('t_antdrawer') && !isAssessed('t_lachman'))
    out.push({tone:'warn', h:'Lachman over anterior drawer', p:'The anterior drawer is limited by hamstring guarding and effusion (sensitivity about 55%). Lachman is the more sensitive test (about 85%).'});
  if (state.t_lachman === 'neg' && isChecked('p_effusion') && isChecked('h_acute') && cand.has('acl'))
    out.push({tone:'warn', h:'A negative acute Lachman is less reliable', p:'Guarding and a tense effusion reduce sensitivity. If the history is strong (pivot, pop, rapid swelling), re-examine in a few days or refer.'});
  if (isChecked('h_immature') && cand.has('acl'))
    out.push({tone:'warn', h:'Skeletally immature athlete with an ACL-type injury', p:'A tibial spine avulsion can mimic ACL rupture, and physeal fractures can mimic ligament sprains. Radiographs come first.'});
  if (cand.has('scfe') && !['r_hipir','r_drehmann'].every(isAssessed))
    out.push({tone:'bad', h:'Examine the hip', p:'Knee pain with a limp or thigh pain in an adolescent can be referred from a slipped capital femoral epiphysis. Check hip IR and the Drehmann sign before settling on a knee diagnosis.'});
  if (isChecked('h_loc_infpole') && isChecked('h_immature') && !isAssessed('p_infpole'))
    out.push({tone:'warn', h:'Inferior pole pain with open growth plates', p:'Palpate the inferior pole: in younger adolescents this is more often Sinding-Larsen-Johansson than patellar tendinopathy.'});
  if ((cand.has('medmen') || cand.has('latmen')) && isChecked('h_mech_valgus') && !isAssessed('p_mcl'))
    out.push({tone:'warn', h:'Separate the MCL from the medial meniscus', p:'Palpate the MCL above and below the joint line and test valgus at 30\u00b0. The two often coexist after a valgus mechanism.'});
  return out;
}

/** Region definition (same shape as the prototype's REG.knee). */
export const KNEE = {label:'Knee', noun:'knee', findings:KN_FINDINGS, sections:KN_SECTIONS, groups:KN_GROUPS, conditions:KN_CONDITIONS, clusters:KN_CLUSTERS, insights:kneeInsights,
  screen:{name:'Neurovascular screen', slots:[['n_pulse'],['n_derm'],['n_myo','n_dfweak']]},
  example:{primary:'medmen', state:{
    rf_screened:true, h_cutting:true, h_jumping:true, h_acute:true, h_mech_pivot:true, h_pop:true, h_swell_fast:true, h_couldnt:true,
    p_effusion:'pos', p_medjl:'pos', p_patella:'neg', p_fibhead:'neg', r_flex90:'pos', r_nwb:'neg',
    t_mcmurray:'pos', t_antdrawer:'neg', n_pulse:'neg'}}};
export default KNEE;
