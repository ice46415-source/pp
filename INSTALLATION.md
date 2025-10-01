# SERVESOFT Installation Guide

## Prerequisites

- XAMPP installed with Apache and MySQL running
- Modern web browser
- Node.js and npm installed (for development)

## Installation Steps

### 1. Database Setup

1. Open phpMyAdmin at `http://localhost/phpmyadmin`
2. Create a new database named `SERVESOFT`
3. Run the provided SQL schema (found in your class diagram SQL file) to create all tables

### 2. PHP API Backend Setup

1. Copy the `php-api` folder to your XAMPP `htdocs` directory
2. Rename it to `servesoft-api`
   ```
   C:\xampp\htdocs\servesoft-api\
   ```
3. The API will be available at: `http://localhost/servesoft-api`

### 3. Frontend Setup

1. Open terminal in the project directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update the `.env` file (already configured):
   ```
   VITE_API_URL=http://localhost/servesoft-api
   ```
4. Build the project:
   ```bash
   npm run build
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### 4. Testing the Application

1. Open your browser and navigate to `http://localhost:5173`
2. Register a new customer account
3. Test the customer interface

### 5. Creating Admin/Manager Accounts

Since the app uses role-based access, you need to manually promote users in the database:

#### Create an Admin User

```sql
-- After registering via the app, find the user
SELECT UserID, Name FROM User WHERE Email = 'admin@example.com';

-- Insert into Admin table
INSERT INTO Admin (UserID) VALUES (1); -- Replace 1 with actual UserID
```

#### Create a Restaurant Manager

```sql
-- First create a restaurant
INSERT INTO Restaurant (RestaurantName, Address, PhoneNumber, Location, Status)
VALUES ('Test Restaurant', '123 Main St', '1234567890', 'Yaounde', 'Active');

-- Register user via app, then find their UserID
SELECT UserID FROM User WHERE Email = 'manager@example.com';

-- Add as staff
INSERT INTO RestaurantStaff (UserID, RestaurantID, Role, DateHired, Status)
VALUES (2, 1, 'Manager', CURDATE(), 'Active');

-- Get the StaffID
SELECT StaffID FROM RestaurantStaff WHERE UserID = 2;

-- Promote to Manager
INSERT INTO RestaurantManager (StaffID) VALUES (1);
```

## Color Scheme

The application uses an orange and green color palette:
- Primary: Orange (#f97316)
- Secondary: Green (#22c55e)
- Gradient: Orange to Green

## Application Structure

### Customer Features
- Browse restaurant menus
- Add items to cart
- Place orders (Table, Pre-order, Delivery)
- View order history
- Make reservations
- Manage profile

### Restaurant Manager Features
- View and manage orders
- Update order status
- Manage menu items
- Create and manage tables
- Handle reservations
- Register and manage staff
- View restaurant settings

### Delivery Agent Features
- Toggle availability status
- View assigned deliveries
- Accept/decline delivery requests
- Update delivery status
- Track delivery history

### Admin Features
- Create and manage restaurants
- Manage all users
- Update user roles

## Troubleshooting

### API Connection Issues
- Ensure XAMPP Apache and MySQL are running
- Check that the API folder is in the correct location
- Verify database credentials in `php-api/config/database.php`

### CORS Issues
- Make sure the CORS headers are properly set in `php-api/config/cors.php`
- Clear browser cache if needed

### Database Connection Failed
- Check MySQL is running in XAMPP
- Verify database name is `SERVESOFT`
- Check username/password in `config/database.php` (default: root with no password)

## Default Credentials

After setting up, you can create test accounts:
- Customer: Register via the sign-up page
- Manager: Needs database promotion (see above)
- Admin: Needs database promotion (see above)

## Port Configuration

- Frontend: `http://localhost:5173`
- API: `http://localhost/servesoft-api`
- MySQL: `localhost:3306`
- phpMyAdmin: `http://localhost/phpmyadmin`

## Next Steps

1. Create sample restaurants
2. Add menu items
3. Create table entries
4. Test order workflow
5. Test reservation system
6. Configure restaurant settings

## Support

For issues or questions about the application, check:
- Database schema matches the provided SQL
- All tables are created correctly
- API endpoints are accessible
- XAMPP services are running