interface BSQL {
  [key: string]: {
    sql: string;
    legacy: boolean;
  };
}

export const bigQuerySQL: BSQL = {
  "Total repositories and commits": {
    sql: `SELECT * from (
            (SELECT COUNT(commit) AS commits FROM bigquery-public-data.github_repos.commits) A CROSS JOIN
            ( SELECT COUNT(repo_name) AS repositories FROM bigquery-public-data.github_repos.languages  ) )`,
    legacy: false,
  },

  "The biggest repository": {
    sql: `(SELECT repo_name, SUM(language.bytes) OVER (partition by repo_name) AS bytes
            FROM [bigquery-public-data:github_repos.languages]) order by bytes DESC LIMIT 1`,
    legacy: true,
  },

  // why use .2*, see https://stackoverflow.com/questions/62077717/table-suffix-between-syntax-is-not-selecting-any-tables
  "Most commits last week": {
    sql: `SELECT user, count
        FROM
            (SELECT actor.login as user, count(actor.login) as count
                FROM \`githubarchive.day.2*\`
                WHERE   _table_suffix between
                            trim(format_date('%Y%m%d', date_sub(current_date(), interval EXTRACT(DAYOFWEEK from CURRENT_DATE())+7 day)),'2')
                            and trim(format_date('%Y%m%d',date_sub(current_date(), interval EXTRACT(DAYOFWEEK from CURRENT_DATE()) day)),'2')
                        AND NOT (actor.login LIKE '%bot%')
                        AND JSON_EXTRACT_SCALAR(payload, '$.pull_request.base.repo.language') IS NOT NULL
            GROUP BY user)
        WHERE count < 7*24  ORDER by count DESC  LIMIT 1 # excluding the bots, automatic build`,
    legacy: false,
  },
};
