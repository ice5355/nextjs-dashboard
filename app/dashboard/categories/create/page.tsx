import { fetchGames } from '@/app/lib/datas/games';
import CategoryForm from '@/app/ui/categories/category-form';
import Breadcrumbs from '@/app/ui/breadcrumbs';

export default async function CreateCategoryPage() {
  const games = await fetchGames();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: '分类管理', href: '/dashboard/categories' },
          { label: '创建分类', href: '/dashboard/categories/create', active: true },
        ]}
      />
      <CategoryForm games={games} />
    </main>
  );
} 