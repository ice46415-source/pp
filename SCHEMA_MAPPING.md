# SERVESOFT - Database Schema Mapping

This document explains how the SERVESOFT application maps to your MySQL database schema.

## User Authentication & Roles

### User Table
The main user entity that stores basic information.

```sql
User (UserID, Name, PhoneNumber, Email)
```

### Account Table
Linked 1:1 with User for authentication credentials.

```sql
Account (AccountID, UserID, PhoneNumber, Password)
```

### Role Determination
User roles are determined by their presence in specialized tables:

- **CUSTOMER**: Exists in `Customer` table
- **STAFF**: Exists in `RestaurantStaff` table (but not in `RestaurantManager`)
- **MANAGER**: Exists in both `RestaurantStaff` AND `RestaurantManager` tables
- **ADMIN**: Exists in `Admin` table

## Restaurant Structure

### Restaurant
```sql
Restaurant (RestaurantID, RestaurantName, Address, PhoneNumber, Location, Status, ManagerID)
```

### Staff & Management
```sql
RestaurantStaff (StaffID, UserID, RestaurantID, Role, DateHired, Salary, Status)
RestaurantManager (ManagerID, StaffID) -- Links to RestaurantStaff
DeliveryAgent (DeliveryAgentID, StaffID) -- Links to RestaurantStaff
```

## Menu & Items

```sql
MenuItem (MenuID, RestaurantID, ItemName, ItemDescription, Category, Availability, Price)
```

## Tables & Reservations

```sql
RestaurantTable (TableID, RestaurantID, TableNumber, Capacity, Status)
Reservation (ReservationID, CustomerID, TableID, ReservationDate, NumberOfGuests, Status)
```

## Shopping & Orders

### Cart System
```sql
Cart (CartID, CustomerID, TotalAmount)
CartItem (CartItemID, CartID, MenuID, Quantity)
```

### Order Processing
```sql
CustomerOrder (OrderID, CustomerID, RestaurantID, CartID, OrderDate, OrderType, OrderStatus, DeliveryAddress)
OrderItem (OrderItemID, OrderID, MenuID, ItemQuantity, ItemPrice)
```

### Payment & Delivery
```sql
Payment (PaymentID, OrderID, Amount, PaymentStatus, PaymentDate)
Delivery (DeliveryID, OrderID, DeliveryAgentID, PickupLocation, Status, EstimatedTime, DeliveredTime)
```

## Application Features Mapping

### Customer Features

1. **Browse Menu**: Queries `MenuItem` by `RestaurantID`
2. **Shopping Cart**:
   - Creates/updates `Cart` and `CartItem`
   - Links cart to customer via `CustomerID`
3. **Place Order**:
   - Creates `CustomerOrder` from cart
   - Copies items to `OrderItem`
   - Links via `CartID`
4. **Order History**: Queries `CustomerOrder` filtered by `CustomerID`
5. **Reservations**: CRUD on `Reservation` table

### Manager Features

1. **Orders Dashboard**:
   - Queries orders via restaurant staff relationship
   - Manager → RestaurantStaff → RestaurantID → CustomerOrder
2. **Menu Management**: CRUD on `MenuItem` for their restaurant
3. **Table Management**: CRUD on `RestaurantTable`
4. **Staff Management**:
   - Creates `User` and `Account`
   - Links via `RestaurantStaff`
   - Can promote to `RestaurantManager` or `DeliveryAgent`
5. **Reservations**: View and manage `Reservation` for restaurant tables

### Delivery Agent Features

1. **View Assignments**: Queries `Delivery` by `DeliveryAgentID`
2. **Update Status**: Updates `Delivery` status field
3. **Availability**: Custom field (could be added to `RestaurantStaff` or new table)

### Admin Features

1. **Restaurant Management**: CRUD on `Restaurant`
2. **User Management**:
   - View all `User` records
   - Insert into `Admin`, `RestaurantManager`, etc. to change roles

## Status Fields

### Restaurant Status
- Active
- Inactive

### Table Status
- Available
- Occupied
- Reserved
- Maintenance

### Order Status
- Pending
- Confirmed
- In Progress
- Ready
- Completed
- Cancelled

### Delivery Status
- Assigned
- Picked Up
- In Transit
- Delivered
- Failed

### Reservation Status
- Pending
- Confirmed
- Seated
- Completed
- Cancelled

### Staff Status
- Active
- Inactive
- On Leave

### Payment Status
- Pending
- Completed
- Failed
- Refunded

## Key Relationships

1. **User → Multiple Roles**: One user can be in Customer, Staff, Manager, or Admin tables
2. **Restaurant → Manager**: 1:1 relationship via ManagerID
3. **Staff → Restaurant**: Many staff belong to one restaurant
4. **Order → Customer**: Many orders per customer
5. **Order → Restaurant**: Many orders per restaurant
6. **Cart → Items**: One cart contains many items
7. **Reservation → Table**: One table can have many reservations (at different times)
8. **Delivery → Order**: 1:1 relationship
9. **Payment → Order**: 1:1 relationship

## Sample Queries

### Get User Role
```sql
SELECT
    u.UserID, u.Name, u.Email,
    CASE
        WHEN ad.AdminID IS NOT NULL THEN 'ADMIN'
        WHEN rm.ManagerID IS NOT NULL THEN 'MANAGER'
        WHEN rs.StaffID IS NOT NULL THEN 'STAFF'
        ELSE 'CUSTOMER'
    END as Role
FROM User u
LEFT JOIN Admin ad ON u.UserID = ad.UserID
LEFT JOIN RestaurantStaff rs ON u.UserID = rs.UserID
LEFT JOIN RestaurantManager rm ON rs.StaffID = rm.StaffID
WHERE u.Email = 'user@example.com';
```

### Get Restaurant Orders
```sql
SELECT o.*, u.Name as CustomerName
FROM CustomerOrder o
INNER JOIN Customer c ON o.CustomerID = c.CustomerID
INNER JOIN User u ON c.UserID = u.UserID
WHERE o.RestaurantID = 1
ORDER BY o.OrderDate DESC;
```

### Get Staff by Restaurant
```sql
SELECT u.Name, u.Email, rs.Role, rs.Status
FROM RestaurantStaff rs
INNER JOIN User u ON rs.UserID = u.UserID
WHERE rs.RestaurantID = 1 AND rs.Status = 'Active';
```

## Notes

1. The application uses JWT tokens stored in localStorage for session management
2. Password hashing uses PHP's `password_hash()` and `password_verify()`
3. All API responses follow the format: `{success: boolean, data/message: ...}`
4. The frontend automatically determines user capabilities based on their role
5. Cross-origin requests are handled via CORS headers in PHP