# Database-Only Data Workflow

As of April 21, 2026, all application data is managed exclusively through the SQLite database (`app-data.db`). The backend no longer reads from or writes to `seed-data.json` or any other JSON seed files.

## Key Points
- **Initial Data**: The database must be initialized with all required data before deployment. No fallback to JSON files exists.
- **Data Updates**: All data changes (services, announcements, etc.) must be performed via the backend API or direct database manipulation.
- **Deployment**: Ensure `app-data.db` is present and up-to-date in the deployment package.
- **Legacy Seed Files**: `seed-data.json` and related logic have been removed from the backend. These files are now obsolete and can be deleted.

## Migration Steps
1. Populate the database with all required data before deployment.
2. Remove or archive any old seed files (`seed-data.json`).
3. Use the backend API or database tools for all future data management.

## Maintenance
- For new environments, provide a pre-populated `app-data.db`.
- Document any schema changes and update the DB accordingly.

---

**This ensures all data is consistent and deployment-ready, with no hardcoded or legacy JSON dependencies.**
