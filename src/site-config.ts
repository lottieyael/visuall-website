/**
 * Site configuration - single source of truth for version, URLs, and metadata.
 * At build time, fetches the latest release tag from GitHub.
 * Falls back to the default version if the fetch fails (e.g., offline dev).
 */

const DEFAULT_VERSION = "1.1.0";
const GITHUB_REPO = "dogalesz/visuall";

interface SiteConfig {
  version: string;
  versionTag: string;
  releaseUrl: string;
  repoUrl: string;
  changelogUrl: string;
  licenseUrl: string;
  contributingUrl: string;
  windowsZip: string;
  linuxTarball: string;
}

async function fetchLatestVersion(): Promise<string> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "visuall-website-build",
        },
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
    const data = await res.json();
    const tag: string = data.tag_name || "";
    // Strip leading 'v' if present
    return tag.replace(/^v/, "") || DEFAULT_VERSION;
  } catch {
    return DEFAULT_VERSION;
  }
}

let _config: SiteConfig | null = null;

export async function getSiteConfig(): Promise<SiteConfig> {
  if (_config) return _config;

  const version = await fetchLatestVersion();
  const versionTag = `v${version}`;

  _config = {
    version,
    versionTag,
    releaseUrl: `https://github.com/${GITHUB_REPO}/releases`,
    repoUrl: `https://github.com/${GITHUB_REPO}`,
    changelogUrl: `https://github.com/${GITHUB_REPO}/blob/main/CHANGELOG.md`,
    licenseUrl: `https://github.com/${GITHUB_REPO}/blob/main/LICENSE`,
    contributingUrl: `https://github.com/${GITHUB_REPO}/blob/main/CONTRIBUTING.md`,
    windowsZip: `visuall-${versionTag}-windows-x86_64.zip`,
    linuxTarball: `visuallc-linux-x86_64.tar.gz`,
  };

  return _config;
}
