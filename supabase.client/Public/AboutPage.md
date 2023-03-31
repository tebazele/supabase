# File upload with supabase ![supabase_logo](/imgs/supabase-logo-icon_1.png)


supabase is a lot of things from an Auth provider to a Postgresql server, file storage to edge functions. Supabase's way of storing all of it's data into tables makes it free, easy and flexible solution for storing and accessing information. We are going to use supabase for it's file storage and set it up in a way that allows us to write rules that our users from auth0 will have to abide by. Get started by creating an account with supabase, and confirming your email.  You will also want to log into your Auth0 account, as we will make some changes to our auth rules there too.

## project setup

 Once signed up and you email is confirmed you should land on a the projects page. You wont have any right now so lets make one.


![new_project](/imgs/new-project.png)


Name your project and give it a secure password. Note that is isn't the password for you supabase account, this could be used to access your database later though. Select a region close to you and we will of course stick with the free option, since we like free.
![create-project](/imgs/create-project.png)

Once we create our project we should get navigated to projects setting page while it gets set up. It only sits here while the project is being built and might navigate you away once it is complete. If that is the case, you can always get back to this settings page by hitting the `cog` at the bottom of the navigation menu on the left.

## subase tokens 

![supabase_tokens](/imgs/secrets.png)

There are some tokens here we are going to want to use for our app so lets keep this page open in a new tab.

## storage setup

Navigate to the storage tab. and create a new storage bucket. Name it whatever you would like, and turn public on. You can change this later but this makes it so anyone can read data from our storage, which we want.

![inline_small_nav-storage](/imgs/nav-storage.png)
![inline_w_75_create storage bucket](/imgs/new-storage.png)

When that is done you should see your storage bucket in the list on the left

![w_50_ list of storage buckets](/imgs/bucket-list.png)

## auth0 rule

Now we need to set up our auth0 so that it can sign a `jwt (json web token) that supabase can read and use to identify users accessing our storage bucket.  That way when someone logs into our website using though auth0 and gets a token for our api, they will also be given a token to interact with our supabase project.

Head on over to the `auth pipeline` - `rules` section page and make a new rule, selecting `empty rule` when prompted
![auth rule button](/imgs/auth0-create-rule.png)

there will be some code start which we can erase. Copy this code block below and paste it into our rule.

```javascript
function supaBaseToken(user, context, callback) {
  let jsonwt = require('jsonwebtoken@7.1.9');
	let supaSecret = 	'<SUPABASE JWT SECERET>'; // REPLACE WITH JWT TOKEN
  
	user.app_metadata = user.app_metadata || {};
  const meta = user.app_metadata;
  
  let expires = Math.floor(Date.now() / 1000) + 60 * 60;
	let payload = {
  userId: meta.id || meta.user_id,
  exp: expires
	};
  
  meta.supabase = meta.supabase || {};
  if(meta.supabase.exp > Date.now()){
  	return callback(null, user, context); // exit if token not expired
  }
 
  meta.supabase.exp = expires;
 	meta.supabase.token = jsonwt.sign(payload, supaSecret); // set to meta to save for later
  context.idToken.supabase = {
    token: meta.supabase.token,
    exp: expires
  };
    auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
        .then(function () {
            callback(null, user, context);
        })
        .catch(function (err) {
            callback(err);
        });  
  
  return callback(null, user, context);
}

```

⚠️ In this rule near the top there is a string with `<SUPABASE JWT SECERET>` this needs to be replaced with our `JWT token` from supabase (you can find this in your `project settings` - `api` tab)

![supabase jwt token](/imgs/supabase-jwt-secret.png)

To simply explain this rule, it takes the Secret from supabase and signs us a token with our user's information on it, similar to how auth0 signs a token for our users to access our api. This one however is signed in a way that supabase can read. The token gets added to our userInfo that comes back when we normally log in. You can see it now if you log into one of your sites and checking the newly added `supabase` property.

![user token](/imgs/user-token.png)

## supabase Token Reader

Heading back to supabase, we want to set up our supabase give our supabase project the ability to read this token and get the userInfo off of it. While we are there, we will also add in the functionality to attach user ids to anything uploaded to our storage bucket.

Head over to the SQL editor and create a `New Query`. You can name it something like `auth0 userIds`. We should have a large empty editor in front of us where we will paste this code.

```sql
create or replace function auth.user_id() returns text as $$
  select nullif(current_setting('request.jwt.claims', true)::json->>'userId', '')::text;
$$ language sql stable;

alter table storage.objects
add column if not exists user_id varchar(55);

create or replace FUNCTION attach_user_id()
RETURNS trigger AS $$
BEGIN
new.user_id = auth.user_id();
return new;
END;
$$ language plpgsql stable;

DROP TRIGGER IF EXISTS insert_id on storage.objects;
create trigger insert_id
BEFORE INSERT ON storage.objects
FOR EACH ROW
EXECUTE function attach_user_id();
```
⚠️ click `Run` in the bottom right. You should get a message that says "Success, no rows returned"

This code block does a couple things. 
  - The first part creates a function that can be used to get the userId from a requests token.
  - It adds a column to our storage bucket to hold the usersId, so we can attach ownership to items uploaded.
  - Then it both creates a function and attaches that function to the insert event, so when someone uploads a file, their user Id will be attached to it.

## supabase row policies

We are almost done with setting up our supabase so that users can start uploading files.  Everything up to this point has been so we can make sure users are authorized and we can enable certain actions using `row level security`, or simply put rules around our database items on who can upload, who can delete etc.

Head back over to the `storage` tab, and click on `policies` under configuration. Here we should see our storage bucket, and we are going to click the `new policy` button, then `Create a policy from scratch` (For full customization).

![new policy](/imgs/supabase-new-policy.png)

In the dialogue window that pops up select `SELECT INSERT UPDATE DELETE`. In the `Policy Definition` paste in this bit of code

```sql
((user_id)::text = auth.user_id())
```
This bit of code will access the user Id function we added earlier to our SQL tables to get the id off the request and compare it against any of our items' user_id;
The dialogue should look something like this

![new policy dialogue](/imgs/supabase-policy-details.png)

Click `review` then `save policy` on the next dialogue window.  This should create 4 policies under the `storage.objects` policy section.

Supabase is now set up to allow authorized users to use interact with it.

## app setup

Now we will want to set up our application to interact with supabase. Starting with installing the supabase node package. Go to your apps client folder (if you app only has a client then no need to go anywhere) and run
```
npm i supabase
```




