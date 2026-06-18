import { CommunityPost } from '../types';

const MOCK_POSTS: CommunityPost[] = [
  { id: '1', user_id: '', content: 'My cotton yield improved 40% using drip irrigation! 🌱', image_urls: [], post_type: 'success_story', farmer_name: 'Ramesh Kumar', village: 'Sangareddy', district: 'Sangareddy', likes_count: 28, comments_count: 7, created_at: new Date().toISOString() },
  { id: '2', user_id: '', content: 'Tomato plants have yellow spots. What should I apply?', image_urls: [], post_type: 'question', farmer_name: 'Lakshmi Devi', village: 'Guntur', district: 'Guntur', likes_count: 15, comments_count: 12, created_at: new Date().toISOString() },
  { id: '3', user_id: '', content: '⚠️ Fall Armyworm spotted in Warangal! Check maize crops.', image_urls: [], post_type: 'pest_alert', farmer_name: 'Venkatesh Rao', village: 'Warangal', district: 'Warangal', likes_count: 45, comments_count: 23, created_at: new Date().toISOString() },
];

export async function fetchCommunityFeed(type?: string): Promise<CommunityPost[]> {
  await new Promise(r => setTimeout(r, 300));
  if (type && type !== 'all') return MOCK_POSTS.filter(p => p.post_type === type);
  return MOCK_POSTS;
}

export async function createPost(content: string, postType: string, imageUrls: string[] = []): Promise<boolean> {
  await new Promise(r => setTimeout(r, 500));
  return true;
}

export async function likePost(postId: string): Promise<void> {
  await new Promise(r => setTimeout(r, 200));
}
