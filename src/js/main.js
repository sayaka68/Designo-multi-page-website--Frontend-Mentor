//header nav button
const hamburger = document.querySelector(".js-hamburger");
hamburger.addEventListener("click", () => {
  const nav = document.querySelector("#js-headerNav");
  const overlay = document.querySelector("#js-overlay");
  if (hamburger.classList.contains("openAnim")) {
    hamburger.classList.remove("openAnim");
    hamburger.classList.add("closeAnim");
    nav.classList.remove("is-active");
    overlay.classList.remove("is-active");
  } else {
    hamburger.classList.add("openAnim");
    hamburger.classList.remove("closeAnim");
    nav.classList.add("is-active");
    overlay.classList.add("is-active");
  }
});

//form error message
const form = document.querySelector(".js-form");
const errorMessages = document.querySelectorAll(".js-errorMsg");
const inputs = document.querySelectorAll(".js-input");

inputs.forEach((input, index) => {
  const errorMsg = errorMessages[index];

  input.addEventListener("blur", () => {
    validateField(input, errorMsg);
  });

  input.addEventListener("input", () => {
    validateField(input, errorMsg);
  });
});

function validateField(input, errorMsg) {
  errorMsg.classList.add("is-active");

  if (input.validity.valueMissing) {
    input.setCustomValidity("Can’t be empty");
    errorMsg.textContent = "Can’t be empty";
    return false;
  } else if (input.validity.typeMismatch) {
    input.setCustomValidity("Valid email required");
    errorMsg.textContent = "Valid email required";
    return false;
  } else {
    input.setCustomValidity("");
    errorMsg.textContent = "";
    errorMsg.classList.remove("is-active");
    return true;
  }

  input.checkValidity();
}

function submitCheck() {
  inputs.forEach((input, index) => {
    const errorMsg = errorMessages[index];

    if (!input.checkValidity()) {
      validateField(input, errorMsg);
    }
  });
}

//送信前の最終チェック
form.addEventListener("submit", (e) => {
  const inputsArray = Array.from(inputs);
  const isValid = inputsArray.every((input) => input.checkValidity());

  if (isValid) {
    e.preventDefault();
    sendData();
  } else {
    const errorMsg = document.querySelector(".js-submitError");
    errorMsg.classList.add("is-show");
    submitCheck();
    e.preventDefault();
  }
});

//GASへformデータを送信し、完了ページに遷移させる処理
async function sendData() {
  const url =
    "https://script.google.com/macros/s/AKfycby_u4PZ4novORxvXSHDflxSko6Cz7WbP3ttVBdDiB63q8x5PCoY-gh9af7sACHEUx3JNQ/exec";

  const data = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    tel: document.getElementById("tel").value.trim(),
    message: document.getElementById("message").value.trim(),
  };

  try {
    await fetch(url, {
      method: "post",
      body: JSON.stringify(data),
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
    });

    window.location.href = "contact-thanks.html";
  } catch (err) {
    console.error(err);
    alert("送信に失敗しました。時間をあけてもう一度試してください。");
  }
}
