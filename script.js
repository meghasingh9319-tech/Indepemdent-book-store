document.addEventListener("DOMContentLoaded", () => {

    // ---------- Elements ----------
    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const emptyState = document.getElementById("emptyState");
    const loadingIndicator = document.getElementById("loadingIndicator");
    const eventGrid = document.getElementById("eventGrid");

    const addEventBtn = document.getElementById("addEventBtn");
    const addEventModal = document.getElementById("addEventModal");
    const addEventForm = document.getElementById("addEventForm");
    const cancelAddEvent = document.getElementById("cancelAddEvent");

    if (!searchInput || !categoryFilter || !emptyState || !eventGrid) {
        console.error("Required HTML elements are missing. Check your IDs.");
        return;
    }

    // ---------- Analytics (Telemetry Simulation) ----------
    function logAnalytics() {
        console.log("[Analytics] User interacted with Independent Bookstore Events Page");
    }

    // ---------- Security: sanitize text before inserting into DOM ----------
    function sanitize(str) {
        const div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    // ---------- Filtering (with simulated async / loading state) ----------
    let filterTimeout;

    function runFilter() {
        const cards = document.querySelectorAll(".event-card");
        const search = searchInput.value.toLowerCase().trim();
        const category = categoryFilter.value;

        let visible = 0;

        cards.forEach(card => {
            const titleEl = card.querySelector("h3");
            if (!titleEl) return;

            const title = titleEl.textContent.toLowerCase();
            const cardCategory = card.dataset.category;

            const matchesSearch = title.includes(search);
            const matchesCategory =
                category === "All Categories" || category === "" || cardCategory === category;

            if (matchesSearch && matchesCategory) {
                card.style.display = "";
                visible++;
            } else {
                card.style.display = "none";
            }
        });

        emptyState.style.display = visible === 0 ? "block" : "none";
        loadingIndicator.style.display = "none";
    }

    function filterEvents() {
        // Simulate a slow / 3G connection: show loading indicator before results settle
        clearTimeout(filterTimeout);
        loadingIndicator.style.display = "flex";
        emptyState.style.display = "none";

        filterTimeout = setTimeout(runFilter, 400);
        logAnalytics();
    }

    searchInput.addEventListener("input", filterEvents);
    categoryFilter.addEventListener("change", filterEvents);

    // Run once on load (no artificial delay needed for initial render)
    runFilter();

    // ---------- View Details buttons (delegated, works for dynamically added cards) ----------
    eventGrid.addEventListener("click", (e) => {
        if (e.target.classList.contains("view-details-btn")) {
            logAnalytics();
        }
    });

    // ---------- Add Event Modal ----------
    function openModal() {
        addEventModal.style.display = "flex";
        document.getElementById("eventTitle").focus();
    }

    function closeModal() {
        addEventModal.style.display = "none";
        addEventForm.reset();
        clearErrors();
    }

    function clearErrors() {
        addEventForm.querySelectorAll(".error-message").forEach(el => el.textContent = "");
        addEventForm.querySelectorAll("input, select").forEach(el => {
            el.classList.remove("invalid");
            el.removeAttribute("aria-invalid");
        });
    }

    addEventBtn.addEventListener("click", openModal);
    cancelAddEvent.addEventListener("click", closeModal);

    addEventModal.addEventListener("click", (e) => {
        if (e.target === addEventModal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && addEventModal.style.display === "flex") {
            closeModal();
        }
    });

    // ---------- Form Validation (Invalid Inputs handling) ----------
    function showError(field, message) {
        const errorEl = document.getElementById(field.id + "Error");
        field.classList.add("invalid");
        field.setAttribute("aria-invalid", "true");
        if (errorEl) errorEl.textContent = message;
    }

    function clearFieldError(field) {
        const errorEl = document.getElementById(field.id + "Error");
        field.classList.remove("invalid");
        field.removeAttribute("aria-invalid");
        if (errorEl) errorEl.textContent = "";
    }

    addEventForm.addEventListener("submit", (e) => {
        e.preventDefault();
        clearErrors();

        const title = document.getElementById("eventTitle");
        const author = document.getElementById("eventAuthor");
        const date = document.getElementById("eventDate");
        const location = document.getElementById("eventLocation");
        const seats = document.getElementById("eventSeats");
        const category = document.getElementById("eventCategory");

        let isValid = true;

        if (!title.value.trim()) {
            showError(title, "Event title is required.");
            isValid = false;
        }

        if (!author.value.trim()) {
            showError(author, "Author / host name is required.");
            isValid = false;
        }

        if (!date.value) {
            showError(date, "Please select a date.");
            isValid = false;
        }

        if (!location.value.trim()) {
            showError(location, "Location is required.");
            isValid = false;
        }

        if (!seats.value || Number(seats.value) < 1) {
            showError(seats, "Enter a valid number of seats (1 or more).");
            isValid = false;
        }

        if (!category.value) {
            showError(category, "Please select a category.");
            isValid = false;
        }

        if (!isValid) return;

        // Build sanitized values
        const safeTitle = sanitize(title.value.trim());
        const safeAuthor = sanitize(author.value.trim());
        const safeLocation = sanitize(location.value.trim());
        const safeSeats = sanitize(seats.value.trim());
        const safeCategory = sanitize(category.value);
        const formattedDate = new Date(date.value).toLocaleDateString("en-GB", {
            day: "numeric", month: "long", year: "numeric"
        });

        // Create the new event card
        const card = document.createElement("div");
        card.className = "event-card";
        card.dataset.category = safeCategory;
        card.innerHTML = `
            <span class="badge">${safeCategory}</span>
            <h3>${safeTitle}</h3>
            <p><i class="fa-solid fa-user" aria-hidden="true"></i> ${safeAuthor}</p>
            <p><i class="fa-solid fa-calendar-days" aria-hidden="true"></i> ${formattedDate}</p>
            <p><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${safeLocation}</p>
            <p><i class="fa-solid fa-chair" aria-hidden="true"></i> ${safeSeats} Seats</p>
            <button type="button" class="view-details-btn">View Details</button>
        `;

        eventGrid.appendChild(card);

        logAnalytics();
        closeModal();
        runFilter();
    });

    // Clear individual field errors as the user types/fixes them
    addEventForm.querySelectorAll("input, select").forEach(field => {
        field.addEventListener("input", () => clearFieldError(field));
        field.addEventListener("change", () => clearFieldError(field));
    });

});