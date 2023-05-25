// Line Functions
var base_url = window.location.origin;

document.addEventListener("DOMContentLoaded", () => {
  // Line Functions
  // Handle form submission
  const handleFormSubmission = async (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();

    const parallelRegistration = await submitFormWithApiAndShopify();
    // console.log(parallelRegistration);
    if (parallelRegistration === 1) {
      event.target.submit();
    } else {
      // Handle the case where the registration failed
    }
  };

  // Set Line Login URL
  const setLineLoginURL = () => {
    const loginLineURL = document.getElementById("loginLineURL");
    fetch("https://ajinomoto.tcapdm.com/api/line/login/getlink?mode=login", {
      method: "POST",
      body: JSON.stringify({
        mode: "register",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("API request failed");
        }
        return response.json();
      })
      .then((data) => {
        if (data.results) {
          loginLineURL.href = data.results;
        }
      })
      .catch((error) => {
        console.error(error);
        alert("Failed to get login URL");
      });
  };
  setLineLoginURL();

  async function fetchLineId() {
    try {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const code = urlParams.get("code");
      if (!code) {
        return;
      }
      const apiUrl = `https://ajinomoto.tcapdm.com/api/register/line/fetch_line_id?code=${code}`;
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

    const selectedRadio = document.querySelector(
      'input[name="shop_group"]:checked'
    );
    if (selectedRadio) {
      parallelFields.shop_group = selectedRadio.value;
    }
    try {
      const response = await fetch(
        "https://ajinomoto.tcapdm.com/api/shopify_account",
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

        setLineLoginURL();
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
});
