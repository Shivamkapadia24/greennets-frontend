GreenNets E-commerce Frontend
This is the frontend of GreenNets E-commerce Project.
It includes the customer website and the admin dashboard UI.

Features:
1.Customer Side
    Home page + product listing pages
    Product filtering by category / quality / size
    Cart & wishlist
    User authentication (login/signup)
    Place order (checkout page)
2. Admin Side
    Admin login
    Dashboard analytics
      Total revenue / orders / products
      Orders by status chart
      Revenue trend chart (7 / 30 / 90 days)
      Low stock section
    Orders management
      Search by Order ID
      Filter by status
      Sort latest/oldest
      View Items popup (order item details)
      Update order status
    Products management (filters + CRUD UI)
    
Tech Stack:
    HTML
    CSS
    JavaScript
    Chart.js (for dashboard analytics charts)
    
How to Run: 
    1) Open frontend folder
      cd frontend
    2) Start frontend
      Since this project is plain HTML/CSS/JS, you can run it using Live Server:
      ✅ Recommended:
      Install Live Server extension in VS Code
      Right click index.html → Open with Live Server
      
Project Structure:
frontend/
 ├── index.html
 ├── products.html
 ├── style.css
 ├── script.js
 ├── admin/
 │    ├── admin-login.html
 │    ├── dashboard.html
 │    ├── admin.css
 │    ├── admin.js
 └── images/
 
Backend Connection:
The frontend connects with backend APIs:
Example:
const API_BASE_URL = "http://localhost:5001";
Update this when deploying the backend.
