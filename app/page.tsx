import { redirect } from 'next/navigation';

export default function Page() {
  //重定向到dashboard
  redirect('/dashboard');
}
