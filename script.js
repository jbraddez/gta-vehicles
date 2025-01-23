document.addEventListener("DOMContentLoaded", async () => {
    const vehicleList = document.getElementById("vehicle-list");
    const searchInput = document.getElementById("search");
    const vehicleTypeFilter = document.getElementById("vehicle-type");
    const sortOptions = document.getElementById("sort-options");

    let vehicles = [];
    let allVehicles = {};

    async function fetchVehicles() {
        try {
            const response = await fetch("https://gta.vercel.app/api/vehicles/all");
            const data = await response.json();

            console.log("API Response:", data);

            if (typeof data !== "object") {
                throw new Error("API response is not an object");
            }

            allVehicles = data;
            vehicles = extractVehicles(data);

            populateFilters(Object.keys(data));
            displayVehicles(shuffleArray([...vehicles]));
        } catch (error) {
            console.error("Error fetching vehicle data:", error);
            vehicleList.innerHTML = "<p>Failed to load vehicle data.</p>";
        }
    }

    function extractVehicles(data) {
        let extracted = [];
        for (const category in data) {
            for (const vehicleName in data[category]) {
                let vehicle = data[category][vehicleName];
                vehicle.name = formatTitle(vehicleName);
                vehicle.category = formatTitle(category);
                vehicle.manufacturer = vehicle.manufacturer ? formatTitle(vehicle.manufacturer) : "N/A";
                vehicle.model = vehicle.model ? formatTitle(vehicle.model) : "N/A";
                extracted.push(vehicle);
            }
        }
        return extracted;
    }

    function populateFilters(categories) {
        vehicleTypeFilter.innerHTML = `<option value="all">All</option>`;

        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = formatTitle(category);
            vehicleTypeFilter.appendChild(option);
        });
    }

    function displayVehicles(filteredVehicles) {
        vehicleList.innerHTML = "";
        filteredVehicles.forEach(vehicle => {
            const vehicleDiv = document.createElement("div");
            vehicleDiv.classList.add("vehicle");

            vehicleDiv.innerHTML = `
                <h2>${vehicle.name || "Unknown"}</h2>
                <p><strong>Manufacturer:</strong> ${vehicle.manufacturer}</p>
                <p><strong>Model:</strong> ${vehicle.model}</p>
                <p><strong>Category:</strong> ${vehicle.category}</p>
                <p><strong>Seats:</strong> ${vehicle.seats || "N/A"}</p>
                <p><strong>Price:</strong> ${vehicle.price ? `$${vehicle.price.toLocaleString()}` : "N/A"}</p>
                <p><strong>Top Speed:</strong> ${vehicle.topSpeed?.mph || "N/A"} mph (${vehicle.topSpeed?.kmh || "N/A"} km/h)</p>
                <p><strong>Speed:</strong> ${vehicle.speed || "N/A"}</p>
                <p><strong>Acceleration:</strong> ${vehicle.acceleration || "N/A"}</p>
                <p><strong>Braking:</strong> ${vehicle.braking || "N/A"}</p>
                <p><strong>Handling:</strong> ${vehicle.handling || "N/A"}</p>
                <img src="${vehicle.images?.frontQuarter || ''}" alt="${vehicle.name}" onerror="this.style.display='none'">
                <div class="stats-info">
                    <div class="stats-bar">
                        <div class="stat-label">Speed</div>
                        <div class="bar"><div class="bar-fill" style="width: ${vehicle.speed ? vehicle.speed : 0}%"></div></div>
                    </div>
                    <div class="stats-bar">
                        <div class="stat-label">Acceleration</div>
                        <div class="bar"><div class="bar-fill" style="width: ${vehicle.acceleration ? vehicle.acceleration : 0}%"></div></div>
                    </div>
                    <div class="stats-bar">
                        <div class="stat-label">Braking</div>
                        <div class="bar"><div class="bar-fill" style="width: ${vehicle.braking ? vehicle.braking : 0}%"></div></div>
                    </div>
                    <div class="stats-bar">
                        <div class="stat-label">Handling</div>
                        <div class="bar"><div class="bar-fill" style="width: ${vehicle.handling ? vehicle.handling : 0}%"></div></div>
                    </div>
                </div>
            `;

            vehicleDiv.addEventListener("click", () => {
                vehicleDiv.classList.toggle("expanded");
            });

            vehicleList.appendChild(vehicleDiv);
        });
    }

    function filterVehicles() {
        const searchQuery = searchInput.value.toLowerCase();
        const selectedType = vehicleTypeFilter.value;

        let filtered = vehicles.filter(vehicle =>
            vehicle.name.toLowerCase().includes(searchQuery)
        );

        if (selectedType !== "all") {
            filtered = filtered.filter(vehicle => vehicle.category.toLowerCase() === selectedType.toLowerCase());
        }

        sortVehicles(filtered); // Call sort after filtering
    }

    function sortVehicles(filteredVehicles) {
        const sortBy = sortOptions.value;

        filteredVehicles.sort((a, b) => {
            if (sortBy === "speed-high") return (b.speed || 0) - (a.speed || 0);
            if (sortBy === "speed-low") return (a.speed || 0) - (b.speed || 0);
            if (sortBy === "handling-high") return (b.handling || 0) - (a.handling || 0);
            if (sortBy === "handling-low") return (a.handling || 0) - (b.handling || 0);
            if (sortBy === "price-high") return (b.price || 0) - (a.price || 0);
            if (sortBy === "price-low") return (a.price || 0) - (b.price || 0);
            if (sortBy === "acceleration-high") return (b.acceleration || 0) - (a.acceleration || 0);
            if (sortBy === "acceleration-low") return (a.acceleration || 0) - (b.acceleration || 0);
            return 0;
        });

        displayVehicles(filteredVehicles); 
    }

    function formatTitle(text) {
        return text.replace(/\b\w/g, char => char.toUpperCase());
    }

    function shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    sortOptions.addEventListener("change", filterVehicles); 
    searchInput.addEventListener("input", filterVehicles);
    vehicleTypeFilter.addEventListener("change", filterVehicles);

    fetchVehicles();
});
