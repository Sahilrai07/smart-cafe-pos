import React from 'react';
import { MenuOrderingView } from '@/components/customer/MenuOrderingView';

export default async function RestaurantMenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <MenuOrderingView slug={slug} />;
}
