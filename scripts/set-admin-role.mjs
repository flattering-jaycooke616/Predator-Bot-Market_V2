import { Clerk } from "@clerk/clerk-sdk-node";

const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

async function setAdminRole() {
  try {
    const email = "ntoampilp@gmail.com";
    
    console.log(`Finding user with email: ${email}`);
    const users = await clerk.users.getUserList({ emailAddress: [email] });
    
    if (users.length === 0) {
      console.error("User not found!");
      return;
    }
    
    const user = users[0];
    console.log(`Found user: ${user.id}`);
    
    await clerk.users.updateUserMetadata(user.id, {
      publicMetadata: {
        role: "admin",
      },
    });
    
    console.log(`✅ Admin role added to ${email}`);
    console.log("Please sign out and sign back in for changes to take effect.");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

setAdminRole();
