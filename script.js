const WHATSAPP_NUMBER = "917597909942";

const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav");
menuBtn.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(isOpen));
});
document.querySelectorAll(".nav a").forEach(link => {
  link.addEventListener("click", () => nav.classList.remove("open"));
});

document.querySelectorAll(".product-btn").forEach(button => {
  button.addEventListener("click", () => {
    const product = button.dataset.product;
    const text = `Hi Harshul, please share the current price and availability for ${product}.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
  });
});

document.getElementById("contactForm").addEventListener("submit", event => {
  event.preventDefault();
  const name = document.getElementById("contactName").value.trim();
  const goal = document.getElementById("contactGoal").value;
  const message = document.getElementById("contactMessage").value.trim();
  const text = `Hi Harshul, my name is ${name}. I am interested in ${goal}. ${message}`.trim();
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
});

const modal = document.getElementById("purchaseModal");
const selectedPlanEl = document.getElementById("selectedPlan");
const selectedPriceEl = document.getElementById("selectedPrice");
let selectedPlan = "";
let selectedPrice = "";

document.querySelectorAll(".buy-btn").forEach(button => {
  button.addEventListener("click", () => {
    selectedPlan = button.dataset.plan;
    selectedPrice = button.dataset.price;
    selectedPlanEl.textContent = selectedPlan;
    selectedPriceEl.textContent = selectedPrice;
    localStorage.setItem("apexForgeSelectedPlan", selectedPlan);
    localStorage.setItem("apexForgeSelectedPrice", selectedPrice);
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  });
});

function closeModal() {
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

document.querySelectorAll("[data-close-modal]").forEach(el => el.addEventListener("click", closeModal));
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

document.getElementById("paidButton").addEventListener("click", () => {
  window.location.href = "assessment.html";
});

document.getElementById("whatsappPaymentHelp").addEventListener("click", () => {
  const text = `Hi Harshul, I need help paying for the ${selectedPlan} plan (${selectedPrice}).`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
});
