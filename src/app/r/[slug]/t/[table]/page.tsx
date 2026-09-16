import React from 'react';
import { MenuOrderingView } from '@/components/customer/MenuOrderingView';

export default async function TableMenuPage({
  params,
}: {
  params: Promise<{ slug: string; table: string }>;
}) {
  const { slug, table } = await params;
  return <MenuOrderingView slug={slug} tableNumber={table} />;
}
