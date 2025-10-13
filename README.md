# Dental Chairs E-commerce Website

A modern e-commerce platform for displaying dental chairs and related products, allowing clients to browse products and request quotations.

## Features

- **Admin Panel**
  - Secure authentication
  - Product management (CRUD operations)
  - Client inquiry management
  - Quotation generation and management
  - Dashboard and reporting

- **Client Side**
  - Product browsing and search
  - Product details and specifications
  - Inquiry submission
  - Quotation requests
  - Responsive design

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: JWT, NextAuth.js

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd dental-chairs-ecommerce
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/dental-chairs
   JWT_SECRET=your-super-secret-jwt-key
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── models/        # MongoDB models
├── pages/         # Next.js pages and API routes
├── lib/           # Utility functions
├── middleware/    # Authentication middleware
└── styles/        # Global styles
```

## API Endpoints

- `/api/auth/login` - Admin authentication
- `/api/products` - Product management
- `/api/inquiries` - Client inquiries
- `/api/quotations` - Quotation management

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Protected admin routes
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 