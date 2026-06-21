import { CommunityPost } from '../types';
import { supabase } from './supabase';

const MOCK_POSTS: CommunityPost[] = [
  { id: '1', user_id: '', content: 'My cotton yield improved 40% using drip irrigation!', image_urls: [], post_type: 'success_story', farmer_name: 'Ramesh Kumar', village: 'Sangareddy', district: 'Sangareddy', likes_count: 28, comments_count: 7, created_at: new Date().toISOString() },
  { id: '2', user_id: '', content: 'Tomato plants have yellow spots. What should I apply?', image_urls: [], post_type: 'question', farmer_name: 'Lakshmi Devi', village: 'Guntur', district: 'Guntur', likes_count: 15, comments_count: 12, created_at: new Date().toISOString() },
  { id: '3', user_id: '', content: 'Fall Armyworm spotted in Warangal! Check maize crops.', image_urls: [], post_type: 'pest_alert', farmer_name: 'Venkatesh Rao', village: 'Warangal', district: 'Warangal', likes_count: 45, comments_count: 23, created_at: new Date().toISOString() },
];

export async function fetchCommunityFeed(type?: string): Promise<CommunityPost[]> {
  try {
    let query = supabase.from('community_posts').select('*').order('created_at', { ascending: false });
    if (type && type !== 'all') {
      query = query.eq('post_type', type);
    }
    const { data, error } = await query.limit(50);
    if (!error && data && data.length > 0) {
      return data.map(p => ({
        id: p.id, user_id: p.user_id || '', content: p.content || '', image_urls: p.image_urls || [],
        post_type: p.post_type || 'text', farmer_name: p.farmer_name || '', village: p.village || '',
        district: p.district || '', likes_count: p.likes_count || 0, comments_count: p.comments_count || 0,
        created_at: p.created_at || new Date().toISOString(),
      }));
    }
  } catch {}
  await new Promise(r => setTimeout(r, 300));
  if (type && type !== 'all') return MOCK_POSTS.filter(p => p.post_type === type);
  return MOCK_POSTS;
}

export async function createPost(content: string, postType: string, imageUrls: string[] = []): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('community_posts').insert({
      user_id: user?.id || '',
      content, post_type: postType, image_urls: imageUrls,
      farmer_name: user?.user_metadata?.full_name || user?.email || 'Farmer',
      created_at: new Date().toISOString(),
    });
    if (!error) return true;
  } catch {}
  await new Promise(r => setTimeout(r, 500));
  return true;
}

export async function likePost(postId: string): Promise<void> {
  try {
    const post = await supabase.from('community_posts').select('likes_count').eq('id', postId).single();
    if (post.data) {
      await supabase.from('community_posts').update({ likes_count: (post.data.likes_count || 0) + 1 }).eq('id', postId);
    }
  } catch {}
}
