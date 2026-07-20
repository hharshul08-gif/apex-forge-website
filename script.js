
const menuButton=document.querySelector(".menu-button"),nav=document.querySelector(".site-nav");
if(menuButton){menuButton.addEventListener("click",()=>nav.classList.toggle("open"))}
const modal=document.getElementById("paymentModal");
let currentName="",currentPrice="";
document.querySelectorAll(".pay-button").forEach(btn=>btn.addEventListener("click",()=>{
 currentName=btn.dataset.name;currentPrice=btn.dataset.price;
 document.getElementById("purchaseName").textContent=currentName;
 document.getElementById("purchasePrice").textContent=currentPrice;
 modal.classList.add("active");modal.setAttribute("aria-hidden","false");
}));
document.querySelectorAll("[data-close]").forEach(x=>x.addEventListener("click",()=>{modal.classList.remove("active");modal.setAttribute("aria-hidden","true")}));
const paid=document.getElementById("paidButton");
if(paid){paid.addEventListener("click",()=>{
 const message=`Hi Harshul, I have paid for ${currentName} (${currentPrice}). Please verify my payment and guide me on the next step.`;
 window.open(`https://wa.me/917597909942?text=${encodeURIComponent(message)}`,"_blank");
})}
