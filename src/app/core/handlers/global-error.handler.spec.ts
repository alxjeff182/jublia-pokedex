import { TestBed } from '@angular/core/testing';
import { ToastController } from '@ionic/angular/standalone';
import { GlobalErrorHandler } from './global-error.handler';

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;
  let toastCreate: jasmine.Spy;

  beforeEach(() => {
    toastCreate = jasmine.createSpy('create').and.resolveTo({
      present: jasmine.createSpy('present').and.resolveTo(),
    });

    TestBed.configureTestingModule({
      providers: [
        GlobalErrorHandler,
        { provide: ToastController, useValue: { create: toastCreate } },
      ],
    });

    handler = TestBed.inject(GlobalErrorHandler);
  });

  it('shows toast for Error instances', () => {
    handler.handleError(new Error('Something broke'));
    expect(toastCreate).toHaveBeenCalled();
  });

  it('handles unknown error values', () => {
    handler.handleError('unexpected');
    expect(toastCreate).toHaveBeenCalledWith(
      jasmine.objectContaining({ message: 'An unexpected error occurred' }),
    );
  });
});
