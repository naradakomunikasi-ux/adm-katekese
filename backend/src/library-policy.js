import crypto from 'node:crypto';

export const MAX_LIBRARY_FILE_BYTES = 60 * 1024 * 1024;
export const LIBRARY_MIME_BY_EXTENSION = Object.freeze({
  pdf:'application/pdf',
  doc:'application/msword',
  docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls:'application/vnd.ms-excel',
  xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt:'application/vnd.ms-powerpoint',
  pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', webp:'image/webp', gif:'image/gif'
});

export function safeLibraryFilename(value=''){
  const name=String(value).normalize('NFKC').replace(/[\\/\u0000-\u001f]/g,'_').replace(/\s+/g,' ').trim();
  if(!name || name==='.' || name==='..' || name.length>180) throw new Error('INVALID_FILENAME');
  return name;
}
export function libraryExtension(filename=''){
  const match=/\.([A-Za-z0-9]+)$/.exec(String(filename));
  return match?match[1].toLowerCase():'';
}
export function validateLibraryFile({filename,mimeType,size}){
  const safeName=safeLibraryFilename(filename);
  const extension=libraryExtension(safeName);
  const expected=LIBRARY_MIME_BY_EXTENSION[extension];
  const bytes=Number(size);
  if(!expected) throw new Error('UNSUPPORTED_FILE_TYPE');
  if(!Number.isInteger(bytes)||bytes<=0||bytes>MAX_LIBRARY_FILE_BYTES) throw new Error('INVALID_FILE_SIZE');
  if(String(mimeType||'').toLowerCase()!==expected) throw new Error('MIME_EXTENSION_MISMATCH');
  return {filename:safeName,extension,mimeType:expected,size:bytes};
}
export function fileSha256(buffer){ return crypto.createHash('sha256').update(buffer).digest('hex'); }
