const verifyCronSecret = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'Missing Authorization header' });
        }

        const token = authHeader.split(' ')[1];

        if (!token || token !== process.env.CRON_SECRET) {
            return res.status(401).json({ message: 'Invalid cron secret' });
        }

        // ✅ Authorized → continue to next handler
        next();

    } catch (error) {
        console.error('Cron secret verification failed:', error);
        return res.status(500).json({ message: 'Cron auth error' });
    }
};

module.exports = verifyCronSecret;
