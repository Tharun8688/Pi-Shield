import { Router } from 'express';

const router = Router();

// Health check endpoint
router.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

export default router;