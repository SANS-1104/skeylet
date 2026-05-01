export function formatCurrency(amount, country = "IN") {
  let currency = "USD"; // default

  if (country === "IN") currency = "INR";
  else if (country === "US") currency = "USD";
  else if (country === "EU") currency = "EUR"; 
  // add more as needed

  return new Intl.NumberFormat(country === "IN" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
  }).format(amount);
}
