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
        "view-profile.html"
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
            "name, profile-pictures"
        )
        .eq(
            "id",
            receiverId
        )
        .maybeSingle();


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

/// ============================================================
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

        conversationsContainer.innerHTML =
            "<p>Could not load messages.</p>";

        return;
    }


    if (!messages || messages.length === 0) {

        conversationsContainer.innerHTML =
            "<p>You have no conversations yet.</p>";

        return;
    }


    conversationsContainer.innerHTML = "";


    const userIds = [];


    messages.forEach(
        function (message) {

            const otherUser =
                message.sender_id ===
                    user.id

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


        const latestMessage =
            messages.find(
                function (message) {

                    return (
                        message.sender_id ===
                            userId ||

                        message.receiver_id ===
                            userId
                    );
                }
            );


        const unreadCount =
            messages.filter(
                function (message) {

                    return (

                        message.sender_id ===
                            userId &&

                        message.receiver_id ===
                            user.id &&

                        message.is_read ===
                            false
                    );
                }
            ).length;


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


        const latestMessageText =
            latestMessage
                ? escapeHTML(
                    latestMessage.message
                )
                : "";


        const latestTime =
            latestMessage
                ? new Date(
                    latestMessage.created_at
                ).toLocaleTimeString(
                    [],
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                )
                : "";


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


        conversation.innerHTML = `

            <div class="conversation-avatar-wrapper">
                ${avatar}
            </div>

            <div class="conversation-content">

                <strong>
                    ${escapeHTML(
                        profile.name
                    )}
                </strong>

                <span>
                    ${latestMessageText}
                </span>

                <small>
                    ${latestTime}
                </small>

                ${
                    unreadCount > 0
                        ? `
                            <b class="unread-badge">
                                ${unreadCount} unread
                            </b>
                        `
                        : ""
                }

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
        .select("*")
        .eq("id", profileId)
        .maybeSingle();


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


    viewProfileDetails.innerHTML = `

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
    `;


    // ------------------------------------------------
    // PROFILE IMAGE MODAL
    // ------------------------------------------------

    const profileImage =
        viewProfileDetails.querySelector(
            ".view-profile-picture"
        );


    const imageModal =
        document.getElementById(
            "image-modal"
        );


    const modalProfileImage =
        document.getElementById(
            "modal-profile-image"
        );


    const closeImageModal =
        document.getElementById(
            "close-image-modal"
        );


    if (
        profileImage &&
        imageModal &&
        modalProfileImage
    ) {

        profileImage.addEventListener(
            "click",
            function () {

                modalProfileImage.src =
                    profileImage.src;

                imageModal.style.display =
                    "flex";
            }
        );
    }


    if (
        closeImageModal &&
        imageModal
    ) {

        closeImageModal.addEventListener(
            "click",
            function () {

                imageModal.style.display =
                    "none";
            }
        );


        imageModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    imageModal
                ) {

                    imageModal.style.display =
                        "none";
                }
            }
        );
    }


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