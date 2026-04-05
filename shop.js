const products = [
  { name: "Brahmi Powder", category: "herbs", img: "Brahmi.jpeg", price: "₹150" },
  { name: "Amla Powder", category: "herbs", img: "AmlaP.PNG", price: "₹120" },
  { name: "Neem Powder", category: "herbs", img: "NeemP.PNG", price: "₹130" },
  { name: "Tulsi Powder", category: "herbs", img: "TulsiP.PNG", price: "₹140" },
  { name: "Ginger Powder", category: "herbs", img: "GingerP.PNG", price: "₹160" },
  { name: "Turmeric Powder", category: "herbs", img: "TumericP.PNG", price: "₹110" },
  { name: "Ashwagandha Capsules", category: "herbs", img: "Ashwagandha.jpeg", price: "₹250" },
  { name: "Coconut Hair Oil", category: "oils", img: "Coconut.jpeg", price: "₹120" },
  { name: "Castor Oil", category: "oils", img: "CastorOil.PNG", price: "₹180" },
  { name: "Amla Candy", category: "food", img: "AmlaCandy.PNG", price: "₹90" },
  { name: "Chyawanprash", category: "food", img: "Chyawa.PNG", price: "₹280" },
  { name: "Tulsi Green Tea", category: "tea", img: "TulsiT.PNG", price: "₹130" },
  { name: "Ginger Herbal Tea", category: "tea", img: "GingerT.PNG", price: "₹110" }
];

  
  // 🛍️ Retrieve cart from localStorage or initialize empty
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  
  const productContainer = document.getElementById("productContainer");
  const categoryFilter = document.getElementById("categoryFilter");
  const searchInput = document.getElementById("searchInput");
  
  // 🖼️ Display products
  function displayProducts(filteredProducts) {
    productContainer.innerHTML = "";
    filteredProducts.forEach(product => {
      productContainer.innerHTML += `
          <div class="ay-card" style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:0.45rem;">
            <img src="${product.img}" alt="${product.name}" style="width:8rem;height:8rem;object-fit:cover;border-radius:0.8rem;">
            <h2 style="margin:0;font-size:1.1rem;font-weight:700;">${product.name}</h2>
            <p style="margin:0;color:#b76d34;font-weight:700;">${product.price}</p>
          <button onclick="addToCart('${product.name}')" 
              class="ay-btn alt">Add to Cart</button>
        </div>
      `;
    });
  }
  
  // 🧃 Filter products by category and search
  function filterProducts() {
    const selectedCategory = categoryFilter.value;
    const searchValue = searchInput.value.toLowerCase();
  
    const filtered = products.filter(product =>
      (selectedCategory === "all" || product.category === selectedCategory) &&
      product.name.toLowerCase().includes(searchValue)
    );
  
    displayProducts(filtered);
  }
  
  // 🔍 Triggered on input
  function searchProducts() {
    filterProducts();
  }
  
  // ➕ Add to cart with actual product
  function addToCart(productName) {
    const product = products.find(p => p.name === productName);
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    showCartMessage();
  }
  
  // 🎉 Temporary message when item is added
  function showCartMessage() {
    const cartMsg = document.getElementById("cartMessage");
    cartMsg.style.display = "block";
    setTimeout(() => {
      cartMsg.style.display = "none";
    }, 1500);
  }
  
  // 🧮 Update cart icon count
  function updateCartCount() {
    const cartCount = document.getElementById("cartCount");
    if (cartCount) {
      cartCount.textContent = cart.length;
    }
  }
  
  // 🔁 On page load
  window.onload = () => {
    displayProducts(products);
    updateCartCount();
  };
  
  

  
