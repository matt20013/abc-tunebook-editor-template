import { Octokit } from "octokit";
import { FileItem } from "@/types/github";

function encodeBase64(str: string) {
    if (typeof window === 'undefined') {
        return Buffer.from(str).toString('base64');
    } else {
        return window.btoa(unescape(encodeURIComponent(str)));
    }
}

function decodeBase64(str: string) {
    if (typeof window === 'undefined') {
        return Buffer.from(str, 'base64').toString('utf-8');
    } else {
        return decodeURIComponent(escape(window.atob(str)));
    }
}

async function resolveOwnerAndRepo(octokit: Octokit, repoName?: string) {
  const fullRepoPath = repoName || process.env.NEXT_PUBLIC_REPO_NAME || "abc-tunebook-editor-template";

  if (fullRepoPath.includes("/")) {
    const [owner, ...repoParts] = fullRepoPath.split("/");
    return { owner, repo: repoParts.join("/") };
  }

  const { data: user } = await octokit.rest.users.getAuthenticated();
  return { owner: user.login, repo: fullRepoPath };
}

export async function getUserRepos(accessToken: string) {
  const octokit = new Octokit({ auth: accessToken });
  try {
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    });
    return data;
  } catch (error) {
    console.error("Error fetching repos:", error);
    return [];
  }
}

export async function getRepoFiles(accessToken: string, repoName: string, path: string = ""): Promise<FileItem[] | null> {
  const octokit = new Octokit({ auth: accessToken });

  try {
    const { owner, repo } = await resolveOwnerAndRepo(octokit, repoName);
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: path,
    });

    if (Array.isArray(response.data)) {
        return response.data
            .filter((item) => item.type === "dir" || item.name.endsWith(".abc"))
            .map((item) => ({
                name: item.name,
                path: item.path,
                type: item.type, // 'file' or 'dir'
                size: item.size,
                download_url: item.download_url,
            })) as FileItem[];
    } else {
        // If it's a single file (not a directory), return it as an array
        return [{
            name: response.data.name,
            path: response.data.path,
            type: response.data.type,
            size: response.data.size,
            download_url: response.data.download_url,
        }] as FileItem[];
    }
  } catch (error) {
    console.error("Error fetching repo content:", error);
    return null;
  }
}

export async function getRepertoireContent(accessToken: string, repoName?: string, filePath?: string) {
  const octokit = new Octokit({ auth: accessToken });
  const path = filePath || "abcs/repertoire.abc";

  try {
    const { owner, repo } = await resolveOwnerAndRepo(octokit, repoName);
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: path,
    });

    if (Array.isArray(response.data)) {
      throw new Error("Path is a directory");
    }

    if (!("content" in response.data)) {
      throw new Error("File content not found");
    }

    const content = decodeBase64(response.data.content);
    return { content, sha: response.data.sha };
  } catch (error) {
    console.error("Error fetching repertoire:", error);
    return null;
  }
}

export async function saveRepertoireContent(accessToken: string, content: string, sha: string, repoName?: string, filePath?: string) {
  const octokit = new Octokit({ auth: accessToken });
  const path = filePath || "abcs/repertoire.abc";

  try {
    const { owner, repo } = await resolveOwnerAndRepo(octokit, repoName);
    const response = await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: path,
      message: `Update ${path} via web editor`,
      content: encodeBase64(content),
      sha,
    });
    return response.data.content?.sha;
  } catch (error) {
    console.error("Error saving repertoire:", error);
    throw error;
  }
}
