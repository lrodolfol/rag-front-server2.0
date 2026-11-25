import { FormControl } from '@angular/forms';
import { notBlankValidator } from './not-blank.validator';

describe('notBlankValidator', () => {
  it('should flag a value made only of spaces', () => {
    expect(notBlankValidator(new FormControl('   '))).toEqual({ blank: true });
  });

  it('should leave an empty value to the required validator', () => {
    expect(notBlankValidator(new FormControl(''))).toBeNull();
  });

  it('should accept text surrounded by spaces', () => {
    expect(notBlankValidator(new FormControl(' Ana '))).toBeNull();
  });
});
