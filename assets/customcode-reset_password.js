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
    // handle the case where the registration failed
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

  // Call the API to register the user
  const obj = parallelFields.reduce((acc, curr) => ({ ...acc, ...curr }), {});
  const email = document.getElementById("email_address");
  if (email.innerHTML) {
    obj["email"] = email.innerHTML;
  }

  return fetch("https://ajinomoto.tcapdm.com/api/shopify_account/1", {
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
        return 0;
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      return 0;
    });
}
