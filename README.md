# SERVESOFT - Restaurant Management System

A comprehensive web-based restaurant management system with role-based access control, built with React, TypeScript, and PHP/MySQL.

## Features

### For Customers
- Browse restaurant menus with categories
- Add items to shopping cart
- Place orders (Dine-in, Pre-order, Delivery)
- Track order status in real-time
- Make and manage table reservations
- View order history

### For Restaurant Managers
- Real-time orders dashboard with status updates
- Menu management (add, edit, toggle availability)
- Table management with status tracking (Free, Seated, Cleaning)
- Reservations management
- Staff registration and management
- Restaurant settings configuration

### For Delivery Agents
- Toggle availability status
- View assigned deliveries
- Accept/decline delivery requests
- Update delivery milestones
- Track delivery history

### For Administrators
- Create and manage multiple restaurants
- User management with role updates
- System-wide oversight

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **State Management**: Zustand
- **Routing**: React Router v6
- **Backend**: PHP 8.x
- **Database**: MySQL (via XAMPP)
- **HTTP Client**: Axios
- **Styling**: Inline styles with custom theme

## Color Palette

The application uses a fresh orange and green color scheme:
- **Primary Orange**: #f97316
- **Secondary Green**: #22c55e
- **Gradient**: Orange to Green transitions
- Clean, modern UI with good contrast

## Project Structure

```
servesoft/
├── src/
│   ├── lib/
│   │   ├── api.ts              # API client functions
│   │   └── supabase.ts         # Legacy (can be removed)
│   ├── pages/
│   │   ├── admin/              # Admin dashboard
│   │   ├── customer/           # Customer interface
│   │   ├── delivery/           # Delivery agent interface
│   │   ├── manager/            # Manager dashboard
│   │   └── Login.tsx           # Authentication page
│   ├── stores/
│   │   ├── authStore.ts        # Authentication state
│   │   └── cartStore.ts        # Shopping cart state
│   ├── theme.ts                # Color theme configuration
│   └── App.tsx                 # Main app component
├── php-api/                    # PHP backend API
│   ├── config/
│   │   ├── database.php        # Database connection
│   │   └── cors.php            # CORS configuration
│   ├── auth/                   # Authentication endpoints
│   └── [other endpoints]/      # Feature-specific APIs
├── INSTALLATION.md             # Setup instructions
├── SCHEMA_MAPPING.md           # Database schema documentation
└── README.md                   # This file
```

## Quick Start

1. **Setup Database**
   ```bash
   # Create database in phpMyAdmin
   Database name: SERVESOFT
   # Run your SQL schema
   ```

2. **Install PHP API**
   ```bash
   # Copy php-api folder to XAMPP htdocs
   cp -r php-api C:/xampp/htdocs/servesoft-api
   ```

3. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

4. **Configure Environment**
   ```bash
   # .env file (already configured)
   VITE_API_URL=http://localhost/servesoft-api
   ```

5. **Build and Run**
   ```bash
   npm run build
   npm run dev
   ```

6. **Access Application**
   - Frontend: http://localhost:5173
   - API: http://localhost/servesoft-api

## User Roles

The system supports four distinct user roles:

1. **CUSTOMER** - Can browse, order, and make reservations
2. **STAFF** - Restaurant employees (delivery agents)
3. **MANAGER** - Restaurant managers with full operational control
4. **ADMIN** - System administrators with global access

Roles are determined by database table relationships (see SCHEMA_MAPPING.md).

## Database Schema

The application works with your existing MySQL schema:

- User & Account (Authentication)
- Customer, Admin, RestaurantStaff, RestaurantManager (Roles)
- Restaurant & MenuItem (Restaurant data)
- RestaurantTable & Reservation (Seating)
- Cart, CartItem, CustomerOrder, OrderItem (Shopping)
- Payment & Delivery (Order fulfillment)

See `SCHEMA_MAPPING.md` for detailed schema information.

## API Endpoints

### Authentication
- POST `/auth/login.php`
- POST `/auth/register.php`

### Core Features
- Restaurants: `/restaurants/*.php`
- Menu: `/menu/*.php`
- Orders: `/orders/*.php`
- Cart: `/cart/*.php`
- Tables: `/tables/*.php`
- Reservations: `/reservations/*.php`
- Staff: `/staff/*.php`
- Delivery: `/delivery/*.php`

See `php-api/README.md` for complete API documentation.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing

1. Register as a customer
2. Browse menus and place orders
3. Promote user to manager in database (see INSTALLATION.md)
4. Test manager dashboard
5. Create admin user for system management

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (latest)

## Security Features

- Password hashing with PHP password_hash()
- Role-based access control
- SQL injection prevention via prepared statements
- CORS configuration for API security
- Input validation on frontend and backend

## Performance

- Optimized bundle size: ~400KB
- Code splitting for route-based loading
- Efficient state management with Zustand
- Minimal re-renders with React best practices

## Known Limitations

1. No real-time updates (requires manual refresh)
2. No push notifications
3. No image upload functionality (menu item images use URLs)
4. No payment gateway integration
5. No geolocation/maps for delivery

## Future Enhancements

- Real-time order updates with WebSockets
- Image upload for menu items
- Payment gateway integration
- Push notifications
- Mobile app version
- Analytics dashboard
- Inventory management
- Employee scheduling
- Customer loyalty program

## Troubleshooting

See `INSTALLATION.md` for common issues and solutions.

## License

Proprietary - All rights reserved

## Credits

Built for SERVESOFT Restaurant Management System
- Frontend: React + TypeScript + Vite
- Backend: PHP + MySQL
- Database: Based on provided class diagram schema

---

For installation instructions, see `INSTALLATION.md`
For schema documentation, see `SCHEMA_MAPPING.md`