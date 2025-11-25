import ArticlesList from "@/components/contributor/ArticlesList";

export const dynamic = "force-dynamic";

export default async function ContributorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Mis Artículos</h1>
        <p className="text-gray-600">
          Administra tus artículos enviados y revisa su estado
        </p>
      </div>
      <ArticlesList />
    </div>
  );
}
