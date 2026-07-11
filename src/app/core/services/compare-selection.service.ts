import { Injectable } from '@angular/core';

export type CompareSide = 'left' | 'right';

export interface PendingCompareSelection {
  left?: number;
  right?: number;
}

@Injectable({ providedIn: 'root' })
export class CompareSelectionService {
  private pending: PendingCompareSelection | null = null;

  queue(side: CompareSide, id: number): void {
    this.pending = { ...this.pending, [side]: id };
  }

  consume(): PendingCompareSelection | null {
    const value = this.pending;
    this.pending = null;
    return value;
  }
}
