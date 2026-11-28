import { FormControl } from '@angular/forms';
import { trimmedMinLength } from './trimmed-min-length.validator';

describe('trimmedMinLength', () => {
  const validator = trimmedMinLength(5);

  it('should leave an empty or blank value to the required validators', () => {
    expect(validator(new FormControl(''))).toBeNull();
    expect(validator(new FormControl('    '))).toBeNull();
  });

  it('should measure the trimmed value', () => {
    expect(validator(new FormControl('  abc  '))).toEqual({
      trimmedMinLength: { requiredLength: 5, actualLength: 3 },
    });
  });

  it('should accept a value at or above the minimum', () => {
    expect(validator(new FormControl(' abcde '))).toBeNull();
    expect(validator(new FormControl('abcdef'))).toBeNull();
  });
});
