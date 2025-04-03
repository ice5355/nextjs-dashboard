import { redirect } from 'next/navigation';
export const runtime = 'edge';
export default function Page() {
  //重定向到dashboard
  redirect('/dashboard');
}
