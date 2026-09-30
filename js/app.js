// ================================
// VIBE - SUPABASE CONNECTION
// ================================
const SUPABASE_URL = "https://kvqtmvsuhsuynhjnbjkj.supabase.co";
const SUPABASE_KEY = "sb_publishable_mIk9De4GPclRl46AhBl00Q_MDKUnMpi";
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
console.log("Supabase connected successfully!");
// ================================
// SIGN UP
// ================================

const signupForm = document.getElementById("signup-form");

if (signupForm) {
    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;

        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password
        });

        if (error) {
            console.error("Sign up error:", error);
            alert(error.message);
            return;
        }

        console.log("Account created:", data);

        alert("Account created successfully!");

        window.location.href = "login.html";
    });
}
// ================================
// CHECK IF USER IS LOGGED IN
// ================================

async function checkUser() {

    const protectedPages = [
        "browse.html",
        "profile.html",
        "chat.html",
        "view-profile.html"
    ];

    const currentPage =
        window.location.pathname.split("/").pop();

    if (!protectedPages.includes(currentPage)) {
        return;
    }

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

    if (error || !user) {
        window.location.href = "login.html";
        return;
    }

    console.log("User is logged in:", user.id);
}

checkUser();
// ================================
// LOGIN
// ================================

const loginForm = document.getElementById("login-form");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error("Login error:", error);
            alert(error.message);
            return;
        }

        console.log("Login successful:", data);

        alert("Login successful!");

        window.location.href = "browse.html";
    });
}
// ================================
// CREATE / EDIT PROFILE
// ================================

const profileForm = document.getElementById("profile-form");

if (profileForm) {
    loadMyProfile();

    profileForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        console.log("PROFILE FORM SUBMITTED");

        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();

        if (userError || !user) {
            alert("You must be logged in.");
            window.location.href = "login.html";
            return;
        }

        const name = document.getElementById("profile-name").value.trim();
        const age = Number(document.getElementById("profile-age").value);
        const gender = document.getElementById("profile-gender").value;
        const location = document.getElementById("profile-location").value.trim();
        const bio = document.getElementById("profile-bio").value.trim();

        const pictureFile = document.getElementById("profile-picture").files[0];
        let profilePictureUrl = null;

if (pictureFile) {
    const fileExtension = pictureFile.name.split(".").pop();
    const fileName = user.id + "." + fileExtension;

    const { error: uploadError } = await supabaseClient
        .storage
        .from("profile-pictures")
        .upload(fileName, pictureFile, {
            upsert: true
        });

    if (uploadError) {
        console.error("Picture upload error:", uploadError);
        alert("Could not upload profile picture: " + uploadError.message);
        return;
    }

    const { data: publicUrlData } = supabaseClient
        .storage
        .from("profile-pictures")
        .getPublicUrl(fileName);

    profilePictureUrl = publicUrlData.publicUrl;

    console.log("Profile picture uploaded:", profilePictureUrl);
}
        const { data: existingProfile, error: checkError } =
            await supabaseClient
                .from("profiles")
                .select("id")
                .eq("id", user.id)
                .maybeSingle();

        if (checkError) {
            console.error("Profile check error:", checkError);
            alert("Could not check your profile.");
            return;
        }

        let data;
        let error;

        if (existingProfile) {
            // Update existing profile
            ({ data, error } = await supabaseClient
                .from("profiles")
                .update({
                    name: name,
                    age: age,
                    gender: gender,
                    location: location,
                    bio: bio,
                    profile_picture: profilePictureUrl || existingProfile.profile_picture
                })
                .eq("id", user.id)
                .select());
        } else {
            // Create new profile
            ({ data, error } = await supabaseClient
                .from("profiles")
                .insert({
                    id: user.id,
                    name: name,
                    age: age,
                    gender: gender,
                    location: location,
                    bio: bio,
                    profile_picture: profilePictureUrl
                })
                .select());
        }

        if (error) {
            console.error("Profile save error:", error);
            alert("Could not save profile: " + error.message);
            return;
        }

        console.log("Profile saved:", data);

        alert("Profile saved successfully!");

        window.location.href = "browse.html";
    });
}


async function loadMyProfile() {
    console.log("Loading my profile...");

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        alert("Please log in first.");
        window.location.href = "login.html";
        return;
    }

    const { data: profile, error } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

    if (error) {
        console.error("Profile loading error:", error);
        return;
    }

    // No profile yet
    if (!profile) {
        console.log("No profile found. Creating a new one.");
        return;
    }
    document.querySelector(".profile-container h1").textContent =
    "Edit Your Profile";
    document.querySelector("#profile-form .btn").textContent =
    "Update Profile";

    // Put existing profile information into the form
    document.getElementById("profile-name").value = profile.name || "";
    document.getElementById("profile-age").value = profile.age || "";
    document.getElementById("profile-gender").value = profile.gender || "";
    document.getElementById("profile-location").value = profile.location || "";
    document.getElementById("profile-bio").value = profile.bio || "";
    // Show existing profile picture
const currentProfilePicture =
    document.getElementById("current-profile-picture");

if (currentProfilePicture && profile.profile_picture) {

    currentProfilePicture.innerHTML = `
        <img
            src="${profile.profile_picture}"
            alt="Current Profile Picture"
            class="current-profile-picture"
        >
        <p>Current profile picture</p>
    `;

} else if (currentProfilePicture) {

    currentProfilePicture.innerHTML =
        "<p>No profile picture uploaded yet.</p>";
}

    console.log("Profile loaded:", profile);
}
console.log("APP.JS IS WORKING!");
// ================================
// BROWSE PROFILES
// ================================
const profilesContainer = document.getElementById("profiles-container");
if (profilesContainer) {
    loadProfiles();
}
async function loadProfiles() {
    console.log("Loading profiles...");
    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();
    if (userError || !user) {
        alert("Please log in to browse profiles.");
        window.location.href = "login.html";
        return;
    }
    const { data: myProfile, error: myProfileError } =
    await supabaseClient
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

if (myProfileError) {
    console.error("My profile check error:", myProfileError);
    return;
}

if (!myProfile) {

    const createProfile = confirm(
        "Your profile is not set up yet.\n\nCreate your profile now so other people can see you on Vibe?"
    );

    if (createProfile) {
        window.location.href = "profile.html";
        return;
    }
}
    const { data: profiles, error } = await supabaseClient
        .from("profiles")
        .select("*")
        .neq("id", user.id);
    if (error) {
        console.error("Error loading profiles:", error);
        profilesContainer.innerHTML = "<p>Could not load profiles.</p>";
        return;
    }
    console.log("PROFILES LOADED ONCE:", profiles);
    if (profiles.length === 0) {
        profilesContainer.innerHTML =
            "<p>No other profiles available yet.</p>";
        return;
    }
    profilesContainer.innerHTML = "";
    function displayProfiles(profileList) {

    profilesContainer.innerHTML = "";

    if (profileList.length === 0) {
        profilesContainer.innerHTML =
            "<p>No profiles found.</p>";
        return;
    }

    profileList.forEach(function (profile) {

        const card = document.createElement("div");
        card.className = "profile-card";

       card.innerHTML = `
    <a href="view-profile.html?user=${profile.id}" class="profile-link">

        ${
            profile.profile_picture
                ? `<img src="${profile.profile_picture}" alt="${profile.name}" class="profile-picture">`
                : `<div class="no-profile-picture">👤</div>`
        }

        <h3>${profile.name}</h3>

        <p><strong>Age:</strong> ${profile.age}</p>

        <p><strong>Gender:</strong> ${profile.gender}</p>

        <p><strong>Location:</strong> ${profile.location}</p>

        <p>${profile.bio}</p>

    </a>

    <a href="view-profile.html?user=${profile.id}" class="text-button">
        👤 View Profile
    </a>

    <a href="chat.html?user=${profile.id}" class="text-button">
        💬 Message
    </a>

        <p><strong>Age:</strong> ${profile.age}</p>

        <p><strong>Gender:</strong> ${profile.gender}</p>

        <p><strong>Location:</strong> ${profile.location}</p>

        <p>${profile.bio}</p>
    </a>

    <a href="view-profile.html?user=${profile.id}" class="text-button">
    👤 View Profile
</a>

<a href="chat.html?user=${profile.id}" class="text-button">
    💬 Message
</a>
`;

        profilesContainer.appendChild(card);
    });
}

displayProfiles(profiles);


// ================================
// SEARCH PROFILES
// ================================

const searchInput = document.getElementById("search-input");
const clearSearch = document.getElementById("clear-search");
const minAgeInput = document.getElementById("min-age");
const maxAgeInput = document.getElementById("max-age");
const genderFilter = document.getElementById("gender-filter");
if (searchInput) {

    searchInput.addEventListener("input", function () {

        const searchText =
    searchInput.value.toLowerCase().trim();

const minAge =
    parseInt(minAgeInput.value) || 18;

const maxAge =
    parseInt(maxAgeInput.value) || 999;

const filteredProfiles = profiles.filter(function (profile) {

    const matchesSearch =
        profile.name.toLowerCase().includes(searchText) ||
        profile.location.toLowerCase().includes(searchText);

    const matchesAge =
        profile.age >= minAge &&
        profile.age <= maxAge;

    return matchesSearch && matchesAge;
});

displayProfiles(filteredProfiles);
    });
}
minAgeInput.addEventListener("input", filterProfiles);
maxAgeInput.addEventListener("input", filterProfiles);
genderFilter.addEventListener("change", filterProfiles);

function filterProfiles() {

    const searchText =
        searchInput.value.toLowerCase().trim();

    const minAge =
        parseInt(minAgeInput.value) || 18;

    const maxAge =
        parseInt(maxAgeInput.value) || 999;

    const filteredProfiles = profiles.filter(function (profile) {

        const matchesSearch =
            profile.name.toLowerCase().includes(searchText) ||
            profile.location.toLowerCase().includes(searchText);

        const matchesAge =
            profile.age >= minAge &&
            profile.age <= maxAge;
            
        const matchesGender =
    !genderFilter.value ||
    profile.gender === genderFilter.value;

        return matchesSearch && matchesAge && matchesGender;
    });

    displayProfiles(filteredProfiles);
}
if (clearSearch) {

    clearSearch.addEventListener("click", function () {

        searchInput.value = "";
        minAgeInput.value = "";
        maxAgeInput.value = "";
        genderFilter.value = "";

        displayProfiles(profiles);

        searchInput.focus();
    });
}
}
// ================================
// LOGOUT
// ================================

const logoutButton = document.getElementById("logout-button");

if (logoutButton) {
    logoutButton.addEventListener("click", async function () {
        const confirmLogout = confirm(
    "Are you sure you want to log out?"
);

if (!confirmLogout) {
    return;
}
        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            console.error("Logout error:", error);
            alert("Could not log out.");
            return;
        }

        alert("You have been logged out.");

        window.location.href = "index.html";
    });
}
// ================================
// CHAT
// ================================

const messageForm = document.getElementById("message-form");

if (messageForm) {

    const urlParams = new URLSearchParams(window.location.search);
    const receiverId = urlParams.get("user");

    console.log("Chat receiver:", receiverId);

    if (!receiverId) {
        alert("No user selected.");
        window.location.href = "browse.html";
    } else {
        loadChatUser(receiverId);
        loadMessages(receiverId);
    }


    // ================================
    // SEND MESSAGE
    // ================================

    messageForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const messageInput =
            document.getElementById("message-input");

        const messageText =
            messageInput.value.trim();

        if (!messageText) {
            return;
        }

        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();

        if (userError || !user) {
            alert("Please log in first.");
            return;
        }

        const { error } = await supabaseClient
            .from("messages")
            .insert({
                sender_id: user.id,
                receiver_id: receiverId,
                message: messageText
            });

        if (error) {
            console.error("Message error:", error);
            alert("Could not send message: " + error.message);
            return;
        }

        messageInput.value = "";

        loadMessages(receiverId);
    });


    // ================================
    // REALTIME CHAT
    // ================================

    supabaseClient
        .channel("chat-messages")
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "messages"
            },
            function (payload) {

                if (
                    payload.new.sender_id === receiverId ||
                    payload.new.receiver_id === receiverId
                ) {
                    loadMessages(receiverId);
                }
            }
        )
        .subscribe();
}


// ================================
// LOAD CHAT USER
// ================================

async function loadChatUser(receiverId) {

    const { data: profile, error } =
        await supabaseClient
            .from("profiles")
            .select("name")
            .eq("id", receiverId)
            .maybeSingle();

    if (error) {
        console.error("Error loading chat user:", error);
        return;
    }

    if (!profile) {
        alert("User not found.");
        window.location.href = "browse.html";
        return;
    }

    document.getElementById("chat-name").textContent =
        "Chat with " + profile.name;
}


// ================================
// LOAD MESSAGES
// ================================

async function loadMessages(receiverId) {

    const messagesContainer =
        document.getElementById("messages-container");

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        return;
    }
    // Mark messages from this user as read
const { error: readError } = await supabaseClient
    .from("messages")
    .update({ is_read: true })
    .eq("sender_id", receiverId)
    .eq("receiver_id", user.id)
    .eq("is_read", false);

if (readError) {
    console.error("Could not mark messages as read:", readError);
}

    const { data: messages, error } =
        await supabaseClient
            .from("messages")
            .select("*")
            .or(
                `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`
            )
            .order("created_at", {
                ascending: true
            });

    if (error) {
        console.error("Error loading messages:", error);
        return;
    }

    messagesContainer.innerHTML = "";

    if (messages.length === 0) {
        messagesContainer.innerHTML =
            "<p>No messages yet. Start the conversation!</p>";
        return;
    }

    messages.forEach(function (message) {

    const messageElement =
        document.createElement("div");

    messageElement.className = "chat-message";

    const time = new Date(message.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    const messageText =
        document.createElement("div");

    messageText.textContent = message.message;

    const messageTime =
        document.createElement("small");

    messageTime.textContent = time;

    messageTime.className = "message-time";

    messageElement.appendChild(messageText);
    messageElement.appendChild(messageTime);

    if (message.sender_id === user.id) {
        messageElement.classList.add("my-message");
    } else {
        messageElement.classList.add("their-message");
    }

    messagesContainer.appendChild(messageElement);
});

    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;
}
// ================================
// LOAD CONVERSATIONS
// ================================

const conversationsContainer =
    document.getElementById("conversations-container");

if (conversationsContainer) {
    loadConversations();
}

async function loadConversations() {

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        alert("Please log in first.");
        window.location.href = "login.html";
        return;
    }

    const { data: messages, error } =
        await supabaseClient
            .from("messages")
            .select("*")
            .or(
                `sender_id.eq.${user.id},receiver_id.eq.${user.id}`
            )
            .order("created_at", {
                ascending: false
            });

    if (error) {
        console.error("Conversation error:", error);
        conversationsContainer.innerHTML =
            "<p>Could not load messages.</p>";
        return;
    }

    if (messages.length === 0) {
        conversationsContainer.innerHTML =
            "<p>You have no conversations yet.</p>";
        return;
    }

    conversationsContainer.innerHTML = "";

    const userIds = [];

    messages.forEach(function (message) {

        const otherUser =
            message.sender_id === user.id
                ? message.receiver_id
                : message.sender_id;

        if (!userIds.includes(otherUser)) {
            userIds.push(otherUser);
        }
    });

    for (const userId of userIds) {

        const { data: profile, error: profileError } =
            await supabaseClient
                .from("profiles")
                .select("name")
                .eq("id", userId)
                .maybeSingle();

        if (profileError || !profile) {
            continue;
        }

        const latestMessage = messages.find(function (message) {

    return (
        message.sender_id === userId ||
        message.receiver_id === userId
    );

});
const unreadCount = messages.filter(function (message) {

    return (
        message.sender_id === userId &&
        message.receiver_id === user.id &&
        message.is_read === false
    );

}).length;

const conversation =
    document.createElement("a");

conversation.href =
    "chat.html?user=" + userId;

conversation.className =
    "conversation-card";

const latestTime = latestMessage
    ? new Date(latestMessage.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    })
    : "";

conversation.innerHTML = `
    <strong>${profile.name}</strong>

    <span>
        ${latestMessage ? latestMessage.message : ""}
    </span>

    <small>
        ${latestTime}
    </small>

    ${
        unreadCount > 0
            ? `<b class="unread-badge">${unreadCount} unread</b>`
            : ""
    }
`;
conversationsContainer.appendChild(conversation);
    }
}
// ================================
// REALTIME CONVERSATION UPDATES
// ================================

if (conversationsContainer) {

    supabaseClient
        .channel("messages-inbox")
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "messages"
            },
            function () {
                loadConversations();
            }
        )
        .subscribe();
}
// ================================
// VIEW PROFILE
// ================================

const viewProfileDetails =
    document.getElementById("view-profile-details");

if (viewProfileDetails) {

    const urlParams =
        new URLSearchParams(window.location.search);

    const profileId =
        urlParams.get("user");

    if (!profileId) {

        alert("No profile selected.");

        window.location.href = "browse.html";

    } else {

        loadViewedProfile(profileId);
    }
}


async function loadViewedProfile(profileId) {

    const { data: profile, error } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", profileId)
            .maybeSingle();

    if (error) {

        console.error("Profile loading error:", error);

        alert("Could not load profile.");

        return;
    }

    if (!profile) {

        alert("Profile not found.");

        window.location.href = "browse.html";

        return;
    }

    document.getElementById("view-profile-name").textContent =
        profile.name;

    viewProfileDetails.innerHTML = `
    ${
        profile.profile_picture
            ? `<img src="${profile.profile_picture}" alt="${profile.name}" class="view-profile-picture">`
            : `<div class="no-profile-picture">👤</div>`
    }

    <p><strong>Age:</strong> ${profile.age}</p>

    <p><strong>Gender:</strong> ${profile.gender}</p>

    <p><strong>Location:</strong> ${profile.location}</p>

    <p><strong>About:</strong></p>

    <p>${profile.bio}</p>
`;
// ================================
// PROFILE IMAGE MODAL
// ================================

const profileImage =
    viewProfileDetails.querySelector(".view-profile-picture");

const imageModal =
    document.getElementById("image-modal");

const modalProfileImage =
    document.getElementById("modal-profile-image");

const closeImageModal =
    document.getElementById("close-image-modal");

if (profileImage && imageModal && modalProfileImage) {

    profileImage.addEventListener("click", function () {

        modalProfileImage.src = profileImage.src;

        imageModal.style.display = "flex";
    });
}

if (closeImageModal && imageModal) {

    closeImageModal.addEventListener("click", function () {

        imageModal.style.display = "none";
    });

    imageModal.addEventListener("click", function (event) {

        if (event.target === imageModal) {

            imageModal.style.display = "none";
        }
    });
}

    document.getElementById("message-profile-button").href =
        "chat.html?user=" + profile.id;
}
// ================================
// BIO CHARACTER COUNTER
// ================================

const bioInput = document.getElementById("profile-bio");
const bioCounter = document.getElementById("bio-counter");

if (bioInput && bioCounter) {

    function updateBioCounter() {

        const length = bioInput.value.length;

        bioCounter.textContent =
            length + " / 300";
    }

    bioInput.addEventListener("input", updateBioCounter);

    updateBioCounter();
}
// ================================
// WELCOME USER
// ================================

const welcomeName = document.getElementById("welcome-name");

if (welcomeName) {
    async function loadWelcomeName() {

        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();

        if (userError || !user) {
            return;
        }

        const { data: profile, error } =
            await supabaseClient
                .from("profiles")
                .select("name")
                .eq("id", user.id)
                .maybeSingle();

        if (error) {
            console.error("Could not load welcome name:", error);
            return;
        }

        if (profile && profile.name) {
            welcomeName.textContent = profile.name;
        }
    }

    loadWelcomeName();
}
// ================================
// PROFILE COMPLETION STATUS
// ================================

const profileStatus = document.getElementById("profile-status");

if (profileStatus) {

    async function loadProfileStatus() {

        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();

        if (userError || !user) {
            return;
        }

        const { data: profile, error } =
            await supabaseClient
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .maybeSingle();

        if (error) {
            console.error("Could not check profile:", error);
            return;
        }

        if (!profile) {
            profileStatus.textContent =
                "⚠️ Your profile is not complete yet.";
            return;
        }

        const requiredFields = [
            profile.name,
            profile.age,
            profile.gender,
            profile.location,
            profile.bio,
            profile.profile_picture
        ];

        const completedFields =
            requiredFields.filter(Boolean).length;

        const totalFields = requiredFields.length;

        if (completedFields === totalFields) {

            profileStatus.textContent =
                "✅ Your profile is complete!";

        } else {

            profileStatus.textContent =
                `⚠️ Your profile is ${completedFields}/${totalFields} complete.`;

        }
    }

    loadProfileStatus();
}