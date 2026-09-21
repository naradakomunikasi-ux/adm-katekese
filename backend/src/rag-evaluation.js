export function reciprocalRank(rankedIds=[], relevantIds=[]){
  const set=new Set(relevantIds); const idx=rankedIds.findIndex(id=>set.has(id)); return idx<0?0:1/(idx+1);
}
export function recallAtK(rankedIds=[], relevantIds=[], k=5){
  const rel=new Set(relevantIds); if(!rel.size)return 1; const hit=new Set(rankedIds.slice(0,k).filter(id=>rel.has(id))); return hit.size/rel.size;
}
export function citationCoverage(answer={}){
  if(!answer.grounded)return answer.citations?.length?1:0;
  const evidenceIds=new Set((answer.evidence||[]).map(x=>String(x.id||x.document_id||'')));
  const cited=(answer.citations||[]).map(String); if(!evidenceIds.size)return 0;
  return cited.filter(id=>evidenceIds.has(id)).length/Math.max(1,cited.length);
}
export function evaluateRetrieval(cases=[]){
  const rows=cases.map(c=>({id:c.id,recall:recallAtK(c.rankedIds,c.relevantIds,c.k||5),rr:reciprocalRank(c.rankedIds,c.relevantIds)}));
  const mean=(key)=>rows.length?rows.reduce((s,r)=>s+r[key],0)/rows.length:0;
  return {cases:rows.length,recallAtK:mean('recall'),mrr:mean('rr'),passed:rows.every(r=>r.recall>0&&r.rr>0)};
}
