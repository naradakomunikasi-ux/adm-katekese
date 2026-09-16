export const DEFAULT_PROGRAM_TYPES=[
 ['KATEKUMEN','Katekumen / Baptis Dewasa','Sakramen'],
 ['BAPTIS_BAYI','Baptis Bayi','Sakramen'],
 ['KOMUNI_PERTAMA','Komuni Pertama','Sakramen'],
 ['KRISMA','Sakramen Krisma','Sakramen'],
 ['MRT','Persiapan Perkawinan / MRT','Sakramen'],
 ['BINA_IMAN_ANAK','Bina Iman Anak','Pembinaan'],
 ['BINA_IMAN_REMAJA','Bina Iman Remaja','Pembinaan'],
 ['OMK','OMK','Pembinaan'],
 ['REKOLEKSI_RETRET','Rekoleksi / Retret','Pembinaan'],
 ['SEMINAR','Seminar','Katekese Tematik'],
 ['WEBINAR','Webinar / Katekese Tematik','Katekese Tematik'],
 ['CUSTOM','Custom Program','Pelayanan']
];

const TEMPLATE={
 KATEKUMEN:['Pendaftaran','Persiapan','Katekumenat','Tahap Liturgis','Sakramen','Mistagogi','Selesai'],
 BAPTIS_BAYI:['Pendaftaran','Data Anak & Orang Tua','Dokumen','Pembekalan Orang Tua','Verifikasi','Persetujuan Pastoral','Jadwal Baptis','Sakramen','Sertifikat','Selesai'],
 KOMUNI_PERTAMA:['Pendaftaran','Verifikasi Baptis','Pembinaan','Pertemuan','Kehadiran','Evaluasi','Persiapan Liturgi','Persetujuan','Komuni Pertama','Sertifikat','Selesai'],
 KRISMA:['Pendaftaran','Dokumen','Pembinaan','Kehadiran','Evaluasi','Pendamping / Sponsor','Persetujuan Pastoral','Sakramen Krisma','Sertifikat','Selesai']
};

export function stageKey(label,index=0){
 const key=String(label||'').normalize('NFKD').replace(/[^\w\s-]/g,'').trim().toUpperCase().replace(/[\s-]+/g,'_').slice(0,64);
 return key||`TAHAP_${index+1}`;
}
export function defaultJourneyStages(programTypeCode){
 const labels=TEMPLATE[String(programTypeCode||'').toUpperCase()]||['Pendaftaran','Persiapan','Pelaksanaan','Evaluasi','Selesai'];
 return labels.map((label,index)=>({key:stageKey(label,index),label,sortOrder:index+1,required:true,approvalRequired:/persetujuan pastoral/i.test(label)}));
}
export function normalizeJourneyStages(input,programTypeCode){
 const src=Array.isArray(input)&&input.length?input:defaultJourneyStages(programTypeCode);
 if(src.length<2||src.length>30) throw new Error('Journey stages must contain 2-30 stages');
 const seen=new Set();
 return src.map((item,index)=>{
  const label=String(item?.label||item||'').trim().slice(0,120); if(!label)throw new Error('Journey stage label is required');
  const key=stageKey(item?.key||label,index); if(seen.has(key))throw new Error(`Duplicate journey stage: ${key}`); seen.add(key);
  return {key,label,sortOrder:index+1,required:item?.required!==false,approvalRequired:Boolean(item?.approvalRequired)};
 });
}
export function normalizeProgramTypeCode(value){
 const code=String(value||'CUSTOM').trim().toUpperCase().replace(/[^A-Z0-9_]+/g,'_').replace(/^_|_$/g,'').slice(0,64);
 if(!code)throw new Error('Invalid program type'); return code;
}
