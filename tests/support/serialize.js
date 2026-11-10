/* Shared serializers, loaded as a classic script into both the prototype page
   and the engine harness page so both sides are reduced to identical JSON. */
(function(){
  /** Analysis object "A" -> comparable plain data (student grade fields excluded). */
  window.__serializeAnalysis = function(A){
    return {
      key:A.key, dx:A.dx,
      results:A.results.map(r => ({id:r.c.id, net:r.net, evidence:r.evidence, band:r.band.key, capped:r.capped, tested:r.tested,
        keys:r.keys.map(k => [k.fid, k.pw]), contribs:r.contribs.map(k => [k.fid, k.dir, k.w, k.raw])})),
      cand:[...A.cand], mine:[...A.mine],
      redflags:A.redflags.map(f => f[0]),
      next:A.next.map(n => ({fid:n.fid, score:n.score, reasons:n.reasons, label:n.label})),
      clusters:A.clusters.map(x => ({id:x.cl.id, pos:x.pos, tested:x.tested, res:x.res})),
      setAside:A.setAside, historyEntered:A.historyEntered, any:A.any,
      notes:A.notes, ro:A.ro, sup:A.sup
    };
  };

  /** Engine data and verbatim function sources -> comparable plain data. */
  window.__dumpEngine = function(x){
    const fn = f => (typeof f === 'function' ? f.toString() : f);
    const regions = {};
    for (const [k, R] of Object.entries(x.REG)){
      regions[k] = {
        label:R.label, noun:R.noun, screen:R.screen, example:R.example,
        findings:R.findings, sections:R.sections, groups:R.groups,
        conditions:R.conditions,
        clusters:R.clusters.map(c => ({id:c.id, name:c.name, cond:c.cond, items:c.items, read:fn(c.read)})),
        insights:fn(R.insights)
      };
    }
    const fns = {};
    for (const [name, f] of Object.entries(x.fns)) fns[name] = fn(f);
    return JSON.parse(JSON.stringify({
      regionKeys:Object.keys(x.REG), regions, SRC:x.SRC, VIDEOS:x.VIDEOS, ORDER:x.ORDER,
      ROMDEF:x.ROMDEF, MMTDEF:x.MMTDEF, GRADES:x.GRADES, GVAL:x.GVAL, ENDFEEL:x.ENDFEEL, BANDS:x.BANDS, CAP:x.CAP, fns
    }));
  };
})();
