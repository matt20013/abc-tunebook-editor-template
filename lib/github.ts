import { Octokit } from "octokit";

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

export async function getRepertoireContent(accessToken: string, repoName?: string) {
  const octokit = new Octokit({ auth: accessToken });
  const { data: user } = await octokit.rest.users.getAuthenticated();
  let owner = user.login;
  let repo = repoName || process.env.NEXT_PUBLIC_REPO_NAME || "abc-tunebook-editor-template";

  if (repoName && repoName.includes("/")) {
    [owner, repo] = repoName.split("/");
  }

  try {
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: "abcs/repertoire.abc",
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

export async function saveRepertoireContent(accessToken: string, content: string, sha: string, repoName?: string) {
  const octokit = new Octokit({ auth: accessToken });
  const { data: user } = await octokit.rest.users.getAuthenticated();
  let owner = user.login;
  let repo = repoName || process.env.NEXT_PUBLIC_REPO_NAME || "abc-tunebook-editor-template";

  if (repoName && repoName.includes("/")) {
    [owner, repo] = repoName.split("/");
  }

  try {
    const response = await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: "abcs/repertoire.abc",
      message: "Update repertoire.abc via web editor",
      content: encodeBase64(content),
      sha,
    });
    return response.data.content?.sha;
  } catch (error) {
    console.error("Error saving repertoire:", error);
    throw error;
  }
}
