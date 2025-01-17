## To-Do List

- at the end add auth test so it will test every endpoint with every user type
- add self auth for crud operations, so that only the user who made the "data" can access his own data and not other users (except admins)
- implement join to cities that will need municipality approval
  for now users cant leave cities after they are approved
  -only users and cities are optimized for now
  -add mini login in the body of "/api/users/pending/:userId"

### Progress

- [V] User Tested
- [V] City Tested
- [V] Request 
- [V] Eat Up Tested
- [V] Donation Tested
- [V] Discount Tested
- [V] Business Tested
- [V] Profile 
- waiting
- [ ] Post
- [ ] Comment
- sockets
- [ ] Channel
- [ ] Message

## MVC
- [V-MRC] User Tested
- [V-MRC] City Tested
- [V-MRC] Request 
- [V-MRC] Eat Up 
- [V-MRC] Donation Tested
- [V-MRC] Discount Tested
- [V-MRC] Business Tested
- [ ] Profile

---

### On Hold

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

- [V] GET /all: Retrieve all eatups.
- [V] GET /:eatupId: Retrieve a eatup by eatup ID.
- [V] POST / create a eatup
- [V] POST /:eatupId/join: Join a eatup
- [V] POST /:eatupId/leave: Leave a eatup
- [V] PUT /:id : Update a eatup by eatup ID.
- [V] DELETE /:id : Delete a eatup by eatup ID.

## extra eatups routes

- [V] GET /my: Retrieve all eatups of the authenticated user.

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

# explain project in a prompt

Project Name: Not Alone

Overview:
Not Alone is a comprehensive platform designed for Lone Soldiers and the people and organizations who want to support them. The platform includes multiple user types—each with specific roles, permissions, and interactions—all of which require admin approval at registration.

User Types:

Lone Soldier (often referred to as “soldier”)

Registers on the app and can be associated with multiple cities or none.
Can make financial requests, which can be approved by a city (Municipality user) or an Admin.
Once approved, these requests become visible to Donors who can fulfill them (monetary only).
Can join Eatups (events) organized by Nonprofits, Cities, or Donors.
Participates in the app’s limited social network with Municipalities, Nonprofits, and Admins.
Donor

Registers to donate items or money to Lone Soldiers.
Can see approved financial requests from Soldiers.
Can organize Eatups (events).
Does not participate in the social network.
Municipality (City Representative)

Registers as either creating a new city (requires Admin approval) or joining an existing city (which can be approved by an Admin or by a Municipality user already in that city).
Can manage financial requests for Soldiers linked to their city (note: a Soldier can be linked to multiple cities, and each city can approve or deny that Soldier’s requests).
Can organize Eatups visible only to the Soldiers linked to that same city.
Participates in the limited social network.
Nonprofit Organization

Registers to support Lone Soldiers through events and other means.
Can create Eatups, which are visible to all Soldiers on the platform.
Participates in the limited social network.
Business

Registers to provide discounts and future services for Lone Soldiers.
Can create a business page and manage special discounts that only verified Lone Soldiers can access.
Currently, a Business owner can add employees in the system; in the future, these employees will be able to directly verify if a customer is indeed a Lone Soldier.
Does not participate in the social network.
Admin

Has full permissions over the application.
Approves or denies registrations for all other user types.
Can manage or override anything in the system, including financial requests and city creation.
Registration & Approval Flow:

New User Signup:

A new user chooses one of the five roles (not Admin) when registering.
The user cannot fully access the app until an Admin approves their registration.
Municipality Registration Specifics:

If creating a new city, an Admin must approve both the city creation and the user’s registration.
If joining an existing city, approval can come either from an Admin or from a Municipality user already in that city.
Soldier City Assignment:

A Soldier can belong to multiple cities or choose none.
Each city or an Admin can accept that Soldier.
Main Features & Interactions:

Financial Requests:

Created by Soldiers.
Approved or denied by either the City (Municipality user) or an Admin.
Once approved, Donors can see the request and fulfill it financially.
Eatups (Events):

Can be created by Nonprofits, Cities, or Donors.
Soldiers can join these events via the app.
Visibility depends on who is creating them:
City-created Eatup: visible only to that city’s Soldiers.
Nonprofit-created Eatup: visible to all Soldiers.
Donor-created Eatup: presumably visible to all Soldiers or whichever scope is set (the user flow can be adapted as needed).
Can optionally have a participant limit.
Each Eatup automatically creates a messaging channel for the participants, which remains open during the event (though there is a plan to close and delete messages in a future version).
Donations of Items:

Donors can donate items (e.g., a fridge).
Municipality users or Admins manage the assignment of items to Soldiers.
The city can even assist with arranging delivery.
Discounts from Businesses:

Businesses create a business page and list discounts exclusive to Lone Soldiers.
In a future release, employees added by the Business can verify a Soldier’s status in-person.
Social Network (Limited):

Accessible by Soldiers, Municipalities, Nonprofits, and Admins.
Used for sharing posts and promoting events.
Businesses and Donors do not participate in this feed.
Messaging System:

An automated channel is created for each Eatup.
Participants can message each other about the event.
Currently, the channel remains open; in the future, it may be automatically closed, with messages deleted, after the event concludes.
Tech Stack:

Frontend: React (TypeScript) using Vite
Backend: Node.js (TypeScript)
Database: MongoDB
Additional Notes & Future Plans:

Soldiers can be approved by multiple cities, and each city can manage that Soldier’s requests.
Businesses can already add employees to the system, so when a real-time Soldier verification feature is implemented, the groundwork is ready.
Channels are used for Eatups, but there’s the potential to add more messaging features in the future.
