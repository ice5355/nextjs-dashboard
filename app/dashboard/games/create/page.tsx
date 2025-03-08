import { GameForm } from '@/app/ui/games/game-form';
import { fetchSites } from '@/app/lib/datas/sites';
import { fetchCategories } from '@/app/lib/datas/categories';
import Breadcrumbs from '@/app/ui/breadcrumbs';

export default async function CreateGamePage() {
  const [sites, categories] = await Promise.all([
    fetchSites(),
    fetchCategories(),
  ]);

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: '游戏管理', href: '/dashboard/games' },
          {
            label: '创建游戏',
            href: '/dashboard/games/create',
            active: true,
          },
        ]}
      />
      <GameForm
        sites={sites}
        categories={categories}
      />
    </main>
  );
} 