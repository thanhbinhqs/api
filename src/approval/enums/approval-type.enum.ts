export enum ApprovalType {
  SEQUENTIAL = 'sequential', // Phê duyệt tuần tự (từng cấp một)
  PARALLEL = 'parallel', // Phê duyệt song song (tất cả cấp cùng lúc)
  UNANIMOUS = 'unanimous', // Cần phê duyệt đồng thuận (tất cả đồng ý)
  MAJORITY = 'majority', // Phê duyệt đa số
  ANY_ONE = 'any_one', // Chỉ cần một người phê duyệt
}
