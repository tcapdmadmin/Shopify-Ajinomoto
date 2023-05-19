// Line Functions

document.addEventListener("DOMContentLoaded", () => {
  // Line Functions
  // Handle form submission
  const handleFormSubmission = async (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();

    const parallelRegistration = await submitFormWithApiAndShopify();
    console.log(parallelRegistration);
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
      alert("Failed to fetch Line ID");
    }
  }

  fetchLineId();

  // Submit form with API and Shopify
  const submitFormWithApiAndShopify = async () => {
    const form = document.getElementById("create_customer");
    const formData = new FormData(form);
    const parallelFields = [];

    const parallelElems = document.querySelectorAll(".parallel");
    const inputs = document.getElementsByClassName("input-full");

    parallelElems.forEach((elem) => {
      const fieldName = elem.getAttribute("name");
      if (fieldName.startsWith("customer[") && fieldName.endsWith("]")) {
        const customerField = fieldName.substring(9, fieldName.length - 1);
        const value = elem.value;
        parallelFields.push({
          [customerField]: value,
        });
      }
    });
    const obj = parallelFields.reduce(
      (acc, curr) => ({
        ...acc,
        ...curr,
      }),
      {}
    );

    const selectedRadio = document.querySelector(
      'input[name="shop_group"]:checked'
    );
    if (selectedRadio) {
      obj["account_type"] = selectedRadio.value;
    }

    try {
      const response = await fetch(
        "https://ajinomoto.tcapdm.com/api/shopify_account",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(obj),
        }
      );
      const data = await response.json();
      if (data.status === "error") {
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
