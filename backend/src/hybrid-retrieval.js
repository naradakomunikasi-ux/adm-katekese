import {lexicalScore, normalizeQuery} from './rag.js';
import {cosineSimilarity} from './embedding-provider.js';

export function normalizeWeights({semanticWeight=0.7, lexicalWeight=0.3}={}){
  const s=Math.max(0,Number(semanticWeight)||0); const l=Math.max(0,Number(lexicalWeight)||0); const total=s+l;
  if(!total)return {semanticWeight:0,lexicalWeight:1};
  return {semanticWeight:s/total,lexicalWeight:l/total};
}

export function parseEmbedding(value){
  if(Array.isArray(value))return value.map(Number).filter(Number.isFinite);
  if(typeof value==='string'){
    try{const parsed=JSON.parse(value); return Array.isArray(parsed)?parsed.map(Number).filter(Number.isFinite):[];}catch{return [];}
  }
  return [];
}

export function hybridScore(query,item,{queryVector=[],semanticWeight=0.7,lexicalWeight=0.3}={}){
  const weights=normalizeWeights({semanticWeight,lexicalWeight});
  const lexical=lexicalScore(query,`${item.title||''} ${item.content||''}`);
  const vector=parseEmbedding(item.embedding);
  const semantic=queryVector.length&&vector.length===queryVector.length?Math.max(0,cosineSimilarity(queryVector,vector)):0;
  const hasSemantic=Boolean(queryVector.length&&vector.length===queryVector.length);
  const score=hasSemantic ? semantic*weights.semanticWeight + lexical*weights.lexicalWeight : lexical;
  return {...item,score,lexicalScore:lexical,semanticScore:semantic,retrievalMode:hasSemantic?'hybrid':'lexical'};
}

export function diversifyResults(items,{topK=5,maxChunksPerDocument=2}={}){
  const limit=Math.max(1,Math.min(20,Number(topK||5)));
  const perDocument=Math.max(1,Math.min(5,Number(maxChunksPerDocument||2)));
  const counts=new Map(); const selected=[];
  for(const item of items||[]){
    const documentKey=String(item.document_id||item.documentId||item.id||'unknown');
    const used=counts.get(documentKey)||0;
    if(used>=perDocument)continue;
    counts.set(documentKey,used+1); selected.push(item);
    if(selected.length>=limit)break;
  }
  return selected;
}

export function retrievalDiagnostics(results=[]){
  if(!results.length)return {confidence:'none',topScore:0,scoreGap:0,uniqueDocuments:0};
  const topScore=Number(results[0]?.score||0); const second=Number(results[1]?.score||0); const scoreGap=Math.max(0,topScore-second);
  const uniqueDocuments=new Set(results.map(r=>String(r.document_id||r.documentId||r.id||''))).size;
  let confidence='low';
  if(topScore>=0.7 && (scoreGap>=0.1 || uniqueDocuments>=2))confidence='high';
  else if(topScore>=0.4)confidence='medium';
  return {confidence,topScore:Number(topScore.toFixed(4)),scoreGap:Number(scoreGap.toFixed(4)),uniqueDocuments};
}

export function retrieveHybrid(query,items,options={}){
  const normalized=normalizeQuery(query,500);
  const topK=Math.max(1,Math.min(20,Number(options.topK||5)));
  const threshold=Math.max(0,Math.min(1,Number(options.threshold??0.2)));
  const ranked=(items||[])
    .map(item=>hybridScore(normalized,item,options))
    .filter(item=>item.score>=threshold)
    .sort((a,b)=>b.score-a.score || b.semanticScore-a.semanticScore || b.lexicalScore-a.lexicalScore);
  return diversifyResults(ranked,{topK,maxChunksPerDocument:options.maxChunksPerDocument??2});
}
