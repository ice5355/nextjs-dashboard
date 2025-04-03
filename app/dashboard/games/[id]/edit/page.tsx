import { fetchGameById } from '@/app/lib/datas/games';
import { fetchSites } from '@/app/lib/datas/sites';
import { fetchCategories } from '@/app/lib/datas/categories';
import { GameForm } from '@/app/ui/games/game-form';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/app/ui/breadcrumbs';

export const runtime = 'edge';
export default async function EditGamePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = parseInt(params.id);

  const [game, sites, categories] = await Promise.all([
    fetchGameById(id),
    fetchSites(),
    fetchCategories(),
  ]);

  if (!game) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: '游戏管理', href: '/dashboard/games' },
          {
            label: '编辑游戏',
            href: `/dashboard/games/${id}/edit`,
            active: true,
          },
        ]}
      />
      <GameForm
        game={game}
        sites={sites}
        categories={categories}
        gameSites={game.sites.map(site => ({
          site_id: site.id,
          weight: site.weight
        }))}
        gameCategories={game.categories.map(c => c.id)}
      />
    </main>

  );
} 