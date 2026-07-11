import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorRetryComponent } from './error-retry.component';

describe('ErrorRetryComponent', () => {
  let fixture: ComponentFixture<ErrorRetryComponent>;
  let component: ErrorRetryComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorRetryComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorRetryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('emits retry and dismiss events', () => {
    spyOn(component.retry, 'emit');
    spyOn(component.dismiss, 'emit');

    component.onRetry();
    component.onDismiss();

    expect(component.retry.emit).toHaveBeenCalled();
    expect(component.dismiss.emit).toHaveBeenCalled();
  });

  it('uses empty defaults for title and message', () => {
    expect(component.title).toBe('');
    expect(component.message).toBe('');
    expect(component.presentation).toBe('modal');
  });
});
