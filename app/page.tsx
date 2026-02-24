import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Editor from "@/components/Editor";
import { getRepertoireContent } from "@/lib/github";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">ABC Tunebook Editor</h1>
          <p className="mb-6 text-gray-600">
            Sign in with GitHub to edit your tunebook.
          </p>
          <div className="flex justify-center">
             <Link
              href="/api/auth/signin"
              className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Sign in with GitHub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const data = await getRepertoireContent(session.accessToken);
  const initialContent = data?.content ?? "";
  const initialSha = data?.sha ?? "";

  return (
    <main className="min-h-screen">
      <Editor
        initialContent={initialContent}
        initialSha={initialSha}
        accessToken={session.accessToken}
      />
    </main>
  );
}
