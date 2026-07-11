import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';
import { TranslationKey } from '../../core/i18n/translation.types';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly lang = inject(LanguageService);

  transform(
    key: TranslationKey | string,
    params?: Record<string, string | number>,
  ): string {
    this.lang.locale();
    return this.lang.t(key, params);
  }
}

@Pipe({
  name: 'typeName',
  standalone: true,
  pure: false,
})
export class TypeNamePipe implements PipeTransform {
  private readonly lang = inject(LanguageService);

  transform(type: string): string {
    this.lang.locale();
    return this.lang.translateType(type);
  }
}

@Pipe({
  name: 'statName',
  standalone: true,
  pure: false,
})
export class StatNamePipe implements PipeTransform {
  private readonly lang = inject(LanguageService);

  transform(stat: string): string {
    this.lang.locale();
    return this.lang.translateStat(stat);
  }
}

@Pipe({
  name: 'learnMethod',
  standalone: true,
  pure: false,
})
export class LearnMethodPipe implements PipeTransform {
  private readonly lang = inject(LanguageService);

  transform(method: string): string {
    this.lang.locale();
    return this.lang.translateLearnMethod(method);
  }
}
