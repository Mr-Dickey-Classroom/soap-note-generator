/**
 * Literature sources keyed by citation id (the prototype's SRC, all blocks merged in source order).
 * Ported verbatim from reference/soap-note-generator-v8.html. Do not edit
 * likelihood ratios, priors, thresholds, labels, clusters, gates, or insight
 * text here: list concerns in docs/QUESTIONS.md instead.
 * tests/engine-source.spec.js compares this data and every function's source
 * text against the prototype.
 */

/* ============================================================
   SOURCES
   Values drafted from the cited literature. Verify against the
   primary sources before using for teaching or protocol work.
   ============================================================ */
export const SRC = {
  MICH09:"Michener LA et al. 2009, Arch Phys Med Rehabil (subacromial impingement cluster)",
  PARK05:"Park HB et al. 2005, J Bone Joint Surg Am (impingement and cuff tear test combinations)",
  ITOI99:"Itoi E et al. 1999, Am J Sports Med (empty can vs full can)",
  HERT96:"Hertel R et al. 1996, J Shoulder Elbow Surg (lag signs); LR tempered for lower later estimates",
  BARTH06:"Barth JR et al. 2006, Arthroscopy (bear hug, belly press, lift-off)",
  KIB09:"Kibler WB et al. 2009, Am J Sports Med (biceps/SLAP tests incl. uppercut, modified DLS)",
  HOLT04:"Holtby R, Razmjou H 2004, Arthroscopy (Speed's, Yergason's)",
  HEG12:"Hegedus EJ et al. 2012, Br J Sports Med (meta-analysis of shoulder tests)",
  KIM01:"Kim SH et al. 2001, Arthroscopy (biceps load II); original study, LR tempered",
  LIU96:"Liu SH et al. 1996, Am J Sports Med (crank); later studies much lower, LR tempered",
  FARB06:"Farber AJ et al. 2006, J Bone Joint Surg Am (apprehension, relocation)",
  LO04:"Lo IK et al. 2004, Am J Sports Med (surprise / anterior release)",
  KIM04:"Kim SH et al. 2004, Am J Sports Med (jerk test)",
  KIM05:"Kim SH et al. 2005, Am J Sports Med (Kim test)",
  MOREY16:"Morey VM et al. 2016, Musculoskelet Surg (Porcellini test); developer's single-center retrospective study, not yet independently validated. LRs tempered",
  CHRON04:"Chronopoulos E et al. 2004, Am J Sports Med (AC joint tests)",
  WALT04:"Walton J et al. 2004, J Bone Joint Surg Am (AC joint palpation)",
  WAIN03:"Wainner RS et al. 2003, Spine (cervical radiculopathy cluster)",
  GILL01:"Gillard J et al. 2001, Joint Bone Spine (TOS provocative tests)",
  EXP:"Expert-weighted: no single validated estimate. A reasoning weight, not a published likelihood ratio"
};
Object.assign(SRC, {
  STIELL92:"Stiell IG et al. 1992, Ann Emerg Med (Ottawa ankle and foot rules)",
  BACH03:"Bachmann LM et al. 2003, BMJ (Ottawa rules meta-analysis)",
  DOWL09:"Dowling S et al. 2009, Acad Emerg Med (Ottawa rules in children)",
  VANDIJK96:"van Dijk CN et al. 1996, J Bone Joint Surg Br (delayed physical exam of ankle sprains)",
  MAFF98:"Maffulli N 1998, Am J Sports Med (clinical diagnosis of Achilles rupture)",
  MAFF03:"Maffulli N et al. 2003, Clin J Sport Med (Achilles tendinopathy clinical tests)",
  AAOS10:"AAOS 2010 Clinical Practice Guideline (acute Achilles tendon rupture)",
  DEGAR03:"De Garceau D et al. 2003, Foot Ankle Int (windlass test)"
});
Object.assign(SRC, {
  BENJ06:"Benjaminse A et al. 2006, J Orthop Sports Phys Ther (ACL tests meta-analysis)",
  LELLI16:"Lelli A et al. 2016, Knee Surg Sports Traumatol Arthrosc (lever sign); later studies lower, LR tempered",
  RUB94:"Rubinstein RA et al. 1994, Am J Sports Med (PCL clinical exam)",
  HEG07:"Hegedus EJ et al. 2007, J Orthop Sports Phys Ther (meniscal tests meta-analysis)",
  KARA05:"Karachalios T et al. 2005, J Bone Joint Surg Am (Thessaly); later studies much lower, LR tempered",
  LOW06:"Lowery DJ et al. 2006, Arthroscopy (meniscal composite score)",
  NUNES13:"Nunes GS et al. 2013, Phys Ther Sport (patellofemoral pain test accuracy)",
  AHMAD09:"Ahmad CS et al. 2009, Am J Sports Med (moving patellar apprehension); single study, LR tempered",
  KIMSJ04:"Kim SJ et al. 2004, Arthroscopy (mediopatellar plica test); single study, LR tempered",
  STIELL95:"Stiell IG et al. 1995, Ann Emerg Med (Ottawa knee rule)",
  BACH04:"Bachmann LM et al. 2004, Ann Intern Med (Ottawa knee rule meta-analysis)"
});
Object.assign(SRC, {
  ODRI05:"O'Driscoll SW et al. 2005, Am J Sports Med (moving valgus stress test); single study, LR tempered",
  ODRI07:"O'Driscoll SW et al. 2007, Am J Sports Med (hook test); single study, LR tempered",
  NOVAK94:"Novak CB et al. 1994, J Hand Surg Am (cubital tunnel provocative tests); LR tempered",
  APPEL08:"Appelboam A et al. 2008, BMJ (elbow extension test for fracture)",
  STIELL01:"Stiell IG et al. 2001, JAMA (Canadian C-Spine Rule)",
  COOK10:"Cook C et al. 2010, J Orthop Sports Phys Ther (cervical myelopathy cluster)",
  HALL08:"Hall TM et al. 2008, J Orthop Sports Phys Ther (cervical flexion-rotation test); LR tempered",
  DEV00:"Dev\u00e9 AL et al. 2000, Spine (straight leg raise meta-analysis)".replace('Dev\u00e9','Devill\u00e9'),
  MAJ08:"Majlesi J et al. 2008, J Clin Rheumatol (slump test)",
  LAS05:"Laslett M et al. 2005, Man Ther (sacroiliac provocation cluster)",
  MASCI06:"Masci L et al. 2006, Br J Sports Med (one-legged hyperextension test for pars injury)"
});
Object.assign(SRC, {
  REIM15:"Reiman MP et al. 2015, Br J Sports Med (FAI and labral test meta-analysis)",
  LEQ08:"Lequesne M et al. 2008, Arthritis Rheum (gluteal tendinopathy tests); later studies lower, LR tempered",
  CACC12:"Cacchio A et al. 2012, Clin J Sport Med (proximal hamstring tendinopathy tests); LR tempered",
  NOUR07:"Nouraei SA et al. 2007, Plast Reconstr Surg (pelvic compression test for meralgia paresthetica); single study, LR tempered",
  DOHA15:"Weir A et al. 2015, Br J Sports Med (Doha groin pain classification)",
  HOPPE17:"Hoppe DJ et al. 2017, Orthop J Sports Med (hip microinstability tests; single-center arthroscopy cohort)"
});
Object.assign(SRC, {
  TAY07:"Tay SC et al. 2007, J Hand Surg Am (ulnar fovea sign); LR tempered"
});
