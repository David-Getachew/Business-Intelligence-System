# AI Rules for BizIntel Application

## Tech Stack Overview

- **Frontend Framework**: React 18 with TypeScript for type-safe development
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: React Router v6 for client-side navigation
- **UI Components**: shadcn/ui built on Radix UI primitives with Tailwind CSS styling
- **State Management**: React Query (TanStack Query) for server state management
- **Styling**: Tailwind CSS with custom design system using HSL color variables
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod for validation
- **Icons**: Lucide React icon library
- **Notifications**: Sonner and Radix UI Toast for user feedback

## Library Usage Rules

### UI Components
- **Primary Choice**: Use shadcn/ui components whenever available
- **Custom Components**: Create new components in `src/components` when shadcn/ui doesn't have what you need
- **Styling**: Always use Tailwind CSS classes for styling, never plain CSS unless absolutely necessary
- **Responsive Design**: All components must be mobile-first and responsive

### Data Fetching & State
- **Server State**: Use React Query for all API data fetching and caching
- **Client State**: Use React's built-in useState and useContext for simple client state
- **Complex State**: Consider useReducer for complex state logic
- **API Layer**: All API calls should go through `src/api/index.ts`

### Forms & Validation
- **Form Library**: Use React Hook Form for all forms
- **Validation**: Use Zod for form validation and data parsing
- **Form Components**: Use shadcn/ui form components which integrate with React Hook Form

### Routing
- **Navigation**: Use React Router v6 for all client-side routing
- **Page Components**: Create page components in `src/pages/` directory
- **Layout Components**: Create layout components in `src/components/layout/`

### Charts & Data Visualization
- **Charting Library**: Use Recharts for all data visualization needs
- **Customization**: Customize Recharts components to match the application's design system
- **Responsiveness**: Ensure all charts are responsive and work on all screen sizes

### Icons
- **Icon Library**: Use Lucide React for all icons
- **Custom Icons**: Only create custom SVG icons if the required icon isn't available in Lucide

### Notifications & Alerts
- **Toast Notifications**: Use Sonner for application toasts
- **Form Validation**: Show validation errors inline with form fields
- **User Feedback**: Provide immediate feedback for user actions

### Styling & Design System
- **Design Tokens**: Use CSS variables defined in `src/index.css` for consistent styling
- **Color Palette**: Use HSL color values from the design system
- **Gradients**: Use predefined gradient classes (`gradient-primary`, `gradient-secondary`)
- **Shadows**: Use predefined shadow classes (`shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-glow`)
- **Glassmorphism**: Use the `glass` utility class for frosted glass effects

### Hooks & Utilities
- **Custom Hooks**: Create reusable logic in `src/hooks/`
- **Utility Functions**: Place helper functions in `src/lib/utils.ts`
- **Theme Management**: Use the provided `useTheme` hook for dark/light mode

### Data Mocking
- **Mock Data**: Use existing mock data in `src/mocks/` during development
- **API Placeholders**: Extend `src/api/index.ts` with new mock functions as needed
- **Real Data Integration**: Replace mock API functions with real backend calls when integrating

### Error Handling
- **Error Boundaries**: Implement error boundaries for graceful error handling
- **User Feedback**: Show meaningful error messages to users
- **Logging**: Log errors appropriately for debugging

### Performance
- **Code Splitting**: Use React's lazy loading for route-based code splitting
- **Bundle Optimization**: Keep bundle sizes small by only importing what's needed
- **Image Optimization**: Use appropriate image formats and sizes

### Accessibility
- **ARIA Attributes**: Use proper ARIA attributes for interactive components
- **Keyboard Navigation**: Ensure all functionality is accessible via keyboard
- **Semantic HTML**: Use semantic HTML elements where appropriate