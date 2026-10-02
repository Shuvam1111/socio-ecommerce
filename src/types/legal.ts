export type LegalContent =
  | {
      readonly type: 'paragraph';
      readonly text: string;
    }
  | {
      readonly type: 'bullets';
      readonly items: string[];
    }
  | {
      readonly type: 'numbered';
      readonly items: string[];
    }
  | {
      readonly type: 'note';
      readonly title: string;
      readonly text: string;
    };

export type LegalSubsection = {
  readonly id: string;
  readonly title: string;
  readonly content: LegalContent[];
};

export type LegalSection = {
  readonly id: string;
  readonly title: string;
  readonly content?: LegalContent[];
  readonly subsections?: LegalSubsection[];
};

export type LegalDocument = {
  readonly type: 'privacy' | 'terms';
  readonly title: string;
  readonly description: string;
  readonly lastUpdated: string;
  readonly sections: LegalSection[];
  readonly contact?: {
    readonly company: string;
    readonly email: string;
    readonly phone?: string;
    readonly address?: string;
  };
};
