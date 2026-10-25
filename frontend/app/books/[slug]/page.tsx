import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBookBySlug } from "@/lib/actions/book.actions";
import ChatInterface from "@/components/ChatInterface";

export default async function BookDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getSession();
  const userId = session?.userId;

  if (!userId) {
    redirect("/sign-in");
  }

  const { slug } = await params;
  const result = await getBookBySlug(slug);

  if (!result.success || !result.data) {
    redirect("/");
  }

  const book = result.data;

  return (
    <main className="fixed inset-0 z-[60] w-screen h-screen flex flex-col overflow-hidden bg-white dark:bg-[#181926]">
      <ChatInterface book={book} />
    </main>
  );
}
