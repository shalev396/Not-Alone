## To-Do List

- at the end add auth test so it will test every endpoint with every user type
- add self auth for crud operations, so that only the user who made the "data" can access his own data and not other users (except admins)
- implement join to cities that will need municipality approval
  for now users cant leave cities after they are approved

### Progress

- [V-MRC] User
- [V-MRC] City
- [V-MRC] Request
- [ ] Eat Up
- [V-MRC] Donation
- [ ] Business

---

### On Hold

- [ ] Voucher
- [ ] Post

---

### Sockets

- [ ] Channel
- [ ] Message

# user routes

## existing user routes

- [V] POST /login: Authenticate a user and return a token. (in auth)
- [V] POST /register: Register a new user. (in auth)
- [V] GET /me: Retrieve the profile of the currently authenticated user.
- [V] GET /:userId: Retrieve a user profile by user ID.
- [x] PUT /:userId: Update a user profile by user ID.
- [V] DELETE /:userId: Delete a user profile by user ID.

## extra routes

- [V] PUT /me: Update a user profile by user ID.
- [V] GET /all: Retrieve all users.

### admin routes related to users

- [V] GET /pending: Retrieve all pending users.
- [V] POST /approve/:userId: Approve a user by user ID.
- [V] POST /deny/:userId: Deny a user by user ID.

# city routes

## existing city routes

-

## extra routes

- [V] GET /all: Retrieve all cities.

### municipality routes related to cities

- [V] POST / create a city
- [V] POST /:cityId/join/municipality: Join a city as a municipality.
- [V] PATCH /:cityId: Update a city by city ID.
- [] GET /:cityID/soldiers: Retrieve all soldiers of a city.

### soldier routes related to cities

- [V] POST /:cityId/join/soldier: Join a city as a soldier.

### admin routes related to cities

- [V] POST /:cityId/approve: Approve a city by city ID.
- [V] POST /:cityId/deny: Deny a city by city ID.
- [V] DELETE /:cityId: Delete a city by city ID.

# request routes

## existing request routes

- [V] POST / create a request
- [V] GET /all: Retrieve all requests.
- [V] GET /:requestId: Retrieve a request by request ID.

### existing municipality routes related to requests

- [V] POST /:requestId/approve: Approve a request by request ID.
- [V] POST /:requestId/deny: Deny a request by request ID.
- [x] DELETE /:requestId: Delete a request by request ID.

### existing Donor routes related to requests

- [x] GET /approved: Retrieve all approved requests.

### existing soldier routes related to requests

- [V] GET /my-requests: Retrieve all requests of the soldier.
- [V] PUT /:id : Update a request by request ID.
- [x] DELETE /:id : Delete a request by request ID.

# Donation routes

## existing donation routes

- [V] POST / create a donation
- [V] GET /all: Retrieve all donations.
- [V] GET /:donationId: Retrieve a donation by donation ID.
- [V] PUT /:id : Update a donation by donation ID.
- [V] DELETE /:id : Delete a donation by donation ID.

## extra donation routes

- [V] GET /my: Retrieve all donations of the authenticated user.
- [V] GET /city-matching: Retrieve all donations of the authenticated user.
- [V] POST /:donationId/assign/:soldierId: Assign a donation to a soldier.
- [V] PUT /:donationId/status: Update the status of a donation.

# eatups routes

## existing eatups routes

- [] GET /all: Retrieve all eatups.
- [] GET /:eatupId: Retrieve a eatup by eatup ID.
- [] POST / create a eatup
- [] POST /:eatupId/join: Join a eatup
- [] POST /:eatupId/leave: Leave a eatup
- [] PUT /:id : Update a eatup by eatup ID.
- [] DELETE /:id : Delete a eatup by eatup ID.

# profile routes

### existing profile routes

- [] GET /me: Retrieve the profile of the currently authenticated user.
- [] PUT /me: Update a user profile by user ID.

### extra profile routes

- [] GET /:profileId: Retrieve a profile by profile ID.

# business routes

### existing business routes

-

### extra business routes

- [] POST / create a business
- [] GET /all: Retrieve all businesses.
- [] GET /:businessId: Retrieve a business by business ID.
- [] PUT /:id : Update a business by business ID.
- [] DELETE /:id : Delete a business by business ID.

### businessUsers routes related to business

- [] POST /:businessId/join: Join a business
- [] POST /:businessId/leave: Leave a business

# discount routes

### existing discount routes

-

### extra discount routes

- [] POST /:businessId/create: create a discount
- [] GET /all: Retrieve all discounts.
- [] GET /:discountId: Retrieve a discount by discount ID.
- [] PUT /:id : Update a discount by discount ID.
- [] DELETE /:id : Delete a voucher by voucher ID.
