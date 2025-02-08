import { HarmProbability } from '@google/generative-ai';
import db from './dbConnection.js'; // Assuming you have a database connection module

export const getUserProgress = async (userId) => {
    try {
        const result = await db.query('SELECT progress FROM user_progress WHERE user_id = $1', [userId]);
        return result.rows[0].progress;
    } catch (error) {
        throw new Error('Error fetching user progress: ' + error.message);
    }
};

