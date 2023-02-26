export interface IGitHubData {
  author: string;
  reponame: string;
  repourl: string;
  repodesc: string;
  language: string;
  langcolor: string;
  stars: number;
  forks: number;
  laststars: number;
  builtby: object;
}

export interface IGitHubStars {
  name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
}
