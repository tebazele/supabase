
# File Upload with supabase ![supabase_logo](/imgs/supabase-logo-icon_1.png)


supabase is a lot of things from  a file storage database to an edge functions service, an Auth provider, and a PostgreSQL server. supabase's way of storing all of it's data into tables makes it a free, easy, and flexible solution for storing and accessing information. We are going to use supabase for its file storage and set it up in a way that allows us to write rules that our users from Auth0 will have to abide by. Get started by creating an account with supabase [HERE](https://supabase.com) and confirming your email. You can also sign up using your GitHub account. You will also want to log into your Auth0 account, as we will make some changes to our auth rules there too.

## Project Setup

Once signed up and after your email is confirmed, you should land on the "projects" page. You won't have any right now, so let's make one. This project can hold many storage “buckets” for lots of different applications, so name it something generic like “sandbox.”


![new_project](/imgs/new-project.png)


Name your project and give it a secure password. Note that is isn't the password for your supabase account but the password you’ll use to access your *database* later on. Select a region close to you, and we will of course stick with the free option, since we like free.
![create-project](/imgs/create-project.png)

Once we create our project, we should be navigated to "projects setting" page while  the project is being set up. It only sits here while the project is being built and might navigate you away once it is complete. You can always get back to this settings page by hitting the `cog` at the bottom of the navigation menu on the left.

## subase Tokens 

![supabase_tokens](/imgs/secrets.png)

There are some tokens here we are going to want to use for our app so let's re-open this page in a new tab by clicking the settings cog in the left-hand nav menu and click “Api”.

## Storage Setup

Back on the main page, navigate to the storage tab in the left-hand nav (it looks like a little storage box) and create a new storage "bucket". Name it whatever you would like, and turn "public" on. You can change this later, but this makes it so anyone can read data from our storage, which we want for now.

![inline_small_nav-storage](/imgs/nav-storage.png)
![inline_w_75_create storage bucket](/imgs/new-storage.png)

When that is done you should see your storage bucket in the list on the left

![w_50_ list of storage buckets](/imgs/bucket-list.png)

## Auth0 Rule

Now we need to set up our auth0 so that it can assign a `JWT` (json web token) that supabase can read and use to identify users accessing our storage bucket.  That way when someone logs into our website using Auth0 and gets a token for our api, they will also be given a token to interact with our supabase project.

Head on over to the `auth pipeline` -> `rules` section page and make a new rule, selecting `empty rule` when prompted
![auth rule button](/imgs/auth0-create-rule.png)

There will be some code there already that we can erase. Copy the code block below and paste it into our rule. Then, rename the rule and save it.

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

⚠️ In this rule near the top, there is a string with `<SUPABASE JWT SECERET>` this (including the carrots) needs to be replaced with our `JWT token` from supabase (you can find this in your `project settings` -> `api` tab)

![supabase jwt token](/imgs/supabase-jwt-secret.png)

To simply explain this rule, it takes the secret token from supabase and assigns us a token with our user's information on it that allows our users to access our api (similar to how Auth0 assigns a bearer token on sign-in). This one, however, is assigned in a way that supabase can read. The token gets added to our userInfo that comes back when we normally log in. You can see it now if you log into one of your sites and checking the newly added `supabase` property.

![user token](/imgs/user-token.png)

## supabase Token Reader

Heading back to supabase, we want to give our supabase project the ability to read this token and get the userInfo off of it. While we are there, we will also add in the functionality to attach user ids to anything uploaded to our storage bucket.

Head over to the SQL editor and create a `New Query`. You can name it something like `auth0 userIds`. We should have a large empty editor in front of us where we will paste the following code.

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
⚠️ click `Run` in the bottom right. You should get a message that says "Success, no rows returned."

This code block does a couple things. 
  - The first part creates a function that can be used to get the userId from a request token
  - It adds a column to our storage bucket to hold the usersId, so we can attach ownership to items uploaded
  - Then it both creates a function and attaches that function to the insert event, so when someone uploads a file, their user Id will be attached to it

## supabase Row Policies

We are almost done with setting up our supabase so that users can start uploading files.  Everything up to this point has been so we can make sure users are authorized and we can enable certain actions using `row level security`, or simply put rules around our database items on who can upload, who can delete, etc.

Head back over to the `storage` tab and click on `configuration` -> `politices`. Here we should see our storage bucket, and we are going to click the `new policy` button and `create a policy from scratch` (For full customization).

![new policy](/imgs/supabase-new-policy.png)

In the dialogue window that pops up, name your policy, then check each of the following: `SELECT`, `INSERT`, `UPDATE`, `DELETE`. In the `policy definition` delete the code that’s already there and paste in this bit of code. Don’t change the target roles.


```sql
((user_id)::text = auth.user_id())
```
This bit of code will access the user Id function we added earlier to our SQL tables to get the id off the request and compare it against any of our items' user_id;
The dialogue should look something like this

![new policy dialogue](/imgs/supabase-policy-details.png)

Click `review`, then `save policy` on the next dialogue window.  This should create 4 policies under the `storage.objects` policy section.

supabase is now set up to allow authorized users to use interact with it.

## App Setup

Now we will want to set up our application to interact with supabase, starting with installing the supabase node package. Go to your app's client folder (if your app only has a client, then no need to change directories), and run this in your terminal.

```
npm install @supabase/supabase-js
```
If you look inside your package.json, you should now see supabase as a dependency.

Next head over to your env.js and add two variables to be exported. One for our supabase project url, and one for our supabase public api key.

![env.js new exports](/imgs/envJs-add.png)

Enter these values. You can find them in the `Project settings` -> `API` tab.

![supabase api tokens](/imgs/supabase-url.png)

## supabase Service

In the code for [this project](https://github.com/MickShannahan/supabase), there is a `SupabseService.js` that is in our services folder. This file includes all the code necessary to connect our supabase and create a "client" to interact with our supabase project. You are welcome to use this for your app but it would be wise to look it over and understand it's function. It includes 4 methods. `init`, `upload`, `remove` and `list`.  

  - init: This is what creates an instance of our supabase client that the other functions can use. Without this successfully connecting, none of the other functions will work. [supabase docs initializing](https://supabase.com/docs/reference/javascript/initializing)

  - upload: This will upload a file to supabase to be stored and returns the url of the file that was saved. It takes in two arguments, the file to be uploaded and the name it is stored under. Something to keep in mind about how supabase uploads files is that folders can be created by including slashes `/` in the name. Just uploading `cuteCats.jpg` would upload that file to the base of our project. For organization it would be wise to instead pass `cat-pictures/cuteCats.jpg` for instance.  In this project we actually use the user's Id for folder names. So any files an user uploads wont overlap with another users. [supabase docs upload file](https://supabase.com/docs/reference/javascript/storage-from-upload)

  - remove: Anything stored should be removable. This function just takes the name of the file you want to remove and it removes it. The only thing to remember when running this function is, if our uploaded file name included slashes (was stored in a folder), then when we remove it we need to use the same file path name. If `cuteCats.jpg` was uploaded into the `cat-pictures` folder, then the name that we need to pass should be `cat-pictures/cuteCats.jpg`. [supabase docs delete a file](https://supabase.com/docs/reference/javascript/storage-from-remove)

  - list: This will list all of the files a particular user has uploaded to supabase. [supabase docs list files](https://supabase.com/docs/reference/javascript/storage-from-list)

  ## Initialize Supabase

  In this current project, and likely in yours, you will want to initialize supabase whenever a user logs in. If file upload is not a priority for your application, then this could be put off until the form that includes the file upload is opened, but for simplicity just creating this connection with the user has been authorized works well.

  In the `AuthService.js`, right after the user info has been retrieved from Auth0, we will want to run the `init` method from the supabase service, passing 2 arguments. 

  - The first is the name of your storage bucket, ours in this project is called 'sandbox'. 
  - The Second argument will need to be the supabase token that our Auth0 rule assigned. That token gets attached to the userInfo object, so it should be accessible in the network tab on `user` at this point.

  ![initalize supabase 10_vh_](/imgs/supabase-init.png)

  > Our `init` function will use that bucket name and token along with the site url and public api key we added in our env.js to connect with supabase, so make sure all of that is filled in before we try to init.

  ## Using supabase with your App

In this project here, we use 'polaroids' or simple picture objects to demonstrate the process of uploading to supabase. When users want to create a polaroid, the user actions are almost identical to what we are used to, but we take an extra step in our service: before we post the polaroid data to our api, we first upload the image to supabase.


Start with the code in our app to backwards engineer how you could use file upload in yours.  All of the code used is on the `HomePage.vue` file.  We have a form with two inputs, one for a title and one to allow the user to select a file.  

To allow an image file to be uploaded, we need to change the input type from ‘url’ to ‘file’. The input type ‘file’ allows users to choose one or more files from their device storage. Regardless of a user's device or operating system, using the file input provides the button that opens up the file picker dialogue. 

We need to specify what type of files we want supabase to accept. The accept attribute is a string that defines the file types that the input should accept. The string “image/*” means ‘any image file’.

You will also need a way to target the file that is being uploaded in our `post` function. The name attribute ‘fileInput’ allows us to target the input when we go to our upload function. 

While the title is attached to a editable ref, we grab the file only once the form is submitted. Then we pass both of these separately to our `polaroidService`.

Because your file cannot be v-modeled to `editable`, our upload function will take in the form submission event. File inputs (regardless of the number of files chosen) will return an array - this is because the default for selection is multiple files. File inputs will always be an array even if the default is changed to return just one type.

From the `polaroidService`, we want to make sure that each user has its own unique folder within our bucket using their userId, so we grab the userId from the `Appstate`. This is necessary so that when files get uploaded by the same user with the same image name, their folder doesn’t show the duplicate images, and so that a similarly named photo can exist under a different users folder.

Next, we upload our file and save the returned url to the `polaroidData`, then send that polaroid data to our own api. Supabase will store your files but your api will still store the url to access those files. *The data displayed on the page are still objects we store in our own database*.

The supabase url will contain the file information we passed from the form, as well as the folder created with the userId, and the title of the polaroid object that creates our file path. If we want to nest the uploaded images inside of another folder with that userId, all we need to do is add another forward slash in between the folder and the polaroidData with the name of the file we want to create. This is a way we could store data in different subfolders under the same user. 

You will also need to backward engineer a way to delete the polaroid not only from your api, but also from your supabase folder and bucket. Start with removing the data from supabase. You will need the storage path information that includes the userId as well as the storage data responese (res) that will be removed using the supabaseService remove function. 

  ![create a polaroid w_100_](/imgs/polaroid-create.png)

When we want to show the polaroids people have uploaded to the site nothing has really changed. We will still just get them from our api - our database still stores url strings to display the correct image, but now that is an image we are storing on supabase in our own project.

## Check your supabase Understanding

After successfully adding supabase to your project, reflect on these questions to check your understanding. If you find that you feel like you are missing some information, check out the supabase docs linked above! 

- What is a JWT token and what is it used for?
- What does the init function in the supabase service do?
- What does the upload function in the supabase service do?
- What does the remove function in the supabase service do?
- What does the list function in the supabase service do?
- Why should you put the supabase initialization function call in the Auth service after authenticating the user?
- When looking at the polaroidUpload function on the `HomePage.vue`, how does this function access the file it sends over to the service? Consider logging ‘file’ to see what it looks like. 






