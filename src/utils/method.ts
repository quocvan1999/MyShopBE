export const getVietnamTime = (): string => {
  const now = new Date();

  // Chuyển đổi giờ sang Việt Nam (GMT+7)
  const utcOffset = 7 * 60; // 7 giờ
  const localTime = new Date(now.getTime() + utcOffset * 60 * 1000);

  // Định dạng ngày tháng theo chuẩn ISO 8601
  const year = localTime.getFullYear();
  const month = String(localTime.getMonth() + 1).padStart(2, "0"); // Tháng từ 0-11
  const date = String(localTime.getDate()).padStart(2, "0");
  const hours = String(localTime.getHours()).padStart(2, "0");
  const minutes = String(localTime.getMinutes()).padStart(2, "0");
  const seconds = String(localTime.getSeconds()).padStart(2, "0");
  const milliseconds = String(localTime.getMilliseconds()).padStart(3, "0");

  // Tạo chuỗi thời gian theo định dạng yêu cầu
  const formattedDateTime = `${year}-${month}-${date}T${hours}:${minutes}:${seconds}.${milliseconds}+07:00`;

  return formattedDateTime;
};
