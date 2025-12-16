import { getStatusBadge, escapeQuotes } from '../../frontend/scripts/pages/adopterPets.js';

describe('adopterPets.js', () => {

  describe('getStatusBadge', () => {
    
    test('should return "Available" badge for "available" status', () => {
      const status = 'available';
      const expectedBadge = '<span class="badge bg-success">Available</span>';
      expect(getStatusBadge(status)).toBe(expectedBadge);
    });

    test('should return "Pending" badge for "pending" status', () => {
      const status = 'pending';
      const expectedBadge = '<span class="badge bg-warning text-dark">Pending</span>';
      expect(getStatusBadge(status)).toBe(expectedBadge);
    });

    test('should return "Adopted" badge for "adopted" status', () => {
      const status = 'adopted';
      const expectedBadge = '<span class="badge bg-info">Adopted</span>';
      expect(getStatusBadge(status)).toBe(expectedBadge);
    });

    test('should return "Medical" badge for "medical" status', () => {
      const status = 'medical';
      const expectedBadge = '<span class="badge bg-danger">Medical</span>';
      expect(getStatusBadge(status)).toBe(expectedBadge);
    });

    test('should return a generic secondary badge for an unknown status', () => {
      const status = 'unknown_status';
      const expectedBadge = `<span class="badge bg-secondary">${status}</span>`;
      expect(getStatusBadge(status)).toBe(expectedBadge);
    });

    test('should handle null or undefined status gracefully', () => {
      const expectedBadge = '<span class="badge bg-secondary"></span>';
      expect(getStatusBadge(null)).toBe(expectedBadge);
      expect(getStatusBadge(undefined)).toBe(expectedBadge);
    });
  });

  // Test suite for the escapeQuotes function
  describe('escapeQuotes', () => {

    test('should escape double quotes', () => {
      const input = 'Pet with "quotes"';
      const expected = 'Pet with &quot;quotes&quot;';
      expect(escapeQuotes(input)).toBe(expected);
    });

    test('should escape single quotes', () => {
      const input = "Pet's Name";
      const expected = 'Pet&#039;s Name';
      expect(escapeQuotes(input)).toBe(expected);
    });

    test('should return an empty string for null or undefined input', () => {
      expect(escapeQuotes(null)).toBe('');
      expect(escapeQuotes(undefined)).toBe('');
    });
  });
});