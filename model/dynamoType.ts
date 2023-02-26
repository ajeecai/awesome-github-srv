export interface IDBItem {
  email: string;
  code: string;
  createAt: string;
  language: string;
  nickname: string;
  password: string;
  since: string;
  tokenId: string;
  updateAt: string;
  verified: boolean;
}

export interface IEmailsOnTopic {
  topic: string;
  emails: string[];
}
