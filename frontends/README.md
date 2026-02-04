# 📘 FRONTEND ARCHITECTURE DOCUMENTATION

Tài liệu này quy định kiến trúc phát triển cho dự án **Rocket Frontend (Locket Clone)**.
Mục tiêu: Xây dựng ứng dụng dễ mở rộng, dễ test, tách biệt rõ ràng giữa **Logic** và **UI**.

---

## 🏗 1. Kiến Trúc Tổng Thể

Hệ thống được chia thành 3 layer (lớp) độc lập. Data flow tuân thủ nguyên tắc **một chiều**.

```mermaid
graph TD
    App[App Layer (Expo Router)] -->|Routing & Config| SDK_UI[SDK UI (Screens & Components)]
    SDK_UI -->|Trigger Actions| SDK_TS[SDK TS (Logic & State)]
    SDK_TS -->|Data / State| SDK_UI
    SDK_UI -->|Callbacks| App
```

### 🚫 Quy tắc bất biến (Mandatory Rules)
1.  **sdk-ts**: KHÔNG chứa UI, KHÔNG import React Native components.
2.  **sdk-ui**: KHÔNG chứa logic nghiệp vụ, KHÔNG import `expo-router` (useRouter, Link).
3.  **app**: KHÔNG chứa logic nghiệp vụ, CHỈ xử lý routing và cấu hình.
4.  **Data Flow**: `sdk-ts` → `sdk-ui` → `app`.

---

## 📂 2. Cấu Trúc Thư Mục

```bash
frontends/
├── rocket-fe/                  # 🚦 APP LAYER (Expo Router)
│
├── sdk-ts/               # 🧠 LOGIC LAYER (Core)
│
└── sdk-ui/               # 🎨 UI LAYER (Presentation)
```

---

## 🧩 3. Chi Tiết Từng Module

### 3.1. `sdk-ts` (Logic Core)
**Trách nhiệm:** "Bộ não" của ứng dụng. Xử lý logic, API, State.

*   ✅ **Được phép:** Axios, Zustand, React Query, Custom Hooks (headless), Utils.
*   ❌ **Cấm:** JSX, React Native View/Text, Navigation logic.

**Ví dụ:**
```typescript
// ✅ sdk-ts/hooks/useFeed.ts
export const useFeed = () => {
  const { data, isLoading } = useQuery({ ... });
  const likePhoto = (id: string) => { ... };
  return { feed: data, isLoading, likePhoto };
};
```

### 3.2. `sdk-ui` (UI & Presentation)
**Trách nhiệm:** "Cơ thể" của ứng dụng. Hiển thị dữ liệu và nhận tương tác.

*   ✅ **Được phép:** UI Components, Animations, Styles (NativeWind).
*   ❌ **Cấm:** `useRouter`, `Link`, gọi API trực tiếp, xử lý Auth flow.
*   ⚠️ **Lưu ý:** Screen trong `sdk-ui` không được tự ý điều hướng. Phải nhận callback điều hướng từ Props.

**Ví dụ:**
```tsx
// ✅ sdk-ui/screens/FeedScreen.tsx
interface FeedScreenProps {
  onOpenProfile: (userId: string) => void; // ⬅️ Callback navigation
}

export const FeedScreen = ({ onOpenProfile }: FeedScreenProps) => {
  const { feed } = useFeed(); // Gọi hook từ sdk-ts

  return (
    <View>
      {feed.map(item => (
        <FeedItem
          key={item.id}
          data={item}
          onPressUser={() => onOpenProfile(item.userId)}
        />
      ))}
    </View>
  );
};
```

### 3.3. `app` (Application Shell)
**Trách nhiệm:** "Bộ khung" kết nối. Quản lý Routing và Layout.

*   ✅ **Được phép:** `expo-router`, `Stack`, `Tabs`, Auth Guards, Providers.
*   ❌ **Cấm:** Viết logic nghiệp vụ, gọi API, styling phức tạp.

**Ví dụ:**
```tsx
// ✅ app/(tabs)/feed.tsx
import { useRouter } from 'expo-router';
import { FeedScreen } from '@/sdk-ui';

export default function FeedRoute() {
  const router = useRouter();

  // Inject navigation logic vào UI
  return (
    <FeedScreen
      onOpenProfile={(id) => router.push(`/profile/${id}`)}
    />
  );
}
```

---

## 🚦 4. Quy Định Về Routing

1.  **Route Path**: Chỉ định nghĩa duy nhất trong folder `app/`.
2.  **Navigation Props**: `sdk-ui` nhận hành động điều hướng thông qua Props (Callback pattern).
3.  **Params**: `app/` chịu trách nhiệm parse params từ URL và truyền xuống `sdk-ui` dưới dạng props sạch.

**❌ BAD (Sai kiến trúc):**
```tsx
// sdk-ui/components/UserCard.tsx
import { useRouter } from 'expo-router'; // ⛔️ CẤM

const UserCard = () => {
  const router = useRouter();
  return <Button onPress={() => router.push('/home')} />;
};
```

**✅ GOOD (Đúng kiến trúc):**
```tsx
// sdk-ui/components/UserCard.tsx
const UserCard = ({ onNavigate }: { onNavigate: () => void }) => {
  return <Button onPress={onNavigate} />;
};
```

---

## 🛡 5. Auth & Permission

*   **Logic Auth**: Nằm hoàn toàn trong `sdk-ts` (Login, Logout, Refresh Token, Storage).
*   **Auth Guard**: Kiểm tra trạng thái đăng nhập tại `app/_layout.tsx`.
*   **UI Login**: `sdk-ui` chỉ hiển thị form đăng nhập và gọi hàm `login()` từ `sdk-ts`.

---

## ✅ 6. Definition of Done (Tiêu chuẩn hoàn thành)

Một tính năng được coi là hoàn thành khi:
- [ ] Logic nghiệp vụ nằm hoàn toàn trong `sdk-ts`.
- [ ] UI Components (trong `sdk-ui`) có thể render độc lập mà không cần `expo-router`.
- [ ] Không có import chéo sai quy tắc (VD: `sdk-ts` import `sdk-ui`).
- [ ] Màn hình có thể tái sử dụng được (cho Web hoặc App khác) nhờ việc tách biệt Routing.

---
## 🗺 7. Sơ đồ luồng ứng dụng (App Flow)

1. Sơ đồ tư duy: Trình tự xây dựng (Development Roadmap)
Quy trình này chia tách rõ ràng giữa FE và BE để có thể làm song song.

Phân tích các giai đoạn:
- Phase 1: Foundation (Móng nhà)

  BE (Go): Dựng khung dự án (project layout chuẩn Go), kết nối PostgreSQL, cài đặt Redis (cache), và cấu hình S3 (MinIO/AWS).

  FE (RN): Init project (dùng CLI, không dùng Expo Go), cấu hình Navigation, State Management (Zustand), và UI Library.

- Phase 2: Authentication & Social Graph (Mạng xã hội)

  BE: API Login (JWT), API danh bạ, Logic kết bạn (Friend Request).

  FE: Màn hình Login (OTP), Xin quyền truy cập danh bạ, Màn hình Add Friend.

- Phase 3: Media Pipeline (Trái tim của App)

  BE: Viết Middleware xử lý ảnh (Resize, Compress) dùng Goroutines (xử lý song song). Đây là lợi thế của Go.

  FE: Tích hợp Camera, logic chụp ảnh, upload ảnh multipart/form-data.

- Phase 4: Widget & Background Sync (Phần khó nhất)

  BE: Tích hợp FCM (Firebase Cloud Messaging) hoặc OneSignal để bắn "Silent Push".

  FE: Cấu hình App Groups (iOS/Android), Viết Native Module để cập nhật Widget, Xử lý nhận Push ngầm.

2. Thiết kế Cơ sở dữ liệu (ERD) - PostgreSQL
Với Go, ta sẽ dùng PostgreSQL. Mô hình này tối ưu cho truy vấn quan hệ bạn bè và lịch sử gửi nhận.

Chi tiết các bảng (Schema):
Users-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  username VARCHAR(50),
  avatar_url TEXT,
  push_token TEXT -- Token OneSignal/FCM
);

-- Friendships (Quan hệ 2 chiều)
CREATE TABLE friendships (
  user_id_1 UUID REFERENCES users(id),
  user_id_2 UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id_1, user_id_2)
);

-- Posts (Locket Moments)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id),
  image_url_full TEXT NOT NULL, -- Ảnh gốc xem trong app
  image_url_thumb TEXT NOT NULL, -- Ảnh nhỏ cho Widget (Quan trọng)
  caption TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

3. Kiến trúc kỹ thuật & Luồng dữ liệu (Architecture Flow)
Tech Stack chi tiết:
Mobile: React Native CLI.

Backend: Go (Framework: Gin hoặc Fiber - vì tốc độ cực nhanh).

Database: PostgreSQL.

Cache: Redis (Cache danh sách bạn bè và feed mới nhất để giảm tải DB).

File Storage: AWS S3 hoặc Cloudflare R2.

Image Processing: Thư viện bimg (libvips wrapper cho Go) - xử lý ảnh nhanh hơn ImageMagick rất nhiều.

Luồng xử lý "Gửi ảnh lên Widget" (Quan trọng):

ROOT: LOCKET CLONE (React Native)
├── Giai đoạn 1: Backend & Setup (Nền tảng)
│   ├── Thiết lập Firebase Project (Auth, Firestore, Storage, Functions)
│   ├── Thiết lập môi trường RN (CLI - KHÔNG nên dùng Expo Go, dùng Expo Prebuild hoặc RN CLI)
│   └── Cấu hình Navigation & State Management (Zustand/Redux)
│
├── Giai đoạn 2: Core App (Các tính năng trong App)
│   ├── Authentication (Login bằng SĐT - Quan trọng để đồng bộ danh bạ)
│   ├── Social Graph (Kết bạn, danh bạ, tạo "Link" giữa 2 user)
│   ├── Camera Module (Custom Camera, chụp nhanh, xử lý ảnh)
│   └── Feed History (Xem lại lịch sử ảnh đã nhận/gửi)
│
├── Giai đoạn 3: Widget Integration (Phần KHÓ NHẤT)
│   ├── Cấu hình Native Environment (Xcode & Android Studio)
│   ├── Thiết lập "Shared App Groups" (để App và Widget dùng chung dữ liệu)
│   ├── Code giao diện Widget (SwiftUI cho iOS / XML layout cho Android)
│   └── Logic đồng bộ: App RN -> Ghi file/UserDefault -> Widget đọc -> Hiển thị
│
└── Giai đoạn 4: Real-time & Optimization
    ├── Push Notifications (Kích hoạt Widget cập nhật khi App tắt)
    ├── Nén ảnh (Image Compression)
    └── Testing & Deploy

4. Lưu ý, Hạn chế & Phương án tối ưu
4.1. Hạn chế (Limitations)
iOS Background Execution: iOS rất khắt khe việc chạy nền. Nếu bạn update widget quá nhiều lần trong ngày, iOS sẽ chặn (budget limit).

Đồng bộ dữ liệu: Ảnh trên Widget đôi khi không cập nhật ngay lập tức do cơ chế tiết kiệm pin của OS (OS quyết định khi nào render lại Widget).

Code Native: Bạn bắt buộc phải biết cơ bản về SwiftUI (iOS) và Jetpack Compose/XML (Android) để vẽ giao diện Widget.

4.2. Phương án Tối ưu (Optimizations)
Tối ưu hình ảnh (Crucial):

Widget rất nhỏ. Đừng load ảnh 4K lên đó.

Giải pháp: Khi upload, tạo 2 phiên bản: 1 bản Full HD xem trong app, 1 bản Thumbnail (khoảng 300x300px) dung lượng < 50KB dành riêng cho Widget. Điều này giúp Widget load "nhanh như điện".

Cơ chế Caching (Shared User Defaults):

Sử dụng App Groups (iOS) để chia sẻ UserDefaults. Khi App RN tải được ảnh mới, hãy ghi URL hoặc base64 string vào Shared Defaults để Widget đọc được ngay mà không cần request mạng lại.

Silent Push Notifications:

Thay vì dùng Push Notification hiển thị tin nhắn, hãy dùng "Data-only message" (Silent Push) để đánh thức app dậy ngầm, tải ảnh về sẵn, update widget Timeline, người dùng mở máy lên là thấy ảnh mới luôn.

Lazy Loading trong App:

Dùng FlashList thay vì FlatList để render lịch sử ảnh mượt mà hơn (đặc biệt khi danh sách ảnh dài).

4.3. Giải pháp với Go & React Native
-Xử lý ảnh: (Backend),Sử dụng Goroutines + Worker Pools. Đừng spawn 1 goroutine cho mỗi request nếu user quá đông. Hãy tạo một hàng đợi (Queue) xử lý ảnh để server không bị quá tải CPU.
-Tốc độ Widget: Payload Optimization: Trong payload của Push Notification, hãy gửi kèm luôn URL của ảnh Thumbnail. App nhận Push -> Có URL -> Tải ngay. Không cần gọi thêm API lấy list ảnh.
-Caching (Redis): Khi User mở App để xem lịch sử, đừng query Postgres ngay. Hãy lưu 10 ảnh gần nhất của mỗi cặp bạn bè vào Redis List. Tốc độ load sẽ gần như tức thì (Zero-latency).
-Tiết kiệm băng thông: Sử dụng định dạng WebP cho cả ảnh gốc và Thumbnail. Go hỗ trợ convert sang WebP rất tốt, giảm dung lượng 30-50% so với JPEG mà chất lượng tương đương.