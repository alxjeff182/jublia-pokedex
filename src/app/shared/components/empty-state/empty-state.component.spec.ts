import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  it('renders default title and message', () => {
    fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h2')?.textContent).toContain('Nothing here yet');
    expect(el.querySelector('p')?.textContent).toContain('Start exploring');
  });

  it('renders custom inputs', () => {
    fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('title', 'No favorites yet');
    fixture.componentRef.setInput('message', 'Tap the heart icon.');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h2')?.textContent).toContain('No favorites yet');
    expect(el.querySelector('p')?.textContent).toContain('Tap the heart icon.');
  });
});
