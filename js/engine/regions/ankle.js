/**
 * Region module: ankle. Findings, sections, correlated-test groups, conditions,
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

const AN_FINDINGS = [
 ['rf_open','rf',null,'Open wound over a suspected fracture'],
 ['rf_deform','rf',null,'Gross deformity, dislocation, or bony crepitus'],
 ['rf_nv','rf',null,'Neurovascular compromise: pulses, capillary refill, color, temperature, or sensation'],
 ['rf_compart','rf',null,'Pain out of proportion, pain with passive toe stretch, or a tense leg compartment'],
 ['rf_dvt','rf',null,'Calf pain, swelling, and warmth, especially after immobilization'],
 ['rf_infect','rf',null,'Fever, hot red joint, or spreading redness'],
 ['h_immature','h','Athlete and mechanism','Skeletally immature (open growth plates)'],
 ['h_cutting','h','Athlete and mechanism','Court or field sport with cutting and jumping'],
 ['h_runner','h','Athlete and mechanism','Recent jump in running or jumping volume'],
 ['h_acute','h','Athlete and mechanism','Acute onset with a specific traumatic moment'],
 ['h_insidious','h','Athlete and mechanism','Insidious or gradual onset'],
 ['h_mech_inv','h','Athlete and mechanism','Inversion with plantarflexion (rolled the ankle)'],
 ['h_mech_er','h','Athlete and mechanism','Foot planted and externally rotated, or forced dorsiflexion'],
 ['h_mech_ever','h','Athlete and mechanism','Forced eversion'],
 ['h_mech_axial','h','Athlete and mechanism','Axial load on a plantarflexed foot, or forefoot twisted while planted'],
 ['h_mech_push','h','Athlete and mechanism','Sudden push-off or landing on a dorsiflexed foot'],
 ['h_mech_pf','h','Athlete and mechanism','Repeated forced plantarflexion (kicking, dance)'],
 ['h_lat_midfoot','h','Pain location','Lateral midfoot, worse at push-off or cutting'],
 ['h_heel_post','h','Pain location','Posterior heel'],
 ['h_heel_plantar','h','Pain location','Plantar medial heel'],
 ['h_ant_ankle','h','Pain location','Anterior ankle, worse with squatting or deep dorsiflexion'],
 ['h_post_ankle','h','Pain location','Posterior ankle, worse with forced plantarflexion'],
 ['h_prevsprain','h','Symptoms','Recurrent sprains or giving way'],
 ['h_pop','h','Symptoms','Felt or heard a pop'],
 ['h_kicked','h','Symptoms','Felt like being kicked in the back of the heel'],
 ['h_firststep','h','Symptoms','Pain with first steps in the morning or after sitting'],
 ['h_morningstiff','h','Symptoms','Morning stiffness in the Achilles'],
 ['h_catch','h','Symptoms','Catching, locking, or deep ankle ache'],
 ['h_persistent','h','Symptoms','Pain or swelling persisting more than 6 weeks after a sprain'],
 ['h_snapping','h','Symptoms','Snapping behind the lateral malleolus'],
 ['h_numb','h','Symptoms','Numbness or tingling in the foot'],
 ['h_burning','h','Symptoms','Burning or electric pain in the foot'],
 ['h_night_foot','h','Symptoms','Foot symptoms worse at night or after prolonged standing'],
 ['h_lat_leg','h','Symptoms','Pain or tingling over the anterolateral lower leg, worse with exercise'],
 ['h_tightlaces','h','Symptoms','Tight laces, boots, or strapping over the dorsal foot or ankle'],
 ['o_lat_ecch','o',null,'Lateral ecchymosis or hematoma'],
 ['o_plantar_ecch','o',null,'Plantar midfoot ecchymosis'],
 ['o_high_swell','o',null,'Swelling extending above the ankle joint line'],
 ['o_effusion','o',null,'Ankle joint effusion'],
 ['o_rigid_flat','o',null,'Flatfoot that does not correct on heel rise'],
 ['o_limp','o',null,'Antalgic gait'],
 ['o_footdrop','o',null,'Foot drop or steppage gait'],
 ['o_flatflex','o',null,'Excessive pronation or flexible flatfoot'],
 ['p_latmall','p','Ottawa rule sites','Posterior edge or tip of lateral malleolus (distal 6 cm)'],
 ['p_medmall','p','Ottawa rule sites','Posterior edge or tip of medial malleolus (distal 6 cm)'],
 ['p_5mt','p','Ottawa rule sites','Base of the 5th metatarsal'],
 ['p_navicular','p','Ottawa rule sites','Navicular, including the dorsal N-spot'],
 ['p_atfl','p','Ligaments','ATFL'],
 ['p_cfl','p','Ligaments','CFL'],
 ['p_aitfl','p','Ligaments','AITFL (anterior syndesmosis)'],
 ['p_ioreg','p','Ligaments','Tenderness extends proximally along the interosseous membrane'],
 ['p_deltoid','p','Ligaments','Deltoid ligament'],
 ['p_cuboid','p','Midfoot and heel','Cuboid, plantar or lateral surface'],
 ['p_midfoot','p','Midfoot and heel','Tarsometatarsal (Lisfranc) joint line'],
 ['p_calc','p','Midfoot and heel','Calcaneal squeeze (medial-lateral compression of posterior calcaneus)'],
 ['p_plantarf','p','Midfoot and heel','Plantar fascia origin, medial calcaneal tubercle'],
 ['p_peroneal','p','Tendons','Peroneal tendons, retromalleolar'],
 ['p_achilles_mid','p','Tendons','Achilles midportion (2\u20136 cm above insertion)'],
 ['p_achilles_gap','p','Tendons','Palpable gap in the Achilles'],
 ['p_antjoint','p','Joint lines','Anterior or anterolateral joint line'],
 ['p_posttalus','p','Joint lines','Posterolateral talus (posterior process / os trigonum)'],
 ['r_nwb','r','Function','Unable to bear weight 4 steps, immediately and now'],
 ['r_heelrise','r','Function','Single-leg heel raise painful or not possible'],
 ['r_hop','r','Function','Single-leg hop reproduces focal bony pain'],
 ['r_df_loss','r','ROM and strength','Dorsiflexion loss vs. uninvolved side'],
 ['r_subtalar','r','ROM and strength','Subtalar motion restricted'],
 ['r_pfweak','r','ROM and strength','Plantarflexion weakness'],
 ['r_everweak','r','ROM and strength','Eversion weakness'],
 ['t_antdrawer','t','Lateral ligaments','Anterior drawer','Most accurate on delayed exam at 4\u20135 days'],
 ['t_talartilt','t','Lateral ligaments','Talar tilt (inversion stress)'],
 ['t_squeeze','t','Syndesmosis and medial','Squeeze test'],
 ['t_ertest','t','Syndesmosis and medial','External rotation (Kleiger)','Positive = pain over the syndesmosis'],
 ['t_dfcomp','t','Syndesmosis and medial','Dorsiflexion-compression','Positive = pain reduced when the malleoli are compressed'],
 ['t_cotton','t','Syndesmosis and medial','Cotton (lateral talar translation)'],
 ['t_everstress','t','Syndesmosis and medial','Eversion stress','Positive = medial pain or laxity'],
 ['t_thompson','t','Achilles','Thompson','Positive = no plantarflexion with calf squeeze'],
 ['t_matles','t','Achilles','Matles','Positive = involved foot hangs in neutral or dorsiflexion'],
 ['t_arc','t','Achilles','Arc sign'],
 ['t_rlht','t','Achilles','Royal London Hospital test'],
 ['t_peroneal','t','Peroneals','Peroneal subluxation (resisted eversion with dorsiflexion)','Positive = tendon snaps or subluxes over the fibula'],
 ['t_cuboid','t','Cuboid and midfoot','Cuboid subluxation, your position and mobility assessment','Positive = you judge the cuboid subluxed. Negative = normal position and glide'],
 ['t_midtarsal','t','Cuboid and midfoot','Midtarsal adduction / supination stress','Positive = reproduces lateral midfoot pain'],
 ['t_cuboid_relief','t','Cuboid and midfoot','Relief after cuboid manipulation (whip or squeeze)','Record only after fracture is ruled out'],
 ['t_piano','t','Cuboid and midfoot','Piano key test','Positive = pain with dorsal-plantar stress of the metatarsal heads'],
 ['t_windlass','t','Plantar fascia','Windlass test (weight bearing)'],
 ['t_forced_df','t','Impingement','Forced dorsiflexion'],
 ['t_forced_pf','t','Impingement','Forced plantarflexion'],
 ['n_pulse','n','Vascular','Dorsalis pedis or posterior tibial pulse diminished'],
 ['n_derm','n','Neuro','Dermatomal or peripheral nerve sensory deficit'],
 ['n_myo','n','Neuro','Myotomal weakness'],
 ['n_reflex','n','Neuro','Diminished Achilles reflex'],
 ['n_sens_plantar','n','Nerve distribution','Sensory change, plantar foot (medial or lateral plantar nerve)'],
 ['n_sens_dorsal','n','Nerve distribution','Sensory change, dorsum of foot (superficial peroneal)'],
 ['n_sens_web','n','Nerve distribution','Sensory change, first web space (deep peroneal)'],
 ['n_dfweak','n','Nerve distribution','Weak dorsiflexion or toe extension'],
 ['n_intrinsic','n','Nerve distribution','Weak toe flexion or abductor hallucis'],
 ['n_tinel_tt','n','Entrapment tests','Tinel at the tarsal tunnel (posterior to medial malleolus)'],
 ['t_dfev','n','Entrapment tests','Dorsiflexion-eversion test','Sustained maximal dorsiflexion and eversion with toe extension; positive = reproduces tibial nerve symptoms'],
 ['n_tinel_fib','n','Entrapment tests','Tinel at the fibular head (common peroneal)'],
 ['n_tinel_spn','n','Entrapment tests','Tinel or pressure where the superficial peroneal nerve exits the fascia (distal third of anterolateral leg)'],
 ['t_spn_stretch','n','Entrapment tests','Passive plantarflexion-inversion reproduces anterolateral leg or dorsal foot symptoms'],
 ['n_tinel_dpn','n','Entrapment tests','Tinel over the anterior ankle (anterior tarsal tunnel, deep peroneal)'],
];

const AN_SECTIONS = [
 {id:'rf', title:'Red flag screen', kind:'check', intro:'Screen before stress testing. Any checked item moves emergency action to the top of the report.'},
 {id:'h', title:'History', kind:'check', intro:'Check only what the athlete reported.'},
 {id:'o', title:'Observation', kind:'check', intro:'Check what you saw.'},
 {id:'p', title:'Palpation', kind:'tri', pos:'Tender', neg:'Not tender', intro:'Negatives count, especially at the Ottawa rule sites.'},
 {id:'r', title:'Function, ROM, and strength', kind:'tri', pos:'Present', neg:'Absent', intro:'Record present, absent, or not assessed.'},
 {id:'t', title:'Special tests', kind:'tri', pos:'Positive', neg:'Negative', intro:'Tap "Evidence" on any test to see its accuracy for each condition it informs.'},
 {id:'n', title:'Neuro and vascular screen', kind:'tri', pos:'Positive', neg:'Negative', intro:'Document distal pulses and sensation on every acute ankle injury.'},
];

const AN_GROUPS = {
  t_antdrawer:'lat', t_talartilt:'lat',
  t_squeeze:'synd', t_ertest:'synd', t_dfcomp:'synd', t_cotton:'synd',
  t_thompson:'achr', t_matles:'achr', p_achilles_gap:'achr',
  t_arc:'acht', t_rlht:'acht', p_achilles_mid:'acht',
  t_cuboid:'cub', t_midtarsal:'cub', p_cuboid:'cub',
  n_derm:'neuro', n_myo:'neuro', n_reflex:'neuro',
  n_tinel_tt:'ttsprov', t_dfev:'ttsprov',
  n_sens_dorsal:'pnsens', n_sens_web:'pnsens'
};

const AN_CONDITIONS = [
 {id:'latsprain', name:'Lateral ankle sprain (ATFL / CFL)', prior:0.3, miss:'normal',
  ev:{ h_mech_inv:X(4), h_acute:X(1.5), h_cutting:X(1.3), h_prevsprain:X(1.5), o_lat_ecch:X(2.5), p_atfl:X(3,.1), p_cfl:X(2,.6), t_antdrawer:X(3,.4), t_talartilt:X(2.5,.7) },
  plan:'Grade severity; a delayed exam at 4\u20135 days is more accurate than the acute exam. Early protected weight bearing and functional rehab, with balance training to reduce re-sprain risk. With recurrent sprains, screen for chronic ankle instability.'},
 {id:'synd', name:'High ankle sprain (syndesmosis)', prior:-0.7, miss:'high',
  ev:{ h_mech_er:X(4), h_acute:X(1.3), o_high_swell:X(2), p_aitfl:X(2.5,.3), p_ioreg:X(3,.7), t_squeeze:X(4,.8), t_ertest:X(4,.6), t_dfcomp:X(2,.6), t_cotton:X(2,.8), r_heelrise:X(1.5), r_nwb:X(1.5) },
  plan:'Syndesmotic tests are specific but insensitive, so a negative test does not clear it. Suspected high ankle sprain warrants radiographs (weight-bearing or stress views) to rule out diastasis or fibular fracture. Expect considerably longer time loss than a lateral sprain.'},
 {id:'medsprain', name:'Medial (deltoid) ankle sprain', prior:-1.2, miss:'normal',
  ev:{ h_mech_ever:X(4), p_deltoid:X(3,.3), t_everstress:X(3,.6), t_ertest:X(1.5) },
  plan:'Isolated deltoid sprains are uncommon. Check the proximal fibula (Maisonneuve) and the syndesmosis; radiographs assess medial clear space.'},
 {id:'fx_ankle', name:'Ankle fracture (malleolar or physeal)', prior:-1.0, miss:'high',
  ev:{ rf_deform:X(CAP), p_latmall:X(2.5,.3), p_medmall:X(2.5,.4), r_nwb:X(3,.4), h_acute:X(1.3), h_pop:X(1.5) },
  plan:'Apply the Ottawa ankle rules. In skeletally immature athletes, tenderness over the distal fibular physis is a Salter-Harris injury until proven otherwise.'},
 {id:'fx_5mt', name:'5th metatarsal fracture (avulsion or Jones)', prior:-1.3, miss:'high',
  ev:{ p_5mt:X(4,.1), h_mech_inv:X(1.5), h_lat_midfoot:X(2), r_nwb:X(2,.5), r_hop:X(2), h_insidious:X(1.2) },
  plan:'Radiograph. Jones fractures at the metaphyseal-diaphyseal junction have a high nonunion rate in athletes and are managed very differently from tuberosity avulsions.'},
 {id:'navfx', name:'Navicular stress fracture', prior:-2.0, miss:'high',
  ev:{ p_navicular:X(4,.2), h_insidious:X(2), h_runner:X(2), r_hop:X(3,.6), h_cutting:X(1.3) },
  plan:'Often missed on plain radiographs; refer for MRI or CT if suspicion persists. N-spot tenderness in a sprinting or jumping athlete should not be treated as a sprain.'},
 {id:'lisfranc', name:'Lisfranc (tarsometatarsal) injury', prior:-2.0, miss:'high',
  ev:{ h_mech_axial:X(4), o_plantar_ecch:X(6), p_midfoot:X(3,.3), t_piano:X(3,.6), r_heelrise:X(2,.6), r_nwb:X(2) },
  plan:'Plantar ecchymosis is a classic sign. Refer for weight-bearing comparison radiographs; subtle diastasis is easy to miss, and missed injuries do poorly.'},
 {id:'achrup', name:'Achilles tendon rupture', prior:-2.5, miss:'high',
  ev:{ h_pop:X(3), h_kicked:X(6), h_mech_push:X(3), t_thompson:SS(.96,.93,'MAFF98'), p_achilles_gap:SS(.73,.89,'MAFF98'), t_matles:SS(.88,.85,'MAFF98'), r_pfweak:X(3,.5) },
  plan:'Rare in adolescents. Two or more positive AAOS criteria establish the diagnosis; refer promptly.'},
 {id:'achtend', name:'Achilles tendinopathy (midportion)', prior:-0.7, miss:'normal',
  ev:{ h_insidious:X(1.5), h_runner:X(2), h_morningstiff:X(3), h_heel_post:X(2), h_immature:X(.6), p_achilles_mid:SS(.58,.84,'MAFF03'), t_arc:SS(.52,.83,'MAFF03'), t_rlht:SS(.54,.91,'MAFF03') },
  plan:'Load management and progressive tendon loading. In younger athletes with posterior heel pain, check the calcaneal apophysis first.'},
 {id:'sever', name:'Calcaneal apophysitis (Sever\u2019s)', prior:-1.2, miss:'normal',
  ev:{ h_immature:X(5), h_heel_post:X(2), h_heel_plantar:X(1.3), p_calc:X(5,.3), h_runner:X(1.5), h_cutting:X(1.3), h_insidious:X(1.3) },
  plan:'Most common around ages 8\u201314, so mainly younger high school athletes. Self-limiting; manage load, heel cups, and calf flexibility.'},
 {id:'plantarf', name:'Plantar fasciopathy', prior:-0.8, miss:'normal',
  ev:{ h_firststep:X(4), h_heel_plantar:X(3), p_plantarf:X(3,.3), t_windlass:SS(.32,1.0,'DEGAR03'), h_runner:X(1.3), r_df_loss:X(1.5) },
  plan:'Calf and plantar fascia loading, footwear, and training volume. A negative windlass test does not rule it out.'},
 {id:'peroneal', name:'Peroneal tendinopathy or subluxation', prior:-1.2, miss:'normal',
  ev:{ h_snapping:X(5), p_peroneal:X(3,.4), t_peroneal:X(6,.7), r_everweak:X(2,.7), h_mech_inv:X(1.3), h_prevsprain:X(1.5), h_lat_midfoot:X(1.3) },
  plan:'Frank subluxation means a retinacular injury; refer, since it often fails nonoperative care in athletes.'},
 {id:'cuboid', name:'Cuboid syndrome (cuboid subluxation)', prior:-1.2, miss:'normal', confirm:['t_cuboid_relief'],
  ev:{ h_mech_inv:X(2), h_lat_midfoot:X(3), p_cuboid:X(3,.4), t_cuboid:X(5,.3), t_midtarsal:X(3,.5), t_cuboid_relief:X(6,.6), o_limp:X(1.3), h_cutting:X(1.2), r_heelrise:X(1.3), p_peroneal:X(1.3) },
  plan:'A clinical diagnosis: no imaging finding or validated test confirms it, so every weight here is expert-assigned. Rule out 5th metatarsal, cuboid, and calcaneal fractures before manipulating. Cuboid whip or squeeze, then a cuboid pad or low-Dye taping and peroneus longus strengthening. Re-assess the lateral ligaments, which the same mechanism often injures.'},
 {id:'ocl', name:'Osteochondral lesion of the talus', prior:-1.5, miss:'high',
  ev:{ h_persistent:X(4), h_catch:X(3), o_effusion:X(2), h_mech_inv:X(1.3), h_prevsprain:X(1.3), p_antjoint:X(1.5) },
  plan:'Suspect when "sprain" symptoms outlast the expected timeline. Radiographs may be normal; refer for MRI.'},
 {id:'antimp', name:'Anterior ankle impingement', prior:-1.3, miss:'normal',
  ev:{ h_ant_ankle:X(4), t_forced_df:X(3,.5), p_antjoint:X(3,.5), r_df_loss:X(2), h_prevsprain:X(1.5), h_persistent:X(1.5) },
  plan:'Often follows recurrent sprains. Mobilization and load modification; refer if a mechanical block persists.'},
 {id:'postimp', name:'Posterior ankle impingement (os trigonum)', prior:-1.8, miss:'normal',
  ev:{ h_mech_pf:X(4), h_post_ankle:X(4), t_forced_pf:X(4,.4), p_posttalus:X(3,.5) },
  plan:'Common in dancers and soccer players. Differentiate from Achilles and FHL tendinopathy; a lateral radiograph shows an os trigonum.'},
 {id:'tts', name:'Tarsal tunnel syndrome (tibial nerve)', prior:-2.0, miss:'normal',
  ev:{ h_burning:X(3), h_numb:X(2.5), h_night_foot:X(2), h_heel_plantar:X(1.3), o_flatflex:X(1.5), h_mech_ever:X(1.3),
   n_tinel_tt:X(4,.5), t_dfev:X(4,.5), n_sens_plantar:X(4,.6), n_intrinsic:X(2.5,.8), n_sens_dorsal:X(.6), n_sens_web:X(.6) },
  plan:'A clinical diagnosis supported by electrodiagnostic testing, which can be normal early. Refer if symptoms persist, progress, or include weakness; imaging if a space-occupying lesion (ganglion, varicosity) is suspected. Distinguish from plantar fasciopathy (first-step pain without paresthesia) and S1 radiculopathy (back or buttock pain, reduced Achilles reflex, dermatomal pattern).'},
 {id:'peronealn', name:'Peroneal (fibular) nerve entrapment', prior:-2.0, miss:'high',
  ev:{ h_numb:X(2), h_burning:X(2), h_lat_leg:X(3), h_tightlaces:X(3), h_mech_inv:X(1.3), o_footdrop:X(6),
   n_dfweak:X(4,.7), r_everweak:X(1.5), n_tinel_fib:X(4,.6), n_tinel_spn:X(4,.6), t_spn_stretch:X(3,.6), n_tinel_dpn:X(4,.6),
   n_sens_dorsal:X(4,.6), n_sens_web:X(4,.7), n_sens_plantar:X(.6) },
  plan:'Localize the branch. Common peroneal (fibular head): dorsiflexion and eversion weakness, dorsal foot numbness; traction after a severe inversion sprain, a direct blow, or sustained pressure. Superficial peroneal (exit through the fascia, distal anterolateral leg): dorsal foot symptoms, often exertional or after recurrent sprains. Deep peroneal (anterior tarsal tunnel): first web space numbness, tight laces or boots. New foot drop warrants prompt physician referral; persistent symptoms need EMG/NCS.'},
 {id:'coalition', name:'Tarsal coalition', prior:-2.0, miss:'normal',
  ev:{ h_prevsprain:X(3), o_rigid_flat:X(6), r_subtalar:X(4,.5), h_immature:X(1.5), h_insidious:X(1.3), p_peroneal:X(1.3) },
  plan:'Typically presents in adolescence as recurrent sprains or activity pain with a stiff flatfoot. Refer for radiographs with oblique views, or CT.'},
];

function ottawaRead(kind){
  return function(pos, tested, n){
    if (pos >= 1) return {tone:'warn', text:`${pos} criterion positive: ${kind} radiographs indicated. Specificity is low, so most positives are not fractures. Applies to acute injuries.`};
    if (tested === n) return {tone:'good', text:'All criteria negative: fracture very unlikely (pooled sensitivity about 98%, Bachmann 2003; similar in children, Dowling 2009). Radiographs usually not needed.'};
    return null;
  };
}
const AN_CLUSTERS = [
 {id:'ott_a', name:'Ottawa ankle rules (Stiell 1992)', cond:['fx_ankle','latsprain','synd','medsprain'], items:['p_latmall','p_medmall','r_nwb'], read:ottawaRead('Ankle')},
 {id:'ott_f', name:'Ottawa foot rules (Stiell 1992)', cond:['fx_5mt','navfx','lisfranc','cuboid','latsprain'], items:['p_5mt','p_navicular','r_nwb'], read:ottawaRead('Foot')},
 {id:'vandijk', name:'Delayed physical exam (van Dijk 1996)', cond:['latsprain'], items:['o_lat_ecch','p_atfl','t_antdrawer'],
  read(pos, tested, n){
   if (pos === 3) return {tone:'good', text:'At 4\u20135 days post-injury, hematoma plus ATFL tenderness plus a positive anterior drawer: about 96% sensitivity and 84% specificity for lateral ligament rupture.'};
   if (state.p_atfl === 'neg') return {tone:'good', text:'No ATFL tenderness on delayed exam makes lateral ligament rupture unlikely.'};
   return null;
  }},
 {id:'aaos', name:'Acute Achilles rupture criteria (AAOS 2010)', cond:['achrup'], items:['t_thompson','r_pfweak','p_achilles_gap','t_matles'],
  read(pos, tested, n){
   if (pos >= 2) return {tone:'bad', text:`${pos} of 4 positive. Two or more establish the diagnosis of acute rupture. Refer promptly.`};
   if (tested === n && pos === 0) return {tone:'good', text:'All four negative: acute rupture unlikely.'};
   if (pos === 1) return {tone:'warn', text:'One positive. Complete the remaining criteria.'};
   return null;
  }},
];

function ankleInsights(A){
  const out = [];
  const {mine, cand} = A;
  const ottA = ['p_latmall','p_medmall','r_nwb'], ottF = ['p_5mt','p_navicular','r_nwb'];
  if (isChecked('h_acute') && !ottA.every(isAssessed))
    out.push({tone:'bad', h:'Complete the Ottawa ankle rules', p:'For an acute injury, document the posterior edge and tip of both malleoli and the ability to bear weight four steps. Negative rules make fracture very unlikely; incomplete rules leave the question open.'});
  const cuboidInPlay = isChecked('h_lat_midfoot') || ['t_cuboid','p_cuboid','t_midtarsal','t_cuboid_relief'].some(isChecked);
  if (cuboidInPlay && !ottF.every(isAssessed))
    out.push({tone:'bad', h:'Rule out fracture before treating the cuboid', p:'Lateral midfoot pain needs the Ottawa foot rules (base of the 5th metatarsal, navicular, weight bearing) before any manipulation. A cuboid or 5th metatarsal fracture can look exactly like cuboid syndrome.'});
  if (isChecked('t_cuboid') && !isAssessed('t_cuboid_relief'))
    out.push({tone:'warn', h:'Cuboid judged subluxed: confirm with the response', p:'No validated test confirms cuboid syndrome, so your position and mobility assessment carries the diagnosis. Once fracture is ruled out, the response to a cuboid whip or squeeze is your best supporting evidence. Record it under Cuboid and midfoot.'});
  if (isChecked('t_cuboid') && !isAssessed('p_peroneal'))
    out.push({tone:'warn', h:'Check the peroneals', p:'Peroneus longus wraps around the cuboid and is often irritated alongside it. Palpate the tendons and test eversion strength.'});
  if (state.t_cuboid === 'neg' && isChecked('h_lat_midfoot'))
    out.push({tone:'warn', h:'Lateral midfoot pain with a normal cuboid', p:'Consider the 5th metatarsal base, the peroneal tendons, and the calcaneocuboid joint or anterior process of the calcaneus.'});
  if ((mine.has('latsprain') || cand.has('latsprain')) && ['h_mech_er','p_aitfl','o_high_swell','p_ioreg'].some(isChecked) && !['t_squeeze','t_ertest'].some(isAssessed))
    out.push({tone:'bad', h:'Test the syndesmosis', p:'Your findings include a feature of a high ankle sprain. Run the squeeze and external rotation tests. They are specific but insensitive, so a negative result does not clear the syndesmosis.'});
  if (isAssessed('t_antdrawer') && isChecked('h_acute'))
    out.push({tone:'warn', h:'Consider a delayed exam', p:'Pain, swelling, and guarding make the acute anterior drawer unreliable. Re-examining at 4\u20135 days (van Dijk 1996) is much more accurate for lateral ligament rupture.'});
  if (isChecked('h_prevsprain') && isChecked('h_immature') && !isAssessed('r_subtalar'))
    out.push({tone:'warn', h:'Recurrent sprains in an adolescent', p:'Check subtalar motion and whether the arch reconstitutes on heel rise. A stiff flatfoot suggests tarsal coalition.'});
  if (isChecked('h_persistent'))
    out.push({tone:'warn', h:'A sprain that won\u2019t settle', p:'Symptoms beyond 6 weeks point to an osteochondral lesion, anterior impingement, syndesmotic injury, or peroneal pathology rather than a slow sprain.'});
  if (['h_kicked','h_pop'].some(isChecked) && !isAssessed('t_thompson'))
    out.push({tone:'bad', h:'Run the Thompson test', p:'A pop or kicked-in-the-heel sensation needs the Achilles ruled out. Thompson is about 96% sensitive (Maffulli 1998).'});
  if (isChecked('h_immature') && isChecked('h_heel_post') && !isAssessed('p_calc'))
    out.push({tone:'warn', h:'Posterior heel pain with open growth plates', p:'Do the calcaneal squeeze to check for Sever\u2019s before calling it Achilles tendinopathy.'});
  const dist = ['n_sens_plantar','n_sens_dorsal','n_sens_web','n_derm'];
  if (['h_numb','h_burning'].some(isChecked) && !dist.every(isAssessed))
    out.push({tone:'warn', h:'Map the symptoms to a nerve', p:'Plantar foot points to the tibial nerve (tarsal tunnel), dorsum of the foot to the superficial peroneal, the first web space to the deep peroneal, and a dermatomal pattern with back pain to L5 or S1 radiculopathy. Check each distribution, then Tinel at the matching site.'});
  if (isChecked('h_mech_inv') && isChecked('h_numb') && !['n_dfweak','n_tinel_fib'].every(isAssessed))
    out.push({tone:'warn', h:'Numbness after an inversion sprain', p:'Severe inversion can stretch the peroneal nerve. Test dorsiflexion and toe extension strength and Tinel at the fibular head and the superficial peroneal exit point.'});
  if (['o_footdrop','n_dfweak'].some(isChecked))
    out.push({tone:'bad', h:'Dorsiflexion weakness', p:'Foot drop needs localization (fibular head vs. L5 radiculopathy) and prompt physician referral. Check hip abduction and inversion strength: both are spared in a peroneal nerve lesion and weak in L5 radiculopathy.'});
  if (isChecked('h_numb') && !['n_derm','n_pulse'].every(isAssessed))
    out.push({tone:'bad', h:'Foot numbness without a neurovascular screen', p:'Document pulses, capillary refill, and sensation.'});
  return out;
}

const AN_GATES = {
  synd:[['h_mech_er'],['o_high_swell'],['p_aitfl'],['p_ioreg']],
  fx_ankle:[['h_acute']],
  fx_5mt:[['h_lat_midfoot'],['h_acute','h_mech_inv']],
  navfx:[['h_insidious','h_runner'],['h_insidious','h_cutting']],
  lisfranc:[['h_mech_axial'],['o_plantar_ecch']],
  achrup:[['h_kicked'],['h_mech_push'],['h_pop','h_heel_post']],
  ocl:[['h_persistent'],['h_catch']],
  peronealn:[['o_footdrop'],['n_dfweak'],['h_lat_leg'],['h_tightlaces','h_numb'],['h_mech_inv','h_numb']],
};

for (const [k,v] of Object.entries(AN_GATES)) AN_CONDITIONS.find(c => c.id === k).gate = v;

/** Region definition (same shape as the prototype's REG.ankle). */
export const ANKLE = {label:'Ankle and foot', noun:'ankle/foot', findings:AN_FINDINGS, sections:AN_SECTIONS, groups:AN_GROUPS, conditions:AN_CONDITIONS, clusters:AN_CLUSTERS, insights:ankleInsights,
    screen:{name:'Neuro and vascular screen', slots:[['n_pulse'],['n_derm'],['n_myo']]},
    example:{primary:'latsprain', conf:'High', state:{
      rf_screened:true, h_cutting:true, h_mech_inv:true, h_lat_midfoot:true, o_limp:true,
      p_atfl:'pos', p_latmall:'neg', p_medmall:'neg', r_nwb:'neg', p_cuboid:'pos', r_heelrise:'pos',
      t_antdrawer:'neg', t_talartilt:'neg', t_cuboid:'pos', t_midtarsal:'pos'}}};
export default ANKLE;
