import { extractDigits, formatPhone } from './phone-mask';

describe('phone-mask', () => {
  describe('extractDigits', () => {
    it('should keep only the digits', () => {
      expect(extractDigits('+55 11 98765-4321')).toBe('5511987654321');
      expect(extractDigits('11.98765.4321')).toBe('11987654321');
      expect(extractDigits('(35) 99567-8901')).toBe('35995678901');
      expect(extractDigits('abc')).toBe('');
    });
  });

  describe('formatPhone', () => {
    const cases: readonly [string, string][] = [
      ['', ''],
      ['1', '(1'],
      ['11', '(11'],
      ['113', '(11) 3'],
      ['113333', '(11) 3333'],
      ['1133333', '(11) 3333-3'],
      ['1133333333', '(11) 3333-3333'],
      ['11987654321', '(11) 98765-4321'],
      ['5511987654321', '5511987654321'],
    ];

    for (const [digits, formatted] of cases) {
      it(`should format "${digits}" as "${formatted}"`, () => {
        expect(formatPhone(digits)).toBe(formatted);
      });
    }
  });
});
