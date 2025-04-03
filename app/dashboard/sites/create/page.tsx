import { fetchGames } from '@/app/lib/datas/games';
import { SiteForm } from '@/app/ui/sites/sites-form';
import Breadcrumbs from '@/app/ui/breadcrumbs';

export const runtime = 'edge';
export default async function CreateSitePage() {
  const games = await fetchGames();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: '网站管理', href: '/dashboard/sites' },
          {
            label: '创建网站',
            href: '/dashboard/sites/create',
            active: true,
          },
        ]}
      />
      <SiteForm games={games} />
    </main>
  );
} 