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

- [V] Donation Status Page (`/donation-status/:donationId`) : notes : need to fix auth and navbar

## Protected Routes

### Admin Routes

- [V] Admin Queue Page (`/admin/queue`)

- [V] Admin City Queue Page (`/admin/city-queue`): notes : check images

### User Management Routes

- [V] Profile Page (`/profile`)
- [V] Logout Page (`/logout`)
- [V] Your Rights Page (`/rights`)

### Home and Navigation

- [x] Home Page - Donations (`/home`, `/home/donations`) notes : discontinued
- [x] Home Page - Residences (`/home/residences`) notes : removed (noted in app.tsx)
- [V] Home Page - EatUp (`/home/eatup`)
- [V] Channel Page (`/channel/:channelId`) notes : need to test/fix

### Social and Posts

- [V] Social Page (`/social`)
- [V] Create Post Page (`/create-post`)
- [V] New EatUp Page (`/new-post`)

### Donations and Contributions

- [V] Contribute Page (`/contribute`)
- [V] Create Donation Page (`/create-donation`)
- [V] My Donations Page (`/my-donations`)
- [V] Donation Control Panel Page (`/donation-control-panel`)
- [V] Donation Assignment Page (`/donation-assignment`)

### City Management

- [V] Create City Page (`/create-city`)
- [V] City Request Queue Page (`/city-request-queue`)
- [V] City User Approval Queue Page (`/city-user-approval-queue`)
- [V] Join City Request Page (`/join-city-request`)
- [V] Soldier Join City Page (`/soldier-join-city`)

### EatUps and Requests

- [V] My EatUps Page (`/my-eatups`) notes : did not test with ood size images
- [V] Request Form Page (`/RequestForm`)
- [V] My Requests Page (`/my-requests`)

### Other Features

- [x] Vouchers Grid Page (`/Vouchers`)

## progress

total 37 pages
finished 34 pages
removed 3 pages

## progress by navbar

## discontined

/Vouchers
/home/donations
/home/residences

##prompt

now in eatupsdialog i want you to do the same like in login and signup pages

the form @https://formik.org/docs/overview
of to formik doc and understand how to use it for the best

i sent a photo of the docs navbar make use you understand every part og formik and implument it accodingly (api refs)

make city edit disable
and use zod for validation
