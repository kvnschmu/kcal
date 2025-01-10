import { BrowserMultiFormatReader } from '@zxing/library';

const videoElement = document.getElementById('video');
const output = document.getElementById('output');
const productTable = document.getElementById('product-table').querySelector('tbody');
const totalKcal = document.getElementById('total-kcal');
const totalCarbs = document.getElementById('total-carbs');
const totalProtein = document.getElementById('total-protein');
const totalFat = document.getElementById('total-fat');
const resetBtn = document.getElementById('reset-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

let totalCalories = 0;
let totalCarbohydrates = 0;
let totalProteins = 0;
let totalFats = 0;
const products = [];

const codeReader = new BrowserMultiFormatReader();

codeReader.getVideoInputDevices().then(videoInputDevices => {
  const firstDeviceId = videoInputDevices[0]?.deviceId;

  codeReader.decodeFromVideoDevice(firstDeviceId, 'video', result => {
    if (result) {
      const barcode = result.text;
      output.textContent = `Barcode: ${barcode}`;

      fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}`)
        .then(response => response.json())
        .then(data => {
          if (data.status === 1) {
            const product = data.product;
            const nutrients = product.nutriments;

            const productName = product.product_name || 'Unbekannt';
            const kcal = nutrients?.energy_kcal || 0;
            const carbs = nutrients?.carbohydrates || 0;
            const protein = nutrients?.proteins || 0;
            const fat = nutrients?.fat || 0;

            addProductToTable(productName, kcal, carbs, protein, fat);
            updateTotals(kcal, carbs, protein, fat);

            products.push({ name: productName, kcal, carbs, protein, fat });
          } else {
            output.textContent = 'Produkt nicht gefunden.';
          }
        })
        .catch(error => {
          console.error('Fehler beim Abrufen des Produkts:', error);
          output.textContent = 'Fehler beim Abrufen der Produktinformationen.';
        });
    }
  });
}).catch(err => {
  console.error('Fehler bei der Videoeingabe:', err);
});

function addProductToTable(name, kcal, carbs, protein, fat) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${name}</td>
    <td>${kcal}</td>
    <td>${carbs}</td>
    <td>${protein}</td>
    <td>${fat}</td>
  `;
  productTable.appendChild(row);
}

function updateTotals(kcal, carbs, protein, fat) {
  totalCalories += kcal;
  totalCarbohydrates += carbs;
  totalProteins += protein;
  totalFats += fat;

  totalKcal.textContent = totalCalories;
  totalCarbs.textContent = totalCarbohydrates.toFixed(1);
  totalProtein.textContent = totalProteins.toFixed(1);
  totalFat.textContent = totalFats.toFixed(1);
}

resetBtn.addEventListener('click', () => {
  totalCalories = 0;
  totalCarbohydrates = 0;
  totalProteins = 0;
  totalFats = 0;

  productTable.innerHTML = '';
  totalKcal.textContent = '0';
  totalCarbs.textContent = '0';
  totalProtein.textContent = '0';
  totalFat.textContent = '0';

  products.length = 0;
});

searchBtn.addEventListener('click', () => {
  const searchQuery = searchInput.value.toLowerCase();
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery)
  );

  console.table(filteredProducts);
});
