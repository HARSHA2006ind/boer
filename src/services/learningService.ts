import { LearningArticle } from '../types';

const MOCK_ARTICLES: LearningArticle[] = [
  { id: '1', category: 'crop', title: 'Complete Guide to Rice Cultivation', summary: 'Everything about rice farming from sowing to harvest.', content: 'Rice cultivation requires careful land preparation...', reading_time: '8 min', cover_image: '🌾', created_at: '' },
  { id: '2', category: 'soil', title: 'How to Test Your Soil pH at Home', summary: 'Simple methods to check soil acidity without lab equipment.', content: 'Soil pH affects nutrient availability...', reading_time: '5 min', cover_image: '🌱', created_at: '' },
  { id: '3', category: 'irrigation', title: 'Drip Irrigation Setup Guide', summary: 'Step-by-step drip irrigation installation guide.', content: 'Drip irrigation saves 30-50% water...', reading_time: '12 min', cover_image: '💧', created_at: '' },
  { id: '4', category: 'fertilizer', title: 'NPK Fertilizers Explained', summary: 'Understanding nitrogen, phosphorus, and potassium.', content: 'NPK ratios determine plant growth...', reading_time: '6 min', cover_image: '🧪', created_at: '' },
  { id: '5', category: 'pest', title: 'Natural Pest Control Methods', summary: 'Effective organic pest control solutions.', content: 'Neem oil, garlic extract, and trap crops...', reading_time: '10 min', cover_image: '🐛', created_at: '' },
  { id: '6', category: 'organic', title: 'Starting Organic Farming Guide', summary: 'Transition to organic farming successfully.', content: 'Organic farming builds soil health...', reading_time: '15 min', cover_image: '🌿', created_at: '' },
  { id: '7', category: 'harvest', title: 'Post-Harvest Management Best Practices', summary: 'Reduce losses with proper handling.', content: 'Proper drying, sorting, and storage...', reading_time: '7 min', cover_image: '🌾', created_at: '' },
  { id: '8', category: 'finance', title: 'Farm Budgeting & Financial Planning', summary: 'Financial strategies for small farmers.', content: 'Track income, expenses, and profits...', reading_time: '9 min', cover_image: '💰', created_at: '' },
];

export async function fetchArticles(category?: string): Promise<LearningArticle[]> {
  await new Promise(r => setTimeout(r, 300));
  if (category && category !== 'all') return MOCK_ARTICLES.filter(a => a.category === category);
  return MOCK_ARTICLES;
}

export async function fetchArticleById(id: string): Promise<LearningArticle | undefined> {
  await new Promise(r => setTimeout(r, 200));
  return MOCK_ARTICLES.find(a => a.id === id);
}
