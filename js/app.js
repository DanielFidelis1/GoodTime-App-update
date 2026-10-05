// ============================================================
// GOODTIME - SUPABASE CONNECTION
// ============================================================

const SUPABASE_URL = "https://kvqtmvsuhsuynhjnbjkj.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_mIk9De4GPclRl46AhBl00Q_MDKUnMpi";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("GoodTime Supabase connected successfully!");


// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getCurrentPage() {
    return window.location.pathname.split("/").pop().toLowerCase();
}


async function getLoggedInUser() {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

    if (error || !user) {
        return null;
    }

    return user;
}


function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// SHOW CURRENT LOGGED-IN USER
// ============================================================

supabaseClient.auth.getUser().then(function (result) {

    if (result.error) {
        console.error(
            "Could not get logged-in user:",
            result.error
        );
        return;
    }

    console.log(
        "GoodTime logged-in user:",
        result.data.user
    );
});


// ============================================================
// SIGN UP
// ============================================================

const signupForm = document.getElementById("signup-form");

if (signupForm) {

    signupForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const emailInput =
            document.getElementById("signup-email");

        const passwordInput =
            document.getElementById("signup-password");

        if (!emailInput || !passwordInput) {
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            alert("Please enter your email and password.");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }

        const { data, error } =
            await supabaseClient.auth.signUp({
                email: email,
                password: password
            });

        if (error) {

            console.error("Sign up error:", error);

            alert(error.message);

            return;
        }

        console.log("Account created:", data);

        if (data.session) {

            alert("Account created successfully!");

        } else {

            alert(
                "Account created successfully!\n\n" +
                "Please check your email to confirm your account before logging in."
            );
        }

        window.location.href = "login.html";
    });
}


// ============================================================
// PROTECTED PAGES
// ============================================================

async function checkUser() {

    const protectedPages = [
    "browse.html",
    "profile.html",
    "chat.html",
    "message.html",
    "messages.html",
    "view-profile.html",
    "view-my-profile.html",
    "settings.html"
];
    const currentPage = getCurrentPage();

    if (!protectedPages.includes(currentPage)) {
        return;
    }

    const user = await getLoggedInUser();

    if (!user) {

        console.log("No logged-in user.");

        window.location.href = "login.html";

        return;
    }

    console.log("User is logged in:", user.id);
}

checkUser();


// ============================================================
// LOGIN
// ============================================================

const loginForm = document.getElementById("login-form");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const emailInput =
            document.getElementById("login-email");

        const passwordInput =
            document.getElementById("login-password");

        if (!emailInput || !passwordInput) {
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            alert("Please enter your email and password.");
            return;
        }

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
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
// ============================================================
// FORGOT PASSWORD
// ============================================================

const forgotPassword =
    document.getElementById("forgot-password");

if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            const emailInput =
                document.getElementById("login-email");

            if (!emailInput) {
                return;
            }

            const email =
                emailInput.value.trim();

            if (!email) {

                alert(
                    "Please enter your email address first."
                );

                emailInput.focus();

                return;
            }

            const {
                error
            } = await supabaseClient.auth.resetPasswordForEmail(
                email,
                {
                    redirectTo:
                        window.location.origin +
                        "/reset-password.html"
                }
            );

            if (error) {

                console.error(
                    "Password reset error:",
                    error
                );

                alert(
                    "Could not send password reset email: " +
                    error.message
                );

                return;
            }

            alert(
                "Password reset instructions have been sent to your email."
            );

        }
    );
}

// ============================================================
// CREATE / EDIT PROFILE
// ============================================================

const profileForm =
    document.getElementById("profile-form");

if (profileForm) {

    loadMyProfile();

    profileForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            console.log("PROFILE FORM SUBMITTED");

            const user = await getLoggedInUser();

            if (!user) {

                alert("You must be logged in.");

                window.location.href = "login.html";

                return;
            }

            const nameInput =
                document.getElementById("profile-name");

            const ageInput =
                document.getElementById("profile-age");

            const genderInput =
                document.getElementById("profile-gender");

            const locationInput =
                document.getElementById("profile-location");

            const bioInput =
                document.getElementById("profile-bio");

            const selectedAvatarInput =
                document.getElementById("selected-avatar");


            if (
                !nameInput ||
                !ageInput ||
                !genderInput ||
                !locationInput ||
                !bioInput
            ) {

                alert(
                    "Some profile fields are missing from the page."
                );

                return;
            }


            const name =
                nameInput.value.trim();

            const age =
                Number(ageInput.value);

            const gender =
                genderInput.value;

            const location =
                locationInput.value.trim();

            const bio =
                bioInput.value.trim();


            // ------------------------------------------------
            // VALIDATION
            // ------------------------------------------------

            if (!name) {
                alert("Please enter your name.");
                return;
            }

            if (!age || age < 18) {
                alert("You must be at least 18 years old.");
                return;
            }

            if (!gender) {
                alert("Please select your gender.");
                return;
            }

            if (!location) {
                alert("Please enter your location.");
                return;
            }

            if (!bio) {
                alert("Please tell people something about yourself.");
                return;
            }

            if (bio.length > 300) {
                alert("Your bio cannot be more than 300 characters.");
                return;
            }


            // ------------------------------------------------
            // GET EXISTING PROFILE
            // ------------------------------------------------

            const {
                data: existingProfile,
                error: checkError
            } = await supabaseClient
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .maybeSingle();


            if (checkError) {

                console.error(
                    "Profile check error:",
                    checkError
                );

                alert(
                    "Could not check your existing profile."
                );

                return;
            }


            // ------------------------------------------------
            // PROFILE PICTURE / AVATAR
            // ------------------------------------------------

            let profilePicture =
                existingProfile
                    ? existingProfile["profile-pictures"]
                    : null;


            if (
                selectedAvatarInput &&
                selectedAvatarInput.value
            ) {

                profilePicture =
                    "images/avatars/" +
                    selectedAvatarInput.value +
                    ".png";
            }


            // ------------------------------------------------
            // REQUIRE AVATAR
            // ------------------------------------------------

            if (!profilePicture) {

                alert(
                    "Please choose a profile picture."
                );

                return;
            }


            // ------------------------------------------------
            // PROFILE DATA
            // ------------------------------------------------

            const profileData = {

                name: name,

                age: age,

                gender: gender,

                location: location,

                bio: bio,

                "profile-pictures": profilePicture
            };


            // ------------------------------------------------
            // UPDATE EXISTING PROFILE
            // ------------------------------------------------

            if (existingProfile) {

                const {
                    data,
                    error
                } = await supabaseClient
                    .from("profiles")
                    .update(profileData)
                    .eq("id", user.id)
                    .select();


                if (error) {

                    console.error(
                        "Profile update error:",
                        error
                    );

                    alert(
                        "Could not update profile: " +
                        error.message
                    );

                    return;
                }


                console.log(
                    "Profile updated:",
                    data
                );

                alert(
                    "Profile updated successfully!"
                );

            }


            // ------------------------------------------------
            // CREATE NEW PROFILE
            // ------------------------------------------------

            else {

                const {
                    data,
                    error
                } = await supabaseClient
                    .from("profiles")
                    .insert({

                        id: user.id,

                        ...profileData

                    })
                    .select();


                if (error) {

                    console.error(
                        "Profile creation error:",
                        error
                    );

                    alert(
                        "Could not create profile: " +
                        error.message
                    );

                    return;
                }


                console.log(
                    "Profile created:",
                    data
                );

                alert(
                    "Profile created successfully!"
                );
            }


            window.location.href =
                "browse.html";
        }
    );
}


// ============================================================
// LOAD MY PROFILE
// ============================================================

async function loadMyProfile() {

    console.log("Loading my profile...");

    const user =
        await getLoggedInUser();

    if (!user) {

        alert("Please log in first.");

        window.location.href =
            "login.html";

        return;
    }


    const {
        data: profile,
        error
    } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();


    if (error) {

        console.error(
            "Profile loading error:",
            error
        );

        return;
    }


    if (!profile) {

        console.log(
            "No profile found. Create a new one."
        );

        return;
    }


    const profileTitle =
        document.querySelector(
            ".profile-container h1"
        );

    if (profileTitle) {

        profileTitle.textContent =
            "Edit Your Profile";
    }


    const profileButton =
        document.querySelector(
            "#profile-form .btn"
        );

    if (profileButton) {

        profileButton.textContent =
            "Update Profile";
    }


    const nameInput =
        document.getElementById("profile-name");

    const ageInput =
        document.getElementById("profile-age");

    const genderInput =
        document.getElementById("profile-gender");

    const locationInput =
        document.getElementById("profile-location");

    const bioInput =
        document.getElementById("profile-bio");


    if (nameInput) {
        nameInput.value =
            profile.name || "";
    }

    if (ageInput) {
        ageInput.value =
            profile.age || "";
    }

    if (genderInput) {
        genderInput.value =
            profile.gender || "";
    }

    if (locationInput) {
        locationInput.value =
            profile.location || "";
    }

    if (bioInput) {
        bioInput.value =
            profile.bio || "";
    }


    // ------------------------------------------------
    // LOAD EXISTING AVATAR
    // ------------------------------------------------

    const selectedAvatar =
        document.getElementById("selected-avatar");

    const avatarOptions =
        document.querySelectorAll(
            ".avatar-option"
        );

    const savedPicture =
        profile["profile-pictures"];


    if (
        selectedAvatar &&
        savedPicture
    ) {

        const avatarMatch =
            savedPicture.match(
                /avatar(\d+)\.png/
            );


        if (avatarMatch) {

            const avatarName =
                "avatar" +
                avatarMatch[1];


            selectedAvatar.value =
                avatarName;


            avatarOptions.forEach(
                function (avatar) {

                    avatar.classList.remove(
                        "selected"
                    );


                    if (
                        avatar.dataset.avatar ===
                        avatarName
                    ) {

                        avatar.classList.add(
                            "selected"
                        );
                    }
                }
            );
        }
    }


    console.log(
        "Profile loaded:",
        profile
    );
}


// ============================================================
// BROWSE PROFILES
// ============================================================

const profilesContainer =
    document.getElementById(
        "profiles-container"
    );


let allProfiles = [];


if (profilesContainer) {

    loadProfiles();
}


async function loadProfiles() {

    console.log("Loading profiles...");

    const user =
        await getLoggedInUser();


    if (!user) {

        alert(
            "Please log in to browse profiles."
        );

        window.location.href =
            "login.html";

        return;
    }
// ============================================================
// AUTO-HIDE WELCOME MESSAGE
// ============================================================

const welcomeMessage =
    document.getElementById("welcome-message");

if (welcomeMessage) {

    setTimeout(function () {

        welcomeMessage.classList.add("hide");

    }, 5000);

}

    // ------------------------------------------------
    // CHECK MY PROFILE
    // ------------------------------------------------

    const {
        data: myProfile,
        error: myProfileError
    } = await supabaseClient
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();


    if (myProfileError) {

        console.error(
            "My profile check error:",
            myProfileError
        );

        return;
    }


    if (!myProfile) {

        const createProfile =
            confirm(
                "Your profile is not set up yet.\n\n" +
                "Create your profile now so other people can see you on GoodTime?"
            );


        if (createProfile) {

            window.location.href =
                "profile.html";

            return;
        }
    }


    // ------------------------------------------------
    // LOAD OTHER PROFILES
    // ------------------------------------------------

    const {
        data: profiles,
        error
    } = await supabaseClient
        .from("profiles")
        .select("*")
        .neq("id", user.id);


    if (error) {

        console.error(
            "Error loading profiles:",
            error
        );

        profilesContainer.innerHTML =
            "<p>Could not load profiles.</p>";

        return;
    }


    allProfiles =
        profiles || [];


    console.log(
        "PROFILES LOADED:",
        allProfiles
    );


    displayProfiles(
        allProfiles
    );
}


// ============================================================
// DISPLAY PROFILES
// ============================================================

function displayProfiles(
    profileList
) {

    if (!profilesContainer) {
        return;
    }


    profilesContainer.innerHTML = "";


    if (!profileList || profileList.length === 0) {

        profilesContainer.innerHTML =
            "<p>No profiles found.</p>";

        return;
    }


    profileList.forEach(
        function (profile) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "profile-card";


            const profileId =
                encodeURIComponent(
                    profile.id
                );


            const name =
                escapeHTML(
                    profile.name
                );


            const age =
                escapeHTML(
                    profile.age
                );


            const gender =
                escapeHTML(
                    profile.gender
                );


            const location =
                escapeHTML(
                    profile.location
                );


            const bio =
                escapeHTML(
                    profile.bio
                );


            const picture =
                profile["profile-pictures"]
                    ? `
                        <img
                            src="${escapeHTML(profile["profile-pictures"])}"
                            alt="${name}"
                            class="profile-picture"
                        >
                    `
                    : `
                        <div class="no-profile-picture">
                            👤
                        </div>
                    `;


            card.innerHTML = `

                <a
                    href="view-profile.html?user=${profileId}"
                    class="profile-link"
                >

                    ${picture}

                    <h3>${name}</h3>

                    <p>
                        <strong>Age:</strong>
                        ${age}
                    </p>

                    <p>
                        <strong>Gender:</strong>
                        ${gender}
                    </p>

                    <p>
                        <strong>Location:</strong>
                        ${location}
                    </p>

                    <p>
                        ${bio}
                    </p>

                </a>


                <a
                    href="view-profile.html?user=${profileId}"
                    class="text-button"
                >
                    👤 View Profile
                </a>


                <a
                    href="chat.html?user=${profileId}"
                    class="text-button"
                >
                    💬 Message
                </a>
            `;


            profilesContainer.appendChild(
                card
            );
        }
    );
}


// ============================================================
// SEARCH + FILTER PROFILES
// ============================================================

const searchInput =
    document.getElementById(
        "search-input"
    );

const clearSearch =
    document.getElementById(
        "clear-search"
    );

const minAgeInput =
    document.getElementById(
        "min-age"
    );

const maxAgeInput =
    document.getElementById(
        "max-age"
    );

const genderFilter =
    document.getElementById(
        "gender-filter"
    );


function filterProfiles() {

    if (!profilesContainer) {
        return;
    }


    const searchText =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const minAge =
        minAgeInput &&
        minAgeInput.value
            ? parseInt(
                minAgeInput.value
            )
            : 18;


    const maxAge =
        maxAgeInput &&
        maxAgeInput.value
            ? parseInt(
                maxAgeInput.value
            )
            : 999;


    const selectedGender =
        genderFilter
            ? genderFilter.value
            : "";


    const filteredProfiles =
        allProfiles.filter(
            function (profile) {

                const profileName =
                    String(
                        profile.name || ""
                    ).toLowerCase();


                const profileLocation =
                    String(
                        profile.location || ""
                    ).toLowerCase();


                const profileAge =
                    Number(
                        profile.age
                    );


                const matchesSearch =
                    !searchText ||
                    profileName.includes(
                        searchText
                    ) ||
                    profileLocation.includes(
                        searchText
                    );


                const matchesAge =
                    profileAge >= minAge &&
                    profileAge <= maxAge;


                const matchesGender =
                    !selectedGender ||
                    profile.gender ===
                        selectedGender;


                return (
                    matchesSearch &&
                    matchesAge &&
                    matchesGender
                );
            }
        );


    displayProfiles(
        filteredProfiles
    );
}


if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterProfiles
    );
}


if (minAgeInput) {

    minAgeInput.addEventListener(
        "input",
        filterProfiles
    );
}


if (maxAgeInput) {

    maxAgeInput.addEventListener(
        "input",
        filterProfiles
    );
}


if (genderFilter) {

    genderFilter.addEventListener(
        "change",
        filterProfiles
    );
}


if (clearSearch) {

    clearSearch.addEventListener(
        "click",
        function () {

            if (searchInput) {
                searchInput.value = "";
            }

            if (minAgeInput) {
                minAgeInput.value = "";
            }

            if (maxAgeInput) {
                maxAgeInput.value = "";
            }

            if (genderFilter) {
                genderFilter.value = "";
            }

            displayProfiles(
                allProfiles
            );


            if (searchInput) {
                searchInput.focus();
            }
        }
    );
}


// ============================================================
// LOGOUT
// ============================================================

const logoutButton =
    document.getElementById(
        "logout-button"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            const confirmLogout =
                confirm(
                    "Are you sure you want to log out?"
                );


            if (!confirmLogout) {
                return;
            }


            const {
                error
            } = await supabaseClient.auth.signOut();


            if (error) {

                console.error(
                    "Logout error:",
                    error
                );

                alert(
                    "Could not log out."
                );

                return;
            }


            alert(
                "You have been logged out."
            );


            window.location.href =
                "index.html";
        }
    );
}


// ============================================================
// CHAT
// ============================================================

const messageForm =
    document.getElementById(
        "message-form"
    );


if (messageForm) {

    const urlParams =
        new URLSearchParams(
            window.location.search
        );


    const receiverId =
        urlParams.get("user");


    console.log(
        "Chat receiver:",
        receiverId
    );


    if (!receiverId) {

        alert(
            "No user selected."
        );

        window.location.href =
            "browse.html";

    } else {

        loadChatUser(
            receiverId
        );

        loadMessages(
            receiverId
        );
    }

// ------------------------------------------------
// SEND MESSAGE
// ------------------------------------------------

messageForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const messageInput =
            document.getElementById("message-input");

        const sendButton =
            messageForm.querySelector(".btn");

        if (!messageInput) {
            return;
        }

        const messageText =
            messageInput.value.trim();

        if (!messageText) {
            return;
        }

        const user =
            await getLoggedInUser();

        if (!user) {
            alert("Please log in first.");
            return;
        }

        if (user.id === receiverId) {
            alert("You cannot message yourself.");
            return;
        }

        // Prevent multiple clicks while sending
        if (sendButton) {
            sendButton.disabled = true;
            sendButton.textContent = "Sending...";
        }

        const {
            data,
            error
        } = await supabaseClient
            .from("messages")
            .insert({
                sender_id: user.id,
                receiver_id: receiverId,
                message: messageText,
                is_read: false
            })
            .select()
            .single();

        if (error) {

            console.error(
                "Message error:",
                error
            );

            alert(
                "Could not send message: " +
                error.message
            );

            if (sendButton) {
                sendButton.disabled = false;
                sendButton.textContent = "Send";
            }

            return;
        }

        // Clear input immediately
        messageInput.value = "";

        // Immediately reload the conversation
        await loadMessages(receiverId);

        // Put cursor back in the message box
        messageInput.focus();

        // Enable Send button again
        if (sendButton) {
            sendButton.disabled = false;
            sendButton.textContent = "Send";
        }
    }
);



// ------------------------------------------------
// REALTIME CHAT UPDATES
// ------------------------------------------------

getLoggedInUser().then(function (user) {

    if (!user) {
        return;
    }

    supabaseClient
        .channel(
            "chat-" + receiverId + "-" + user.id
        )
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "messages"
            },
            function (payload) {

                const newMessage =
                    payload.new;

                // Check if this message belongs
                // to the current conversation
                const isThisConversation =
                    (
                        newMessage.sender_id === receiverId &&
                        newMessage.receiver_id === user.id
                    ) ||
                    (
                        newMessage.sender_id === user.id &&
                        newMessage.receiver_id === receiverId
                    );

                if (isThisConversation) {

                    loadMessages(
                        receiverId
                    );
                }
            }
        )
        .subscribe(function (status) {

            console.log(
                "Chat realtime status:",
                status
            );

        });

});

    // ------------------------------------------------
    // REALTIME CHAT
    // ------------------------------------------------

    supabaseClient
        .channel(
            "chat-messages-" +
            receiverId
        )
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "messages"
            },
            async function (payload) {

                if (
                    payload.new.sender_id ===
                        receiverId ||

                    payload.new.receiver_id ===
                        receiverId
                ) {

                    await loadMessages(
                        receiverId
                    );
                }
            }
        )
        .subscribe();
}


// ============================================================
// LOAD CHAT USER
// ============================================================

async function loadChatUser(
    receiverId
) {

    const chatName =
        document.getElementById(
            "chat-name"
        );

    const chatAvatar =
        document.getElementById(
            "chat-user-avatar"
        );


    if (!chatName) {
        return;
    }


    const {
        data: profile,
        error
    } = await supabaseClient
        .from("profiles")
        .select(
            "name, profile-pictures, last_seen"
        )
        .eq(
            "id",
            receiverId
        )
        .maybeSingle();

    const activityStatus =
    getActivityStatus(
        profile.last_seen
    );

const chatUserStatus =
    document.getElementById(
        "chat-user-status"
    );

const chatUserStatusText =
    document.getElementById(
        "chat-user-status-text"
    );

if (
    chatUserStatus &&
    chatUserStatusText
) {

    chatUserStatusText.textContent =
        activityStatus.text;

    chatUserStatus.classList.toggle(
        "active",
        activityStatus.active
    );
}


    if (error) {

        console.error(
            "Error loading chat user:",
            error
        );

        return;
    }


    if (!profile) {

        alert(
            "User not found."
        );

        window.location.href =
            "browse.html";

        return;
    }


    // Set the person's name

    chatName.textContent =
        "Chat with " +
        profile.name;


    // Set the person's avatar

    if (
        chatAvatar &&
        profile["profile-pictures"]
    ) {

        chatAvatar.innerHTML = `
            <img
                src="${escapeHTML(
                    profile["profile-pictures"]
                )}"
                alt="${escapeHTML(
                    profile.name
                )}"
            >
        `;

    } else if (chatAvatar) {

        chatAvatar.textContent =
            "👤";
    }
}

// ============================================================
// LOAD MESSAGES
// ============================================================

async function loadMessages(
    receiverId
) {

    const messagesContainer =
        document.getElementById(
            "messages-container"
        );

    if (!messagesContainer) {
        return;
    }

    const user =
        await getLoggedInUser();

    if (!user) {
        return;
    }

    const {
        data: messages,
        error
    } = await supabaseClient
        .from("messages")
        .select("*")
        .or(
            `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`
        )
        .order(
            "created_at",
            {
                ascending: true
            }
        );

    if (error) {

        console.error(
            "Error loading messages:",
            error
        );

        messagesContainer.innerHTML =
            "<p>Could not load messages.</p>";

        return;
    }


    // ========================================================
    // MARK RECEIVED MESSAGES AS READ
    // ========================================================

    const {
        error: readError
    } = await supabaseClient
        .from("messages")
        .update({
            is_read: true
        })
        .eq("receiver_id", user.id)
        .eq("sender_id", receiverId)
        .eq("is_read", false);


    if (readError) {

        console.error(
            "Could not mark messages as read:",
            readError
        );

    }


    // ========================================================
    // DISPLAY MESSAGES
    // ========================================================

    messagesContainer.innerHTML = "";


    if (!messages || messages.length === 0) {

        messagesContainer.innerHTML =
            "<p>No messages yet. Start the conversation!</p>";

        updateUnreadBadge();

        return;
    }


    messages.forEach(
        function (message) {

            const messageElement =
                document.createElement(
                    "div"
                );

            messageElement.className =
                "chat-message";


            const time =
                new Date(
                    message.created_at
                ).toLocaleTimeString(
                    [],
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );


            const messageText =
                document.createElement(
                    "div"
                );

            messageText.textContent =
                message.message;


            const messageTime =
                document.createElement(
                    "small"
                );

            messageTime.textContent =
                time;

            messageTime.className =
                "message-time";


            messageElement.appendChild(
                messageText
            );

            messageElement.appendChild(
                messageTime
            );


            if (
                message.sender_id ===
                user.id
            ) {

                messageElement.classList.add(
                    "my-message"
                );

            } else {

                messageElement.classList.add(
                    "their-message"
                );
            }


            messagesContainer.appendChild(
                messageElement
            );
        }
    );


    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;


    // Update the unread badge
    updateUnreadBadge();
}

// ============================================================
// LOAD CONVERSATIONS
// ============================================================

const conversationsContainer =
    document.getElementById(
        "conversations-container"
    );

if (conversationsContainer) {

    loadConversations();
}


async function loadConversations() {

    const user =
        await getLoggedInUser();


    if (!user) {

        alert(
            "Please log in first."
        );

        window.location.href =
            "login.html";

        return;
    }


    // --------------------------------------------------------
    // GET ALL MESSAGES
    // --------------------------------------------------------

    const {
        data: messages,
        error
    } = await supabaseClient
        .from("messages")
        .select("*")
        .or(
            `sender_id.eq.${user.id},receiver_id.eq.${user.id}`
        )
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Conversation error:",
            error
        );

        conversationsContainer.innerHTML = `
            <div class="messages-empty-state">
                <div class="messages-empty-icon">⚠️</div>
                <h3>Unable to load messages</h3>
                <p>Please refresh the page and try again.</p>
            </div>
        `;

        return;
    }


    // --------------------------------------------------------
    // NO CONVERSATIONS
    // --------------------------------------------------------

    if (!messages || messages.length === 0) {

        conversationsContainer.innerHTML = `
            <div class="messages-empty-state">

                <div class="messages-empty-icon">
                    💬
                </div>

                <h3>No conversations yet</h3>

                <p>
                    Start a conversation with someone
                    from Browse.
                </p>

                <a
                    href="browse.html"
                    class="messages-browse-button"
                >
                    Browse Profiles
                </a>

            </div>
        `;

        return;
    }


    conversationsContainer.innerHTML = "";


    // --------------------------------------------------------
    // GET UNIQUE USERS
    // --------------------------------------------------------

    const userIds = [];


    messages.forEach(
        function (message) {

            const otherUser =
                message.sender_id === user.id
                    ? message.receiver_id
                    : message.sender_id;


            if (
                !userIds.includes(
                    otherUser
                )
            ) {

                userIds.push(
                    otherUser
                );
            }
        }
    );


    // --------------------------------------------------------
    // BUILD CONVERSATIONS
    // --------------------------------------------------------

    for (
        const userId of userIds
    ) {

        const {
            data: profile,
            error: profileError
        } = await supabaseClient
            .from("profiles")
            .select(
                "name, profile-pictures"
            )
            .eq(
                "id",
                userId
            )
            .maybeSingle();


        if (
            profileError ||
            !profile
        ) {

            console.error(
                "Could not load profile:",
                profileError
            );

            continue;
        }


        // ----------------------------------------------------
        // LATEST MESSAGE
        // ----------------------------------------------------

        const latestMessage =
            messages.find(
                function (message) {

                    return (
                        message.sender_id === userId ||
                        message.receiver_id === userId
                    );
                }
            );


        // ----------------------------------------------------
        // UNREAD COUNT
        // ----------------------------------------------------

        const unreadCount =
            messages.filter(
                function (message) {

                    return (

                        message.sender_id === userId &&

                        message.receiver_id === user.id &&

                        message.is_read === false
                    );
                }
            ).length;


        // ----------------------------------------------------
        // CONVERSATION CARD
        // ----------------------------------------------------

        const conversation =
            document.createElement(
                "a"
            );


        conversation.href =
            "chat.html?user=" +
            encodeURIComponent(
                userId
            );


        conversation.className =
            "conversation-card";


        // Add unread class
        if (unreadCount > 0) {

            conversation.classList.add(
                "conversation-unread"
            );
        }


        // ----------------------------------------------------
        // MESSAGE TEXT
        // ----------------------------------------------------

        let latestMessageText =
            latestMessage
                ? escapeHTML(
                    latestMessage.message
                )
                : "No messages yet";


        // Shorten very long messages
        if (
            latestMessageText.length > 55
        ) {

            latestMessageText =
                latestMessageText.substring(
                    0,
                    55
                ) + "...";
        }


        // ----------------------------------------------------
        // TIME
        // ----------------------------------------------------

        let latestTime = "";


        if (
            latestMessage &&
            latestMessage.created_at
        ) {

            const messageDate =
                new Date(
                    latestMessage.created_at
                );


            const today =
                new Date();


            const sameDay =
                messageDate.toDateString() ===
                today.toDateString();


            if (sameDay) {

                latestTime =
                    messageDate.toLocaleTimeString(
                        [],
                        {
                            hour: "2-digit",
                            minute: "2-digit"
                        }
                    );

            } else {

                latestTime =
                    messageDate.toLocaleDateString(
                        [],
                        {
                            day: "numeric",
                            month: "short"
                        }
                    );
            }
        }


        // ----------------------------------------------------
        // AVATAR
        // ----------------------------------------------------

        const avatar =
            profile["profile-pictures"]
                ? `
                    <img
                        src="${escapeHTML(
                            profile["profile-pictures"]
                        )}"
                        alt="${escapeHTML(
                            profile.name
                        )}"
                        class="conversation-avatar"
                    >
                `
                : `
                    <div class="conversation-avatar-placeholder">
                        👤
                    </div>
                `;


        // ----------------------------------------------------
        // UNREAD BADGE
        // ----------------------------------------------------

        const unreadBadge =
            unreadCount > 0
                ? `
                    <span class="conversation-unread-badge">
                        ${unreadCount > 99
                            ? "99+"
                            : unreadCount}
                    </span>
                `
                : "";


        // ----------------------------------------------------
        // CARD HTML
        // ----------------------------------------------------

        conversation.innerHTML = `

            <div class="conversation-avatar-wrapper">

                ${avatar}

                ${
                    unreadCount > 0
                        ? `
                            <span
                                class="conversation-status-dot"
                            ></span>
                        `
                        : ""
                }

            </div>


            <div class="conversation-content">

                <div class="conversation-top-row">

                    <strong>
                        ${escapeHTML(
                            profile.name
                        )}
                    </strong>

                    <small>
                        ${latestTime}
                    </small>

                </div>


                <div class="conversation-bottom-row">

                    <span class="conversation-preview">
                        ${latestMessageText}
                    </span>

                    ${unreadBadge}

                </div>

            </div>

        `;


        conversationsContainer.appendChild(
            conversation
        );
    }
}

// ============================================================
// REALTIME CONVERSATION UPDATES
// ============================================================

if (conversationsContainer) {

    supabaseClient
        .channel(
            "messages-inbox"
        )
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
// ============================================================
// SEARCH CONVERSATIONS
// ============================================================

const conversationSearch =
    document.getElementById(
        "conversation-search"
    );

if (conversationSearch) {

    conversationSearch.addEventListener(
        "input",
        function () {

            const searchTerm =
                conversationSearch.value
                    .trim()
                    .toLowerCase();

            const conversationCards =
                document.querySelectorAll(
                    ".conversation-card"
                );

            let visibleCount = 0;

            conversationCards.forEach(
                function (card) {

                    const name =
                        card
                            .querySelector(
                                ".conversation-top-row strong"
                            )
                            ?.textContent
                            .toLowerCase() || "";

                    if (
                        name.includes(
                            searchTerm
                        )
                    ) {

                        card.style.display = "flex";

                        visibleCount++;

                    } else {

                        card.style.display = "none";
                    }
                }
            );


            // Remove an existing search message
            const existingMessage =
                document.getElementById(
                    "no-conversation-search-result"
                );

            if (existingMessage) {
                existingMessage.remove();
            }


            // Show message when nothing matches
            if (
                searchTerm &&
                visibleCount === 0
            ) {

                const message =
                    document.createElement(
                        "div"
                    );

                message.id =
                    "no-conversation-search-result";

                message.className =
                    "messages-search-empty";

                message.innerHTML = `
                    <div class="messages-empty-icon">
                        🔍
                    </div>

                    <h3>
                        No conversation found
                    </h3>

                    <p>
                        Try searching for another name.
                    </p>
                `;

                conversationsContainer.appendChild(
                    message
                );
            }
        }
    );
}

// ============================================================
// VIEW PROFILE
// ============================================================

const viewProfileDetails =
    document.getElementById(
        "view-profile-details"
    );


if (viewProfileDetails) {

    const urlParams =
        new URLSearchParams(
            window.location.search
        );


    const profileId =
        urlParams.get("user");


    if (!profileId) {

        alert(
            "No profile selected."
        );

        window.location.href =
            "browse.html";

    } else {

        loadViewedProfile(
            profileId
        );
    }
}

// ============================================================
// FORMAT LAST SEEN
// ============================================================

function getActivityStatus(lastSeen) {

    if (!lastSeen) {
        return {
            text: "Offline",
            active: false
        };
    }


    const lastSeenDate =
        new Date(lastSeen);

    const now =
        new Date();


    const difference =
        now - lastSeenDate;


    const minutes =
        Math.floor(
            difference / (1000 * 60)
        );


    // Active within 2 minutes
    if (minutes <= 2) {

        return {
            text: "Active now",
            active: true
        };

    }


    // Less than 60 minutes
    if (minutes < 60) {

        return {
            text:
                "Active " +
                minutes +
                " min ago",

            active: false
        };

    }


    // Less than 24 hours
    const hours =
        Math.floor(
            minutes / 60
        );


    if (hours < 24) {

        return {
            text:
                "Active " +
                hours +
                (
                    hours === 1
                        ? " hour ago"
                        : " hours ago"
                ),

            active: false
        };

    }


    // Yesterday / older
    const days =
        Math.floor(
            hours / 24
        );


    if (days === 1) {

        return {
            text: "Active yesterday",
            active: false
        };

    }


    return {
        text:
            "Active " +
            days +
            " days ago",

        active: false
    };
}
// ============================================================
// LOAD VIEWED PROFILE
// ============================================================

async function loadViewedProfile(
    profileId
) {

    const {
        data: profile,
        error
    } = await supabaseClient
        .from("profiles")
        .select("*, last_seen")
        .eq("id", profileId)
        .maybeSingle();

    const activityStatus =
    getActivityStatus(
        profile.last_seen
    );


    if (error) {

        console.error(
            "Profile loading error:",
            error
        );

        alert(
            "Could not load profile."
        );

        return;
    }


    if (!profile) {

        alert(
            "Profile not found."
        );

        window.location.href =
            "browse.html";

        return;
    }


    const profileName =
        document.getElementById(
            "view-profile-name"
        );


    if (profileName) {

        profileName.textContent =
            profile.name;
    }


    const viewedPicture =
        profile["profile-pictures"];


    // ------------------------------------------------
    // GET ADDITIONAL PHOTOS
    // ------------------------------------------------

    let additionalPhotos = [];

    if (profile["profile-photos"]) {

        try {

            additionalPhotos =
                JSON.parse(
                    profile["profile-photos"]
                );

        } catch (error) {

            console.error(
                "Could not read additional profile photos:",
                error
            );

            additionalPhotos = [];
        }
    }


    // ------------------------------------------------
    // BUILD ADDITIONAL PHOTO GALLERY
    // ------------------------------------------------

    let galleryHTML = "";


    if (additionalPhotos.length > 0) {

        galleryHTML = `
            <div class="view-profile-gallery">

                <h3 class="view-profile-gallery-title">
                    Photos
                </h3>

                <div class="view-profile-gallery-grid">
        `;


        additionalPhotos.forEach(
            function (photoPath) {

                const {
                    data
                } = supabaseClient.storage
                    .from("user-photos")
                    .getPublicUrl(
                        photoPath
                    );


                if (
                    data &&
                    data.publicUrl
                ) {

                    galleryHTML += `
                        <div class="view-profile-gallery-item">

                            <img
                                src="${escapeHTML(data.publicUrl)}"
                                alt="${escapeHTML(profile.name)}"
                                class="view-profile-gallery-image"
                            >

                        </div>
                    `;
                }

            }
        );


        galleryHTML += `

                </div>

            </div>
        `;
    }


    // ------------------------------------------------
    // DISPLAY PROFILE
    // ------------------------------------------------

    viewProfileDetails.innerHTML = `

        <div class="view-profile-main-photo-wrapper">

            ${
                viewedPicture

                    ? `
                        <img
                            src="${escapeHTML(viewedPicture)}"
                            alt="${escapeHTML(profile.name)}"
                            class="view-profile-picture"
                        >
                    `

                    : `
                        <div class="no-profile-picture">
                            👤
                        </div>
                    `
            }

        </div>


        ${galleryHTML}
        
        
        
        <div class="view-profile-info">
        
        <div class="profile-activity-status ${
            activityStatus.active
            ? "active"
            : ""
        }">

        <span class="activity-dot"></span>

        <span>
            ${escapeHTML(
                activityStatus.text
            )}
        </span>

    </div>

    <p>
        <strong>Age:</strong>
        ${escapeHTML(profile.age)}
    </p>


            <p>
                <strong>Gender:</strong>
                ${escapeHTML(profile.gender)}
            </p>


            <p>
                <strong>Location:</strong>
                ${escapeHTML(profile.location)}
            </p>


            <p>
                <strong>About:</strong>
            </p>


            <p>
                ${escapeHTML(profile.bio)}
            </p>

        </div>
    `;

    // ------------------------------------------------
    // MESSAGE BUTTON
    // ------------------------------------------------

    const messageProfileButton =
        document.getElementById(
            "message-profile-button"
        );

    if (messageProfileButton) {

        messageProfileButton.href =
            "chat.html?user=" +
            encodeURIComponent(
                profile.id
            );

        messageProfileButton.style.display =
            "inline-block";
    }
}
// ============================================================
// BIO CHARACTER COUNTER
// ============================================================

const bioInput =
    document.getElementById(
        "profile-bio"
    );


const bioCounter =
    document.getElementById(
        "bio-counter"
    );


if (
    bioInput &&
    bioCounter
) {

    function updateBioCounter() {

        const length =
            bioInput.value.length;


        bioCounter.textContent =
            length +
            " / 300";
    }


    bioInput.addEventListener(
        "input",
        updateBioCounter
    );


    updateBioCounter();
}


// ============================================================
// WELCOME USER
// ============================================================

const welcomeName =
    document.getElementById(
        "welcome-name"
    );


if (welcomeName) {

    async function loadWelcomeName() {

        const user =
            await getLoggedInUser();


        if (!user) {
            return;
        }


        const {
            data: profile,
            error
        } = await supabaseClient
            .from("profiles")
            .select("name")
            .eq("id", user.id)
            .maybeSingle();


        if (error) {

            console.error(
                "Could not load welcome name:",
                error
            );

            return;
        }


        if (
            profile &&
            profile.name
        ) {

            welcomeName.textContent =
                profile.name;
        }
    }


    loadWelcomeName();
}


// ============================================================
// PROFILE COMPLETION STATUS
// ============================================================

const profileStatus =
    document.getElementById(
        "profile-status"
    );


if (profileStatus) {

    async function loadProfileStatus() {

        const user =
            await getLoggedInUser();


        if (!user) {
            return;
        }


        const {
            data: profile,
            error
        } = await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();


        if (error) {

            console.error(
                "Could not check profile:",
                error
            );

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

            profile["profile-pictures"]

        ];


        const completedFields =
            requiredFields.filter(
                function (field) {

                    return (
                        field !== null &&
                        field !== undefined &&
                        String(field).trim() !== ""
                    );
                }
            ).length;


        const totalFields =
            requiredFields.length;


        if (
            completedFields ===
            totalFields
        ) {

            profileStatus.textContent =
                "✅ Your profile is complete!";

        } else {

            profileStatus.textContent =
                `⚠️ Your profile is ${completedFields}/${totalFields} complete.`;
        }
    }


    loadProfileStatus();
}


// ============================================================
// AVATAR SELECTION
// ============================================================

const avatarOptions =
    document.querySelectorAll(
        ".avatar-option"
    );


const selectedAvatar =
    document.getElementById(
        "selected-avatar"
    );


if (
    avatarOptions.length > 0 &&
    selectedAvatar
) {

    avatarOptions.forEach(
        function (avatar) {

            avatar.addEventListener(
                "click",
                function () {

                    avatarOptions.forEach(
                        function (item) {

                            item.classList.remove(
                                "selected"
                            );
                        }
                    );


                    avatar.classList.add(
                        "selected"
                    );


                    selectedAvatar.value =
                        avatar.dataset.avatar;


                    console.log(
                        "Selected avatar:",
                        selectedAvatar.value
                    );
                }
            );
        }
    );
}


// ============================================================
// FINAL STATUS
// ============================================================

console.log(
    "GOODTIME APP.JS IS WORKING!"
);
// ============================================================
// RESET PASSWORD
// ============================================================

const resetPasswordForm =
    document.getElementById(
        "reset-password-form"
    );

if (resetPasswordForm) {

    resetPasswordForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const newPassword =
                document.getElementById(
                    "new-password"
                ).value;

            const confirmPassword =
                document.getElementById(
                    "confirm-password"
                ).value;


            if (
                newPassword !==
                confirmPassword
            ) {

                alert(
                    "Passwords do not match."
                );

                return;
            }


            if (newPassword.length < 6) {

                alert(
                    "Password must be at least 6 characters."
                );

                return;
            }


            const {
                error
            } = await supabaseClient.auth.updateUser(
                {
                    password: newPassword
                }
            );


            if (error) {

                console.error(
                    "Password update error:",
                    error
                );

                alert(
                    "Could not update your password: " +
                    error.message
                );

                return;
            }


            alert(
                "Your password has been updated successfully."
            );


            window.location.href =
                "login.html";

        }
    );
}
// ============================================================
// UNREAD MESSAGE BADGE
// ============================================================

async function updateUnreadBadge() {

    const unreadBadge =
        document.getElementById("unread-badge");

    if (!unreadBadge) {
        return;
    }

    const user =
        await getLoggedInUser();

    if (!user) {
        unreadBadge.style.display = "none";
        return;
    }

    const {
        count,
        error
    } = await supabaseClient
        .from("messages")
        .select("*", {
            count: "exact",
            head: true
        })
        .eq("receiver_id", user.id)
        .eq("is_read", false);

    if (error) {
        console.error(
            "Unread message error:",
            error
        );

        return;
    }

    if (count && count > 0) {

        unreadBadge.textContent =
            count > 99 ? "99+" : count;

        unreadBadge.style.display =
            "inline-flex";

    } else {

        unreadBadge.style.display =
            "none";
    }
}


// Update badge when the page loads
updateUnreadBadge();


// Update badge when a new message arrives
supabaseClient
    .channel("unread-message-badge")
    .on(
        "postgres_changes",
        {
            event: "INSERT",
            schema: "public",
            table: "messages"
        },
        function () {

            updateUnreadBadge();

        }
    )
    .subscribe();

// =========================================================
// GOODTIME SIDEBAR MENU
// =========================================================

const menuButton = document.getElementById("menu-button");
const sidebar = document.getElementById("goodtime-sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");
const sidebarClose = document.getElementById("sidebar-close");

function openSidebar() {
    if (!sidebar || !sidebarOverlay) return;

    sidebar.classList.add("open");
    sidebarOverlay.classList.add("open");
}

function closeSidebar() {
    if (!sidebar || !sidebarOverlay) return;

    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("open");
}

if (menuButton) {
    menuButton.addEventListener("click", openSidebar);
}

if (sidebarClose) {
    sidebarClose.addEventListener("click", closeSidebar);
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebar);
}
// =========================================================
// GOODTIME THEME SYSTEM
// =========================================================

(function () {

    const themeButtons =
        document.querySelectorAll(".theme-option");

    function applyTheme(theme) {

        if (theme === "dark") {
            document.body.classList.add("dark-mode");

        } else if (theme === "light") {
            document.body.classList.remove("dark-mode");

        } else if (theme === "system") {

            const systemDark =
                window.matchMedia(
                    "(prefers-color-scheme: dark)"
                ).matches;

            document.body.classList.toggle(
                "dark-mode",
                systemDark
            );
        }

        // Highlight selected option
        themeButtons.forEach(function (button) {

            button.classList.toggle(
                "active",
                button.dataset.theme === theme
            );

        });
    }

    // Get saved theme
    let savedTheme =
        localStorage.getItem("goodtime-theme");

    if (!savedTheme) {
        savedTheme = "system";
    }

    applyTheme(savedTheme);

    // Theme button clicks
    themeButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const selectedTheme =
                button.dataset.theme;

            localStorage.setItem(
                "goodtime-theme",
                selectedTheme
            );

            applyTheme(selectedTheme);
        });

    });

    // Update automatically when System mode is selected
    const systemPreference =
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        );

    systemPreference.addEventListener(
        "change",
        function () {

            const currentTheme =
                localStorage.getItem(
                    "goodtime-theme"
                );

            if (currentTheme === "system") {
                applyTheme("system");
            }

        }
    );

})();
// =========================================================
// GOODTIME - ADDITIONAL PROFILE PHOTOS
// =========================================================

const addProfilePhotoButton =
    document.getElementById("add-profile-photo-button");

const profilePhotoInput =
    document.getElementById("profile-photo-input");

const profilePhotosGrid =
    document.getElementById("profile-photos-grid");


// ---------------------------------------------------------
// LOAD ADDITIONAL PROFILE PHOTOS
// ---------------------------------------------------------

async function loadAdditionalProfilePhotos() {

    if (!profilePhotosGrid) {
        return;
    }

    const user = await getLoggedInUser();

    if (!user) {
        return;
    }

    const { data: profile, error } = await supabaseClient
        .from("profiles")
        .select("profile-photos")
        .eq("id", user.id)
        .maybeSingle();

    if (error) {
        console.error(
            "Could not load profile photos:",
            error
        );
        return;
    }

    profilePhotosGrid.innerHTML = "";

    if (!profile || !profile["profile-photos"]) {
        return;
    }

    let photos = [];

    try {
        photos = JSON.parse(
            profile["profile-photos"]
        );
    } catch (error) {
        console.error(
            "Invalid profile-photos data:",
            error
        );
        return;
    }

    photos.forEach(function (photoPath) {

        createAdditionalPhotoElement(
            photoPath
        );

    });
}


// ---------------------------------------------------------
// CREATE PHOTO PREVIEW
// ---------------------------------------------------------

function createAdditionalPhotoElement(
    photoPath
) {

    if (!profilePhotosGrid) {
        return;
    }

    const photoItem =
        document.createElement("div");

    photoItem.className =
        "profile-photo-item";


    const image =
        document.createElement("img");

    const {
        data
    } = supabaseClient.storage
        .from("user-photos")
        .getPublicUrl(photoPath);

    image.src =
        data.publicUrl;

    image.alt =
        "Additional profile photo";


    // Delete button
    const deleteButton =
        document.createElement("button");

    deleteButton.type =
        "button";

    deleteButton.className =
        "delete-profile-photo";

    deleteButton.innerHTML =
        "×";


    deleteButton.addEventListener(
        "click",
        async function () {

            const confirmDelete =
                confirm(
                    "Delete this photo?"
                );

            if (!confirmDelete) {
                return;
            }

            await deleteAdditionalProfilePhoto(
                photoPath,
                photoItem
            );

        }
    );


    photoItem.appendChild(image);

    photoItem.appendChild(
        deleteButton
    );

    profilePhotosGrid.appendChild(
        photoItem
    );
}


// ---------------------------------------------------------
// DELETE PHOTO
// ---------------------------------------------------------

async function deleteAdditionalProfilePhoto(
    photoPath,
    photoElement
) {

    const user =
        await getLoggedInUser();

    if (!user) {
        alert(
            "Please log in again."
        );
        return;
    }


    // Make sure the photo belongs
    // to the logged-in user
    if (
        !photoPath.startsWith(
            user.id + "/"
        )
    ) {

        alert(
            "You cannot delete this photo."
        );

        return;
    }


    // Delete from Storage
    const {
        error: storageError
    } = await supabaseClient.storage
        .from("user-photos")
        .remove([
            photoPath
        ]);


    if (storageError) {

        console.error(
            "Storage delete error:",
            storageError
        );

        alert(
            "Could not delete the photo."
        );

        return;
    }


    // Get current profile photos
    const {
        data: profile,
        error: profileError
    } = await supabaseClient
        .from("profiles")
        .select("profile-photos")
        .eq("id", user.id)
        .maybeSingle();


    if (profileError) {

        console.error(
            "Profile photo data error:",
            profileError
        );

        return;
    }


    let photos = [];

    if (profile && profile["profile-photos"]) {

        try {

            photos =
                JSON.parse(
                    profile["profile-photos"]
                );

        } catch (error) {

            photos = [];

        }
    }


    // Remove deleted photo
    photos =
        photos.filter(function (photo) {

            return photo !== photoPath;

        });


    // Save updated list
    const {
        error: updateError
    } = await supabaseClient
        .from("profiles")
        .update({
            "profile-photos":
                JSON.stringify(photos)
        })
        .eq("id", user.id);


    if (updateError) {

        console.error(
            "Profile photo update error:",
            updateError
        );

        alert(
            "Photo deleted, but profile data could not be updated."
        );

        return;
    }


    // Remove from screen
    if (photoElement) {

        photoElement.remove();

    }

    console.log(
        "Additional photo deleted:",
        photoPath
    );
}


// ---------------------------------------------------------
// ADD / UPLOAD PHOTO
// ---------------------------------------------------------

if (
    addProfilePhotoButton &&
    profilePhotoInput
) {

    addProfilePhotoButton.addEventListener(
        "click",
        function () {

            profilePhotoInput.click();

        }
    );


    profilePhotoInput.addEventListener(
        "change",
        async function () {

            const file =
                profilePhotoInput.files[0];

            if (!file) {
                return;
            }


            const user =
                await getLoggedInUser();

            if (!user) {

                alert(
                    "Please log in again."
                );

                return;
            }


            // Get existing photos
            const {
                data: profile,
                error
            } = await supabaseClient
                .from("profiles")
                .select("profile-photos")
                .eq("id", user.id)
                .maybeSingle();


            if (error) {

                console.error(
                    "Could not get profile photos:",
                    error
                );

                alert(
                    "Could not load your photos."
                );

                return;
            }


            let photos = [];

            if (
                profile &&
                profile["profile-photos"]
            ) {

                try {

                    photos =
                        JSON.parse(
                            profile["profile-photos"]
                        );

                } catch (error) {

                    photos = [];

                }
            }


            // Maximum 4 additional photos
            if (photos.length >= 4) {

                alert(
                    "You can only add up to 4 additional photos."
                );

                profilePhotoInput.value =
                    "";

                return;
            }


            // Only allow images
            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select an image file."
                );

                profilePhotoInput.value =
                    "";

                return;
            }


            // Maximum 5MB
            if (
                file.size >
                5 * 1024 * 1024
            ) {

                alert(
                    "Please choose an image smaller than 5MB."
                );

                profilePhotoInput.value =
                    "";

                return;
            }


            // Create unique filename
            const fileExtension =
                file.name
                    .split(".")
                    .pop()
                    .toLowerCase();

            const fileName =
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .substring(2, 8) +
                "." +
                fileExtension;


            // Store each user's photos
            // inside their own folder
            const filePath =
                user.id +
                "/" +
                fileName;


            console.log(
                "Uploading photo:",
                filePath
            );


            // Upload to Supabase Storage
            const {
                error: uploadError
            } = await supabaseClient.storage
                .from("user-photos")
                .upload(
                    filePath,
                    file,
                    {
                        cacheControl: "3600",
                        upsert: false
                    }
                );


            if (uploadError) {

                console.error(
                    "Photo upload error:",
                    uploadError
                );

                alert(
                    "Could not upload photo: " +
                    uploadError.message
                );

                return;
            }


            // Add new photo path
            photos.push(
                filePath
            );


            // Save paths to database
            const {
                error: updateError
            } = await supabaseClient
                .from("profiles")
                .update({
                    "profile-photos":
                        JSON.stringify(photos)
                })
                .eq("id", user.id);


            if (updateError) {

                console.error(
                    "Profile photo save error:",
                    updateError
                );

                // If database save fails,
                // remove uploaded file
                await supabaseClient.storage
                    .from("user-photos")
                    .remove([
                        filePath
                    ]);

                alert(
                    "Photo uploaded but could not be saved to your profile."
                );

                return;
            }


            // Display the uploaded photo
            createAdditionalPhotoElement(
                filePath
            );


            // Reset file input
            profilePhotoInput.value =
                "";


            console.log(
                "Additional photo uploaded successfully:",
                filePath
            );

        }
    );
}


// ---------------------------------------------------------
// LOAD PHOTOS WHEN PROFILE PAGE OPENS
// ---------------------------------------------------------

loadAdditionalProfilePhotos();
// ========================================================
// SIDEBAR UNREAD MESSAGE COUNT
// ========================================================

async function updateSidebarUnreadCount() {

    const badge =
        document.getElementById("sidebar-unread-count");

    if (!badge) {
        return;
    }

    const {
        data: {
            user
        }
    } = await supabaseClient.auth.getUser();

    if (!user) {
        return;
    }

    const {
        count,
        error
    } = await supabaseClient
        .from("messages")
        .select("*", {
            count: "exact",
            head: true
        })
        .eq("receiver_id", user.id)
        .eq("is_read", false);

    if (error) {
        console.error(
            "Error loading unread message count:",
            error
        );

        return;
    }

    if (count && count > 0) {

        badge.textContent =
            count > 99 ? "99+" : count;

        badge.classList.add("show");

    } else {

        badge.textContent = "";

        badge.classList.remove("show");
    }
}


// Load unread count
updateSidebarUnreadCount();


// Update when a new message arrives
async function listenForSidebarUnreadMessages() {

    const {
        data: {
            user
        }
    } = await supabaseClient.auth.getUser();

    if (!user) {
        return;
    }

    supabaseClient
        .channel("sidebar-unread-messages")
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "messages",
                filter:
                    "receiver_id=eq." + user.id
            },
            function () {

                updateSidebarUnreadCount();

            }
        )
        .subscribe();
}

listenForSidebarUnreadMessages();
// ============================================================
// UPDATE LAST SEEN
// ============================================================

async function updateLastSeen() {

    try {

        const {
            data: {
                user
            }
        } = await supabaseClient.auth.getUser();


        if (!user) {
            return;
        }


        const {
            error
        } = await supabaseClient
            .from("profiles")
            .update({
                last_seen: new Date().toISOString()
            })
            .eq(
                "id",
                user.id
            );


        if (error) {

            console.error(
                "Could not update last seen:",
                error
            );

        }

    } catch (error) {

        console.error(
            "Last seen error:",
            error
        );

    }
}


// Update when the page loads
updateLastSeen();


// Update every 60 seconds
setInterval(
    updateLastSeen,
    60 * 1000
);
// =========================================================
// GOODTIME - VIEW MY PROFILE
// =========================================================

const myProfilePage =
    window.location.pathname.endsWith(
        "view-my-profile.html"
    );

if (myProfilePage) {

    loadMyProfile();

}


async function loadMyProfile() {

    const user =
        await getLoggedInUser();

    if (!user) {

        window.location.href =
            "login.html";

        return;

    }


    const {
        data: profile,
        error
    } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();


    if (error) {

        console.error(
            "Error loading my profile:",
            error
        );

        return;

    }


    if (!profile) {

        alert(
            "You haven't created your profile yet."
        );

        window.location.href =
            "profile.html";

        return;

    }


    // ================================
    // BASIC INFORMATION
    // ================================

    const nameElement =
        document.getElementById(
            "my-profile-name"
        );

    const ageElement =
        document.getElementById(
            "my-profile-age"
        );

    const genderElement =
        document.getElementById(
            "my-profile-gender"
        );

    const locationElement =
        document.getElementById(
            "my-profile-location"
        );

    const bioElement =
        document.getElementById(
            "my-profile-bio"
        );


    if (nameElement) {

        nameElement.textContent =
            profile.name || "—";

    }

    if (ageElement) {

        ageElement.textContent =
            profile.age || "—";

    }

    if (genderElement) {

        genderElement.textContent =
            profile.gender || "—";

    }

    if (locationElement) {

        locationElement.textContent =
            profile.location || "—";

    }

    if (bioElement) {

        bioElement.textContent =
            profile.bio || "No bio added yet.";

    }


    // ================================
    // MAIN PROFILE PHOTO
    // ================================

    const mainPicture =
        document.getElementById(
            "my-profile-picture"
        );


    if (mainPicture) {

        if (
            profile["profile-pictures"]
        ) {

            mainPicture.src =
                profile["profile-pictures"];

            mainPicture.alt =
                profile.name ||
                "My profile picture";

        } else {

            mainPicture.style.display =
                "none";

        }

    }


    // ================================
    // ACTIVITY STATUS
    // ================================

    const activityElement =
        document.getElementById(
            "my-profile-activity"
        );

    const activityText =
        document.getElementById(
            "my-profile-activity-text"
        );


    if (
        activityElement &&
        activityText
    ) {

        const status =
            getActivityStatus(
                profile.last_seen
            );


        activityText.textContent =
            status.text;


        if (status.active) {

            activityElement.classList.add(
                "active"
            );

        } else {

            activityElement.classList.remove(
                "active"
            );

        }

    }


    // ================================
    // ADDITIONAL PHOTOS
    // ================================

    const gallery =
        document.getElementById(
            "my-profile-gallery"
        );

    const galleryGrid =
        document.getElementById(
            "my-profile-gallery-grid"
        );


    if (
        gallery &&
        galleryGrid
    ) {

        galleryGrid.innerHTML = "";


        let additionalPhotos = [];


        if (
            profile["profile-photos"]
        ) {

            try {

                additionalPhotos =
                    JSON.parse(
                        profile["profile-photos"]
                    );

            } catch (error) {

                console.error(
                    "Could not load additional photos:",
                    error
                );

                additionalPhotos = [];

            }

        }


        if (
            Array.isArray(
                additionalPhotos
            ) &&
            additionalPhotos.length > 0
        ) {

            gallery.style.display =
                "block";


            additionalPhotos.forEach(
                function (photo) {

                    const item =
                        document.createElement(
                            "div"
                        );

                    item.className =
                        "view-profile-gallery-item";


                    const image =
                        document.createElement(
                            "img"
                        );

                    image.src =
                        photo.url ||
                        photo;

                    image.alt =
                        "Additional profile photo";

                    image.className =
                        "view-profile-gallery-image";


                    item.appendChild(
                        image
                    );

                    galleryGrid.appendChild(
                        item
                    );

                }
            );

        } else {

            gallery.style.display =
                "none";

        }

    }

}