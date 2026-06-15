import { createClient } from '@supabase/supabase-js';

const s = createClient(
  'https://pqvbhkyedjrfhwxnczhp.supabase.co',
  'sb_publishable_iLPN9fkQ60aniVmciX2oHA_OAiChmD0'
);

async function main() {
  const cols = ['name','location','village','district','soil_type','land_area','land_area_unit','water_source','state','preferred_language','notes','area','size','crop_type'];
  for (const col of cols) {
    const { error } = await s.from('farms').insert({ user_id: '00000000-0000-0000-0000-000000000000', [col]: 'test' }).select();
    if (error && error.code === '42501') console.log(`✓ ${col}`);
    else if (error && error.code === '23502') console.log(`✓ ${col} (not-null on another)`);
    else if (error && error.code === 'PGRST204') {}
    else if (!error) { console.log(`✓ ${col} (inserted)`); await s.from('farms').delete().eq('user_id','00000000-0000-0000-0000-000000000000'); }
  }
  console.log('---done---');
}
main().catch(e => console.error(e));
