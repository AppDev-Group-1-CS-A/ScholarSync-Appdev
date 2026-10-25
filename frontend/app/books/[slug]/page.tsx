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
    <div className="w-full min-h-screen pt-14 sm:pt-16 pb-2 px-2 sm:px-4 md:px-6 max-w-[1780px] mx-auto flex flex-col justify-start">
      <ChatInterface book={book} />
    </div>
  );
}
