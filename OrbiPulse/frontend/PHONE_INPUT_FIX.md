# 🔧 Phone Input Fix - Troubleshooting Guide

## Issue: Phone number input not working or OTP modal not appearing

---

## ✅ What Was Fixed

### 1. Created Proper Routes
**Files Created:**
- `app/(auth)/index.tsx` - Auth entry point
- `app/(auth)/profile.tsx` - Profile setup route

### 2. Fixed Navigation Paths
**Updated:**
- PhoneLoginScreen → navigates to `/(auth)/profile`
- ProfileSetupScreen → navigates to `/(tabs)`

### 3. Added Debug Logging
Console logs added to track:
- Send OTP button clicks
- Phone number validation
- Modal opening
- Navigation events

---

## 🚀 How to Test

### Step 1: Restart App with Cache Clear
```bash
cd c:\Users\xxtri\Desktop\Eactuell\OrbiPulse\frontend
npx expo start -c
```

### Step 2: Access Login Screen
The app should now show the Phone Login Screen first.

If it doesn't, manually navigate to:
```
/(auth)
```

### Step 3: Enter Phone Number
```
Phone: 9876543210 (any 10 digits)
```

**Check Console Logs:**
You should see in terminal:
```
Send OTP clicked
Phone value: 9876543210
Full phone number: +919876543210
Opening OTP modal...
```

### Step 4: Verify OTP Modal Opens
After tapping "Send OTP", the OTP modal should appear.

---

## 🐛 Common Issues & Solutions

### Issue 1: Cannot Type in Phone Input

**Possible Causes:**
1. Keyboard not appearing
2. Input field not focused
3. ScrollView blocking taps

**Solutions:**

**A. Check Keyboard Settings**
```typescript
// In PhoneLoginScreen.tsx
<TextInput
  keyboardType="phone-pad"  // Should be this
  // ... other props
/>
```

**B. Try Disabling ScrollView Temporarily**
Remove ScrollView wrapper to test if it's blocking input.

**C. Check Platform**
- iOS: May need different keyboard handling
- Android: Should work out of box

---

### Issue 2: Send OTP Button Not Working

**Check Console:**
Look for these logs when you tap the button:
```
Send OTP clicked
Phone value: [your number]
```

**If No Logs Appear:**
1. Button might be disabled
2. onPress handler not connected
3. Loading state is true

**Fix:**
```typescript
<TouchableOpacity
  onPress={handleSendOtp}  // Check this is correct
  disabled={loading}       // Check loading state
>
```

---

### Issue 3: Validation Always Fails

**Problem:**
```
Invalid phone number
```

**Solution:**
Ensure you're entering at least 10 digits.

**Test Validation Function:**
```typescript
const validatePhoneNumber = (number: string): boolean => {
  const digits = number.replace(/\D/g, '');
  console.log('Digits:', digits);
  console.log('Valid:', digits.length >= 10);
  return digits.length >= 10;
};
```

---

### Issue 4: OTP Modal Not Appearing

**Check Console:**
Should see:
```
Opening OTP modal...
```

**If Modal Doesn't Appear:**

**A. Check State:**
```typescript
const [otpModalVisible, setOtpModalVisible] = useState(false);
// Should change to true after clicking Send OTP
```

**B. Check Modal Component:**
```typescript
<OtpModal
  visible={otpModalVisible}  // Should be true
  // ... other props
/>
```

**C. Check OtpModal Import:**
```typescript
import OtpModal from '../../components/auth/OtpModal';
// Path should be correct
```

---

## 📱 Testing Checklist

### Phone Input Test
- [ ] Can tap phone input field
- [ ] Keyboard appears (phone-pad layout)
- [ ] Can type numbers
- [ ] Numbers appear in input field
- [ ] Country code shows +91

### Validation Test
- [ ] Enter 10 digits → Valid
- [ ] Enter less than 10 → Shows error
- [ ] Error message appears

### Send OTP Test
- [ ] Tap "Send OTP" button
- [ ] Console logs appear
- [ ] Button shows loading state briefly
- [ ] OTP modal opens

### OTP Modal Test
- [ ] Modal appears centered
- [ ] Title shows "Enter Verification Code"
- [ ] 6 OTP boxes visible
- [ ] Phone number displayed

### Navigation Test
- [ ] After OTP → Profile screen appears
- [ ] After Profile → Dashboard appears

---

## 🔍 Debug Steps

### Enable Maximum Logging

Add these logs throughout the flow:

**In PhoneLoginScreen:**
```typescript
console.log('=== PHONE LOGIN SCREEN ===');
console.log('State - phone:', phone);
console.log('State - loading:', loading);
console.log('State - modalVisible:', otpModalVisible);
```

**In handleSendOtp:**
```typescript
console.log('--- SEND OTP CLICKED ---');
console.log('Phone value:', phone);
console.log('Validation result:', validatePhoneNumber(phone));
```

**In OtpModal:**
```typescript
console.log('=== OTP MODAL ===');
console.log('Visible:', visible);
console.log('Phone Number:', phoneNumber);
```

---

## 🎯 Expected Behavior

### Complete Flow:

```
1. App Opens
   ↓
2. Phone Login Screen Loads
   ├─ Logo visible
   ├─ Title visible
   ├─ Input field visible
   └─ Button visible
   ↓
3. User Enters Phone
   ├─ Taps input field
   ├─ Keyboard appears
   ├─ Types: 9876543210
   └─ Numbers appear in field
   ↓
4. User Taps "Send OTP"
   ├─ Console: "Send OTP clicked"
   ├─ Validates: 10 digits ✓
   ├─ Console: "Opening OTP modal..."
   └─ Modal appears
   ↓
5. OTP Modal Opens
   ├─ Fade animation
   ├─ 6 input boxes
   ├─ User enters: 123456
   ├─ Auto-submits after 800ms
   └─ Navigates to Profile
   ↓
6. Profile Setup Appears
   ↓
7. Dashboard Loads
```

---

## 📊 Console Output Example

**Successful Flow:**
```
=== PHONE LOGIN SCREEN ===
Send OTP clicked
Phone value: 9876543210
Full phone number: +919876543210
Opening OTP modal...

=== OTP MODAL ===
Visible: true
Phone Number: +919876543210

OTP verified, navigating to profile...
Navigating to profile setup...

=== PROFILE SETUP ===
Profile submitted
Navigating to dashboard...
```

---

## ⚡ Quick Fixes

### If Input Field Not Working:

**Try This:**
```typescript
// Add autoFocus
<TextInput
  autoFocus={true}
  // ... other props
/>

// Or add onFocus
<TextInput
  onFocus={() => console.log('Input focused')}
  // ... other props
/>
```

### If Button Not Working:

**Check This:**
```typescript
// Make sure not disabled
disabled={false}  // or remove this line entirely

// Check onPress
onPress={() => {
  console.log('Button pressed!');
  handleSendOtp();
}}
```

### If Modal Not Appearing:

**Force It:**
```typescript
// In handleSendOtp, after setting state:
setOtpModalVisible(true);
console.log('Modal state set to:', true);

// Add a small delay if needed
setTimeout(() => {
  console.log('Current modal state:', otpModalVisible);
}, 100);
```

---

## 🎯 Final Verification

After all fixes, verify:

✅ **Can type in phone input**  
✅ **Keyboard appears correctly**  
✅ **Numbers display in field**  
✅ **Send OTP button responds**  
✅ **Console logs appear**  
✅ **OTP modal opens**  
✅ **Navigation works**  
✅ **Dashboard accessible after auth**  

---

**Status:** Debugging enabled with extensive logging  
**Next Step:** Restart app with `-c` flag and check console output  
**Expected:** See detailed logs tracking each step of the flow  

🔍 **Watch the terminal for console.log messages to identify where the issue occurs!**
