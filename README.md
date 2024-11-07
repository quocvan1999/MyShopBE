# Danh sách API

## AUTH API

### 1. Đăng ký tài khoản

```bash
  /api/auth/singn
```

- Đăng ký tài khoản dành cho người dùng.
- Req:
  - Body: username, password, email, phone, address.
- Logic:
  - Kiểm tra trùng email - nếu trùng trả về res 400.
  - Mã hoá mật khẩu.
  - Thêm người dùng mới vào DB.
- Res:

  - Code 201 và thông tin người dùng vừa đăng ký.
  - Email thông báo đăng ký thành công.

### 2. Đăng nhập dành cho người dùng

```bash
/api/auth/login
```

- Đăng nhập tài khoản dành cho người dùng.
- Req:
  - Body: email, password.
- Logic:
  - Kiểm tra email có trong DB hay không - nếu không trả về res 400.
  - Kiểm tra mật khẩu - nếu sai trả về res 400.
  - Tạo accessToken.
  - Tạo refreshToken.
  - Tạo ngày hết hạn của refreshToken.
  - Kiểm tra xem người dùng có refreshToken trong DB - nếu chưa thì tạo mới còn đã có thì update.
  - Thêm refreshToken vào cookie người dùng.
- Res:

  - Code 200 và accessToken.

### 3. Đăng nhập Facebook

```bash
/api/auth/login-facebook
```

- Đăng nhập Facebook dành cho người dùng.
- Req:
  - Body: name, email.
- Logic:
  - Kiểm tra email có trong DB hay không - nếu chưa có thì tạo mới người dùng và gửi mail tạo thông thông báo tạo tài khoản thành công.
  - Lấy thông tin người dùng.
  - Tạo accessToken.
  - Tạo refreshToken.
  - Tạo ngày hết hạn của refreshToken.
  - Kiểm tra xem người dùng có refreshToken trong DB - nếu chưa thì tạo mới còn đã có thì update.
  - Thêm refreshToken vào cookie người dùng.
- Res:

  - Code 200 và accessToken.

### 4. Extend Token

```bash
  /api/auth/extend-token
```

- Duy trì đăng nhập người dùng.
- Req:
  - cookies: refreshToken.
- Logic:
  - Kiểm tra cookies có refreshToken hay không - nếu không trả về res 401.
  - Kiểm tra refreshToken có trong DB hay không - nếu không có trả về res 401.
  - Kiểm tra tính hợp lệ và thời hạn của refreshToken - nếu không hợp lệ hoặc hết hạn thì xoá refreshToken khỏi DB và trả về res 410.
  - Lấy thông tin user của refreshToken đó và tạo một accessToken mới
- Res:

  - Code 200 và accessToken.

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

1. Lấy danh sách người dùng

- Phải có token đăng nhập mới lấy được danh sách.

  ```bash
  /api/users
  ```

2. Lấy thông tin người dùng đăng nhập

- Lấy thông tin người đăng nhập bằng token gửi qua headers.

  ```bash
  /api/profile
  ```

3. Cập nhật thông tin người dùng đăng nhập

- Cập nhật thông tin người dùng đăng đăng nhập thông qua accessToken.

  ```bash
  /api/profile
  ```
