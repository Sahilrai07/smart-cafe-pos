import { redirect } from 'next/navigation';

export default async function TableFallbackPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/r/${slug}/t/01`);
}
