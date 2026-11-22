import HomeClient from "@/components/HomeClient";
import { getHomeData } from "@/lib/homeData";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function Home() {
  const data = await getHomeData();

  return (
    <HomeClient
      paquetes={data.paquetes}
      paquetesF1={data.paquetesF1}
      categorias={data.categorias}
      productosOrdenados={data.productosOrdenados}
      banners={data.banners}
      blogPosts={data.blogPosts}
    />
  );
}
