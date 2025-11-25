import { Suspense } from "react";
import ArticleCreatePage from "@/components/contributor/ArticleCreatePage";

export const dynamic = "force-dynamic";

export default async function CreateArticlePage() {
  return (
    <Suspense fallback={
      <div className="text-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    }>
      <ArticleCreatePage />
    </Suspense>
  );
}
