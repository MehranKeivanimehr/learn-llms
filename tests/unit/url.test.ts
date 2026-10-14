import { describe, expect, it } from 'vitest';
import { joinBase } from '../../src/lib/url';

describe('joinBase', () => {
  it('joins a root base and a path', () => {
    expect(joinBase('/', 'inside/')).toBe('/inside/');
  });
  it('joins a project base without a trailing slash', () => {
    expect(joinBase('/learn-llms', '/inside/')).toBe('/learn-llms/inside/');
  });
  it('joins a project base with a trailing slash and an empty path', () => {
    expect(joinBase('/learn-llms/', '')).toBe('/learn-llms/');
  });
  it('never produces a double slash', () => {
    expect(joinBase('/', '/')).toBe('/');
  });
});
