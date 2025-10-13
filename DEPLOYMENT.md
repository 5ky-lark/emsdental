# Deployment Guide for Render.com

## Quick Start

1. **Push your code to GitHub**
2. **Connect Render to your GitHub repository**
3. **Create a PostgreSQL database on Render**
4. **Deploy your web service**
5. **Set up environment variables**

## Step-by-Step Instructions

### 1. Prepare Your Repository

Your repository is now ready with:
- ✅ `.nvmrc` - Specifies Node.js version (18.x)
- ✅ `package.json` - Updated with engines and build scripts
- ✅ `prisma/schema.prisma` - Updated for PostgreSQL
- ✅ `env.example` - Environment variables template
- ✅ `next.config.js` - Production-ready configuration
- ✅ `render.yaml` - Render deployment configuration

### 2. Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Connect your repository

### 3. Create PostgreSQL Database

1. In Render dashboard, click **"New +"**
2. Select **"PostgreSQL"**
3. Configure:
   - **Name**: `dental-chair-db`
   - **Database**: `dental_chair`
   - **User**: `dental_user`
   - **Plan**: Free (for starters)
4. Click **"Create Database"**
5. Copy the **Internal Database URL** (you'll need this)

### 4. Create Web Service

1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `dental-chair-ecommerce`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (for starters)

### 5. Set Environment Variables

In your web service settings, add these environment variables:

```env
NODE_ENV=production
DATABASE_URL=postgresql://username:password@hostname:port/database
NEXTAUTH_SECRET=your-super-secret-nextauth-key-here
JWT_SECRET=your-super-secret-jwt-key-here
NEXTAUTH_URL=https://your-app-name.onrender.com
PAYMONGO_SECRET_KEY=your-paymongo-secret-key-here
```

### 6. Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Install dependencies
   - Run Prisma migrations
   - Build your Next.js app
   - Start the server

## Important Notes

### Database Migration
- Your app will automatically create tables on first deployment
- If you need to seed data, run: `npm run seed` in Render's shell

### File Uploads
- Render provides persistent disk storage
- Your uploads will be stored in `/opt/render/project/src/public/uploads/`
- For production, consider using AWS S3 or Cloudinary

### Custom Domain
- You can add a custom domain in Render settings
- SSL certificates are automatically provisioned

### Monitoring
- Check Render dashboard for logs and performance metrics
- Monitor database usage and upgrade plan if needed

## Troubleshooting

### Common Issues:

1. **Build fails**: Check Node.js version matches `.nvmrc`
2. **Database connection fails**: Verify `DATABASE_URL` is correct
3. **Authentication issues**: Ensure `NEXTAUTH_SECRET` is set
4. **PayMongo errors**: Check `PAYMONGO_SECRET_KEY` is valid

### Useful Commands in Render Shell:

```bash
# Check database connection
npx prisma db push

# Seed database
npm run seed

# Check logs
# (Use Render dashboard for logs)
```

## Cost Estimation

**Free Tier (Starting):**
- Web Service: Free
- PostgreSQL: Free (1GB storage)
- Bandwidth: 100GB/month

**Paid Plans (When Scaling):**
- Starter: $7/month
- Standard: $25/month

## Next Steps

1. Test your deployed application
2. Set up monitoring and alerts
3. Configure custom domain (optional)
4. Set up automated backups
5. Consider upgrading plans as you scale

---

**Your dental equipment e-commerce app is now ready for production deployment on Render!** 🚀
