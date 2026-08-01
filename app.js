// REPLACE THIS with your actual API Gateway Invoke URL from Step 6
const API_BASE_URL = "https://stpejwlqtg.execute-api.ap-southeast-1.amazonaws.com";

async function register(event) {
  event.preventDefault();

  const firstName = document.getElementById("FName").value;
  const lastName = document.getElementById("Lname").value;
  const middleName = document.getElementById("Mname").value;
  const age = document.getElementById("Age").value;
  const position = document.getElementById("Position").value;
  const bday = document.getElementById("bday").value;
  const email = document.getElementById("email").value;

  const genderElement = document.querySelector('input[name="Gender"]:checked');
  const gender = genderElement ? genderElement.value : "";

  const fileInput = document.getElementById("file");
  const file = fileInput ? fileInput.files[0] : null;

  let photoUrl = "https://via.placeholder.com/120?text=No+Photo";

  try {
    // Step 1: Upload image to S3 if a photo was selected
    if (file) {
      // A. Get Presigned URL from Lambda
      const presignedRes = await fetch(`${API_BASE_URL}/get-upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type
        })
      });

      if (!presignedRes.ok) throw new Error("Failed to get image upload URL.");
      const { uploadUrl, imageUrl } = await presignedRes.json();

      // B. Upload file directly to S3 via PUT request
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file
      });

      if (!uploadRes.ok) throw new Error("Failed to upload image to S3.");
      photoUrl = imageUrl; // Set the public S3 URL
    }

    // Step 2: Save employee record to DynamoDB via API Gateway
    const employeeData = {
      firstName,
      lastName,
      middleName,
      age,
      position,
      bday,
      email,
      gender,
      photo: photoUrl
    };

    const saveRes = await fetch(`${API_BASE_URL}/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employeeData)
    });

    if (!saveRes.ok) throw new Error("Failed to save employee data.");

    alert("Employee registered successfully to AWS!");
    window.location.href = "SearchTab.html";

  } catch (error) {
    console.error("Error during registration:", error);
    alert(`Registration failed: ${error.message}`);
  }
}