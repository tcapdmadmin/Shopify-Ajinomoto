// Line Functions
var base_url = window.location.origin;

document.addEventListener("DOMContentLoaded", () => {



// Initial Shop Group: food_vendor
// storeShopType("food_vendor");
  let checkShopGroup = retrieveShopType();
  if(checkShopGroup){
    if(checkShopGroup.length > 0){
       // storeShopType(checkShopGroup);
    }    
  }

  console.log(checkShopGroup)
// Get a reference to the radio button element
const customer_type_food_vendorlistener = document.getElementById("customer_type_food_vendor");
const customer_type_retailerlistener = document.getElementById("customer_type_retailer");
// Add a click event listener to the radio button
customer_type_food_vendorlistener.addEventListener("click", function () {
  storeShopType("food_vendor");
});

customer_type_retailerlistener.addEventListener("click", function () {
  storeShopType("retailer");
});


  
  const handleFormSubmission = async (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();

    // Perform form validation
    let isValidForm = formValidator();
    if (isValidForm == true) {
      const parallelRegistration = await submitFormWithApiAndShopify();
      // return false;
      if (parallelRegistration === 1) {
        storeUserReg();
        event.target.submit();
      }
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
        location.reload();
        // alert("Failed to get login URL");
      });
  };

  async function fetchLineId() {
    // try {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const code = urlParams.get("code");
    if (!code) {
      return;
    }

    const apiUrl = `https://apps.ajinomotosalesth.com/api/register/line/fetch_line_id?code=${code}&shop_group=${retrieveShopType()}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch Line ID");
    }
    const data = await response.json();
    const lineUserId = document.getElementById("line_user_id");

    const lineValidator = await lineAccountValidator(
      retrieveShopType(),
      data.results.user_id
    );
    if (lineValidator["status"] == "error") {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: lineValidator["message"],
      });

      return false;
    }

    lineUserId.value = data.results.user_id;

    document.getElementById("lineindication").style.display = "block";
    document.getElementById("signuplinebtn").style.display = "none";

    const lineConnectionText = document.getElementById("lineConnectionText");

    lineConnectionText.innerHTML = "Connected";

    const lineConnectionColor = document.getElementById("lineConnectionColor");
    lineConnectionColor.setAttribute("fill", "#06C755");
    // } catch (error) {
    //   console.error(error);
    //   window.location.href = base_url + "/account/register";
    // }
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

    const selectedRadio = document.querySelector(".Shop-group:checked");
    if (selectedRadio) {
      parallelFields.shop_group = selectedRadio.value;
    }
    const telephone = document.getElementById("Telephone").value;
    if (telephone) {
      parallelFields.telephone = telephone;
    }
    const birthdate = document.getElementById("birthdate").value;
    if (birthdate) {
      parallelFields.birthdate = birthdate;
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
    localStorage.setItem("shopType", shopType);
  }

  function retrieveShopType() {
    return localStorage.getItem("shopType");
  }
  function autoSelectShopGroup() {
    const shopType = retrieveShopType();
    var shopGroup = document.getElementsByClassName("Shop-group");

    if (shopType === "food_vendor") {
      document.querySelector('.Shop-group[value="Food Vendor"]').checked = true;
    } else if (shopType === "retailer") {
      document.querySelector('.Shop-group[value="Retailer"]').checked = true;
    }
  }

  // autoSelectShopGroup();

  function checkboxValidator() {
    const checkboxes = document.querySelectorAll(".parallel-shop-type");

    let checkedCount = 0;

    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        checkedCount++;
      }
    });

    if (checkedCount >= 1) {
      return true;
    } else {
      const swal_shop_type_error_title = document.getElementById(
        "swal_shop_type_error_title"
      ).innerHTML;
      const swal_shop_type_error_text = document.getElementById(
        "swal_shop_type_error_text"
      ).innerHTML;
      Swal.fire({
        icon: "error",
        title: swal_shop_type_error_title,
        text: swal_shop_type_error_text,
      });

      return false;
    }
  }

  function formValidator() {
    let is_valid = false;
    let isValidCheckbox = checkboxValidator();

    if (!isValidCheckbox) {
      is_valid = false;
    } else {
      is_valid = true;
    }

    return is_valid;
  }

  function uncheckParallelShopTypes() {
    const checkboxes = document.querySelectorAll(".parallel-shop-type");

    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
  }

  // Get the radio buttons by their IDs
  const foodVendorRadioButton = document.getElementById(
    "customer_type_food_vendor"
  );
  const retailerRadioButton = document.getElementById("customer_type_retailer");

  // Add event listeners to the radio buttons
  foodVendorRadioButton.addEventListener("change", uncheckParallelShopTypes);
  retailerRadioButton.addEventListener("change", uncheckParallelShopTypes);

  async function lineAccountValidator(vendor, line_user_id) {
    const apiUrl = `https://apps.ajinomotosalesth.com/api/line_user_validator?vendor=${vendor}&line_user_id=${line_user_id}&mode=reg-validate-line`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data;
  }



  
});

function storeUserReg() {
  var setRegistersession = sessionStorage.setItem("newly_registered", 1);
  let isNewlyRegistered = sessionStorage.getItem("newly_registered");
}





