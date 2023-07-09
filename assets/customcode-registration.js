// Line Functions
var base_url = window.location.origin;

document.addEventListener("DOMContentLoaded", () => {
  const handleFormSubmission = async (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();

    const parallelRegistration = await submitFormWithApiAndShopify();
    // console.log(parallelRegistration);
    // return false;
    if (parallelRegistration === 1) {
      storeUserReg();
      event.target.submit();
    } else {
      // Handle the case where the registration failed
    }
  };

  // Set Line Login URL
  const setLineLoginURL = (param = "") => {
    return fetch(
      "https://apps.ajinomotosalesth.com/api/line/login/getlink?mode=login&shop_group=" +
        param,
      {
        method: "POST",
        body: JSON.stringify({
          mode: "register",
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

  async function fetchLineId() {
    try {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const code = urlParams.get("code");
      if (!code) {
        return;
      }
      const apiUrl = `https://apps.ajinomotosalesth.com/api/register/line/fetch_line_id?code=${code}&shop_group=${retrieveShopType()}`;
      console.log('API URL')
      console.log(apiUrl)
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch Line ID");
      }
      const data = await response.json();
      const lineUserId = document.getElementById("line_user_id");

      lineUserId.value = data.results.user_id;
      document.getElementById("lineindication").style.display = "block";
      document.getElementById("signuplinebtn").style.display = "none";

      const lineConnectionText = document.getElementById("lineConnectionText");

      lineConnectionText.innerHTML = "Connected";

      const lineConnectionColor = document.getElementById(
        "lineConnectionColor"
      );
      lineConnectionColor.setAttribute("fill", "#06C755");
    } catch (error) {
      console.error(error);
      window.location.href = base_url + "/account/register";
    }
  }

  fetchLineId();

  // Submit form with API and Shopify
  const submitFormWithApiAndShopify = async () => {
    const form = document.getElementById("create_customer");
    const formData = new FormData(form);
    const parallelFields = {};

    const parallelElems = document.querySelectorAll(".parallel");
    parallelElems.forEach((elem) => {
      const fieldName = elem.getAttribute("name");
      if (fieldName.startsWith("customer[") && fieldName.endsWith("]")) {
        const customerField = fieldName.substring(9, fieldName.length - 1);
        const value = elem.value;
        if (fieldName === "customer[metafields][custom][telephone]") {
          parallelFields.telephone = value;
        } else {
          parallelFields[customerField] = value;
        }
      } else {
        const modifiedFieldName = fieldName.replace(/-/g, "_");
        parallelFields[modifiedFieldName] = elem.value;
      }
    });

    const checkedUmamiSeasoningUsage = document.querySelectorAll(
      "input.parallel-umami-seasoning-usage:checked"
    );
    const storedUmamiSeasoningUsage = Array.from(
      checkedUmamiSeasoningUsage
    ).map((input) => input.value);
    if (storedUmamiSeasoningUsage.length > 0) {
      parallelFields.umami_seasoning_usage = storedUmamiSeasoningUsage;
    }

    const checkedFlavorSeasoningUsage = document.querySelectorAll(
      "input.parallel-flavor-seasoning-usage:checked"
    );
    const storedFlavorSeasoningUsage = Array.from(
      checkedFlavorSeasoningUsage
    ).map((input) => input.value);
    if (storedFlavorSeasoningUsage.length > 0) {
      parallelFields.flavored_seasoning_usage = storedFlavorSeasoningUsage;
    }

    const checkedShopTypes = document.querySelectorAll(
      "input.parallel-shop-type:checked"
    );
    const storedShopTypes = Array.from(checkedShopTypes).map(
      (input) => input.value
    );
    if (storedShopTypes.length > 0) {
      parallelFields.shop_type = storedShopTypes;
    }

    const selectedRadio = document.querySelector('.Shop-group:checked');
    if (selectedRadio) {
      parallelFields.shop_group = selectedRadio.value;
    }
    const telephone = document.getElementById("Telephone").value;
    if (telephone) {
      parallelFields.telephone = telephone;
    }
    // console.log(parallelFields)
    // return false;
    try {
      const response = await fetch(
        "https://apps.ajinomotosalesth.com/api/shopify_account",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parallelFields),
        }
      );
      const data = await response.json();
      if (data.status === "error") {
        var errorMessage = "";

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

        setLineLoginURL(params);
        document.getElementById("lineindication").style.display = "none";
        document.getElementById("signuplinebtn").style.display = "block";

        throw new Error(data.message);
      }
      return 1;
    } catch (error) {
      console.error("Error:", error);
      return 0;
    }
  };

  const form = document.getElementById("create_customer");

  form.addEventListener("submit", handleFormSubmission);

  function handleSignInToLine() {

    const swal_shop_type_select_doc = document.getElementById("swal_shop_type_select").innerHTML;
    const swal_shop_type_description_doc = document.getElementById("swal_shop_type_description").innerHTML;
    const swal_shop_type_confirm_doc = document.getElementById("swal_shop_type_confirm").innerHTML;
    const swal_shop_type_deny_doc = document.getElementById("swal_shop_type_deny").innerHTML;
    const swal_shop_type_cancel_doc = document.getElementById("swal_shop_type_cancel").innerHTML;


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
        setLineLoginURL("food_vendor").then((url) => {
          console.log(url);
          if (url.results) {
            storeShopType("food_vendor");

            window.location.href = url.results;
          }
        });
      } else if (result.isDenied) {
        Swal.showLoading();
        setLineLoginURL("retailer").then((url) => {
          if (url.results) {
            storeShopType("retailer");
            window.location.href = url.results;
          }
        });
      } else {
      }
    });
  }

  const signupLineBtn = document.getElementById("signuplinebtn");
  signupLineBtn.addEventListener("click", handleSignInToLine);

  function storeShopType(shopType) {
    sessionStorage.setItem("shopType", shopType);
  }

  function retrieveShopType() {
    return sessionStorage.getItem("shopType");
  }
  function autoSelectShopGroup() {
    const shopType = retrieveShopType();
    if (shopType === "food_vendor") {
      console.log('shop group select')
      var shopGroup = document.getElementsByClassName("Shop-group");
      console.log(shopGroup)
      document.querySelector('.Shop-group[value="Food Vendor"]').checked = true;

    } else if (shopType === "retailer") {
      document.querySelector('.Shop-group[value="Retailer"]').checked = true;
    }
  }

  autoSelectShopGroup();
});


function storeUserReg() {
  var setRegistersession = sessionStorage.setItem("newly_registered", 1);
  let isNewlyRegistered = sessionStorage.getItem("newly_registered");
  console.log('SET REGISTER SESSION')
  console.log(isNewlyRegistered)
}
