// REPLACE THIS with your actual API Gateway Invoke URL
const API_BASE_URL = "https://stpejwlqtg.execute-api.ap-southeast-1.amazonaws.com";

let employees = [];
let selectedEmployeeId = null;

// Fetch all employees from DynamoDB on page load
document.addEventListener("DOMContentLoaded", fetchEmployees);

async function fetchEmployees() {
  try {
    const response = await fetch(`${API_BASE_URL}/employees`);
    if (!response.ok) throw new Error("Failed to fetch employees.");
    
    employees = await response.json();
    renderList(employees);
  } catch (error) {
    console.error("Error loading employees:", error);
    alert("Could not load employee list from cloud database.");
  }
}

// Render employee list in left panel
function renderList(data) {
  const listContainer = document.getElementById("employeeList");
  if (!listContainer) return;

  listContainer.innerHTML = "";

  if (data.length === 0) {
    listContainer.innerHTML = "<li style='cursor:default; padding: 10px;'>No employees found</li>";
    return;
  }

  data.forEach((emp) => {
    const li = document.createElement("li");
    if (emp.id === selectedEmployeeId) li.classList.add("active");

    li.innerHTML = `
      <span class="emp-name">${emp.firstName} ${emp.lastName}</span>
      <span class="emp-role">${emp.position || "No position listed"}</span>
    `;

    li.onclick = () => selectEmployee(emp.id);
    listContainer.appendChild(li);
  });
}

// Filter list based on search bar
function filterEmployees() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const filtered = employees.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const position = (emp.position || "").toLowerCase();
    return fullName.includes(query) || position.includes(query);
  });
  renderList(filtered);
}

// Show selected employee in right panel form
function selectEmployee(id) {
  selectedEmployeeId = id;
  const emp = employees.find((e) => e.id === id);
  if (!emp) return;

  filterEmployees(); // Highlight selected in list

  document.getElementById("emptyState").classList.add("hidden");
  document.getElementById("editForm").classList.remove("hidden");

  document.getElementById("editFirstName").value = emp.firstName || "";
  document.getElementById("editLastName").value = emp.lastName || "";
  document.getElementById("editMiddleName").value = emp.middleName || "";
  document.getElementById("editAge").value = emp.age || "";
  document.getElementById("editPosition").value = emp.position || "";
  document.getElementById("editBday").value = emp.bday || "";
  document.getElementById("editEmail").value = emp.email || "";
  document.getElementById("editGender").value = emp.gender || "Male";
  document.getElementById("editPhoto").src = emp.photo || "https://via.placeholder.com/120";
}

// Save employee changes to DynamoDB
async function saveEmployeeChanges() {
  if (!selectedEmployeeId) return;

  const updatedEmployee = {
    id: selectedEmployeeId,
    firstName: document.getElementById("editFirstName").value,
    lastName: document.getElementById("editLastName").value,
    middleName: document.getElementById("editMiddleName").value,
    age: document.getElementById("editAge").value,
    position: document.getElementById("editPosition").value,
    bday: document.getElementById("editBday").value,
    email: document.getElementById("editEmail").value,
    gender: document.getElementById("editGender").value,
    photo: document.getElementById("editPhoto").src
  };

  try {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedEmployee)
    });

    if (!response.ok) throw new Error("Failed to save changes.");

    alert("Employee details updated in DynamoDB!");
    await fetchEmployees(); // Refresh list from database
  } catch (error) {
    console.error("Error saving changes:", error);
    alert("Could not save changes.");
  }
}

// Delete employee from DynamoDB
async function deleteEmployee() {
  if (!selectedEmployeeId) return;

  const confirmDelete = confirm("Are you sure you want to delete this employee record?");
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedEmployeeId })
    });

    if (!response.ok) throw new Error("Failed to delete employee.");

    alert("Employee deleted from cloud database!");

    selectedEmployeeId = null;
    document.getElementById("editForm").classList.add("hidden");
    document.getElementById("emptyState").classList.remove("hidden");

    await fetchEmployees(); // Refresh list
  } catch (error) {
    console.error("Error deleting employee:", error);
    alert("Could not delete employee.");
  }
}