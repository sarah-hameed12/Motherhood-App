
API Documentation
Table of Contents
Vaccine Routes

Community Routes

Vaccine Routes
Create Default Vaccines
POST /api/vaccines/setup-default-vaccines
Creates all important childhood vaccines.

Get All Vaccines with Schedules
GET /api/vaccines/all-vaccines-schedules
Retrieves all vaccines along with their schedule details.

Get Schedules for a Specific Vaccine
GET /api/vaccines/{vaccine_id}/schedules
Fetches schedule information for a particular vaccine using its ID.

Get Vaccine by Name
GET /api/vaccines/name/{vaccine_name}
Retrieves a vaccine and its schedules by vaccine name.

Search Vaccines by Disease
GET /api/vaccines/protects-against/{disease}
Searches for vaccines based on the disease they protect against.

Community Routes
Create a Post
POST /api/community/create-post
Creates a new community post.

Get My Posts
GET /api/community/my-posts
Retrieves all posts created by the authenticated user.

Get Feed Posts
GET /api/community/feed
Fetches the community feed posts.

Get Post Details
GET /api/community/post/{post_id}
Retrieves detailed information for a specific post.

Update a Post
PUT /api/community/update-post/{post_id}
Updates an existing post.

Change Post Visibility
PATCH /api/community/change-visibility/{post_id}
Changes the visibility of a post.

Delete a Post
DELETE /api/community/delete-post/{post_id}
Deletes a specific post.

Google-like Interaction
POST /api/community/post/{post_id}
Handles a Google-like interaction (e.g., like) on a post.
