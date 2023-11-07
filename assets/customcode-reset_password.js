// Parallel Update
const resetPasswordForm = document.querySelectorAll(
  "#reset_customer_password_div form"
)[0];

resetPasswordForm.addEventListener("submit", async function (event) {
  event.preventDefault(); // prevent the default form submission behavior
  // your code to handle the form submission
  event.stopImmediatePropagation();
  var parallel_update = await submitFormWithApiAndShopify(); // wait for the result
  if (parallel_update == 1) {
    this.submit();
  } else {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Unexpected Error occurred",
    });
  }
});

function submitFormWithApiAndShopify() {
  const form = document.querySelectorAll(
    "#reset_customer_password_div form"
  )[0];
  const formData = new FormData(form);
  const parallelFields = [];

  // Collect data from parallel fields
  document.querySelectorAll(".parallel").forEach(function (element) {
    const fieldName = element.getAttribute("name");

    if (fieldName.startsWith("customer[") && fieldName.endsWith("]")) {
      const customerField = fieldName.substring(9, fieldName.length - 1);
      const value = element.value;
      parallelFields.push({
        [customerField]: value,
      });
    }
  });

  // Call the API to register the usergit
  const obj = parallelFields.reduce((acc, curr) => ({ ...acc, ...curr }), {});
  const emailInput = document.getElementById("email_address");
  const email = emailInput.value;
  const password = document.getElementById("ResetPassword");
  const confirm_password = document.getElementById("PasswordConfirmation");
  if (email.innerHTML) {
    obj["email"] = email;
    obj["password"] = password.value;
    obj["confirm_password"] = confirm_password.value;
  }

  return fetch("https://apps.ajinomotosalesth.com/api/shopify_account/1", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(obj),
  })
    .then((response) => response.json())
    .then((data) => {
      // Do something with the response data
      if (data.status != "error") {
        return 1;
      } else {
        var errorMessage = "";

        // Loop through the JSON response and concatenate the error messages
        for (var key in data.message) {
          if (data.message.hasOwnProperty(key)) {
            errorMessage += data.message[key].join("\n");
          }
        }
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
        });

        return 0;
      }
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Unexpected Error occurred",
      });
      return 0;
    });
}
