import { describe, expect, it } from 'vitest';
import { splitSlides } from '../../src/arcade/slides';

describe('splitSlides', () => {
  it('starts a new slide at every h2 and uses its text as the title', () => {
    const html = '<h2 id="a">One <em>trick</em></h2><p>First.</p><h2 id="b">Two</h2><p>Second.</p><ul><li>x</li></ul>';
    expect(splitSlides(html)).toEqual([
      { title: 'One trick', html: '<p>First.</p>' },
      { title: 'Two', html: '<p>Second.</p><ul><li>x</li></ul>' },
    ]);
  });
  it('keeps content before the first heading as an untitled slide', () => {
    expect(splitSlides('<p>Intro</p><h2>Next</h2><p>More</p>')).toEqual([
      { title: '', html: '<p>Intro</p>' },
      { title: 'Next', html: '<p>More</p>' },
    ]);
  });
  it('returns [] for empty input', () => {
    expect(splitSlides('  ')).toEqual([]);
  });
});
