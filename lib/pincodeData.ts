export interface PincodeInfo {
  pincode: string;
  cityName: string;
  cityId: string;
  state: string;
  isSupported: boolean;
}

export const INDIAN_PINCODE_DB: Record<string, PincodeInfo> = {
  // Guntur PIN codes (522xxx)
  '522001': { pincode: '522001', cityName: 'Guntur', cityId: 'guntur', state: 'Andhra Pradesh', isSupported: true },
  '522002': { pincode: '522002', cityName: 'Guntur', cityId: 'guntur', state: 'Andhra Pradesh', isSupported: true },
  '522003': { pincode: '522003', cityName: 'Guntur', cityId: 'guntur', state: 'Andhra Pradesh', isSupported: true },
  '522004': { pincode: '522004', cityName: 'Guntur', cityId: 'guntur', state: 'Andhra Pradesh', isSupported: true },
  '522006': { pincode: '522006', cityName: 'Guntur', cityId: 'guntur', state: 'Andhra Pradesh', isSupported: true },
  '522007': { pincode: '522007', cityName: 'Guntur', cityId: 'guntur', state: 'Andhra Pradesh', isSupported: true },

  // Vijayawada PIN codes (520xxx)
  '520001': { pincode: '520001', cityName: 'Vijayawada', cityId: 'vijayawada', state: 'Andhra Pradesh', isSupported: true },
  '520002': { pincode: '520002', cityName: 'Vijayawada', cityId: 'vijayawada', state: 'Andhra Pradesh', isSupported: true },
  '520003': { pincode: '520003', cityName: 'Vijayawada', cityId: 'vijayawada', state: 'Andhra Pradesh', isSupported: true },
  '520008': { pincode: '520008', cityName: 'Vijayawada', cityId: 'vijayawada', state: 'Andhra Pradesh', isSupported: true },
  '520010': { pincode: '520010', cityName: 'Vijayawada', cityId: 'vijayawada', state: 'Andhra Pradesh', isSupported: true },

  // Narasaraopeta PIN codes (5226xx)
  '522601': { pincode: '522601', cityName: 'Narasaraopeta', cityId: 'nrt', state: 'Andhra Pradesh', isSupported: true },
  '522602': { pincode: '522602', cityName: 'Narasaraopeta', cityId: 'nrt', state: 'Andhra Pradesh', isSupported: true },

  // Sattenapalli PIN codes (522403)
  '522403': { pincode: '522403', cityName: 'Sattenapalli', cityId: 'stp', state: 'Andhra Pradesh', isSupported: true },

  // Edlapadu PIN codes (522233)
  '522233': { pincode: '522233', cityName: 'Edlapadu', cityId: 'edlapadu', state: 'Andhra Pradesh', isSupported: true },

  // Martur PIN codes (523260)
  '523260': { pincode: '523260', cityName: 'Martur', cityId: 'martur', state: 'Andhra Pradesh', isSupported: true },

  // Hyderabad PIN codes (500xxx)
  '500081': { pincode: '500081', cityName: 'Hyderabad', cityId: 'hyderabad', state: 'Telangana', isSupported: true },
  '500001': { pincode: '500001', cityName: 'Hyderabad', cityId: 'hyderabad', state: 'Telangana', isSupported: true },
  '500032': { pincode: '500032', cityName: 'Hyderabad', cityId: 'hyderabad', state: 'Telangana', isSupported: true },
  '500034': { pincode: '500034', cityName: 'Hyderabad', cityId: 'hyderabad', state: 'Telangana', isSupported: true },

  // Unsupported test PIN codes
  '560001': { pincode: '560001', cityName: 'Bengaluru', cityId: 'bengaluru', state: 'Karnataka', isSupported: false },
  '400001': { pincode: '400001', cityName: 'Mumbai', cityId: 'mumbai', state: 'Maharashtra', isSupported: false },
  '600001': { pincode: '600001', cityName: 'Chennai', cityId: 'chennai', state: 'Tamil Nadu', isSupported: false },
};

export function lookupPincode(query: string): PincodeInfo | null {
  const clean = query.trim();
  if (/^\d{6}$/.test(clean)) {
    return INDIAN_PINCODE_DB[clean] || null;
  }
  return null;
}
