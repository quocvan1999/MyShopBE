# Danh sách API

## AUTH API

1. Đăng ký tài khoản

- Các trường dữ liệu: username, password, email, phone, address.
- Kiểm tra trùng email, nếu đăng ký thành công sẽ có thông báo mail.

  ```bash
  /api/auth/singn
  ```

2. Đăng nhập

- Các trường dữ liệu: email, password.
- Kiểm tra xem email có trong DB hay không, kiểm tra mật khẩu, nếu đúng sẽ tạo accessToken và refreshToken. refreshToken sẽ được lưu và DB và lưu về cookies máy người dùng. accessToken sẽ được trả về qua res.

  ```bash
  /api/auth/login
  ```

3. Đăng nhập Facebook

- Các trường dữ liệu: name, email.
- Kiểm tra xem email có trong DB hay không nếu có sẽ trả về res đăng nhập thành công, nếu email chưa có trong DB sẽ tạo người dùng mới bằng email sao đó gửi mail báo đăng ký tại khoản thành công và trả về res đăng nhập thành công với accessToken + lưu refToken vào DB.

  ```bash
  /api/auth/login-facebook
  ```

4. Extend Token

- Các trường dữ liệu: name, email.
- Lấy refreshToken từ cookies của người dùng nếu không có báo res 401 nếu có kiểm tra xem refreshToken có trong DB hay không nếu không có trả về res 401. Kiểm tra xem token có hợp lệ và còn thời hạn hay không nếu không có trong DB hoặc hết hạn trả về res 401 và xoá token khỏi DB. Nếu vượt qua tất cả các điều kiện thì tạo token mới và trả và trả về res.

  ```bash
  /api/auth/extend-token
  ```

5. Forgot Password

- Các trường dữ liệu: email.
- Kiểm tra email xem có trong DB hay không nếu không trả về res 400, tạo code và thời hạn của code(2ph) sau đó kiểm tra xem id người dùng có trong bảng lưu code hay chưa nếu có rồi thì cập nhật lại code mới và id người dùng đó nếu chưa thì tạo mới. Gửi mail code cho người dùng và trả về res 200.

  ```bash
  /api/auth/forgot-password
  ```

6. Change Password

- Các trường dữ liệu: email, code, newPass.
- Kiểm tra email xem có trong DB hay không nếu không trả về res 400. Kiểm tra xem id người dùng có code được lưu trong DB hay không nếu không trả về res 400 nếu có kiểm tra code người dùng nhập và code lưu trong DB có giống nhau hay không nếu không trả về res 400. Nếu code đúng thì kiểm tra code trong DB còn hạn hay không nếu không bắn res 400 về và xoá code lưu ở hệ thống. Nếu code còn hạn và chính xác thì kiểm tra kiểm tra trong bảng passHistory có id của người dùng không nếu có thì kiểm tra newPass và pass được lưu ở historu có giống nhau hay không nếu giống trả về res 400. nếu không thì mã hoá pass mới sau đó kiểm tra trong passHitory có id người dùng không nếu có thì cập nhật pass trước khi update và history nếu không có thì tạo mới bằng pass trước khi đổi để sử dụng cho việc so sánh sau này cuối cùng là update pass mới đã mã hoá cho user và trả res 200 về cho người dùng cuối cùng là xoá code xác nhận đổi mật khẩu trong DB.

  ```bash
  /api/auth/change-password
  ```

7. Đăng xuất

- Các trường dữ liệu: email.
- Kiểm tra email xem có trong DB hay không nếu không trả về res 400. Kiểm tra bảng Forgot Password và RefToken nếu có id của người dùng thì xoá khỏi bảng. Cuối cùng trả về res 200 và xoá refreshToken khỏi cookie người dùng.

  ```bash
  /api/auth/logout
  ```

8. Reset Password

- Các trường dữ liệu: email, password, newPassword.
- Kiểm tra email xem có trong DB hay không nếu không trả về res 400. Kiểm tra mật khẩu cũ xem có chính xác không. Kiểm tra mật khẩu mới xem có trùng với mật khẩu đã đổi lần trước hay không nếu qua hêt các điều kiện thì mã hoá mật khẩu mới. lưu mật khẩu trước khi update vào passHistory sao đó update mật khẩu mới cho người dùng và trả về res 200.

  ```bash
  /api/auth/reset-password
  ```

9. Send Code Verify Email

- Các trường dữ liệu: email.
- Kiểm tra email xem có trong DB hay không nếu không trả về res 400. Tạo code và thời hạn, kiểm tra id người dùng có trong bản lưu code hay không nếu có thì update còn không thì tạo mới, gửi mail chứa code cho người dùng và trả về res 200.

  ```bash
  /api/auth/send-code-verify-email
  ```

10. Verify email

- Các trường dữ liệu: email, code.
- Kiểm tra email xem có trong DB hay không nếu không trả về res 400. Kiểm tra code có trang DB hay không, Kiểm tra code có chính xác với code DB hay không, kiểm tra thời hạn code nếu hết hạn thì xoá code khỏi DB. Cập nhật trạng thái xác thực mail của user và xoá code khỏi DB.

  ```bash
  /api/auth/verify-email
  ```

  ## USER API

  11. Lấy danh sách người dùng

- Phải có token đăng nhập mới lấy được danh sách.

  ```bash
  /api/users
  ```

  12. Lấy thông tin người dùng hiện tại

- Lấy thông tin người đăng nhập bằng token gửi qua headers.

  ```bash
  /api/profile
  ```
