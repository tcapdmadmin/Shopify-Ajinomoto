let lineConnection = 0;
document.addEventListener("DOMContentLoaded", function () {
  // Line Functions
  const sh_id = document.getElementById("sh_id");
  const sh_email = document.getElementById("sh_email");

  const lineConnectBtn = document.getElementById("lineConnectBtn");
  lineConnectBtn.style.display = "none";
  const apiUrl = "https://ajith-api.tcapdm.com";

  function lineConnectionChecker(apiUrl) {
    const requestData = {
      sh_id: sh_id.value,
      sh_email: sh_email.value,
    };

    fetch(apiUrl + "/api/myaccount", {
      method: "POST",
      body: JSON.stringify(requestData),
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
        console.log("data check");
        console.log(data.result);
        if (data.result && data.result.data.line_user_id) {
          lineConnectionText.innerHTML = "Connected";
          lineConnectionColor.setAttribute("fill", "#06C755");
          lineConnection = 1;
        } else {
          lineConnectBtn.style.display = "block";
          const lineDisplayStatus =
            document.getElementById("lineDisplayStatus");
          lineDisplayStatus.style.display = "none";
        }
      });
  }

  // LineLogin Setter
  function setLoginLineURL(apiUrl) {
    const loginLineURL = document.getElementById("loginLineURL");
    fetch(apiUrl + "/api/line/login/getlink?mode=connect", {
      method: "POST",
      body: {
        mode: "connect",
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

  //Define Field for Line ID
  function fetchLineId(apiUrla) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const code = urlParams.get("code");

    if (code) {
      const apiUrl = apiUrla + `/api/line/account/update`;

      const payload = {
        code: code,
        mode: "connect",
        sh_id: sh_id.value,
      };

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
            }).then(() => {
              window.location.href =
                "https://ajinomotosales-th.myshopify.com/account";
            });
          } else {
            window.location.href =
              "https://ajinomotosales-th.myshopify.com/account";
          }
        })
        .catch((error) => console.error(error));
    }
  }

  function lineStarter(apiUrl) {
    lineConnectionChecker(apiUrl);
    setLoginLineURL(apiUrl);
    fetchLineId(apiUrl);
  }

  lineStarter(apiUrl);
});

function disconnectLine() {
  const lineDisplayStatus = document.getElementById("lineDisplayStatus");
  const lineConnectionText = document.getElementById("lineConnectionText");
  const lineConnectionColor = document.getElementById("lineConnectionColor");
  const sh_id = document.getElementById("sh_id").value;
  lineDisplayStatus.addEventListener("click", function () {
    if (lineConnection === 1) {
      Swal.fire({
        title: "Remove Line?",
        text: "Line will be disconnected from this account.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Remove Line",
      }).then((result) => {
        if (result.isConfirmed) {
          const apiUrl = "https://ajith-api.tcapdm.com/api/line/account/update";
          const payload = { mode: "remove_line", sh_id: sh_id };
          const options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          };

          fetch(apiUrl, options)
            .then((response) => {
              if (response.ok) {
                Swal.fire("Removed!", "Line is now removed", "success");
                location.reload();
              } else {
                Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: "Failed to disconnect line",
                });
              }
            })
            .catch((error) => {
              console.error(error);
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to disconnect line",
              });
            });
        }
      });

      return false;
      if (confirmDisconnect) {
      }
    }
  });
}
