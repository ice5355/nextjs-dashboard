import { fetchSiteById } from '@/app/lib/datas/sites';
import { fetchGames } from '@/app/lib/datas/games';
import { SiteForm } from '@/app/ui/sites/sites-form';
import Breadcrumbs from '@/app/ui/breadcrumbs';
import { notFound } from 'next/navigation';

export const runtime = 'edge';
export default async function EditSitePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = parseInt(params.id);

  const [site, games] = await Promise.all([
    fetchSiteById(id),
    fetchGames(),
  ]);

  if (!site) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: '网站管理', href: '/dashboard/sites' },
          {
            label: '编辑网站',
            href: `/dashboard/sites/${id}/edit`,
            active: true,
          },
        ]}
      />
      <SiteForm site={site} games={games} siteGames={site.games} />
    </main>
  );
} 