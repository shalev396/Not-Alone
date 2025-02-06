# Pages and Routes Checklist

## Public Routes

- [V] Landing Page (`/`) notes : hide reviews , statistics and supporters before lunching the app
- [V] Login Page (`/login`)
- [V] Signup Page (`/signup`)
- [V] Two Factor Auth Page (`/2fa`) notes : add cole down to resend code
- [V] Forgot Password Page (`/forgot-password`)
- [V] Reset Password Verify Page (`/reset-password-verify`)
- [V] Pending Page (`/pending`)

- [V] Terms of Service Page (`/termsofservice`) notes : TOS is not correct
- [V] Privacy Policy Page (`/privacypolicy`) notes : PP is not correct
- [V] Licenses Page (`/licenses`)

- [ ] Donation Status Page (`/donation-status/:donationId`)

## Protected Routes

### Admin Routes

- [V] Admin Queue Page (`/admin/queue`)
- [V] Admin City Queue Page (`/admin/city-queue`): notes : check images

### User Management Routes

- [ ] Profile Page (`/profile`)
- [V] Logout Page (`/logout`)
- [V] Your Rights Page (`/rights`)

### Home and Navigation

- [ ] Home Page - Donations (`/home`, `/home/donations`)
- [x] Home Page - Residences (`/home/residences`) notes : removed (noted in app.tsx)
- [ ] Home Page - EatUp (`/home/eatup`)
- [ ] Channel Page (`/channel/:channelId`)

### Social and Posts

- [ ] Social Page (`/social`)
- [ ] Create Post Page (`/create-post`)
- [V] New EatUp Page (`/new-post`)

### Donations and Contributions

- [ ] Contribute Page (`/contribute`)
- [ ] Create Donation Page (`/create-donation`)
- [ ] My Donations Page (`/my-donations`)
- [ ] Donation Control Panel Page (`/donation-control-panel`)
- [ ] Donation Assignment Page (`/donation-assignment`)

### City Management

- [ ] Create City Page (`/create-city`)
- [ ] City Request Queue Page (`/city-request-queue`)
- [ ] City User Approval Queue Page (`/city-user-approval-queue`)
- [ ] Join City Request Page (`/join-city-request`)
- [ ] Soldier Join City Page (`/soldier-join-city`)

### EatUps and Requests

- [V] My EatUps Page (`/my-eatups`) notes : did not test with ood size images
- [ ] Request Form Page (`/RequestForm`)
- [ ] My Requests Page (`/my-requests`)

### Other Features

- [x] Vouchers Grid Page (`/Vouchers`)

## progress

total 37 pages
finished 14 pages
removed 2 pages

21 pages to go
prompt

now in eatupsdialog i want you to do the same like in login and signup pages

the form @https://formik.org/docs/overview
of to formik doc and understand how to use it for the best
i sent a photo of the docs navbar make use you understand every part og formik and implument it accodingly (api refs)

make city edit disable
and use zod for validation
