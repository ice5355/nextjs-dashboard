import { fetchCategoryById, fetchGamesByCategoryId } from '@/app/lib/datas/categories';
import { fetchGames } from '@/app/lib/datas/games';
import CategoryForm from '@/app/ui/categories/category-form';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/app/ui/breadcrumbs';

export default async function EditCategoryPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = parseInt(params.id);
  
  const [category, games, categoryGames] = await Promise.all([
    fetchCategoryById(id),
    fetchGames(),
    fetchGamesByCategoryId(id),
  ]);
  
  if (!category) {
    notFound();
  }

  // 获取已关联游戏的ID列表
  const categoryGameIds = categoryGames.map(game => game.game_id);

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: '分类管理', href: '/dashboard/categories' },
          { label: '编辑分类', href: `/dashboard/categories/${id}/edit`, active: true },
        ]}
      />
      <CategoryForm 
        category={category} 
        games={games}
        categoryGames={categoryGameIds}
      />
    </main>
  );
} 