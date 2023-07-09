// LINE FUNCTIONS
const apiUrl = "https://apps.ajinomotosalesth.com";
var base_url = window.location.origin;
let is_en = window.location.pathname;
let selectedGroup = "";
const segments = is_en.split("/");
// Check if "en" exists in the first segment (index 1) of the string
if (segments[1] === "en") {
  is_en = "/en";
} else {
  is_en = "";
}
document.addEventListener("DOMContentLoaded", () => {
  function handleSignInToLine() {
    const swal_shop_type_select_doc = document.getElementById(
      "swal_shop_type_select"
    ).innerHTML;
    const swal_shop_type_description_doc = document.getElementById(
      "swal_shop_type_description"
    ).innerHTML;
    const swal_shop_type_confirm_doc = document.getElementById(
      "swal_shop_type_confirm"
    ).innerHTML;
    const swal_shop_type_deny_doc = document.getElementById(
      "swal_shop_type_deny"
    ).innerHTML;
    const swal_shop_type_cancel_doc = document.getElementById(
      "swal_shop_type_cancel"
    ).innerHTML;

    Swal.fire({
      title: swal_shop_type_select_doc,
      html: swal_shop_type_description_doc,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: swal_shop_type_confirm_doc,
      denyButtonText: swal_shop_type_deny_doc,
      cancelButtonText: swal_shop_type_cancel_doc,
      customClass: {
        confirmButton: "swal2-confirm swal2-styled swal2-blue-button",
        denyButton: "swal2-deny swal2-styled swal2-blue-button",
        cancelButton: "swal2-cancel",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Redirect to Food Vendor page
        Swal.showLoading();
        setLineLoginURLa("food_vendor").then((url) => {
          console.log(url);
          if (url.results) {
            storeShopType("food_vendor");
            window.location.href = url.results;
          }
        });
      } else if (result.isDenied) {
        Swal.showLoading();
        setLineLoginURLa("retailer").then((url) => {
          if (url.results) {
            storeShopType("retailer");
            window.location.href = url.results;
          }
        });
      } else {
      }
    });
  }
  const signupLineBtn = document.getElementById("lineConnectBtn");
  signupLineBtn.addEventListener("click", handleSignInToLine);
});
// Set Line Login URL
const setLineLoginURLa = (param = "") => {
  return fetch(
    "https://apps.ajinomotosalesth.com/api/line/login/getlink?mode=login&shop_group=" +
      param,
    {
      method: "POST",
      body: JSON.stringify({
        mode: "login",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("API request failed");
      }
      return response.json();
    })
    .then((data) => {
      if (data.results) {
        return data;
      }
    })
    .catch((error) => {
      console.error(error);
      alert("Failed to get login URL");
    });
};

function autoFillLogin() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const code = urlParams.get("code");

  if (code) {
    setTimeout(autoFillExecute(code), 3500);
  }
}

function autoFillExecute(code) {
  const shopType = retrieveShopType();
  const apiUrl =
    "https://apps.ajinomotosalesth.com/api/login/line/verify?shop_group=" + shopType;
  const payload = { code: code };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };

  fetch(apiUrl, options)
    .then((response) => response.json())
    .then((data) => {
      if (data.code == 200) {
        Swal.showLoading();

        storeShopType("");
        let CustomerEmail = document.getElementById("CustomerEmail");
        CustomerEmail.value = data.results.email;
        let CustomerPassword = document.getElementById("CustomerPassword");
        CustomerPassword.value = data.results.password;
        setTimeout(() => {
          localStorage.clear();
          const loginSubmit = document.getElementById("loginSubmit");
          loginSubmit.click();
        }, 2000);
      } else {
        let message = "Unexpected error occurred";
        if (data.message) {
          message = data.message;
        }
        Swal.fire({
          icon: "error",
          title: "Error",
          text: message,
        }).then(() => {
          window.location.href = base_url + is_en + "/account/login";
        });
      }
    })
    .catch((error) => {
      localStorage.clear();
      console.log(error);
    });
}
autoFillLogin();

function storeShopType(shopType) {
  localStorage.setItem("shopType", shopType);
}
function retrieveShopType() {
  return localStorage.getItem("shopType");
}
