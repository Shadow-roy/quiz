import { User } from '@/types';
import { leaderboardService } from './leaderboardService';
import { notificationService } from './notificationService';

const USERS_KEY = 'quiz_app_users';
const CURRENT_USER_KEY = 'quiz_app_current_user';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

interface StoredUser extends User {
    password?: string;
}

const getUsers = (): StoredUser[] => {
    try {
        const users = localStorage.getItem(USERS_KEY);
        return users ? JSON.parse(users) : [];
    } catch (error) {
        console.error("Failed to parse users from localStorage", error);
        return [];
    }
};

const saveUsers = (users: StoredUser[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const authService = {
    initialize: () => {
        const users = getUsers();
        if (users.length === 0) {
            const adminUser: StoredUser = {
                id: 'admin_user_01',
                email: 'admin@quiz.com',
                password: 'password123',
                role: 'admin',
            };
            saveUsers([adminUser]);
        }
    },

    login: async (email: string, pass: string): Promise<User | null> => {
        await delay(400);
        const users = getUsers();
        const userIndex = users.findIndex(u => u.email === email && u.password === pass);

        if (userIndex !== -1) {
            const user = users[userIndex];
            user.lastLogin = new Date().toISOString(); // Update last login time
            users[userIndex] = user;
            saveUsers(users); // Save the updated users array

            const { password, ...userToStore } = user;
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToStore));
            
            notificationService.addNotification(`'${userToStore.email}' (${userToStore.role}) has logged in.`);
            
            return userToStore;
        }
        return null;
    },

    signup: async (email: string, pass: string): Promise<User | null> => {
        await delay(400);
        const users = getUsers();
        if (users.some(u => u.email === email)) {
            return null; // User already exists
        }
        const newUser: StoredUser = {
            id: String(Date.now()),
            email,
            password: pass,
            role: 'user',
        };
        users.push(newUser);
        saveUsers(users);
        const { password, ...userToStore } = newUser;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToStore));
        notificationService.addNotification(`New user signed up: ${email}.`);
        return userToStore;
    },

    createUser: async (email: string, pass: string): Promise<{ user?: User, error?: string }> => {
        await delay(400);
        const users = getUsers();
        if (users.some(u => u.email === email)) {
            return { error: 'An account with this email already exists.' };
        }
        const newUser: StoredUser = {
            id: String(Date.now()),
            email,
            password: pass,
            role: 'user',
        };
        users.push(newUser);
        saveUsers(users);
        const { password, ...userToReturn } = newUser;
        notificationService.addNotification(`New user account created: ${email}.`);
        return { user: userToReturn };
    },
    
    createAdminUser: async (email: string, pass: string): Promise<{ user?: User, error?: string }> => {
        await delay(400);
        const users = getUsers();
        if (users.some(u => u.email === email)) {
            return { error: 'An account with this email already exists.' };
        }
        const newAdmin: StoredUser = {
            id: String(Date.now()),
            email,
            password: pass,
            role: 'admin',
        };
        users.push(newAdmin);
        saveUsers(users);
        const { password, ...userToReturn } = newAdmin;
        notificationService.addNotification(`New admin account created: ${email}.`);
        return { user: userToReturn };
    },

    logout: (): void => {
        localStorage.removeItem(CURRENT_USER_KEY);
    },

    getCurrentUser: (): User | null => {
        try {
            const user = localStorage.getItem(CURRENT_USER_KEY);
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error("Failed to parse current user from localStorage", error);
            return null;
        }
    },

    getAllUsers: async (): Promise<User[]> => {
        await delay(300);
        const users = getUsers();
        return users.map(({ password, ...user }) => user);
    },
    
    updateEmail: async (userId: string, newEmail: string): Promise<{ user?: User, error?: string }> => {
        await delay(400);
        const users = getUsers();
        const existingUser = users.find(u => u.email === newEmail && u.id !== userId);
        if (existingUser) {
            return { error: 'This email is already taken by another account.' };
        }
        
        let updatedUser: StoredUser | null = null;
        const updatedUsers = users.map(user => {
            if (user.id === userId) {
                updatedUser = { ...user, email: newEmail };
                return updatedUser;
            }
            return user;
        });

        if (updatedUser) {
            saveUsers(updatedUsers);
            await leaderboardService.updateUserEmail(userId, newEmail);

            const currentUser = authService.getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                const { password, ...userToStore } = updatedUser;
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToStore));
                return { user: userToStore };
            }
            const { password, ...userToReturn } = updatedUser;
            return { user: userToReturn };
        }
        return { error: 'User not found.' };
    },
    
    updatePassword: async (userId: string, currentPass: string, newPass: string): Promise<{ success?: boolean, error?: string }> => {
        await delay(400);
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return { error: 'User not found.' };
        }
        if (users[userIndex].password !== currentPass) {
            return { error: 'Incorrect current password.' };
        }

        users[userIndex].password = newPass;
        saveUsers(users);
        return { success: true };
    },

    updateUserRole: async (userId: string, newRole: 'user' | 'admin'): Promise<User | null> => {
        await delay(200);
        const users = getUsers();
        let updatedUser: StoredUser | null = null;
        const updatedUsers = users.map(user => {
            if (user.id === userId) {
                updatedUser = { ...user, role: newRole };
                return updatedUser;
            }
            return user;
        });
        
        if (updatedUser) {
            saveUsers(updatedUsers);
            const { password, ...userToReturn } = updatedUser;
            notificationService.addNotification(`Role for ${userToReturn.email} changed to ${newRole}.`);
            return userToReturn;
        }
        return null;
    },

    deleteUser: async (userId: string): Promise<void> => {
        await delay(500);
        let users = getUsers();
        const userToDelete = users.find(u => u.id === userId);
        if (userToDelete) {
             users = users.filter(u => u.id !== userId);
            saveUsers(users);
            await leaderboardService.deleteScoresByUserId(userId);
            notificationService.addNotification(`User ${userToDelete.email} has been deleted.`);
        }
    },
};