import { TestBed } from '@angular/core/testing';
import { CompareSelectionService } from './compare-selection.service';

describe('CompareSelectionService', () => {
  let service: CompareSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompareSelectionService);
  });

  it('queues and consumes a single side', () => {
    service.queue('left', 25);
    expect(service.consume()).toEqual({ left: 25 });
    expect(service.consume()).toBeNull();
  });

  it('queues both sides before consume', () => {
    service.queue('left', 1);
    service.queue('right', 4);
    expect(service.consume()).toEqual({ left: 1, right: 4 });
  });

  it('overwrites the same side when queued again', () => {
    service.queue('left', 1);
    service.queue('left', 7);
    expect(service.consume()).toEqual({ left: 7 });
  });
});
