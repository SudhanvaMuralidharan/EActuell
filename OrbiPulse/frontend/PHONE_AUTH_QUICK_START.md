# 🚀 Phone Authentication - Quick Start Guide

## ✅ What's Been Implemented

Complete phone number authentication flow with OTP verification and profile setup.

---

## 📋 Files Created

### Services (1)
- `services/authService.ts` - API calls for authentication

### Context (1)
- `context/AuthContext.tsx` - Authentication state management

### Screens (2)
- `screens/auth/PhoneLoginScreen.tsx` - Phone number entry
- `screens/auth/ProfileSetupScreen.tsx` - Profile creation

### Components (1)
- `components/auth/OtpModal.tsx` - OTP verification modal

### Utils (1)
- `utils/imagePicker.ts` - Image picker utility

### Config (1)
- `config.ts` - API configuration

---

## 🔄 User Flow

```
Splash Screen
    ↓
Phone Login (enter number)
    ↓
OTP Modal (verify code)
    ↓
Profile Setup (name + photo)
    ↓
Dashboard (authenticated)
```

---

## 🔧 Backend API Required

Your backend needs these 3 endpoints:

### 1. Send OTP
```http
POST /auth/send-otp
{
  "phone": "+919876543210"
}
```

### 2. Verify OTP
```http
POST /auth/verify-otp
{
  "phone": "+919876543210",
  "otp": "123456"
}
```

### 3. Create Profile
```http
POST /farmers/profile
{
  "phone": "+919876543210",
  "name": "Ravi Kumar",
  "profile_image": "base64_string"
}
```

---

## ⚙️ Configuration

### Update API URL

Edit `config.ts`:

```typescript
export const API_URL = __DEV__ 
  ? 'http://10.0.2.2:8000/api'  // Development
  : 'https://your-api.com/api';  // Production
```

---

## 🎨 Design Features

### Colors Used
- Primary: #4FB7B4 (buttons, accents)
- Secondary: #3F9EA3 (borders)
- Card: #FFFFFF (backgrounds)
- Background: #F4F6F7 (app BG)

### Spacing
- paddingHorizontal: 16px
- marginVertical: 12px
- borderRadius: 10-16px

### Typography
- Font sizes: 12px to 32px
- Weights: 500, 600, 700, 800

---

## 📱 Key Features

### Phone Login Screen
✅ Country code (+91 default)  
✅ 10-digit validation  
✅ Send OTP button  
✅ Loading states  
✅ Terms notice  

### OTP Modal
✅ 6-box input  
✅ Auto-focus next digit  
✅ Backspace navigation  
✅ Resend option  
✅ Centered modal design  

### Profile Setup
✅ Profile picture upload  
✅ Name input (required)  
✅ Continue/Skip buttons  
✅ Validation  
✅ Base64 image conversion  

---

## 💻 How to Use

### Import Auth Context

```typescript
import { useAuth } from './context/AuthContext';

// In your component
const { isAuthenticated, farmer, login, logout } = useAuth();
```

### Check Authentication

```typescript
if (!isAuthenticated) {
  return <PhoneLoginScreen />;
}

return <DashboardContent />;
```

### Access Farmer Data

```typescript
console.log('User:', farmer?.name);
console.log('Phone:', farmer?.phone);
console.log('Profile:', farmer?.profile_image);
```

---

## 🧪 Testing Steps

### 1. Test Phone Entry
- Enter 10-digit number ✓
- Try invalid numbers (should fail) ✓
- Tap Send OTP ✓

### 2. Test OTP Verification
- Enter 6 digits ✓
- Auto-submit on completion ✓
- Wrong OTP (should show error) ✓
- Resend OTP ✓

### 3. Test Profile Setup
- Upload photo (optional) ✓
- Enter name (required) ✓
- Tap Continue ✓
- Try Skip (needs name) ✓

---

## 🐛 Common Issues

### OTP Not Sending
**Fix:** Check backend API is running and API_URL is correct

### Image Picker Error
**Fix:** Ensure expo-image-picker is installed:
```bash
npx expo install expo-image-picker
```

### Auth Undefined
**Fix:** Verify AuthProvider wraps app in `_layout.tsx`

---

## 📊 State Management

### AuthContext Stores:
- `isAuthenticated` - boolean
- `farmer` - { id, phone, name, profile_image }
- `phoneNumber` - string (during auth flow)

### Methods:
- `login(farmer)` - Set authenticated user
- `logout()` - Clear user data
- `setPhoneNumber(phone)` - Store phone temporarily

---

## 🎯 Next Steps

1. **Backend Integration**
   - Implement the 3 API endpoints
   - Test with real phone numbers
   - Handle token storage

2. **Testing**
   - Run through complete flow
   - Test edge cases
   - Verify error handling

3. **Enhancement** (Optional)
   - Add loading spinners
   - Improve error messages
   - Add success animations

---

## ✅ Checklist

Before production:

- [ ] Backend endpoints implemented
- [ ] API URL configured
- [ ] Tested with real phones
- [ ] Error handling verified
- [ ] Loading states working
- [ ] Navigation smooth
- [ ] Auth persists across restarts

---

**Status:** ✅ Ready for Backend Integration  
**Dependencies:** expo-image-picker installed  
**Files:** 7 new files created  
**Code Quality:** TypeScript, modular, typed  

🚀 **Start by implementing the backend endpoints!**
