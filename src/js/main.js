//header nav button
const hamburger = document.querySelector(".js-hamburger");
hamburger.addEventListener("click", () => {
  const nav = document.querySelector(".p-headerNav");
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
