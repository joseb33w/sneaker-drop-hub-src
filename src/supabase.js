import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://xhhmxabftbyxrirvvihn.supabase.co',
  'sb_publishable_NZHoIxqqpSvVBP8MrLHCYA_gmg1AbN-'
)

export const TABLES = {
  appUsers: 'uNMexs7BYTXQ2_sneaker_drop_tracker_20260320_app_users',
  releases: 'uNMexs7BYTXQ2_sneaker_drop_tracker_20260320_releases',
  favorites: 'uNMexs7BYTXQ2_sneaker_drop_tracker_20260320_favorites'
}
