import {chunkDocument} from './ai-provider.js';
import {contentHash} from './embedding-provider.js';
import {KNOWLEDGE_SCOPES} from './knowledge-policy.js';

export function normalizeKnowledgeDocument(input={}){
  const title=String(input.title||'').trim().slice(0,240);
  const content=String(input.content||'').replace(/\u0000/g,'').trim();
  const scope=String(input.scope||'INTERNAL').toUpperCase();
  if(title.length<3)throw new Error('TITLE_REQUIRED');
  if(content.length<20)throw new Error('CONTENT_TOO_SHORT');
  if(!KNOWLEDGE_SCOPES.includes(scope))throw new Error('INVALID_SCOPE');
  return {title,content,scope,sourceUrl:input.sourceUrl||null,version:String(input.version||'1').slice(0,64),contentHash:contentHash(content)};
}
export function prepareKnowledgeChunks(document,{maxChars=1200,overlap=150}={}){
  const normalized=normalizeKnowledgeDocument(document);
  return chunkDocument(normalized.content,{maxChars,overlap}).map((content,index)=>({
    chunkIndex:index,content,contentHash:contentHash(content),scope:normalized.scope,title:normalized.title
  }));
}
export function ingestionFingerprint(document){
  const d=normalizeKnowledgeDocument(document);
  return contentHash([d.title,d.scope,d.version,d.contentHash].join('|'));
}
