# Fish and Follow - Contact Collection Tool

A modern React application built with React Router v7 for collecting and managing contacts. Features a public contact form and private admin dashboard with Okta authentication.

## Features

### Public Routes
- **`/`** - Contact submission form for users to provide their information
- **`/login`** - Okta-powered authentication for admin access
- **`/resources`** - Static pages with helpful resources and documentation

### Private Routes (Authentication Required)
- **`/contacts`** - Full CRUD operations for managing submitted contacts
- **`/admin`** - User account management and system administration

## Tech Stack

- **React 19** - UI framework
- **React Router v7** - File-based routing and navigation
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool and development server

## Project Structure

```
app/
├── components/          # Reusable UI components
│   ├── ContactForm.tsx  # Contact submission form
│   ├── Navigation.tsx   # Main navigation bar
│   └── ProtectedRoute.tsx # Route protection wrapper
├── lib/                 # Utility libraries
│   ├── api.ts          # API service layer
│   └── auth.tsx        # Authentication context and helpers
├── routes/             # Page components (file-based routing)
│   ├── home.tsx        # Landing page with contact form
│   ├── login.tsx       # Okta authentication page
│   ├── resources.tsx   # Resources and documentation
│   ├── contacts.tsx    # Contact management dashboard
│   └── admin.tsx       # User and system administration
├── root.tsx            # Root layout with navigation
└── app.css             # Global styles
```

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Okta developer account (for authentication)

### Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   # API Configuration
   REACT_APP_API_URL=http://localhost:3001
   
   # Okta Configuration
   REACT_APP_OKTA_CLIENT_ID=your_okta_client_id
   REACT_APP_OKTA_DOMAIN=your_okta_domain
   REACT_APP_OKTA_REDIRECT_URI=http://localhost:5173/auth/callback
   ```

3. **Start the development server:**
   ```bash
   pnpm dev
   ```

4. **Build for production:**
   ```bash
   pnpm build
   ```

## Development

### Running the Application

The application runs on `http://localhost:5173` by default. The development server supports:
- Hot module replacement
- TypeScript compilation
- Tailwind CSS processing

### Testing Routes

You can test the application routes:

1. **Public routes** (no authentication required):
   - Visit `/` to see the contact form
   - Visit `/resources` to see the resources page
   - Visit `/login` to see the Okta login page

2. **Private routes** (authentication required):
   - Visit `/contacts` to manage contacts (currently uses mock authentication)
   - Visit `/admin` to manage users and view system stats

### Mock Data

The application currently uses mock data for development:
- Contact form submissions are logged to console
- Contact and user lists use hardcoded data
- Authentication is simulated (all users are considered authenticated)

## Next Steps

### Backend Integration
1. **API Server**: Set up a Node.js/Express API server with the endpoints defined in `app/lib/api.ts`
2. **Database**: Configure a database (PostgreSQL, MongoDB, etc.) for storing contacts and users
3. **Okta Integration**: Complete the Okta authentication flow with proper token handling

### Enhanced Features
1. **Form Validation**: Add comprehensive form validation with error handling
2. **File Uploads**: Allow contact attachments (resumes, documents)
3. **Email Notifications**: Send confirmation emails to contacts and notifications to admins
4. **Export/Import**: CSV/Excel export of contacts
5. **Advanced Filtering**: Search and filter contacts by various criteria
6. **Audit Logs**: Track user actions and changes
7. **Role-based Permissions**: Granular permissions for different user roles

### Production Considerations
1. **Environment Configuration**: Set up proper environment variables for different stages
2. **Error Monitoring**: Integrate with services like Sentry for error tracking
3. **Analytics**: Add usage analytics and monitoring
4. **Performance**: Implement proper caching, code splitting, and optimization
5. **Security**: Add CSRF protection, rate limiting, and input sanitization
6. **Testing**: Add unit and integration tests

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
