let vendors = JSON.parse(localStorage.getItem("vendors")) || [];

const totalVendorsEl = document.querySelector("#total-vendors .Values");
const compliantEl = document.querySelector("#total-compliant .Values");
const improvementEl = document.querySelector("#total-improvement .Values");
const nonCompliantEl = document.querySelector("#non-compliant .Values");

const warningBox = document.getElementById("warning-message");

let total = vendors.length;
let compliant = 0;
let improvement = 0;
let nonCompliant = 0;

const categories = {
    "School Supply": 0,
    "Office Supplies": 0,
    "Food & Beverage": 0,
    "Clothing & Apparel": 0,
    "Electronics": 0
};

vendors.forEach(vendor => {

    if (vendor.status === "compliant") {
        compliant++;
    } else if (vendor.status === "improvement") {
        improvement++;
    } else if (vendor.status === "non-compliant") {
        nonCompliant++;
    }

    if (categories[vendor.category] !== undefined) {
        categories[vendor.category]++;
    }
});

totalVendorsEl.textContent = total;
compliantEl.textContent = compliant;
improvementEl.textContent = improvement;
nonCompliantEl.textContent = nonCompliant;

let rate = total === 0 ? 0 : Math.round((compliant / total) * 100);
document.querySelector("#total-compliant .desc").textContent =
    `${rate}% compliance rate`;

document.querySelectorAll("#vendor-list li").forEach(li => {
    let categoryName = li.childNodes[0].textContent.trim();
    li.querySelector(".vendor-value").textContent =
        categories[categoryName] || 0;
});


const displayWarning = document.getElementById("display-warning");
const vendorList = document.getElementById("vendor-list");

if (total === 0) {
    displayWarning.style.display = "flex";
    vendorList.style.display = "none";

    warningBox.innerHTML = `
        <p>No vendors registered yet.</p>
        <p>Waiting for submissions...</p>
    `;
} else {
    displayWarning.style.display = "none";
    vendorList.style.display = "flex";

    if (nonCompliant > 0) {
        warningBox.innerHTML = `
            <p>${nonCompliant} vendor(s) need attention!</p>
            <p>Immediate action required.</p>
        `;
    } else if (improvement > 0) {
        warningBox.innerHTML = `
            <p>${improvement} vendor(s) need improvement.</p>
            <p>Follow-up recommended.</p>
        `;
    } else {
        warningBox.innerHTML = `
            <p>All vendors are compliant ✅</p>
            <p>Great job!</p>
        `;
    }
}