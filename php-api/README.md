# SERVESOFT PHP API Backend

This is the PHP backend API for SERVESOFT that works with MySQL/XAMPP.

## Installation

1. Copy the entire `php-api` folder to your XAMPP `htdocs` directory and rename it to `servesoft-api`
2. Update the database configuration in `config/database.php`
3. Make sure your MySQL server is running
4. The API will be accessible at `http://localhost/servesoft-api`

## Database Setup

Run the SQL schema file (provided separately) on your MySQL database named `SERVESOFT`

## API Endpoints

### Authentication
- POST `/auth/login.php` - User login
- POST `/auth/register.php` - Customer registration

### Users
- GET `/users/profile.php?id={userId}` - Get user profile
- PUT `/users/update-role.php` - Update user role (Admin only)

### Restaurants
- GET `/restaurants/list.php` - Get all restaurants
- POST `/restaurants/create.php` - Create restaurant (Admin only)
- PUT `/restaurants/update.php` - Update restaurant

### Menu
- GET `/menu/list.php?restaurant_id={id}` - Get menu items by restaurant
- POST `/menu/create.php` - Create menu item (Manager only)
- PUT `/menu/update.php` - Update menu item
- PUT `/menu/toggle-availability.php` - Toggle item availability

### Orders
- POST `/orders/create.php` - Create new order
- GET `/orders/customer.php?customer_id={id}` - Get customer orders
- GET `/orders/restaurant.php?restaurant_id={id}` - Get restaurant orders
- PUT `/orders/update-status.php` - Update order status

### Cart
- GET `/cart/get.php?customer_id={id}` - Get customer cart
- POST `/cart/add-item.php` - Add item to cart
- PUT `/cart/update-item.php` - Update cart item
- DELETE `/cart/remove-item.php?id={id}` - Remove cart item
- DELETE `/cart/clear.php?cart_id={id}` - Clear cart

### Tables
- GET `/tables/list.php?restaurant_id={id}` - Get restaurant tables
- POST `/tables/create.php` - Create table
- PUT `/tables/update-status.php` - Update table status

### Reservations
- GET `/reservations/customer.php?customer_id={id}` - Get customer reservations
- GET `/reservations/restaurant.php?restaurant_id={id}` - Get restaurant reservations
- POST `/reservations/create.php` - Create reservation
- PUT `/reservations/update-status.php` - Update reservation status

### Staff
- GET `/staff/list.php?restaurant_id={id}` - Get restaurant staff
- POST `/staff/create.php` - Register new staff
- PUT `/staff/update-status.php` - Update staff status

### Delivery
- GET `/delivery/driver.php?driver_id={id}` - Get driver deliveries
- POST `/delivery/assign.php` - Assign delivery to driver
- PUT `/delivery/update-status.php` - Update delivery status

## Frontend Configuration

Update your frontend `.env` file:
```
VITE_API_URL=http://localhost/servesoft-api
```