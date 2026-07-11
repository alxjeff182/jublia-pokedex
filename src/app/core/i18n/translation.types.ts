export type AppLocale = 'en' | 'id';

export interface TranslationDictionary {
  common: Record<string, string>;
  tabs: Record<string, string>;
  header: Record<string, string>;
  home: Record<string, string>;
  browse: Record<string, string>;
  favorites: Record<string, string>;
  detail: Record<string, string>;
  compare: Record<string, string>;
  settings: Record<string, string>;
  splash: Record<string, string>;
  error: Record<string, string>;
  offline: Record<string, string>;
  titles: Record<string, string>;
  seo: Record<string, string>;
  types: Record<string, string>;
  stats: Record<string, string>;
  statShort: Record<string, string>;
  learnMethods: Record<string, string>;
}

export type TranslationKey =
  | `common.${keyof TranslationDictionary['common'] & string}`
  | `tabs.${keyof TranslationDictionary['tabs'] & string}`
  | `header.${keyof TranslationDictionary['header'] & string}`
  | `home.${keyof TranslationDictionary['home'] & string}`
  | `browse.${keyof TranslationDictionary['browse'] & string}`
  | `favorites.${keyof TranslationDictionary['favorites'] & string}`
  | `detail.${keyof TranslationDictionary['detail'] & string}`
  | `compare.${keyof TranslationDictionary['compare'] & string}`
  | `settings.${keyof TranslationDictionary['settings'] & string}`
  | `splash.${keyof TranslationDictionary['splash'] & string}`
  | `error.${keyof TranslationDictionary['error'] & string}`
  | `offline.${keyof TranslationDictionary['offline'] & string}`
  | `titles.${keyof TranslationDictionary['titles'] & string}`
  | `seo.${keyof TranslationDictionary['seo'] & string}`
  | `types.${keyof TranslationDictionary['types'] & string}`
  | `stats.${keyof TranslationDictionary['stats'] & string}`
  | `statShort.${keyof TranslationDictionary['statShort'] & string}`
  | `learnMethods.${keyof TranslationDictionary['learnMethods'] & string}`;
