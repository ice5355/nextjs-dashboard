import {
  GlobeAltIcon,
  ComputerDesktopIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { fetchSiteGameCategoryData } from '@/app/lib/datas/dashboard';

const iconMap = {
  sites: GlobeAltIcon,
  games: ComputerDesktopIcon,
  categories: TagIcon,
};

export default async function CardWrapper() {
  const {
    numberOfSites,
    numberOfGames,
    numberOfCategories,
  } = await fetchSiteGameCategoryData();

  return (
    <>
      <Card title="网站总数" value={numberOfSites} type="sites" />
      <Card title="游戏总数" value={numberOfGames} type="games" />
      <Card title="分类总数" value={numberOfCategories} type="categories" />
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'sites' | 'games' | 'categories';
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}
