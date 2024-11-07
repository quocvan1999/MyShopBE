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

### 5. Forgot Password

```bash
 /api/auth/forgot-password
```

- Tạo mã khôi phục mật khẩu cho người dùng.
- Req:
  - Body: email.
- Logic:
  - Kiểm tra email có trong DB không - nếu không trả về res 400.
  - Tạo mã code khôi phục.
  - Tạo thời gian hết hạn của code.
  - Kiểm tra trong DB xem người dùng đã có mã code hay chưa - nếu đã có thì update code mới còn chưa thì tạo mới.
- Res:

  - Code 200.
  - Mail chứa code khôi phục mật khẩu

### 6. Change Password

```bash
 /api/auth/change-password
```

- Khôi phục mật khẩu cho tài khoản.
- Req:
  - Body: email, code, newPass.
- Logic:
  - Kiểm tra email có trong DB không - nếu không trả về res 400.
  - Kiểm tra xem code có trong DB hay không - nếu không trả về res 400.
  - Kiểm tra code người dùng gửi và code trong DB có giống nhau không - nếu sai trả về res 400.
  - Kiểm tra thời hạn của code - nếu code hết hạn trả về res 400 và xoá code khỏi DB.
  - Kiểm tra email đã từng đổi mật khẩu hay chưa.
  - Nếu người dùng đã đổi mật khẩu trước đó thì kiểm tra mật khẩu mới có trùng với mật khẩu trước đó không - nếu trùng trả về res 400.
  - Mã hoá mật khẩu mới.
  - Update mật khẩu cũ vào DB để lưu lại.
  - Update lại mật khẩu mới vào thông tin người dùng.
  - Xoá code khỏi DB.
- Res:

  - Code 200.

### 7. Đăng xuất

```bash
  /api/auth/logout
```

- Đăng xuất người dùng.
- Req:
  - Body: email.
- Logic:
  - Kiểm tra email có trong DB không - nếu không trả về res 400.
  - Kiểm tra mã khôi phục mật khẩu trong DB - nếu có thì xoá đi.
  - Kiểm tra RefToken trong DB - nếu có thì xoá đi.
  - Xoá refreshToken được lưu ở cookies của người dùng.
- Res:

  - Code 200.

### 8. Reset Password

```bash
  /api/auth/reset-password
```

- Đổi mật khẩu người dùng.
- Req:
  - Body: email, password, newPassword.
- Logic:
  - Kiểm tra email có trong DB không - nếu không trả về res 400.
  - Kiểm tra mật khẩu - nếu sai thì trả về res 400.
  - Kiểm tra mật khẩu mới và mật khẩu đã đổi gần đây - nếu giống nhau trả về res 400.
  - Mã hoá mật khẩu mới.
  - Update mật khẩu cũ vào lịch sử đổi mật khẩu.
  - Update mật khẩu mới cho người dùng.
- Res:

  - Code 200.

### 9. Send Code Verify Email

```bash
/api/auth/send-code-verify-email
```

- Tạo mã xác thực email.
- Req:
  - Body: email.
- Logic:
  - Kiểm tra email có trong DB không - nếu không trả về res 400.
  - Tạo code xác thực.
  - Tạo thời hạn code.
  - Update code vào DB - nếu chưa có thì tạo mới.
- Res:

  - Code 200.
  - Mail chứa mã xác thực.

### 10. Verify email

```bash
/api/auth/verify-email
```

- Xác thực email.
- Req:
  - Body: email, code.
- Logic:

  - Kiểm tra email có trong DB không - nếu không trả về res 400.
  - Kiểm tra người dùng có tạo mã xác thực trong DB hay không - nếu không trả về res 400.
  - Kiểm tra mã xác thực của người dùng và DB có giống nhau - nếu không trả về res 400.
  - Kiểm tra thời hạn code - nếu hết hạn trả về res 400 và xoá code khỏi DB.
  - Update trạng thái xác thực mail của người dùng.

- Res:

  - Code 200.

## USER API

### 1. Lấy danh sách người dùng

```bash
/api/users
```

- lấy danh sách người dùng.
- Middleware;
  - headers: token(accessToken).
- Res:

  - Code 200 và danh sách người dùng.

### 2. Lấy thông tin người dùng đăng nhập

- Lấy thông tin người đăng nhập bằng token gửi qua headers.

  ```bash
  /api/profile
  ```

- lấy thông tin người dùng bằng accessToken.

- Middleware;

  - headers: token(accessToken).

- Req:

  - headers: token.

- Logic:

  - Kiểm tra token - nếu không có trả về res 401.
  - Lấy thông tin người dùng bằng accessToken.

- Res:
  - Code 200 và thông tin người dùng.
