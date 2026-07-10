import { ApiError } from './api-error.model';

describe('ApiError', () => {
  it('stores status and url', () => {
    const error = new ApiError('Not found', 404, '/pokemon/999');
    expect(error.message).toBe('Not found');
    expect(error.status).toBe(404);
    expect(error.url).toBe('/pokemon/999');
    expect(error.name).toBe('ApiError');
  });
});
