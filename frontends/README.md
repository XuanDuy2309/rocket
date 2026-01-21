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
*Document generated for Rocket Project - 2026*
