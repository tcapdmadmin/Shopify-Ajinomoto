// LINE FUNCTIONS
const apiUrl = "https://ajinomoto.tcapdm.com";

// LineLogin Setter
function setLoginLineURL(apiUrl) {
  const loginLineURL = document.getElementById("loginLineURL");
  fetch(apiUrl + "/api/line/login/getlink?mode=login", {
    method: "POST",
    body: {
      mode: "login",
    },
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(function (response) {
      console.log(response);
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("API request failed");
      }
    })
    .then(function (data) {
      if (data.results) {
        loginLineURL.href = data.results; // Use data.result instead of result
      }
    })
    .catch(function (error) {
      console.error(error);
      alert("Failed to get login URL");
    });
}

setLoginLineURL(apiUrl);

function autoFillLogin() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const code = urlParams.get("code");

  if (code) {
    const apiUrl = "https://ajinomoto.tcapdm.com/api/login/line/verify";
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
          let CustomerEmail = document.getElementById("CustomerEmail");
          CustomerEmail.value = data.results.email_address;
          let CustomerPassword = document.getElementById("CustomerPassword");
          CustomerPassword.value = data.results.password;
          setTimeout(() => {
            const loginSubmit = document.getElementById("loginSubmit");
            loginSubmit.click();
          }, 2000);
        }
      })
      .catch((error) => console.error(error));
  }
}
autoFillLogin();
