import React from 'react';
import { MenuOrderingView } from '@/components/customer/MenuOrderingView';

export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = ['quick-bite', 'urban-brew'];
  const tables = ['01', '02', '03', '04', '05', '06', '07', '1', '2', '3', '4', '5', '6', '7', 'T-01', 'T-02'];
  const params: { slug: string; table: string }[] = [];
  for (const slug of slugs) {
    for (const table of tables) {
      params.push({ slug, table });
    }
  }
  return params;
}

export default async function TableMenuPage({
  params,
}: {
  params: Promise<{ slug: string; table: string }>;
}) {
  const { slug, table } = await params;
  return <MenuOrderingView slug={slug} tableNumber={table} />;
}

