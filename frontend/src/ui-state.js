export const UI_STATES = ['loading','ready','empty','error','forbidden','offline','success','confirm','destructive'];
export function resolveListState({loading=false,error=null,forbidden=false,offline=false,items=[]}={}){
 if(loading)return 'loading'; if(forbidden)return 'forbidden'; if(offline)return 'offline'; if(error)return 'error'; return items.length?'ready':'empty';
}
export function stateCopy(state){ return ({loading:'Memuat data…',empty:'Belum ada data.',error:'Data belum dapat dimuat.',forbidden:'Anda tidak memiliki akses.',offline:'Koneksi terputus. Periksa jaringan Anda.',success:'Perubahan berhasil disimpan.',confirm:'Periksa kembali sebelum melanjutkan.',destructive:'Tindakan ini dapat menghapus atau membatalkan data.'})[state]||''; }
