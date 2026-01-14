# Profile Edit Integration - TEST GUIDE

## 🧪 Complete Testing & Verification

### Prerequisites
```bash
# Terminal 1: Backend
cd d:\Projects\p4p\p4p-back
npm run dev

# Terminal 2: Frontend  
cd d:\Projects\p4p\p4p-dashboard
npm run dev
```

Access: http://localhost:5173

---

## 🔐 Test Accounts

### Admin Account
- Email: `admin@example.com`
- Password: `admin123` (or your configured password)
- Role: `admin` ✅ (can access dashboard & edit profile)

### Regular User Account
- Email: `user@example.com`
- Password: `user123`
- Role: `user` ❌ (cannot access admin dashboard)

---

## ✅ Test Case 1: Successful Profile Edit

### Steps:
1. Sign in with admin account
2. Navigate to Profile page (sidebar menu)
3. Click "Edit" button on Personal Information card
4. Modal opens showing current data
5. Change first name to "UpdatedAdmin"
6. Change last name to "User"
7. Change phone to "+1234567890"
8. Click "Save Changes"

### Expected Results:
- ✅ Button shows "Saving..." while loading
- ✅ Form inputs disabled during request
- ✅ Modal closes on success
- ✅ Profile displays new values immediately
- ✅ Refresh page → data still persists
- ✅ localStorage contains updated user

### Verification:
```javascript
// In browser console
localStorage.getItem('user') // Should show updated firstName, lastName, phone
```

---

## ✅ Test Case 2: Form Validation

### Test 2.1: Empty First Name
1. Open edit modal
2. Clear "First Name" field
3. Click "Save Changes"
4. ❌ Should show error: "First name is required"
5. ✅ Button remains enabled
6. ✅ Modal stays open

### Test 2.2: Empty Last Name
1. Open edit modal
2. Clear "Last Name" field
3. Click "Save Changes"
4. ❌ Should show error: "Last name is required"
5. ✅ Button remains enabled
6. ✅ Modal stays open

### Test 2.3: Empty Phone
1. Open edit modal
2. Clear "Phone" field
3. Click "Save Changes"
4. ❌ Should show error: "Phone is required"
5. ✅ Button remains enabled
6. ✅ Modal stays open

### Test 2.4: Multiple Empty Fields
1. Open edit modal
2. Clear all three fields
3. Click "Save Changes"
4. ❌ Should show error for first empty field encountered
5. ✅ Form doesn't submit

---

## ✅ Test Case 3: Read-Only Fields

### Steps:
1. Open edit modal
2. Observe Email field
3. Try to click/type in Email field
4. Try to click/type in Role field

### Expected Results:
- ✅ Email field is disabled (greyed out)
- ✅ Role field is disabled (greyed out)
- ❌ Cannot type or modify these fields
- ✅ Visual feedback shows they're read-only

---

## ✅ Test Case 4: Modal Close & Reset

### Test 4.1: Close Button Without Changes
1. Open edit modal
2. Click "Close" button
3. Modal closes
4. ✅ Form data discarded

### Test 4.2: Close Button After Changes
1. Open edit modal
2. Change first name to "Test"
3. Click "Close" button
4. Modal closes
5. Open edit modal again
6. ✅ First name back to original value

### Test 4.3: Escape Key (if implemented)
1. Open edit modal
2. Make changes
3. Press Escape key
4. ✅ Modal closes
5. ✅ Changes are discarded

---

## ✅ Test Case 5: API Error Handling

### Simulate Network Error:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Open edit modal
4. Make changes
5. Click "Save Changes"
6. Quickly set Network to "Offline"
7. ✅ Should see error in red error box
8. ❌ Modal should NOT close

### Backend Error Simulation:
1. Stop the backend server
2. Make changes in edit modal
3. Click "Save Changes"
4. ✅ Should see error message
5. ❌ Modal should NOT close
6. Restart backend and try again

---

## ✅ Test Case 6: Loading States

### Steps:
1. Open edit modal
2. Make changes
3. Click "Save Changes"
4. Quickly observe (before response):
   - ✅ Button text changed to "Saving..."
   - ✅ Button disabled (cannot click again)
   - ✅ Form inputs disabled
   - ✅ Close button disabled

### After Response:
- ✅ Button text returns to "Save Changes"
- ✅ Buttons become enabled again
- ✅ Modal closes (success) or error shows (failure)

---

## ✅ Test Case 7: Persistence Testing

### Steps:
1. Sign in and edit profile (firstName → "Persistent")
2. Save successfully
3. Verify changes display
4. Refresh page (F5)
5. ✅ Profile still shows "Persistent"
6. Close browser completely
7. Reopen browser and navigate to dashboard
8. ✅ Still logged in with updated profile
9. Navigate to Profile page
10. ✅ Changes persisted

### Check localStorage:
```javascript
// Before login
localStorage.getItem('user') // null

// After login
localStorage.getItem('user') // { firstName: 'Persistent', ... }

// After edit
localStorage.getItem('user') // Updated user object

// After refresh
localStorage.getItem('user') // Still has updated user
```

---

## ✅ Test Case 8: Redux State Verification

### Using Redux DevTools:
1. Install Redux DevTools browser extension
2. Sign in and open Profile
3. Click Edit button
4. Make changes and save
5. Open Redux DevTools (Extension icon)
6. Look for actions in this order:
   - ✅ `updateProfile.pending`
   - ✅ `updateProfile.fulfilled` (with updated user payload)
7. Check state after:
   - ✅ `auth.user` has updated values
   - ✅ `auth.loading = false`
   - ✅ `auth.error = null`

### Using Console:
```javascript
// In browser console
store.getState().auth.user
// Should show: { firstName: 'Updated', ... }

store.getState().auth.loading
// Should show: false

store.getState().auth.error
// Should show: null (on success) or error message (on failure)
```

---

## ✅ Test Case 9: Multiple Rapid Edits

### Steps:
1. Edit and save profile
2. Immediately edit again (before page updates)
3. Make different changes and save
4. ✅ Second save should succeed
5. ✅ Profile shows latest values
6. ✅ No race condition issues

---

## ✅ Test Case 10: Browser Compatibility

Test on:
- [x] Chrome/Edge (Chromium)
- [x] Firefox
- [x] Safari (if available)
- [x] Mobile browsers

Expected: Works identically on all browsers

---

## 🎯 Regression Tests

### Ensure Other Features Still Work:

- [ ] Sign in/out functionality unchanged
- [ ] Protected routes still guard access
- [ ] Other profile cards (Meta, Address) still display
- [ ] Page navigation works
- [ ] Breadcrumb navigation works
- [ ] Dark mode toggle works
- [ ] Responsive design still works

---

## 📊 Performance Checklist

- [ ] API request completes < 2 seconds
- [ ] No console errors on successful save
- [ ] No memory leaks on modal open/close
- [ ] Smooth animations in modal
- [ ] No UI lag during typing
- [ ] Responsive to immediate user actions

---

## 🔍 Code Quality Verification

### TypeScript Compilation:
```bash
cd p4p-dashboard
npm run build  # Should complete without errors
```

### ESLint Check:
```bash
npm run lint   # Should pass without warnings (if enabled)
```

### Redux State Shape:
```typescript
// Verify in Redux DevTools
{
  auth: {
    user: User | null,
    token: string | null,
    loading: boolean,
    error: string | null,
    isAdmin: boolean
  }
}
```

---

## ✨ Success Criteria

✅ All test cases pass  
✅ No console errors  
✅ No TypeScript errors  
✅ API successfully called  
✅ Data persisted in localStorage  
✅ Redux state updated correctly  
✅ Modal UX smooth and responsive  
✅ Error handling graceful  
✅ Loading states clear  
✅ Security measures intact  

---

## 🐛 Issue Reporting Format

If you find an issue:

```
Title: [Brief description]

Steps to Reproduce:
1. ...
2. ...
3. ...

Expected Result:
...

Actual Result:
...

Browser/OS:
...

Console Errors:
[paste any errors]

Redux State:
[paste auth state from DevTools]
```

---

## 📝 Checklist for Team

- [ ] Review PROFILE_EDIT_INTEGRATION.md
- [ ] Review PROFILE_EDIT_QUICK_REF.md
- [ ] Run through all test cases
- [ ] Verify API endpoint working
- [ ] Test on multiple browsers
- [ ] Test on mobile
- [ ] Check localStorage persistence
- [ ] Verify Redux state updates
- [ ] Confirm no security issues
- [ ] Sign off on completion

---

**Test Coverage:** 10 comprehensive test cases
**Status:** Ready for testing
**Last Updated:** November 23, 2025

---
