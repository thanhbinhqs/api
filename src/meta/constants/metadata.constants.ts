// Jig Drawing related constants
export const DRAWING_TYPES = [
  { value: 'assembly', label: 'Lắp ráp' },
  { value: 'detail', label: 'Chi tiết' },
  { value: 'schematic', label: 'Sơ đồ' },
  { value: 'layout', label: 'Bố trí' },
  { value: 'electrical', label: 'Điện' },
  { value: 'mechanical', label: 'Cơ khí' },
] as const;

export const DRAWING_STATUS = [
  { value: 'draft', label: 'Nháp' },
  { value: 'approved', label: 'Đã phê duyệt' },
  { value: 'rejected', label: 'Bị từ chối' },
  { value: 'obsolete', label: 'Đã lỗi thời' },
] as const;

export const DRAWING_REVISIONS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
] as const;

// Jig related constants
export const JIG_TYPES = [
  { value: 'mechanical', label: 'Cơ khí' },
  { value: 'hw', label: 'Phần cứng' },
  { value: 'sw', label: 'Phần mềm' },
] as const;

// Part related constants
export const ORDER_TYPES = [
  { value: 'material', label: 'Vật liệu' },
  { value: 'mro', label: 'MRO' },
  { value: 'self-made', label: 'Tự sản xuất' },
] as const;

export const CURRENCIES = [
  { value: 'VND', label: 'Việt Nam Đồng' },
  { value: 'USD', label: 'US Dollar' },
  { value: 'EUR', label: 'Euro' },
  { value: 'JPY', label: 'Japanese Yen' },
] as const;

export const UNITS = [
  { value: 'pcs', label: 'Cái' },
  { value: 'kg', label: 'Kilogram' },
  { value: 'meter', label: 'Mét' },
  { value: 'liter', label: 'Lít' },
  { value: 'box', label: 'Hộp' },
  { value: 'set', label: 'Bộ' },
] as const;

// File format constants
export const SUPPORTED_DRAWING_FORMATS = [
  { value: 'pdf', label: 'PDF Document', mimeType: 'application/pdf' },
  { value: 'dwg', label: 'AutoCAD Drawing', mimeType: 'application/dwg' },
  { value: 'step', label: 'STEP File', mimeType: 'application/step' },
  { value: 'iges', label: 'IGES File', mimeType: 'application/iges' },
  { value: 'jpg', label: 'JPEG Image', mimeType: 'image/jpeg' },
  { value: 'png', label: 'PNG Image', mimeType: 'image/png' },
] as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/dwg',
  'application/step',
  'application/iges',
  'application/x-dwg',
] as const;
